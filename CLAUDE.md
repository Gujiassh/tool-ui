# Tool UI

Copy/paste component library (shadcn/ui model) for AI assistant interfaces. Users copy component directories into projects and modify them. Source code is the product—readability over cleverness.

## Commands

```bash
pnpm dev          # Dev server (Turbopack)
pnpm build        # Production build
pnpm check        # Biome lint + format check (and run typecheck separately)
pnpm check:fix    # Biome auto-fix lint + format
pnpm typecheck    # TypeScript checking (tsgo)
pnpm test         # Run tests (Vitest)
pnpm verify:ci    # Full CI gate (typecheck + check + test + changelog/registry/weather checks)
```

## Tooling

- **Linter + Formatter**: Biome (config: `/biome.json` at repo root) — handles lint, format, Tailwind class sort, import organize. Run via `pnpm check` (lint+format) or `pnpm check:fix`.
- **Typecheck**: tsgo (`@typescript/native-preview`) — native TypeScript compiler
- **Git hooks**: husky (`/.husky/`) — pre-commit runs lint-staged + registry sync; pre-push runs typecheck + biome + registry/changelog checks

### Portability rules (manual — enforce in code review)

The following conventions used to be auto-enforced by lint plugins. They were removed in favor of code-review enforcement; if a violation slips into a PR, push back:

1. **No `window.open()` in `apps/www/components/tool-ui/**`** — use `openSafeNavigationHref` from `shared/media/safe-navigation` (preserves sandbox / noopener attributes).
2. **No `from "../shared"` barrel imports inside tool-ui components** — use deep paths like `from "../shared/schema"` so the barrel doesn't become a hidden coupling point.
3. **No `from "@/components/ui/*"` or `from "@/lib/utils"` inside tool-ui components** — import shadcn primitives and `cn` from the colocated `_adapter.tsx`. This is the portability promise: a user who copies a component dir into their project only edits one file.
4. **No `addResult(...)` inside `<LocalActions>` `onAction` handlers** — `LocalActions` is a non-consequential surface; commits go through `<DecisionActions>` instead.

## Stack

- **Package manager**: pnpm (required)
- **Dependencies**: Only shadcn/ui prerequisites (Tailwind, Radix, Lucide)—users shouldn't need new deps

## Architecture

### Component Structure

Each component lives in `apps/www/components/tool-ui/{name}/`. Reference: `apps/www/components/tool-ui/approval-card/`

Key files:

- `index.tsx` — Barrel exports
- `{name}.tsx` — Main component
- `schema.ts` — Zod schema + SerializableX types
- `_adapter.tsx` — shadcn re-exports

The `shared/` directory contains utilities all components need.

### Documentation Site

Interconnected registries:

- Component metadata: `apps/www/lib/docs/component-registry.ts`
- Presets (example data): `apps/www/lib/presets/{component}.ts`
- Preview rendering: `apps/www/lib/docs/preview-config.tsx`
- Doc pages: `apps/www/app/docs/{component}/content.mdx`
- Gallery: `apps/www/app/docs/gallery/page.tsx`

## Key Patterns

### Component API

- **Tailwind for layout**: No `maxWidth`/`padding` props—users customize via `className`
- **Standard widths**: Cards use `min-w-80 max-w-md`, compact components use `max-w-sm`
- **Flat props**: Avoid nested config objects
- **Semantic action IDs**: Use `id: "confirm"` / `id: "cancel"` for local and decision actions
- **Receipt state**: Use `choice` prop to render confirmed state (e.g., `<OptionList choice="option-a" />`)

### Main Component Structure

Reference: `apps/www/components/tool-ui/approval-card/approval-card.tsx:183`

- Outer `<article>` with `data-slot`, `data-tool-ui-id`, `lang="en"`, `aria-busy`
- Loading skeleton via `isLoading` prop
- Optional sibling `ToolUI.LocalActions` / `ToolUI.DecisionActions` surfaces

## Discovery

| What                    | Where                                            |
| ----------------------- | ------------------------------------------------ |
| Tool UI components      | `apps/www/components/tool-ui/` (scan barrels)    |
| Component docs metadata | `apps/www/lib/docs/component-registry.ts`        |
| Preset configurations   | `apps/www/lib/presets/*.ts`                      |
| Types & validation      | Colocated `schema.ts` files                      |
| assistant-ui reference  | `private/reference-docs/assistant-ui/`           |
| Design system specs     | `private/design-system/`                         |

## Task Guides

- Adding/modifying components: `.claude/docs/component-workflow.md`
- Writing doc pages: `.claude/docs/mdx-authoring.md`
- Copy style for examples: `.claude/docs/copy-guide.md`
- Writing changelog entries: `apps/www/docs/changelog.md`
