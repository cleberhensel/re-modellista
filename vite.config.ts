/// <reference types="vitest/config" />
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/re-modellista/" : "/",
  root: ".",
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  test: {
    environment: "happy-dom",
    include: ["**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json"],
      include: ["engine/**/*.ts", "render/**/*.ts", "catalog/**/*.ts", "app.ts"],
      exclude: [
        "**/*.test.ts",
        "engine/types.ts",
        "engine/composition/types.ts",
        "engine/guardrails/types.ts",
        "scripts/**",
        "vite.config.ts",
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 86,
        statements: 100,
      },
    },
  },
}));
