/**
 * Base URL for the tool-ui registry. Used in build output (registry.json homepage)
 * and in doc install commands. Set via env or default for local dev.
 */
export const REGISTRY_BASE_URL =
  process.env.NEXT_PUBLIC_REGISTRY_BASE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://tool-ui.com')

export const REGISTRY_INDEX_URL = `${REGISTRY_BASE_URL}/r/registry.json`
export function registryItemUrl(name: string): string {
  return `${REGISTRY_BASE_URL}/r/${name}.json`
}
