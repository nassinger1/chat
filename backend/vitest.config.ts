import { fileURLToPath } from "node:url";
import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

const dir = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  plugins: [swc.vite()],
  resolve: {
    alias: {
      "@": dir("./src"),
      "@test": dir("./test"),
    },
  },
  test: {
    globals: true,
    include: ["src/**/*.spec.ts"],
    globalSetup: ["./test/global-setup.ts"],
    pool: "forks",
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
