module.exports = {
  extends: ['../../.eslintrc'],
  parserOptions: {
    project: ['./tsconfig.json', './test/tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
}
