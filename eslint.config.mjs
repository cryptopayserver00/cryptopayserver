import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    'node_modules/**',
    '.next/**',
    'out/**',
    'build/**',
    'tests/**',
    'scripts/**',
    'vitest.config.ts',
  ]),
  {
    rules: {
      // Pre-existing codebase style; tighten gradually without blocking CI.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      'prefer-const': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/rules-of-hooks': 'warn',
      'react/no-unescaped-entities': 'warn',
      '@next/next/no-img-element': 'warn',
    },
  },
])

export default eslintConfig
