---
name: tool-ui
description: Find, install, configure, and integrate Tool UI components in React apps using shadcn registry entries, compatibility checks, scaffolded runtime wiring, and troubleshooting workflows. Use when developers ask to add one or more Tool UI components, choose components for a use case, verify compatibility, or wire Tool UI payloads into assistant-ui or an existing chat/runtime stack.
---

# Tool UI

Use this skill to move from request to working Tool UI integration quickly.

Prefer assistant-ui when the project has no existing chat UI/runtime. Treat assistant-ui as optional when the app already has a working runtime.

## Workflow

1. Run compatibility and doctor checks.
2. Find candidate components or bundles.
3. Install selected components.
4. Generate scaffolds and integrate runtime wiring.
5. Validate behavior and troubleshoot failures.

## Step 1: Compatibility and Doctor

```bash
python scripts/tool_ui_compat.py --project <repo-root>
python scripts/tool_ui_compat.py --project <repo-root> --doctor
```

Auto-fix missing `@tool-ui` registry entry:

```bash
python scripts/tool_ui_compat.py --project <repo-root> --fix
```

Minimum requirements:

- `components.json` exists.
- `components.json.aliases.utils` exists (typically `@/lib/utils`).
- `components.json.registries["@tool-ui"]` equals `https://tool-ui.com/r/{name}.json`.

## Step 2: Discover Components

Use intent-first discovery:

```bash
python scripts/tool_ui_components.py list
python scripts/tool_ui_components.py find "<use case keywords>"
python scripts/tool_ui_components.py bundle
python scripts/tool_ui_components.py bundle planning-flow
```

References:

- `references/components-catalog.md`
- `references/recipes.md`

## Step 3: Install Components

Generate install command:

```bash
python scripts/tool_ui_components.py install <component-id> [component-id...]
```

Default install pattern:

```bash
npx shadcn@latest add https://tool-ui.com/r/<component-id>.json
```

Peer dependencies for specific components:

| Component   | Peer dependency | Install               |
| ----------- | --------------- | --------------------- |
| `code-diff` | `@pierre/diffs` | `npm i @pierre/diffs` |
| `chart`     | `recharts`      | `npm i recharts`      |

## Step 4: Scaffold and Integrate

Generate wiring snippet:

```bash
python scripts/tool_ui_scaffold.py --mode assistant-backend --component plan
python scripts/tool_ui_scaffold.py --mode assistant-frontend --component option-list
python scripts/tool_ui_scaffold.py --mode manual --component stats-display
```

Use integration patterns for final adaptation:

- `references/integration-patterns.md`

## Step 5: Validate and Troubleshoot

After integration:

1. Run typecheck/lint.
2. Trigger a real tool call.
3. Confirm UI renders and interactions complete expected flow.

If broken, use:

- `references/troubleshooting.md`

## Action Model

Tool UI uses two action surfaces, rendered as compound siblings outside the display component:

- `ToolUI.LocalActions`: non-consequential side effects (export, copy, open link). Handlers must not call `addResult(...)`.
- `ToolUI.DecisionActions`: consequential choices that produce a `DecisionResult` envelope via `createDecisionResult(...)`. The commit callback calls `addResult(...)`.

Compound wrapper pattern for display components with actions:

```tsx
<ToolUI id={surfaceId}>
  <ToolUI.Surface>
    <DataTable {...props} />
  </ToolUI.Surface>
  <ToolUI.Actions>
    <ToolUI.LocalActions
      actions={[{ id: "export-csv", label: "Export CSV" }]}
      onAction={(actionId) => {
        /* side effects only */
      }}
    />
  </ToolUI.Actions>
</ToolUI>
```

Three components are action-centric exceptions — they keep embedded action props instead of sibling surfaces. All three share a unified interface:

- `actions`: action buttons rendered by the component.
- `onAction(actionId, state)`: runs after the action and receives post-action state.
- `onBeforeAction(actionId, state)`: guard evaluated before an action runs.

| Component          | State type passed to handlers |
| ------------------ | ----------------------------- |
| `OptionList`       | `OptionListSelection`         |
| `ParameterSlider`  | `SliderValue[]`               |
| `PreferencesPanel` | `PreferencesValue`            |

ESLint enforces this model:

- `no-embedded-response-actions` — bans legacy `responseActions` / `onResponseAction` props.
- `no-add-result-in-local-actions` — prevents `addResult()` inside LocalActions handlers.
- `decision-actions-require-envelope` — requires `createDecisionResult(...)` in DecisionActions handlers.

## Schema Boundary

Every component schema follows the `defineToolUiContract` pattern:

```tsx
// 1. Base Zod schema (includes className)
const XPropsSchemaBase = z.object({
  id: ToolUIIdSchema,
  role: ToolUIRoleSchema.optional(),
  receipt: ToolUIReceiptSchema.optional(),
  /* ...component props... */
  className: z.string().optional(),
});

// 2. Props schema (may add cross-field validation via superRefine)
export const XPropsSchema = XPropsSchemaBase.superRefine(validate);
export type XProps = z.infer<typeof XPropsSchema>;

// 3. Serializable schema (strips className, re-applies refinements)
export const SerializableXSchema = XPropsSchemaBase.omit({
  className: true,
}).superRefine(validate);
export type SerializableX = z.infer<typeof SerializableXSchema>;

// 4. Contract — typed parse + safeParse
const contract = defineToolUiContract("X", SerializableXSchema);
export const parseSerializableX = contract.parse;
export const safeParseSerializableX = contract.safeParse;
```

Import from colocated entrypoints, not barrel `index.tsx`:

```tsx
import { DataTable } from "@/components/tool-ui/data-table/data-table";
import { safeParseSerializableDataTable } from "@/components/tool-ui/data-table/schema";
import {
  ToolUI,
  createDecisionResult,
  type Action,
} from "@/components/tool-ui/shared";
```

Cross-field validation with `superRefine` is used by several components:

- `code-diff`: patch vs. oldCode/newCode exclusivity.
- `order-summary`: variant/choice consistency, duplicate item ID detection.
- `progress-tracker`: duplicate step ID detection.

## Compound Component Pattern

Artifact and display components expose a compound API alongside a flat composed default:

```tsx
// Flat usage (composed default)
<CodeBlock code="const x = 1" language="typescript" />

// Compound usage (custom layout)
<CodeBlock.Root code="const x = 1" language="typescript">
  <CodeBlock.Header />
  <CodeBlock.Content />
  <CodeBlock.CollapseToggle />
</CodeBlock.Root>
```

Components using the compound pattern: `CodeBlock`, `CodeDiff`, `Terminal`, `ProgressTracker`.

Context is shared via `createContext` + `use()` (React 19). Subcomponents throw if used outside their Root.

## Receipt and Choice Convention

Components with outcomes use a `choice` prop to render confirmed/completed state:

| Component         | `choice` type            | Values / shape                                         |
| ----------------- | ------------------------ | ------------------------------------------------------ |
| `ApprovalCard`    | `"approved" \| "denied"` | String literal                                         |
| `OptionList`      | `string \| string[]`     | Selected option ID(s)                                  |
| `OrderSummary`    | `OrderDecision`          | `{ action: "confirm", orderId?, confirmedAt? }`        |
| `ProgressTracker` | `ToolUIReceipt`          | `{ outcome, summary, identifiers?, at }` (shared type) |

When `choice` is present, the component renders in receipt mode — read-only, no actions.

## Component-Specific Notes

### weather-widget

Import from `runtime.ts`, not `index.tsx`:

```tsx
import { WeatherWidget } from "@/components/tool-ui/weather-widget/runtime";
```

Schema is TypeScript-only (`schema-runtime.ts`), no Zod — the payload is machine-generated. The `generated/` directory is ESLint-ignored.

### code-diff

Two mutually exclusive input modes (enforced by schema):

- **Files mode**: provide `oldCode` and/or `newCode` strings.
- **Patch mode**: provide a unified `patch` string.

Requires peer dependency `@pierre/diffs`. Uses shared Pierre themes for syntax highlighting (same as `code-block`).

### terminal

Extended props beyond basic command/output:

- `durationMs`: elapsed time displayed in header.
- `cwd`: working directory prefix before command.
- `stderr`: rendered separately in red below stdout.
- `truncated`: shows "Output truncated..." note.
- `maxCollapsedLines`: collapsible output with line count toggle.

### code-block

Uses Pierre themes (`pierre-dark` / `pierre-light`) vendored in `shared/`. Themes auto-switch based on `data-theme` attribute, `.dark`/`.light` class, or `prefers-color-scheme`. Supports `maxCollapsedLines` and `highlightLines` for focused code regions.

## Adapter Pattern

Every component includes `_adapter.tsx` — a re-export file for UI primitives (`cn`, `Button`, `Collapsible`, etc.). Enforced by ESLint `no-restricted-imports`: components must import UI dependencies through `_adapter`, not directly from `@/components/ui/*`. This ensures copy-paste portability across projects.

## Operational Rules

- Install the smallest set of components that solves the request.
- Validate one component first, then scale to multiple components.
- Keep payload schemas serializable and explicit.
- For decision flows, wire `DecisionActions` with `createDecisionResult(...)` and commit via `addResult(...)`.
- For display components that need actions, use the compound `ToolUI` wrapper with `LocalActions`.
- Install peer dependencies when using `code-diff` (`@pierre/diffs`) or `chart` (`recharts`).

## Maintainer Notes

Keep component metadata synchronized with Tool UI source:

```bash
python scripts/sync_components.py
```

Run script tests:

```bash
python -m unittest discover -s tests -p "test_*.py"
```
