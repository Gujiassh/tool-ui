# Tool UI

### UI components for AI interfaces.

Responsive, accessible, typed, copy-pasteable. Built on Radix, shadcn/ui, and Tailwind. Open Source.

## Local development

```bash
pnpm install
pnpm dev
```

Open:

- `http://localhost:3000/docs/quick-start` for integration walkthrough
- `http://localhost:3000/docs/changelog` for release notes and migration prompts
- `http://localhost:3000/playground` for interactive prototype testing

## Quality checks

```bash
pnpm test
pnpm lint:ci
pnpm registry:check
```

## First aha in 10 minutes

1. Run `pnpm dev` and open `/playground`.
2. Add a prototype entry in `lib/playground/registry.ts`.
3. Use an existing preset from `lib/presets/*.ts` to render your target tool payload.
4. Iterate on the matching component under `components/tool-ui/<component>/`.
5. Rebuild registry artifacts with `pnpm registry:build`.

For detailed maintainer workflow see `docs/tests.md` and `docs/playground.md`.

## Components

- Approval Card — Binary confirmation for agent actions
- Audio — Audio playback with artwork and metadata
- Chart — Visualize data with interactive charts
- Citation — Display source references with attribution
- Code Block — Display syntax-highlighted code snippets
- Data Table — Sortable columns, row actions, mobile accordion layout
- Image — Display images with metadata and attribution
- Image Gallery — Grid layout for browsing image collections
- Item Carousel — Horizontal carousel for browsing collections
- Link Preview — Rich link previews with OG data
- Option List — Single/multi-select choices with external local/decision actions
- Order Summary — Itemized purchase confirmation with pricing
- Parameter Slider — Numeric parameter adjustment controls
- Plan — Display step-by-step task workflows
- Preferences Panel — Compact settings/preferences surface
- Progress Tracker — Multi-step progress and status surface
- Question Flow — Guided multi-step input/selection flow
- Social Post — X/Instagram/LinkedIn renderers with media previews
- Stats Display — Compact metric cards and deltas
- Terminal — Show command-line output and logs
- Video — Video playback with controls and poster
- Weather Widget — Forecast and conditions surface

👀 [Browse components](https://tool-ui.com/components)

## Maintenance

Tool UI is maintained by assistant-ui. This repository is optimized for direct maintenance rather than open-ended external contribution flow.

- [UI Guidelines](https://tool-ui.com/docs/design-guidelines) — design philosophy and principles
- [Changelog](https://tool-ui.com/docs/changelog) — release notes and migration guidance

## License

MIT License — see the [LICENSE](LICENSE) file for details.

## Shadcn Registry

Build Tool UI registry artifacts:

```bash
pnpm registry:build
```

This generates:

- `public/r/registry.json`
- `public/r/<component>.json` (e.g. `public/r/plan.json`)

Each component artifact includes only the shared files it directly depends on
(plus `lib/ui/cn.ts`) instead of requiring a monolithic `shared.json`.

## Component scaffold

Create a new component skeleton (component files + docs page + preset stub):

```bash
pnpm component:new my-component
```
