import tsLint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';
import jsxA11Y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-plugin-prettier';
import importPlugin from 'eslint-plugin-import';
import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    ignores: [
      '**/node_modules',
      '**/coverage',
      '**/dist',
      '**/jest.config.ts',
      'scripts/bin/scaffold/template/**/*',
      '.prettierrc.js',
    ],
  },
  {
    plugins: {
      '@typescript-eslint': tsLint,
      'jsx-a11y': jsxA11Y,
      prettier,
      importPlugin,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },

      parser: tsParser,
      ecmaVersion: 12,
      sourceType: 'module',
    },

    files: ['**/*.ts', '**/*.tsx'],

    rules: {
      'no-alert': 0,
      'no-dupe-class-members': 0,
      'no-underscore-dangle': 0,
      'no-useless-constructor': 0,
      'no-unused-vars': 0,
      'no-redeclare': 1,
      'class-methods-use-this': 0,
      'importPlugin/extensions': 0,
      'importPlugin/no-extraneous-dependencies': 0,
      '@typescript-eslint/ban-types': 0,
      '@typescript-eslint/no-unsafe-call': 0,
      '@typescript-eslint/await-thenable': 0,
      '@typescript-eslint/ban-ts-comment': 0,
      '@typescript-eslint/no-unsafe-return': 0,
      '@typescript-eslint/no-empty-function': 0,
      '@typescript-eslint/no-floating-promises': 0,
      '@typescript-eslint/no-unsafe-assignment': 0,
      '@typescript-eslint/no-useless-constructor': 0,
      '@typescript-eslint/no-unsafe-member-access': 0,
      '@typescript-eslint/restrict-template-expressions': 0,
      '@typescript-eslint/explicit-module-boundary-types': 0,
    },

    settings: {
      'importPlugin/resolver': {
        typescript: {
          directory: ['**/tsconfig.json'],
        },
      },
    },
  },
];
