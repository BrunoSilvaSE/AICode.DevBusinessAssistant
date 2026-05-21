import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['node_modules', '.next', '**/*.config.*'],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "next/link": path.resolve(__dirname, "./__mocks__/next-link.tsx"),
      "next/navigation": path.resolve(__dirname, "./__mocks__/next-navigation.ts"),
    },
  },
})
