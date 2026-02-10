"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { ComponentPreviewShell } from "../component-preview-shell";
import { ChatContextPreview } from "../chat-context-preview";
import { XPost } from "@/components/tool-ui/x-post";
import { InstagramPost } from "@/components/tool-ui/instagram-post";
import { LinkedInPost } from "@/components/tool-ui/linkedin-post";
import { xPostPresets, type XPostPresetName } from "@/lib/presets/x-post";
import {
  instagramPostPresets,
  type InstagramPostPresetName,
} from "@/lib/presets/instagram-post";
import {
  linkedInPostPresets,
  type LinkedInPostPresetName,
} from "@/lib/presets/linkedin-post";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/ui/cn";
import {
  STREAMING_PRESET_DESCRIPTION,
  STREAMING_PRESET_NAME,
} from "@/lib/docs/preview-config";
import {
  ToolRenderState,
  type StreamingToolRenderState,
} from "@/components/tool-ui/shared";

type Platform = "x" | "instagram" | "linkedin";
type PresetName =
  | XPostPresetName
  | InstagramPostPresetName
  | LinkedInPostPresetName
  | typeof STREAMING_PRESET_NAME;

const VALID_PLATFORMS: readonly Platform[] = ["x", "instagram", "linkedin"];

const platformConfig = {
  x: {
    label: "X (Twitter)",
    presets: xPostPresets,
    presetNames: Object.keys(xPostPresets) as XPostPresetName[],
  },
  instagram: {
    label: "Instagram",
    presets: instagramPostPresets,
    presetNames: Object.keys(instagramPostPresets) as InstagramPostPresetName[],
  },
  linkedin: {
    label: "LinkedIn",
    presets: linkedInPostPresets,
    presetNames: Object.keys(linkedInPostPresets) as LinkedInPostPresetName[],
  },
} as const;

const STREAMING_LOADING_STATE: StreamingToolRenderState<unknown, unknown> = {
  kind: "loading",
  args: null,
  result: null,
  message: "Loading tool output…",
  status: { type: "running" },
};
const STREAMING_PARTIAL_STATE: StreamingToolRenderState<unknown, unknown> = {
  kind: "partial",
  args: null,
  result: {},
  status: { type: "running" },
};
const STREAMING_ERROR_STATE: StreamingToolRenderState<unknown, unknown> = {
  kind: "error",
  args: null,
  result: null,
  message: "Tool output unavailable",
  isCancelled: false,
  status: { type: "complete" },
};

function getPresetNames(platform: Platform): PresetName[] {
  return [
    ...platformConfig[platform].presetNames,
    STREAMING_PRESET_NAME,
  ] as PresetName[];
}

function getValidPreset(platform: Platform, preset: string | null): PresetName {
  const presetNames = getPresetNames(platform);
  if (preset && (presetNames as readonly string[]).includes(preset)) {
    return preset as PresetName;
  }
  return presetNames[0];
}

function PlatformSelector({
  currentPlatform,
  onSelectPlatform,
}: {
  currentPlatform: Platform;
  onSelectPlatform: (platform: Platform) => void;
}) {
  return (
    <div className="mb-4">
      <div className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
        Platform
      </div>
      <Tabs
        value={currentPlatform}
        onValueChange={(value) => onSelectPlatform(value as Platform)}
      >
        <TabsList className="w-full bg-primary/5">
          <TabsTrigger value="x" className="flex-1">
            X
          </TabsTrigger>
          <TabsTrigger value="instagram" className="flex-1">
            Instagram
          </TabsTrigger>
          <TabsTrigger value="linkedin" className="flex-1">
            LinkedIn
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

function PresetSelector({
  platform,
  currentPreset,
  onSelectPreset,
}: {
  platform: Platform;
  currentPreset: PresetName;
  onSelectPreset: (preset: PresetName) => void;
}) {
  const config = platformConfig[platform];
  const presets = config.presets as Record<
    string,
    { description: string; data: unknown }
  >;
  const presetNames = getPresetNames(platform);

  return (
    <ItemGroup className="gap-1">
      {presetNames.map((preset) => (
        <Item
          key={preset}
          variant="default"
          size="sm"
          data-selected={currentPreset === preset}
          className={cn(
            "group/item relative py-[2px] lg:py-3!",
            currentPreset === preset
              ? "bg-muted cursor-pointer border-transparent shadow-xs"
              : "hover:bg-primary/5 active:bg-primary/10 cursor-pointer transition-[colors,shadow,border,background] duration-150 ease-out",
          )}
          onClick={() => onSelectPreset(preset as PresetName)}
        >
          <ItemContent className="transform-gpu transition-transform duration-300 ease-[cubic-bezier(0.3,-0.55,0.27,1.55)] will-change-transform group-active/item:scale-[0.98] group-active/item:duration-100 group-active/item:ease-out">
            <div className="relative flex items-start justify-between">
              <div className="flex flex-1 flex-col gap-0 lg:gap-1">
                <ItemTitle className="flex w-full items-center justify-between capitalize">
                  <span className="text-foreground">
                    {preset.replace("-", " ").replace("_", " ")}
                  </span>
                </ItemTitle>
                <ItemDescription className="text-sm font-light">
                  {preset === STREAMING_PRESET_NAME
                    ? STREAMING_PRESET_DESCRIPTION
                    : presets[preset].description}
                </ItemDescription>
              </div>
            </div>
            <span
              aria-hidden="true"
              data-selected={currentPreset === preset}
              className="bg-foreground absolute top-2.5 -left-4.5 h-5 w-1 origin-center -translate-y-1/2 scale-y-0 transform-gpu rounded-full opacity-0 transition-[opacity,transform] delay-100 duration-200 ease-out data-[selected=true]:scale-y-100 data-[selected=true]:opacity-100"
            />
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  );
}

export function SocialPostPreview() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const platformParam = searchParams.get("platform");
  const presetParam = searchParams.get("preset");

  const initialPlatform = useMemo((): Platform => {
    if (platformParam && VALID_PLATFORMS.includes(platformParam as Platform)) {
      return platformParam as Platform;
    }
    return "x";
  }, [platformParam]);

  const initialPreset = useMemo(
    () => getValidPreset(initialPlatform, presetParam),
    [initialPlatform, presetParam],
  );

  const [currentPlatform, setCurrentPlatform] =
    useState<Platform>(initialPlatform);
  const [currentPreset, setCurrentPreset] = useState<PresetName>(initialPreset);

  useEffect(() => {
    if (
      platformParam &&
      VALID_PLATFORMS.includes(platformParam as Platform) &&
      platformParam !== currentPlatform
    ) {
      setCurrentPlatform(platformParam as Platform);
      setCurrentPreset(getValidPreset(platformParam as Platform, presetParam));
    } else if (presetParam && presetParam !== currentPreset) {
      const validPreset = getValidPreset(currentPlatform, presetParam);
      if (validPreset !== currentPreset) {
        setCurrentPreset(validPreset);
      }
    }
  }, [platformParam, presetParam, currentPlatform, currentPreset]);

  const updateUrl = useCallback(
    (platform: Platform, preset: PresetName) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("platform", platform);
      params.set("preset", preset);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const handleSelectPlatform = useCallback(
    (platform: Platform) => {
      const defaultPreset = platformConfig[platform].presetNames[0];
      setCurrentPlatform(platform);
      setCurrentPreset(defaultPreset);
      updateUrl(platform, defaultPreset);
    },
    [updateUrl],
  );

  const handleSelectPreset = useCallback(
    (preset: PresetName) => {
      setCurrentPreset(preset);
      updateUrl(currentPlatform, preset);
    },
    [currentPlatform, updateUrl],
  );

  const isStreamingPreset = currentPreset === STREAMING_PRESET_NAME;
  const effectivePreset = (
    isStreamingPreset
      ? platformConfig[currentPlatform].presetNames[0]
      : currentPreset
  ) as XPostPresetName | InstagramPostPresetName | LinkedInPostPresetName;

  const renderedPost =
    currentPlatform === "x" ? (
      <XPost
        post={xPostPresets[effectivePreset as XPostPresetName].data.post}
        responseActions={
          xPostPresets[effectivePreset as XPostPresetName].data.responseActions
        }
        onAction={(action, post) => console.log("X action:", action, post.id)}
        onResponseAction={(id) => alert(`Response action: ${id}`)}
      />
    ) : currentPlatform === "instagram" ? (
      <InstagramPost
        post={
          instagramPostPresets[effectivePreset as InstagramPostPresetName].data
            .post
        }
        responseActions={
          instagramPostPresets[effectivePreset as InstagramPostPresetName].data
            .responseActions
        }
        onAction={(action, post) =>
          console.log("Instagram action:", action, post.id)
        }
        onResponseAction={(id) => alert(`Response action: ${id}`)}
      />
    ) : (
      <LinkedInPost
        post={
          linkedInPostPresets[effectivePreset as LinkedInPostPresetName].data
            .post
        }
        responseActions={
          linkedInPostPresets[effectivePreset as LinkedInPostPresetName].data
            .responseActions
        }
        onAction={(action, post) =>
          console.log("LinkedIn action:", action, post.id)
        }
        onResponseAction={(id) => alert(`Response action: ${id}`)}
      />
    );

  const previewContent = (
    <div className="mx-auto w-full max-w-[500px]">
      {isStreamingPreset ? (
        <div className="flex w-full flex-col gap-3">
          <ToolRenderState state={STREAMING_LOADING_STATE} />
          <div className="flex w-full flex-col gap-2">
            <ToolRenderState
              state={STREAMING_PARTIAL_STATE}
              partialLabel="Streaming partial output"
            />
            {renderedPost}
          </div>
          <ToolRenderState state={STREAMING_ERROR_STATE} />
        </div>
      ) : (
        renderedPost
      )}
    </div>
  );

  const chatPanel = (
    <ChatContextPreview
      userMessage="What are the trending posts about AI on social media right now?"
      preamble="Here's a popular post I found:"
    >
      {previewContent}
    </ChatContextPreview>
  );

  return (
    <ComponentPreviewShell
      componentId={`social-post-${currentPlatform}`}
      sidebar={
        <>
          <PlatformSelector
            currentPlatform={currentPlatform}
            onSelectPlatform={handleSelectPlatform}
          />
          <PresetSelector
            platform={currentPlatform}
            currentPreset={currentPreset}
            onSelectPreset={handleSelectPreset}
          />
        </>
      }
      preview={previewContent}
      chatPanel={chatPanel}
      codePanel={
        <div className="text-muted-foreground flex h-full items-center justify-center">
          Code panel coming soon
        </div>
      }
      code=""
    />
  );
}
