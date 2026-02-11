---
name: tool-ui-implementer
description: Create Tool UI component source files. Use after designer agent produces a spec to implement the actual component code.
tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

# Tool UI Implementer Agent

You implement a new Tool UI component to current repo standards.

## Context

Tool UI is maintainer-owned and copy/paste-first. Readability and predictable contracts are mandatory.

## Input

You receive a design spec with:
- slug + intent
- schema shape
- action semantics
- receipt semantics
- accessibility requirements

## Implementation Steps

### 1. Scaffold First

For a new component, run:

```bash
pnpm component:new <slug>
```

Then extend scaffolded files instead of creating ad-hoc structure.

### 2. Component Directory Contract

Ensure `components/tool-ui/<slug>/` includes:
- `_adapter.tsx`
- `schema.ts`
- `<slug>.tsx`
- `error-boundary.tsx`
- `index.ts` or `index.tsx`
- `README.md`

### 3. Schema + Parse Contract

Use current schema contract pattern:
- `defineToolUiContract` from `../shared/contract`
- `parseSerializableX`
- `safeParseSerializableX`

Rules:
- serializable schema is JSON-safe only
- `className` is client-only, not in serializable schema
- do not use `.default()` on Zod fields
- receipt prop is `choice` (never `confirmed`/`decision`)

### 4. Component Rules

- Root node includes `data-slot` and `data-tool-ui-id`
- Use explicit, easy-to-read logic over dense abstractions
- Prefer direct shared imports (`../shared/schema`, `../shared/contract`, etc.) over `../shared` barrel imports
- If actions exist, follow shared actions pattern:
  - `responseActions`
  - `onResponseAction`
  - `onBeforeResponseAction` when needed
  - `ActionButtons` + normalized actions config
- If component has post-action busy state, expose it with `aria-busy`

### 5. Error Boundary + Exports

- Use `createToolUiErrorBoundary` from `../shared/error-boundary`
- Export component, error boundary, schema, parse/safeParse helpers, and types
- Update aggregate exports in `components/tool-ui/index.ts`

### 6. Tests for Non-Trivial Behavior

For logic-heavy behavior, add focused tests in:
- `lib/tests/tool-ui/<slug>/...`

Good candidates:
- deterministic ids/keys
- state transition helpers
- action semantics
- parsing contracts

## Reference Files

- `components/tool-ui/option-list/*`
- `components/tool-ui/plan/*`
- `components/tool-ui/message-draft/*`
- `components/tool-ui/shared/*`
- `scripts/new-tool-ui-component.ts`

## Final Checklist

- [ ] Scaffold-based structure is complete
- [ ] Schema uses `defineToolUiContract`
- [ ] Receipt semantics use `choice`
- [ ] No `../shared` barrel imports for core component logic
- [ ] Component exports are complete (local + aggregate)
- [ ] Added contract tests for non-trivial logic
