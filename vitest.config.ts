import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    include: [
      'tests/rate-limit.test.ts',
      'tests/webhook-sign.test.ts',
      'tests/api-key-crypto.test.ts',
      'tests/password-strength.test.ts',
      'tests/password-version.test.ts',
      'tests/safe-url.test.ts',
      'tests/public-token.test.ts',
    ],
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
