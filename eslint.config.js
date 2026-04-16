import jsEslint from '@eslint/js'
import tsEslint from 'typescript-eslint'
import reactEslint from "@eslint-react/eslint-plugin";
import { defineConfig } from 'eslint/config'
import autoImports from './.wxt/eslint-auto-imports.mjs';

export default defineConfig([
  autoImports,
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      jsEslint.configs.recommended,
      tsEslint.configs.recommended,
      reactEslint.configs["recommended-typescript"],
    ],
    languageOptions: {
      parser: tsEslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      ecmaVersion: 2020,
    },
  },
])
