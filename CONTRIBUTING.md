# Tool UI Maintainer Guide

This guide is the shortest path from clone to a working Tool UI component for assistant-ui maintainers.

## Setup

```bash
pnpm install
pnpm dev
```

Open:

- `http://localhost:3000/docs/contributing`
- `http://localhost:3000/playground`

## Component workflow

1. Start from a scaffold: `pnpm component:new your-component-name`
2. Implement the surface in `components/tool-ui/your-component-name/`
3. Add or update sample payload in `lib/presets/your-component-name.ts`
4. Document usage in `app/docs/your-component-name/content.mdx`
5. Regenerate registry artifacts: `pnpm registry:build`

## Required checks

```bash
pnpm test
pnpm lint:ci
pnpm registry:check
```

## File contract for each component

Each `components/tool-ui/<name>/` directory should include:

- `schema.ts` with `SerializableXSchema`, `parseSerializableX`, and `safeParseSerializableX`
- Main component file (usually `<name>.tsx`)
- `_adapter.tsx` for local primitive re-exports
- `index.ts` or `index.tsx`
- `README.md`

## Related docs

- `docs/playground.md` for prototype workflow
- `docs/tests.md` for test strategy and suite map
