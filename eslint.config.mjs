import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import nodePlugin from "eslint-plugin-node";
import importPlugin from "eslint-plugin-import";

export default [
  js.configs.recommended,
  prettierConfig,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        require: "readonly",
        module: "readonly",
        process: "readonly",
        console: "readonly",
      },
    },
    plugins: {
      prettier: prettierPlugin,
      node: nodePlugin,
      import: importPlugin,
    },
    rules: {
      "prettier/prettier": "error",
      "no-unused-vars": "warn",
      "no-console": "off",
      eqeqeq: "warn",
      curly: "error",
      "node/no-unsupported-features/es-syntax": "off",
      "import/order": ["warn", { groups: ["builtin", "external", "internal"] }],
    },
    ignores: ["node_modules", "dist", "build"],
  },
];
