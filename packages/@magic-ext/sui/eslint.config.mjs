import path from 'node:path';
import { fileURLToPath } from 'node:url';
import rootEslintConfig from '../../../eslint.config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  ...rootEslintConfig,
  {
    ignores: ['node_modules', 'coverage', 'dist', 'eslintrc.config.mjs', 'jest.config.ts'],
  },
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json', './test/tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },
  },
];
