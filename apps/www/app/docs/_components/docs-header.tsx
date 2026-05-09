import { isComponentId } from "@/lib/docs/component-ids";
import { CopyMarkdownButton } from "./copy-markdown-button";
import { HeaderPreviewTabs } from "./header-preview-tabs";
import { InstallCommandLine } from "./install-command-line";
import { getMdxAsMarkdown } from "./mdx-to-markdown";

type DocsHeaderProps = {
  title: string;
  description?: string;
  mdxPath?: string;
};

export function DocsHeader({ title, description, mdxPath }: DocsHeaderProps) {
  const markdown = mdxPath ? getMdxAsMarkdown(mdxPath) : undefined;
  const componentIdMatch = mdxPath?.match(/^app\/docs\/([^/]+)\/content\.mdx$/);
  const parsedComponentId = componentIdMatch?.[1];
  const componentId =
    parsedComponentId && isComponentId(parsedComponentId)
      ? parsedComponentId
      : null;

  return (
    <header className="not-prose mb-8 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <h1 className="font-normal text-[32px] leading-[1.2] tracking-[-0.02em]">
          {title}
        </h1>
        {markdown && <CopyMarkdownButton markdown={markdown} />}
      </div>
      {description && (
        <p className="text-[15px] text-muted-foreground leading-[1.5]">
          {description}
        </p>
      )}
      {componentId && (
        <InstallCommandLine componentId={componentId} className="mt-3" />
      )}
      {componentId && <HeaderPreviewTabs componentId={componentId} />}
    </header>
  );
}
