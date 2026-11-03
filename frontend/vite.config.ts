import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const src = (folder: string) =>
  path.resolve(import.meta.dirname, "src", folder);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@components": src("components"),
      "@contexts": src("contexts"),
      "@pages": src("pages"),
      "@services": src("services"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.spec.{ts,tsx}"],
    setupFiles: ["./src/test-setup.ts"],
    passWithNoTests: true,
    testTimeout: 20_000,
  },
});
