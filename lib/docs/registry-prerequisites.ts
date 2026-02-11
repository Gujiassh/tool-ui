/**
 * Shadcn/ui registry component names required by each tool-ui component.
 * Used when building registry JSON (registryDependencies).
 * List only shadcn primitives (e.g. "button", "separator"); "tool-ui-shared" is added by the build script.
 */
export const REGISTRY_SHADCN_PREREQUISITES: Record<string, string[]> = {
  'approval-card': ['separator'],
  'chart': ['chart', 'card'],
  'citation': ['tooltip', 'popover'],
  'code-block': ['button', 'collapsible'],
  'data-table': ['button', 'dropdown-menu', 'accordion', 'tooltip', 'badge', 'table'],
  'image': [],
  'image-gallery': ['button'],
  'video': ['button'],
  'audio': ['button', 'slider'],
  'link-preview': [],
  'message-draft': ['button'],
  'option-list': ['button', 'separator'],
  'order-summary': ['button', 'separator', 'skeleton'],
  'parameter-slider': ['button', 'separator', 'slider'],
  'plan': ['accordion', 'card', 'collapsible'],
  'preferences-panel': ['button', 'switch', 'toggle-group', 'select', 'separator', 'label'],
  'progress-tracker': ['button'],
  'question-flow': ['button', 'separator'],
  'item-carousel': ['button', 'card'],
  'stats-display': ['card'],
  'terminal': ['button', 'collapsible'],
  'weather-widget': ['card'],
}

/** NPM dependencies common to all tool-ui components (for registry items). */
export const REGISTRY_NPM_DEPS = ['lucide-react', 'zod'] as const
