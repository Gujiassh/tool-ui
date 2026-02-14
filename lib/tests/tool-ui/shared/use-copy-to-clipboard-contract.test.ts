// @vitest-environment jsdom

import {
  act,
  createElement,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useState,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, expect, it } from "vitest";
import { useCopyToClipboard } from "@/components/tool-ui/shared/use-copy-to-clipboard";

const reactActEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};
reactActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;

type CopyFn = (text: string, id?: string) => Promise<boolean>;

function CopyHookHarness(props: {
  onCopyReady: Dispatch<SetStateAction<CopyFn | null>>;
}) {
  const { copy } = useCopyToClipboard();

  useEffect(() => {
    props.onCopyReady(() => copy);
  }, [copy, props]);

  return null;
}

async function renderClient(node: ReactNode): Promise<{
  container: HTMLDivElement;
  root: Root;
}> {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);
  await act(async () => {
    root.render(node);
  });

  return { container, root };
}

async function cleanupClient(root: Root, container: HTMLDivElement) {
  await act(async () => {
    root.unmount();
  });
  container.remove();
}

describe("useCopyToClipboard contract", () => {
  it("cleans up temporary textarea when fallback copy throws", async () => {
    const originalClipboard = navigator.clipboard;
    const originalExecCommand = (
      document as Document & {
        execCommand?: (command: string) => boolean;
      }
    ).execCommand;

    const simulatedError = new Error("copy denied");
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
    (
      document as Document & {
        execCommand: (command: string) => boolean;
      }
    ).execCommand = (_command: string) => {
      throw simulatedError;
    };

    let capturedCopy: CopyFn | null = null;
    function MountCopyHook() {
      const [copyFn, setCopyFn] = useState<CopyFn | null>(null);

      useEffect(() => {
        capturedCopy = copyFn;
      }, [copyFn]);

      return createElement(CopyHookHarness, { onCopyReady: setCopyFn });
    }

    const { root, container } = await renderClient(createElement(MountCopyHook));

    try {
      await act(async () => {
        await Promise.resolve();
      });

      expect(capturedCopy).not.toBeNull();
      expect(document.querySelectorAll("textarea")).toHaveLength(0);

      await act(async () => {
        const ok = await capturedCopy!("copy this");
        expect(ok).toBe(false);
      });

      expect(document.querySelectorAll("textarea")).toHaveLength(0);
    } finally {
      await cleanupClient(root, container);

      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: originalClipboard,
      });

      if (originalExecCommand) {
        (
          document as Document & {
            execCommand: (command: string) => boolean;
          }
        ).execCommand = originalExecCommand;
      } else {
        delete (
          document as Document & {
            execCommand?: (command: string) => boolean;
          }
        ).execCommand;
      }
    }
  });
});
