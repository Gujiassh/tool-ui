import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  // Global ignores first
  globalIgnores([
    "**/dist/**",
    "**/node_modules/**",
    "**/.next/**",
    "**/out/**",
    "**/next-env.d.ts",
  ]),

  // Next.js recommended configs (native flat format in v16, includes React)
  ...nextVitals,
  ...nextTs,

  // Custom rules override
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      // Disable strict React Compiler rules that don't fit this codebase's patterns
      "react-hooks/refs": "off",
      "react-hooks/immutability": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
    },
  },
  {
    files: ["components/tool-ui/**/*.ts", "components/tool-ui/**/*.tsx"],
    ignores: ["components/tool-ui/shared/media/safe-navigation.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.object.name='window'][callee.property.name='open']",
          message:
            "Use openSafeNavigationHref from components/tool-ui/shared/media/safe-navigation instead of window.open.",
        },
      ],
    },
  },
  {
    files: ["components/tool-ui/**/*.ts", "components/tool-ui/**/*.tsx"],
    ignores: ["components/tool-ui/shared/**/*.ts", "components/tool-ui/shared/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "../shared",
              message:
                "Import from direct shared modules (for example '../shared/schema' or '../shared/contract') instead of the shared barrel.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["components/tool-ui/**/*.ts", "components/tool-ui/**/*.tsx"],
    ignores: [
      "components/tool-ui/**/_adapter.tsx",
      "components/tool-ui/shared/**/*.ts",
      "components/tool-ui/shared/**/*.tsx",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/components/ui/*", "@/lib/ui/cn"],
              message:
                "Import UI primitives and cn from './_adapter' to keep tool-ui components portable.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
