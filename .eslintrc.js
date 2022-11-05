module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.eslintrc.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  plugins: ["prettier", "@typescript-eslint/eslint-plugin", "jest"],
  extends: [
    "eslint:recommended",
    "airbnb-base",
    "airbnb-typescript/base",
    "plugin:prettier/recommended",
  ],
  overrides: [
    {
      files: ["tests/**/*.ts"],
      env: {
        node: true,
        jest: true,
      },
    },
  ],
  ignorePatterns: [".eslintrc.js"],
  rules: {
    "import/prefer-default-export": "off",
    "import/no-cycle": "off",
    "class-methods-use-this": "off",
  },
  settings: {
    "prettier/prettier": ["error", { singleQuote: true, parser: "flow" }],
  },
};
