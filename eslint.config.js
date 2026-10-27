import js from "@eslint/js";
import tseslint from "typescript-eslint";
export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "public/mockServiceWorker.js",
      "playwright-report/**",
      "test-results/**",
      "artifacts/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        process: "readonly",
        URL: "readonly",
        console: "readonly",
        window: "readonly",
        document: "readonly",
        location: "readonly",
        localStorage: "readonly",
        crypto: "readonly",
        structuredClone: "readonly",
        AbortSignal: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
);
