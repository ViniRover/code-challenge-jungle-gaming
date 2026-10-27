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
      "padding-line-between-statements": [
        "error",
        // Separate declarations from execution, but keep short declarations grouped.
        { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
        { blankLine: "always", prev: "*", next: ["const", "let", "var"] },
        {
          blankLine: "any",
          prev: ["singleline-const", "singleline-let", "singleline-var"],
          next: ["singleline-const", "singleline-let", "singleline-var"],
        },
        // This also covers arrow functions and hooks with multiline callbacks.
        {
          blankLine: "always",
          prev: ["block-like", "multiline-expression"],
          next: "*",
        },
        {
          blankLine: "always",
          prev: "*",
          next: ["block-like", "multiline-expression"],
        },
        {
          blankLine: "always",
          prev: ["if", "for", "while", "do", "switch", "try"],
          next: "*",
        },
        {
          blankLine: "always",
          prev: "*",
          next: ["if", "for", "while", "do", "switch", "try", "throw"],
        },
        { blankLine: "always", prev: "import", next: "*" },
        { blankLine: "any", prev: "import", next: "import" },
        {
          blankLine: "always",
          prev: "*",
          next: ["function", "class", "export"],
        },
        {
          blankLine: "always",
          prev: ["function", "class", "export"],
          next: "*",
        },
        { blankLine: "always", prev: "*", next: "return" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
);
