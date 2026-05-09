/**
 * Single source of truth for repo-level URLs and social links.
 * Used across header, footer, mobile nav, and docs TOC actions.
 */

export const SITE_LINKS = {
  github: "https://github.com/assistant-ui/tool-ui",
  githubIssues: "https://github.com/assistant-ui/tool-ui/issues",
  githubReleases: "https://github.com/assistant-ui/tool-ui/releases",
  twitter: "https://x.com/assistantui",
  discord: "https://discord.gg/S9dwgCNEFs",
  assistantUi: "https://www.assistant-ui.com",
  assistantUiCloud: "https://cloud.assistant-ui.com",
} as const;

const REPO_BASE = "https://github.com/assistant-ui/tool-ui";

/**
 * Build a GitHub edit URL for a docs page.
 * Conventions: docs slugs map to `apps/www/app/docs/{slug}/content.mdx`.
 */
export function getDocsEditUrl(slug: string): string {
  return `${REPO_BASE}/edit/main/apps/www/app/docs/${slug}/content.mdx`;
}

/**
 * Derive a docs slug from a Next.js pathname (`/docs/foo` → `foo`).
 * Returns null for non-docs paths, `gallery`, nested paths, or query-only paths.
 */
export function getDocsSlug(pathname: string): string | null {
  const slug = pathname.replace(/^\/docs\/?/, "").split("?")[0];
  if (!slug || slug === "gallery" || slug.includes("/")) return null;
  return slug;
}
