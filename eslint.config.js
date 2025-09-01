import { FlatCompat } from "@eslint/eslintrc";
import eslintjs from "@eslint/js";
import globals from "globals";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: eslintjs.configs.recommended,
});

export default [
  ...compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:react-native/all"
  ),
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        "__DEV__": "readonly",
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react-native/no-raw-text": "off",
      "react-native/no-color-literals": "off",
      "react-native/no-inline-styles": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];