import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import customRules from "eslint-plugin-custom-rules";
import eslintPluginImport from "eslint-plugin-import";
import perfectionist from "eslint-plugin-perfectionist";
import react from "eslint-plugin-react";
import reactRefresh from "eslint-plugin-react-refresh";
import sortDestructureKeys from "eslint-plugin-sort-destructure-keys";
import sortKeysPlus from "eslint-plugin-sort-keys-plus";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import { fileURLToPath } from "node:url";

const baseDirectory = fileURLToPath(new URL(".", import.meta.url));
const compat = new FlatCompat({
  allConfig: js.configs.all,
  baseDirectory,
  recommendedConfig: js.configs.recommended,
});

export default defineConfig([
  {
    extends: fixupConfigRules(
      compat.extends(
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:cypress/recommended",
        "plugin:react-hooks/recommended"
      )
    ),
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": fixupPluginRules(typescriptEslint),
      "custom-rules": customRules,
      import: fixupPluginRules(eslintPluginImport),
      perfectionist,
      react,
      "react-refresh": reactRefresh,
      "sort-destructure-keys": sortDestructureKeys,
      "sort-keys-plus": sortKeysPlus,
    },
    rules: {
      "@typescript-eslint/member-ordering": [
        "error",
        {
          default: [
            "constructor",
            "field",
            "get",
            "method",
            "set",
            "static-field",
            "static-get",
            "static-method",
            "static-set",
          ],
        },
      ],
      "custom-rules/alphabetical-types": "error",
      "custom-rules/array-typing": "error",
      "custom-rules/no-and-operator": "error",
      "custom-rules/no-hex-colors": "error",
      "custom-rules/object-of-typing": "error",
      "max-len": [
        "error",
        {
          code: 120,
          comments: 200,
          ignorePattern: `d\\s*=\\s*["'][^"]*["']|xlinkHref\\s*=\\s*["'][^"]*["']`,
          ignoreUrls: true,
          tabWidth: 2,
        },
      ],
      "max-lines": ["error", { max: 350 }],
      "no-nested-ternary": "error",
      "no-unneeded-ternary": ["error", { defaultAssignment: false }],
      "perfectionist/sort-enums": "error",
      "perfectionist/sort-interfaces": "error",
      "perfectionist/sort-named-exports": "error",
      "perfectionist/sort-object-types": "error",
      "react-hooks/exhaustive-deps": "off",
      "react-refresh/only-export-components": ["error", { allowConstantExport: true }],
      "react/destructuring-assignment": ["error"],
      "react/jsx-key": "error",
      "react/jsx-no-useless-fragment": "error",
      "react/jsx-sort-props": ["error", { ignoreCase: true }],
      "react/sort-prop-types": "error",
      "sort-destructure-keys/sort-destructure-keys": ["error", { caseSensitive: false }],
      "sort-keys-plus/sort-keys": ["error", "asc", { caseSensitive: true, minKeys: 2, natural: false }],
    },
  },
  globalIgnores(["**/dist", "**/.eslintrc.cjs"]),
  {
    files: ["**/*ObjectOf.ts"],
    rules: { "custom-rules/object-of-typing": "off" },
  },
]);
