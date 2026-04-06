import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  globalSetup: "./e2e/fixtures/auth",
  testDir: "./e2e",
  retries: process.env.CI ? 1 : 0,
  reporter: [["html", { open: "never" }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
