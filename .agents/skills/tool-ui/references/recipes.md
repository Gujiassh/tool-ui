# Integration Recipes

Use recipes when a user asks for a capability, not a specific component.

## Planning Flow

Components: `plan`, `progress-tracker`, `approval-card`

Use for: multi-step execution with final approval.

Install:

```bash
npx shadcn@latest add https://tool-ui.com/r/plan.json https://tool-ui.com/r/progress-tracker.json https://tool-ui.com/r/approval-card.json
```

## Research Output

Components: `citation`, `link-preview`, `code-block`, `code-diff`

Use for: cited answers with source previews, code artifacts, and before/after code changes.

Install:

```bash
npx shadcn@latest add https://tool-ui.com/r/citation.json https://tool-ui.com/r/link-preview.json https://tool-ui.com/r/code-block.json https://tool-ui.com/r/code-diff.json
```

Peer dependency: `npm i @pierre/diffs` (required by `code-diff`).

## Code Review

Components: `code-diff`, `code-block`, `approval-card`

Use for: reviewing code changes with diff view, displaying context snippets, and approving or rejecting.

Install:

```bash
npx shadcn@latest add https://tool-ui.com/r/code-diff.json https://tool-ui.com/r/code-block.json https://tool-ui.com/r/approval-card.json
```

Peer dependency: `npm i @pierre/diffs` (required by `code-diff`).

## Commerce Flow

Components: `item-carousel`, `order-summary`, `approval-card`

Use for: browse items, review totals, confirm purchase-like actions.

Install:

```bash
npx shadcn@latest add https://tool-ui.com/r/item-carousel.json https://tool-ui.com/r/order-summary.json https://tool-ui.com/r/approval-card.json
```

## Dashboard

Components: `stats-display`, `chart`, `data-table`

Use for: KPIs, visualizations, and tabular data in a single view.

Install:

```bash
npx shadcn@latest add https://tool-ui.com/r/stats-display.json https://tool-ui.com/r/chart.json https://tool-ui.com/r/data-table.json
```

Peer dependency: `npm i recharts` (required by `chart`).

## Recipe Command

```bash
python scripts/tool_ui_components.py bundle
python scripts/tool_ui_components.py bundle planning-flow
```
