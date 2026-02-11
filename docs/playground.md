# Playground guide

Use `/playground` to get fast visual feedback while building Tool UI components.

## Entry points

- Page: `app/playground/page.tsx`
- Prototype registry: `lib/playground/registry.ts`
- Prototype definitions: `lib/playground/prototypes/*`

## Add a prototype

1. Create or update a prototype object in `lib/playground/prototypes/`.
2. Register it in `lib/playground/registry.ts`.
3. Reload `/playground` and select the prototype from the sidebar.

## Debug flow

1. Use "View tools" to inspect tool definitions.
2. Use "Copy chat state" to capture reproducible state for test fixtures.
3. Use "Reset thread" to validate first-run behavior repeatedly.

## Recommended loop

1. Edit component source in `components/tool-ui/<component>/`.
2. Adjust matching preset payload in `lib/presets/<component>.ts`.
3. Validate in `/playground` and `/docs/<component>`.
