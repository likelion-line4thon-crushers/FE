import path from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig, devices } from "@playwright/experimental-ct-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: "./tests/component",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? undefined : 1,
  use: {
    headless: !!process.env.CI,
    trace: "on-first-retry",
    ctViteConfig: {
      plugins: [react()],
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src"),
        },
      },
      define: {
        global: "globalThis",
      },
    },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
