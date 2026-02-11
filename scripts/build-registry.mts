/**
 * Builds shadcn-compatible registry JSON from components/tool-ui.
 * Writes public/r/registry.json and public/r/{name}.json.
 *
 * Run: pnpm registry:build (or tsx scripts/build-registry.mts)
 */
import { readFileSync, readdirSync, mkdirSync, writeFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const REGISTRY_BASE_URL =
  process.env.NEXT_PUBLIC_REGISTRY_BASE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://tool-ui.assistant-ui.com')

const OUT_DIR = path.join(ROOT, 'public', 'r')
const TOOL_UI = path.join(ROOT, 'components', 'tool-ui')

const REGISTRY_NPM_DEPS = ['lucide-react', 'zod']
const REGISTRY_SHADCN_PREREQUISITES: Record<string, string[]> = {
  'approval-card': ['separator'],
  chart: ['chart', 'card'],
  citation: ['tooltip', 'popover'],
  'code-block': ['button', 'collapsible'],
  'data-table': ['button', 'dropdown-menu', 'accordion', 'tooltip', 'badge', 'table'],
  image: [],
  'image-gallery': ['button'],
  video: ['button'],
  audio: ['button', 'slider'],
  'link-preview': [],
  'message-draft': ['button'],
  'option-list': ['button', 'separator'],
  'order-summary': ['button', 'separator', 'skeleton'],
  'parameter-slider': ['button', 'separator', 'slider'],
  plan: ['accordion', 'card', 'collapsible'],
  'preferences-panel': ['button', 'switch', 'toggle-group', 'select', 'separator', 'label'],
  'progress-tracker': ['button'],
  'question-flow': ['button', 'separator'],
  'item-carousel': ['button', 'card'],
  'stats-display': ['card'],
  terminal: ['button', 'collapsible'],
  'weather-widget': ['card']
}

const COMPONENTS_META: { id: string; label: string; description: string }[] = [
  { id: 'approval-card', label: 'Approval Card', description: 'Binary confirmation for agent actions' },
  { id: 'chart', label: 'Chart', description: 'Visualize data with interactive charts' },
  { id: 'citation', label: 'Citation', description: 'Display source references with attribution' },
  { id: 'code-block', label: 'Code Block', description: 'Display syntax-highlighted code snippets' },
  { id: 'data-table', label: 'Data Table', description: 'Present structured data in sortable tables' },
  { id: 'image', label: 'Image', description: 'Display images with metadata and attribution' },
  { id: 'image-gallery', label: 'Image Gallery', description: 'Masonry grid with fullscreen lightbox viewer' },
  { id: 'video', label: 'Video', description: 'Video playback with controls and poster' },
  { id: 'audio', label: 'Audio', description: 'Audio playback with artwork and metadata' },
  { id: 'link-preview', label: 'Link Preview', description: 'Rich link previews with OG data' },
  { id: 'message-draft', label: 'Message Draft', description: 'Review and approve messages before sending' },
  { id: 'option-list', label: 'Option List', description: 'Let users select from multiple choices' },
  { id: 'order-summary', label: 'Order Summary', description: 'Display purchases with itemized pricing' },
  { id: 'parameter-slider', label: 'Parameter Slider', description: 'Numeric parameter adjustment controls' },
  { id: 'plan', label: 'Plan', description: 'Display step-by-step task workflows' },
  { id: 'preferences-panel', label: 'Preferences Panel', description: 'Compact settings panel for user preferences' },
  { id: 'progress-tracker', label: 'Progress Tracker', description: 'Real-time status feedback for multi-step operations' },
  { id: 'question-flow', label: 'Question Flow', description: 'Multi-step guided questions with branching' },
  { id: 'item-carousel', label: 'Item Carousel', description: 'Horizontal carousel for browsing collections' },
  { id: 'social-post', label: 'Social Posts', description: 'Render social media content previews' },
  { id: 'stats-display', label: 'Stats Display', description: 'Display key metrics in a grid' },
  { id: 'terminal', label: 'Terminal', description: 'Show command-line output and logs' },
  { id: 'weather-widget', label: 'Weather Widget', description: 'Display weather conditions and forecasts' }
]

const SHARED_ALIAS = '@/components/tool-ui/shared'

function transformSharedImports(content: string): string {
  return content
    .replace(/from ["']\.\.\/shared["']/g, `from "${SHARED_ALIAS}"`)
    .replace(/from ["']\.\.\/shared\//g, `from "${SHARED_ALIAS}/`)
}

function transformAdapterImports(content: string): string {
  return content
    .replace(/from ["']\.\.\/\.\.\/\.\.\/lib\/ui\/cn["']/g, 'from "@/lib/utils"')
    .replace(/from ["']@\/lib\/ui\/cn["']/g, 'from "@/lib/utils"')
    .replace(/from ["']\.\.\/\.\.\/ui\//g, 'from "@/components/ui/')
    .replace(/from ["']@\/components\/ui\//g, 'from "@/components/ui/')
}

function fileType(filename: string): 'registry:component' | 'registry:lib' | 'registry:style' {
  if (filename.endsWith('.css')) return 'registry:style'
  if (filename.endsWith('.tsx')) return 'registry:component'
  return 'registry:lib'
}

function* walkDir(dir: string, prefix = ''): Generator<string> {
  const entries = readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const rel = prefix ? `${prefix}/${e.name}` : e.name
    if (e.isDirectory()) {
      yield* walkDir(path.join(dir, e.name), rel)
    } else {
      yield rel
    }
  }
}

function readAndTransform(
  filePath: string,
  options: { isAdapter?: boolean; sharedToAlias?: boolean }
): string {
  let content = readFileSync(filePath, 'utf-8')
  if (options.sharedToAlias) content = transformSharedImports(content)
  if (options.isAdapter) content = transformAdapterImports(content)
  return content
}

interface RegistryFile {
  path: string
  type: string
  content: string
  target?: string
}

interface RegistryItem {
  $schema?: string
  name: string
  type: string
  description: string
  title: string
  registryDependencies: string[]
  dependencies: string[]
  files: RegistryFile[]
}

// Build tool-ui-shared item
function buildSharedItem(): RegistryItem {
  const sharedDir = path.join(TOOL_UI, 'shared')
  const files: RegistryFile[] = []
  const targetBase = 'components/tool-ui/shared'
  for (const rel of walkDir(sharedDir)) {
    const fullPath = path.join(sharedDir, rel)
    const isAdapter = rel === '_adapter.tsx'
    const content = readAndTransform(fullPath, { isAdapter })
    const target = `${targetBase}/${rel}`
    files.push({
      path: target,
      type: fileType(rel),
      content,
      target
    })
  }
  return {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: 'tool-ui-shared',
    type: 'registry:block',
    title: 'Tool UI Shared',
    description: 'Shared utilities and primitives used by all Tool UI components.',
    registryDependencies: ['button'],
    dependencies: [...REGISTRY_NPM_DEPS],
    files
  }
}

// Build component item
function buildComponentItem(id: string, label: string, description: string): RegistryItem | null {
  const compDir = path.join(TOOL_UI, id)
  try {
    statSync(compDir)
  } catch {
    return null
  }
  const shadcn = REGISTRY_SHADCN_PREREQUISITES[id] ?? []
  const sharedUrl = `${REGISTRY_BASE_URL}/r/tool-ui-shared.json`
  const registryDependencies = [sharedUrl, ...shadcn]
  const targetBase = `components/tool-ui/${id}`
  const files: RegistryFile[] = []
  for (const rel of walkDir(compDir)) {
    const fullPath = path.join(compDir, rel)
    const isAdapter = rel === '_adapter.tsx'
    const content = readAndTransform(fullPath, { sharedToAlias: true, isAdapter })
    const target = `${targetBase}/${rel}`
    files.push({
      path: target,
      type: fileType(rel),
      content,
      target
    })
  }
  return {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: id,
    type: 'registry:block',
    title: label,
    description,
    registryDependencies,
    dependencies: [...REGISTRY_NPM_DEPS],
    files
  }
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true })

  const sharedItem = buildSharedItem()
  const itemNames: string[] = [sharedItem.name]

  writeFileSync(
    path.join(OUT_DIR, `${sharedItem.name}.json`),
    JSON.stringify(sharedItem, null, 2),
    'utf-8'
  )

  for (const meta of COMPONENTS_META) {
    const item = buildComponentItem(meta.id, meta.label, meta.description)
    if (!item) continue
    itemNames.push(item.name)
    writeFileSync(
      path.join(OUT_DIR, `${item.name}.json`),
      JSON.stringify(item, null, 2),
      'utf-8'
    )
  }

  const registryIndex = {
    $schema: 'https://ui.shadcn.com/schema/registry.json',
    name: 'tool-ui',
    homepage: REGISTRY_BASE_URL,
    items: itemNames.map((name) => ({ name }))
  }
  writeFileSync(
    path.join(OUT_DIR, 'registry.json'),
    JSON.stringify(registryIndex, null, 2),
    'utf-8'
  )

  console.log(`Registry built: ${OUT_DIR}`)
  console.log(`  registry.json (${itemNames.length} items)`)
  itemNames.forEach((n) => console.log(`  ${n}.json`))
}

main()
