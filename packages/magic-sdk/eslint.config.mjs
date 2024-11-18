import tsParser from '@typescript-eslint/parser';
import rootEslintConfig from '../../eslint.config.mjs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  ...rootEslintConfig,
  {
    ignores: ['node_modules', 'coverage', 'dist', 'eslintrc.config.mjs', 'jest.config.ts'],
  },
  {
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 12,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: ['./tsconfig.json', './test/tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },
  },
];
