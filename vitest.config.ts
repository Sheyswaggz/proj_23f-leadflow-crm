import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/modules/**/*.ts', 'src/middleware/**/*.ts', 'src/jobs/**/*.ts'],
      exclude: ['src/test/**', 'src/types/**', '**/*.d.ts', 'src/index.ts', 'src/app.ts', 'src/lib/prisma.ts', 'node_modules/', 'dist/'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
        perFile: false,
      },
    },
    setupFiles: ['./src/test/setup.ts'],
  },
});
