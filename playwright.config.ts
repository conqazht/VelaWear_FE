import { defineConfig, devices } from "@playwright/test";

const frontendUrl = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const retries = Number(process.env.PLAYWRIGHT_RETRIES ?? (process.env.CI ? "2" : "0"));

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: frontendUrl,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm dev --hostname localhost",
    url: `${frontendUrl}/sale`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
