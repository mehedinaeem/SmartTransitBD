import { defineConfig } from "@playwright/test";
const port = Number(process.env.PLAYWRIGHT_PORT ?? 3100);
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  timeout: 120000,
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    launchOptions: {
      ...(process.env.CHROME_PATH
        ? { executablePath: process.env.CHROME_PATH }
        : {}),
      args: ["--no-sandbox"],
    },
    reducedMotion: "reduce",
  },
  webServer: {
    command: `npm run start -- --port ${port}`,
    url: `http://127.0.0.1:${port}/operator`,
    reuseExistingServer: false,
    timeout: 30000,
  },
  reporter: "list",
});
