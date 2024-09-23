import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tseslintParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  eslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        ...globals.node,
        "NodeJS": true
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      // Custom rules
      '@typescript-eslint/no-unused-vars': 'warn',
      // Add more TypeScript-specific rules as needed
    },
  },
  {
    // Configuration for JavaScript files
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    ...eslint.configs.recommended,
    rules: {
      // Custom rules for JavaScript files
      'no-unused-vars': 'warn',
      // Add more JavaScript-specific rules as needed
    },
  },
  {
    ignores: ['**/dist/**', '**/node_modules/**'],
  },
];
