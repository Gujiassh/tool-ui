import { CopyMarkdownButton } from "./copy-markdown-button";
import { HeaderPreviewTabs } from "./header-preview-tabs";
import { InstallCommandLine } from "./install-command-line";
import { getMdxAsMarkdown } from "./mdx-to-markdown";
import { isComponentId } from "@/lib/docs/component-ids";

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
    <header className="not-prose mb-8 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-2xl font-medium tracking-tight">{title}</h1>
        {markdown && <CopyMarkdownButton markdown={markdown} />}
      </div>
      {description && (
        <p className="text-[14px] text-muted-foreground">{description}</p>
      )}
      {componentId && (
        <InstallCommandLine componentId={componentId} className="mt-3" />
      )}
      {componentId && <HeaderPreviewTabs componentId={componentId} />}
    </header>
  );
}
