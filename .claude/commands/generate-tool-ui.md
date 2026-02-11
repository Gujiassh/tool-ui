---
description: Generate a complete Tool UI component with docs, presets, and quality gates
---

# Generate Tool UI

Create a new Tool UI component through a maintainer-first workflow.

## Arguments

`$ARGUMENTS`

If no arguments are provided, start with the designer interview.
If a component slug is provided, use it as the starting point.

## Workflow

This command orchestrates 5 specialized agents in sequence:

`designer → implementer → (examples ∥ documenter) → reviewer`

## Execution Steps

### 1. Design

Launch `tool-ui-designer` to interview and produce a concrete design spec:
- component slug + label
- serializable schema shape
- action semantics
- receipt semantics (`choice`)
- accessibility + state behavior

### 2. Implement

Launch `tool-ui-implementer` with the design spec.

Implementation must follow current repo contracts:
- scaffold-first: `pnpm component:new <slug>` when creating from scratch
- schema contract via `defineToolUiContract` + `parseSerializableX` + `safeParseSerializableX`
- receipt prop is `choice` (never `confirmed` / `decision`)
- maintain component directory file contract (including `README.md`)
- update aggregate exports in `components/tool-ui/index.ts`

### 3. Examples + Docs (Parallel)

Launch both in parallel:
- `tool-ui-examples`: presets + gallery/showcase decisions
- `tool-ui-documenter`: docs page + registry wiring

### 4. Review

Launch `tool-ui-reviewer` as the quality gate.

Hard gates:
- `pnpm lint:ci`
- `pnpm typecheck`
- `pnpm test`
- `pnpm registry:check`

### 5. Report

Return a concise summary:
- files created/updated
- any warnings
- final gate status

## Critical Registration Points

The documenter/reviewer must ensure all of these are wired:

| File | Purpose |
|------|---------|
| `lib/docs/component-registry.ts` | Component metadata + docs nav categorization |
| `lib/docs/preview-config.tsx` | Interactive preview config + `ComponentId` coverage |
| `app/docs/_components/preset-selector.tsx` | Examples tab preset mapping |
| `app/docs/{name}/page.tsx` | `ComponentDocsTabs` docs/examples surface |

## Notes

- Tool UI in this repo is maintainer-owned and optimized for direct maintenance.
- Prefer pragmatic, explicit implementations over abstractions that reduce readability.
- If any phase fails, report the blocker with the exact file/command and continue where possible.
