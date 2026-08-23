import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)), "server-only": fileURLToPath(new URL("./tests/support/server-only.ts", import.meta.url)) } },
  test: { include: ["tests/integration/**/*.test.ts"], setupFiles: ["tests/integration/setup.ts"], environment: "node", testTimeout: 20_000, hookTimeout: 20_000 },
});
