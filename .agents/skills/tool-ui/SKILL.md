---
name: tool-ui
description: Find, install, configure, and integrate Tool UI components in React apps using shadcn registry entries, compatibility checks, scaffolded runtime wiring, toolkit setup with assistant-ui, and troubleshooting workflows. Use when developers ask to add one or more Tool UI components, choose components for a use case, verify compatibility, wire a toolkit in a codebase, or integrate Tool UI payloads into assistant-ui or an existing chat/runtime stack.
---

# Tool UI

Use this skill to move from request to working Tool UI integration quickly.

Prefer assistant-ui when the project has no existing chat UI/runtime. Treat assistant-ui as optional when the app already has a working runtime.

## Workflow

1. Run compatibility and doctor checks.
2. Find candidate components or bundles.
3. Install selected components.
4. Generate scaffolds and integrate runtime wiring (see **Toolkit setup in a codebase** for assistant-ui + toolkit).
5. Validate behavior and troubleshoot failures.

## Step 1: Compatibility and Doctor

Scripts live in `.agents/skills/tool-ui/scripts/`. Run from tool-ui repo root or use `cd .agents/skills/tool-ui && python scripts/...`:

```bash
python .agents/skills/tool-ui/scripts/tool_ui_compat.py --project <user-project-root>
python .agents/skills/tool-ui/scripts/tool_ui_compat.py --project <user-project-root> --doctor
```

Auto-fix missing `@tool-ui` registry entry:

```bash
python .agents/skills/tool-ui/scripts/tool_ui_compat.py --project <user-project-root> --fix
```

Minimum requirements (in the user's project):

- `components.json` exists.
- `components.json.aliases.utils` exists (e.g. `@/lib/utils`).
- `components.json.registries["@tool-ui"]` equals `https://tool-ui.com/r/{name}.json`.

## Step 2: Discover Components

```bash
python .agents/skills/tool-ui/scripts/tool_ui_components.py list
python .agents/skills/tool-ui/scripts/tool_ui_components.py find "<use case keywords>"
python .agents/skills/tool-ui/scripts/tool_ui_components.py bundle
python .agents/skills/tool-ui/scripts/tool_ui_components.py bundle planning-flow
```

References (under `.agents/skills/tool-ui/references/`):

- `components-catalog.md`
- `recipes.md`

## Step 3: Install Components

### Install command

Run from project root (requires `components.json` with `@tool-ui` registry):

```bash
npx shadcn@latest add @tool-ui/<component-id>
```

Multiple components:

```bash
npx shadcn@latest add @tool-ui/plan @tool-ui/progress-tracker @tool-ui/approval-card
```

Or generate via script:

```bash
python .agents/skills/tool-ui/scripts/tool_ui_components.py install <component-id> [component-id...]
```

### Peer dependencies

| Component   | Peer dependency | Install               |
| ----------- | --------------- | --------------------- |
| `code-diff` | `@pierre/diffs` | `npm i @pierre/diffs` |
| `chart`     | `recharts`      | `npm i recharts`      |

### Complete component catalog

All 25 Tool UI components with install commands:

**Progress**

| Component         | Description                                           | Install |
| ----------------- | ----------------------------------------------------- | ------- |
| `plan`            | Step-by-step task workflows with status tracking       | `npx shadcn@latest add @tool-ui/plan` |
| `progress-tracker`| Real-time status feedback for multi-step operations    | `npx shadcn@latest add @tool-ui/progress-tracker` |

**Input**

| Component           | Description                                    | Install |
| ------------------- | ---------------------------------------------- | ------- |
| `option-list`       | Let users select from multiple choices         | `npx shadcn@latest add @tool-ui/option-list` |
| `parameter-slider`  | Numeric parameter adjustment controls          | `npx shadcn@latest add @tool-ui/parameter-slider` |
| `preferences-panel` | Compact settings panel for user preferences    | `npx shadcn@latest add @tool-ui/preferences-panel` |
| `question-flow`     | Multi-step guided questions with branching     | `npx shadcn@latest add @tool-ui/question-flow` |

**Display**

| Component       | Description                                         | Install |
| --------------- | --------------------------------------------------- | ------- |
| `citation`      | Display source references with attribution          | `npx shadcn@latest add @tool-ui/citation` |
| `item-carousel` | Horizontal carousel for browsing collections        | `npx shadcn@latest add @tool-ui/item-carousel` |
| `link-preview`  | Rich link previews with Open Graph data             | `npx shadcn@latest add @tool-ui/link-preview` |
| `stats-display` | Key metrics and KPIs in a visual grid               | `npx shadcn@latest add @tool-ui/stats-display` |
| `terminal`      | Show command-line output and logs                   | `npx shadcn@latest add @tool-ui/terminal` |
| `weather-widget`| Weather display with forecasts and conditions       | `npx shadcn@latest add @tool-ui/weather-widget` |

**Artifacts**

| Component      | Description                                         | Install |
| -------------- | --------------------------------------------------- | ------- |
| `chart`        | Visualize data with interactive charts (needs `recharts`) | `npx shadcn@latest add @tool-ui/chart` |
| `code-block`   | Display syntax-highlighted code snippets            | `npx shadcn@latest add @tool-ui/code-block` |
| `code-diff`    | Compare code changes with syntax-highlighted diffs (needs `@pierre/diffs`) | `npx shadcn@latest add @tool-ui/code-diff` |
| `data-table`   | Present structured data in sortable tables          | `npx shadcn@latest add @tool-ui/data-table` |
| `message-draft`| Review and approve messages before sending          | `npx shadcn@latest add @tool-ui/message-draft` |
| `instagram-post` | Render Instagram post previews                    | `npx shadcn@latest add @tool-ui/instagram-post` |
| `linkedin-post`  | Render LinkedIn post previews                     | `npx shadcn@latest add @tool-ui/linkedin-post` |
| `x-post`       | Render X post previews                              | `npx shadcn@latest add @tool-ui/x-post` |

**Confirmation**

| Component       | Description                               | Install |
| --------------- | ----------------------------------------- | ------- |
| `approval-card` | Binary confirmation for agent actions     | `npx shadcn@latest add @tool-ui/approval-card` |
| `order-summary` | Display purchases with itemized pricing   | `npx shadcn@latest add @tool-ui/order-summary` |

**Media**

| Component      | Description                                         | Install |
| -------------- | --------------------------------------------------- | ------- |
| `audio`        | Audio playback with artwork and metadata            | `npx shadcn@latest add @tool-ui/audio` |
| `image`        | Display images with metadata and attribution        | `npx shadcn@latest add @tool-ui/image` |
| `image-gallery`| Masonry grid with fullscreen lightbox viewer        | `npx shadcn@latest add @tool-ui/image-gallery` |
| `video`        | Video playback with controls and poster             | `npx shadcn@latest add @tool-ui/video` |

Docs: each component has a doc page at `/docs/<component-id>` (e.g. `/docs/option-list`).

### Example installs by use case

```bash
# Planning flow (plan + progress + approval)
npx shadcn@latest add @tool-ui/plan @tool-ui/progress-tracker @tool-ui/approval-card

# Research output (citation + link preview + code)
npx shadcn@latest add @tool-ui/citation @tool-ui/link-preview @tool-ui/code-block @tool-ui/code-diff

# Data display (table + chart + stats)
npx shadcn@latest add @tool-ui/data-table @tool-ui/chart @tool-ui/stats-display
# npm i recharts  # peer for chart

# Media (images + video + audio)
npx shadcn@latest add @tool-ui/image @tool-ui/image-gallery @tool-ui/video @tool-ui/audio
```

See `references/recipes.md` for more bundles.

## Step 4: Scaffold and Integrate

Generate wiring snippet:

```bash
python .agents/skills/tool-ui/scripts/tool_ui_scaffold.py --mode assistant-backend --component plan
python .agents/skills/tool-ui/scripts/tool_ui_scaffold.py --mode assistant-frontend --component option-list
python .agents/skills/tool-ui/scripts/tool_ui_scaffold.py --mode manual --component stats-display
```

Use integration patterns for final adaptation:

- `references/integration-patterns.md`

### Toolkit setup in a codebase

After installing components, wire them into assistant-ui via a `Toolkit`. This section covers the full setup: provider, runtime, toolkit file, and ID handling.

#### 1. Provider and runtime

Create an assistant wrapper that provides runtime, transport, and tools:

```tsx
'use client'

import { lastAssistantMessageIsCompleteWithToolCalls } from 'ai'
import { AssistantRuntimeProvider, Tools, useAui } from '@assistant-ui/react'
import { AssistantChatTransport, useChatRuntime } from '@assistant-ui/react-ai-sdk'
import { Thread } from '@/components/assistant-ui/thread'
import { toolkit } from '@/components/toolkit'

export const Assistant = () => {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({ api: '/api/chat' }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls
  })
  const aui = useAui({ tools: Tools({ toolkit }) })

  return (
    <AssistantRuntimeProvider runtime={runtime} aui={aui}>
      <div className="h-dvh">
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  )
}
```

Key points:

- `useChatRuntime` + `AssistantChatTransport`: connects to your chat API.
- `Tools({ toolkit })`: forwards tool definitions and renderers to the model.
- `sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls`: auto-continues after tool calls (optional but common for tool-heavy flows).

#### 2. Toolkit file structure

Create a single `toolkit.ts` (or `toolkit.tsx`) that exports a `Toolkit` object. Each key is a tool name; each value has `type`, `description`, `parameters`, and `render`.

**Backend tools** (model returns result; no user input):

```tsx
import { type Toolkit } from '@assistant-ui/react'
import { Plan } from '@/components/tool-ui/plan'
import { safeParseSerializablePlan } from '@/components/tool-ui/plan/schema'

export const toolkit: Toolkit = {
  showPlan: {
    type: 'backend',
    render: ({ result }) => {
      const parsed = safeParseSerializablePlan(result)
      if (!parsed) return null
      return <Plan {...parsed} />
    }
  }
}
```

**Frontend tools** (model sends args; user interaction commits via `addResult`):

```tsx
import { type Toolkit } from '@assistant-ui/react'
import { OptionList } from '@/components/tool-ui/option-list'
import {
  SerializableOptionListSchema,
  safeParseSerializableOptionList
} from '@/components/tool-ui/option-list/schema'

const optionListTool: Toolkit[string] = {
  description: 'Render selectable options with confirm and clear actions.',
  parameters: SerializableOptionListSchema,
  render: ({ args, toolCallId, result, addResult }) => {
    const parsed = safeParseSerializableOptionList({
      ...args,
      id: args?.id ?? `option-list-${toolCallId}`
    })
    if (!parsed) return null

    if (result) {
      return <OptionList {...parsed} choice={result} />
    }
    return (
      <OptionList
        {...parsed}
        onAction={async (actionId, selection) => {
          if (actionId === 'confirm' || actionId === 'cancel') {
            await addResult?.(selection)
          }
        }}
      />
    )
  }
}

export const toolkit: Toolkit = {
  option_list: optionListTool,
  approval_card: { /* ... */ }
}
```

#### 3. ID handling

Tool UI components require a stable `id`. For frontend tools, merge `args` with a fallback ID:

```tsx
id: args?.id ?? `${componentId}-${toolCallId}`
```

Example for ApprovalCard:

```tsx
const parsed = safeParseSerializableApprovalCard({
  ...args,
  id: args?.id ?? `approval-card-${toolCallId}`
})
```

You can centralize this in a helper:

```tsx
function withToolId<T extends { id?: string }>(
  args: T,
  toolCallId: string,
  componentId: string
): T & { id: string } {
  return { ...args, id: args?.id ?? `${componentId}-${toolCallId}` } as T & { id: string }
}

// Usage
const parsed = safeParseSerializableOptionList(withToolId(args, toolCallId, 'option-list'))
```

#### 4. Action-centric vs compound components

| Pattern | Components | Usage |
| ------- | ---------- | ----- |
| **Action-centric** | `OptionList`, `ParameterSlider`, `PreferencesPanel`, `ApprovalCard` | Wire `onAction` or `onConfirm`/`onCancel` directly; no `ToolUI` wrapper. Pass `choice={result}` for receipt state. |
| **Compound** | `OrderSummary`, `DataTable`, etc. | Wrap in `ToolUI` + `ToolUI.Surface` + `ToolUI.Actions`; use `DecisionActions` or `LocalActions`. |

Action-centric example (OptionList):

```tsx
return (
  <OptionList
    {...parsed}
    onAction={async (actionId, selection) => {
      if (actionId === 'confirm' || actionId === 'cancel') {
        await addResult?.(selection)
      }
    }}
  />
)
```

Compound example (OrderSummary with DecisionActions):

```tsx
return (
  <ToolUI id={parsed.id}>
    <ToolUI.Surface>
      <OrderSummary {...parsed} />
    </ToolUI.Surface>
    <ToolUI.Actions>
      <ToolUI.DecisionActions
        actions={[
          { id: 'cancel', label: 'Cancel', variant: 'outline' },
          { id: 'confirm', label: 'Purchase' }
        ]}
        onAction={(action) => createDecisionResult({ decisionId: parsed.id, action })}
        onCommit={(decision) => addResult?.(decision)}
      />
    </ToolUI.Actions>
  </ToolUI>
)
```

ApprovalCard uses embedded actions; wire `onConfirm`/`onCancel` directly:

```tsx
return (
  <ApprovalCard
    {...parsed}
    choice={result === 'approved' || result === 'denied' ? result : parsed.choice}
    onConfirm={async () => addResult?.('approved')}
    onCancel={async () => addResult?.('denied')}
  />
)
```


#### 5. Checklist for each tool

1. **Import**: component from `@/components/tool-ui/{id}`, schema and `safeParseSerializable*` from `schema.ts`.
2. **Parse**: always `safeParse*`; return `null` on failure.
3. **Receipt**: if `result` exists, render with `choice={result}` (or equivalent) for read-only state.
4. **ID**: ensure `id` is set via `args?.id ?? \`{component}-${toolCallId}\``.
5. **addResult**: call only for consequential actions (confirm, approve, select); never in LocalActions handlers.

See `references/integration-patterns.md` for backend vs frontend, LocalActions vs DecisionActions, and manual (non-assistant-ui) rendering.

## Step 5: Validate and Troubleshoot

After integration:

1. Run typecheck/lint.
2. Trigger a real tool call.
3. Confirm UI renders and interactions complete expected flow.

If broken, use:

- `references/troubleshooting.md` (under `.agents/skills/tool-ui/references/`)

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

Import components from the barrel and schema/parser from the schema file:

```tsx
import { DataTable } from "@/components/tool-ui/data-table";
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

Keep component metadata synchronized with Tool UI source (from tool-ui repo root):

```bash
python .agents/skills/tool-ui/scripts/sync_components.py
```

Run skill script tests (from skill root `.agents/skills/tool-ui/`):

```bash
cd .agents/skills/tool-ui && python -m unittest discover -s tests -p "test_*.py"
```
