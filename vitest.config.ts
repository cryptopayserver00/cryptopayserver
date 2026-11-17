import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    // Active security / unit tests. Legacy scratch files live under tests/legacy/.
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/legacy/**', 'node_modules/**'],
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
