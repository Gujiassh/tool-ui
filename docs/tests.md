# Test guide

Tool UI tests use Vitest with node environment and strict console guards.

## Run tests

```bash
pnpm test
pnpm test:watch
```

## Test locations

- Tool UI contracts: `lib/tests/tool-ui/**`
- Registry artifacts: `lib/tests/registry/**`
- Playground logic: `lib/playground/**/*.test.ts`

## Console policy

`lib/tests/setup/console-guard.ts` fails tests on unexpected `console.warn` / `console.error`.
If a test expects a warning, add an explicit allow pattern there.

## What to test for new components

1. Schema parse/safeParse contracts
2. State transitions and action semantics
3. Accessibility ids/roles for interactive surfaces
4. Registry artifact inclusion after `pnpm registry:build`
