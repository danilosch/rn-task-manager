import { FlatCompat } from "@eslint/eslintrc";
import { configs } from "@eslint/js";
import { browser, node, es2021 } from "globals";

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: configs.recommended,
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
        ...browser,
        ...node,
        ...es2021,
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