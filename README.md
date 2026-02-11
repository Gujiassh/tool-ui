# Tool UI

### UI components for AI interfaces.

Responsive, accessible, typed, copy-pasteable. Built on Radix, shadcn/ui, and Tailwind. Open Source.

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
- Option List — Single/multi-select choices with response actions
- Order Summary — Itemized purchase confirmation with pricing
- Parameter Slider — Numeric parameter adjustment controls
- Plan — Display step-by-step task workflows
- Social Post — X/Instagram/LinkedIn renderers with media previews
- Terminal — Show command-line output and logs
- Video — Video playback with controls and poster

👀 [Browse components](https://tool-ui.com/components)

## Contributing

Contributions are welcome! Before investing time building something, please [open an issue](https://github.com/assistant-ui/tool-ui/issues) to discuss your idea first.

When you're ready to submit a PR, please read:

- [UI Guidelines](https://tool-ui.com/docs/design-guidelines) — Design philosophy and principles
- [Contributing Guide](https://tool-ui.com/docs/contributing) — Component structure and implementation checklist

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
