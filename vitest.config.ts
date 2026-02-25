import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    isolate: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/Domain/**', 'src/Application/**'],
      exclude: ['src/**/*.d.ts', 'src/**/index.ts'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@domain': resolve(__dirname, 'src/Domain'),
      '@application': resolve(__dirname, 'src/Application'),
      '@infrastructure': resolve(__dirname, 'src/Infrastructure'),
      '@presentation': resolve(__dirname, 'src/Presentation'),
      '@shared': resolve(__dirname, 'src/Shared'),
    },
  },
});
