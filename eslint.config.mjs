import { FlatCompat } from "@eslint/eslintrc";
import importPlugin from "eslint-plugin-import";
import sortPlugin from "eslint-plugin-simple-import-sort";
import unusedPlugin from "eslint-plugin-unused-imports";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      "simple-import-sort": sortPlugin,
      import: importPlugin,
      "unused-imports": unusedPlugin,
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
      "no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
    languageOptions: {
      sourceType: "module",
      ecmaVersion: 2015,
      parserOptions: {
        sourceType: "module",
      },
    },
  },
];

export default eslintConfig;
