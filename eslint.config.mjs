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
      'no-alert': 'off',
      'no-dupe-class-members': 'off',
      'no-underscore-dangle': 'off',
      'no-useless-constructor': 'off',
      'no-unused-vars': 'off',
      'no-redeclare': 'off',
      'class-methods-use-this': 'off',
      'importPlugin/extensions': 'off',
      'importPlugin/no-extraneous-dependencies': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-useless-constructor': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
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
