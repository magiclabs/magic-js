module.exports = {
  root: true,

  extends: ["@ikscodes/eslint-config"],

  rules: {
    // ESLint rules
    "no-alert": 0,
    "no-underscore-dangle": 0,
    "no-useless-constructor": 0,
    "class-methods-use-this": 0,

    // Import rules
    "import/extensions": 0,
    "import/no-extraneous-dependencies": 0,

    // TypeScript rules
    "@typescript-eslint/ban-types": 0,
    "@typescript-eslint/no-unsafe-call": 0,
    "@typescript-eslint/await-thenable": 0,
    "@typescript-eslint/ban-ts-comment": 0,
    "@typescript-eslint/no-unsafe-return": 0,
    "@typescript-eslint/no-empty-function": 0,
    "@typescript-eslint/no-floating-promises": 0,
    "@typescript-eslint/no-unsafe-assignment": 0,
    "@typescript-eslint/no-useless-constructor": 0,
    "@typescript-eslint/no-unsafe-member-access": 0,
    "@typescript-eslint/restrict-template-expressions": 0,
    "@typescript-eslint/explicit-module-boundary-types": 0,
  },

  settings: {
    "import/resolver": {
      "typescript": {
        "directory": ["**/tsconfig.json"],
      },
    },
  },
}
