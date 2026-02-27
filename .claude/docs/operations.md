# Common Operations

## Adding a New Component

1. Create `apps/www/components/tool-ui/{name}/` with standard files
2. Create `apps/www/lib/presets/{name}.ts`
3. Add to `apps/www/lib/docs/component-registry.ts`
4. Add to `apps/www/lib/docs/preview-config.tsx`
5. Create `apps/www/app/docs/{name}/page.tsx` and `content.mdx`
6. Create `apps/www/app/docs/{name}/opengraph-image.tsx`
7. Add to `apps/www/app/docs/gallery/page.tsx`

## Renaming a Preset

1. Update type in `apps/www/lib/presets/{component}.ts`
2. Update object key
3. `grep` for old name across codebase
4. Update `defaultPreset` in `apps/www/lib/docs/preview-config.tsx` if needed
5. Update `content.mdx` and `gallery/page.tsx` references
