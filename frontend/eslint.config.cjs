const { defineConfig, globalIgnores } = require("eslint/config");
const { fixupConfigRules, fixupPluginRules } = require("@eslint/compat");

const globals = require("globals");
const customRules = require("eslint-plugin-custom-rules");
const eslintPluginImport = require("eslint-plugin-import");
const js = require("@eslint/js");
const perfectionist = require("eslint-plugin-perfectionist");
const react = require("eslint-plugin-react");
const reactRefresh = require("eslint-plugin-react-refresh");
const sortDestructureKeys = require("eslint-plugin-sort-destructure-keys");
const sortKeysPlus = require("eslint-plugin-sort-keys-plus");
const tsParser = require("@typescript-eslint/parser");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");

const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
  allConfig: js.configs.all,
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = defineConfig([
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
        module: "readonly",
        require: "readonly",
      },
      parser: tsParser,
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
          ignorePattern: `d\\s*=\\s*["'][^"]*["]|xlinkHref\\s*=\\s*["'][^"]*["']`,
          ignoreUrls: true,
          tabWidth: 2,
        },
      ],
      "max-lines": [
        "error",
        {
          max: 350,
        },
      ],
      "no-nested-ternary": "error",
      "no-unneeded-ternary": [
        "error",
        {
          defaultAssignment: false,
        },
      ],
      "perfectionist/sort-enums": "error",
      "perfectionist/sort-interfaces": "error",
      "perfectionist/sort-named-exports": "error",
      "perfectionist/sort-object-types": "error",
      "react-hooks/exhaustive-deps": "off",
      "react-refresh/only-export-components": [
        "error",
        { allowConstantExport: true },
      ],
      "react/destructuring-assignment": ["error"],
      "react/jsx-key": "error",
      "react/jsx-no-useless-fragment": "error",
      "react/jsx-sort-props": ["error", { ignoreCase: true }],
      "react/sort-prop-types": "error",
      "sort-destructure-keys/sort-destructure-keys": [
        "error",
        { caseSensitive: false },
      ],
      "sort-keys-plus/sort-keys": [
        "error",
        "asc",
        {
          caseSensitive: true,
          minKeys: 2,
          natural: false,
        },
      ],
    },
  },
  globalIgnores(["**/dist", "**/.eslintrc.cjs"]),
  {
    files: ["**/*ObjectOf.ts"],
    rules: { "custom-rules/object-of-typing": "off" },
  },
]);
