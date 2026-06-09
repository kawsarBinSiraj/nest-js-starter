/**
 * File: eslint.config.mjs
 * Purpose: Flat ESLint config with TypeScript parser, no opinionated rules.
 */
/* @ts-check */
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
   {
      ignores: ['eslint.config.mjs', 'dist/**', 'src/generated/**'],
   },
   /* TypeScript parser setup (no recommended rule sets). */
   /** @type {any} */ (tseslint.configs.base),
   {
      files: ['**/*.ts'],
      languageOptions: {
         globals: {
            ...globals.node,
            ...globals.jest,
         },
         parserOptions: {
            projectService: true,
            tsconfigRootDir: import.meta.dirname,
         },
      },
   },
   /* Custom rules */
   {
      rules: {
         'prettier/prettier': 'off',
      },
   },
];
