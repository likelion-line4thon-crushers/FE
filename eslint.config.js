import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import react from "eslint-plugin-react";
import tseslint from "typescript-eslint";
import boundaries from "eslint-plugin-boundaries";

export default [
  {
    ignores: [
      "dist",
      "playwright/.cache",
      "test-results",
      "playwright-report",
      "blob-report",
      "tests/k6",
    ],
  },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    settings: { react: { version: "19" } },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      react,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    settings: { react: { version: "19" } },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      react,
    },
    rules: {
      ...tseslint.configs.recommended.reduce((acc, cfg) => ({ ...acc, ...cfg.rules }), {}),
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
  {
    // FSD layer boundaries: shared → entities → features → widgets → pages → app
    files: ["src/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      "import/resolver": {
        typescript: { alwaysTryTypes: true, project: "./tsconfig.json" },
      },
      "boundaries/elements": [
        { type: "app", pattern: "src/app" },
        { type: "pages", pattern: "src/pages/*", capture: ["slice"] },
        { type: "widgets", pattern: "src/widgets/*", capture: ["slice"] },
        { type: "features", pattern: "src/features/*", capture: ["slice"] },
        { type: "entities", pattern: "src/entities/*", capture: ["slice"] },
        { type: "shared", pattern: "src/shared" },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          message: "FSD violation: {{ from.type }} may not import from {{ to.type }}",
          policies: [
            // Known debt: shared/api uses entity TYPES (RoomData, QuickSettings, …).
            // Type-only imports allowed; value imports from entities remain errors.
            {
              from: { element: { type: "shared" } },
              allow: { to: { element: { type: "entities" } }, dependency: { kind: "type" } },
            },
            {
              from: { element: { type: "entities" } },
              allow: { to: { element: { type: "shared" } } },
            },
            {
              from: { element: { type: "features" } },
              allow: { to: { element: { type: ["shared", "entities"] } } },
            },
            {
              from: { element: { type: "widgets" } },
              allow: { to: { element: { type: ["shared", "entities", "features"] } } },
            },
            {
              from: { element: { type: "pages" } },
              allow: { to: { element: { type: ["shared", "entities", "features", "widgets"] } } },
            },
            {
              from: { element: { type: "app" } },
              allow: {
                to: { element: { type: ["shared", "entities", "features", "widgets", "pages"] } },
              },
            },
          ],
        },
      ],
      // Surface files that don't match any declared element instead of silently skipping them
      "boundaries/no-unknown-files": "error",
    },
  },
];
