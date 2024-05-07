import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import vitest from 'eslint-plugin-vitest';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  ...tseslint.config(eslint.configs.recommended, ...tseslint.configs.recommended),
  vitest.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      yoda: 'error',
      'prefer-template': 'error',
      'no-console': 'error'
    }
  }
];
