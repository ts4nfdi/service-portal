import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { MOCK_GATEWAY_BASE_URL, startMockGateway } from "./tests/mockGateway";

dotenv.config({ path: path.resolve(__dirname, ".env") });

const testPort = process.env.PLAYWRIGHT_TEST_PORT ?? "3000";
const siteUrl = `http://localhost:${testPort}`;

process.env.GATEWAY_BASE_URL = MOCK_GATEWAY_BASE_URL;
process.env.NEXT_PUBLIC_SITE_URL = siteUrl;
process.env.NEXTAUTH_URL = siteUrl;
process.env.NEXTAUTH_SECRET = "test-secret";
startMockGateway();

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
          ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
          : undefined,
      },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  webServer: {
    command: process.env.PLAYWRIGHT_WEB_SERVER_COMMAND ?? "npm run dev",
    url: siteUrl,
    reuseExistingServer: process.env.PLAYWRIGHT_REUSE_SERVER === "true",
    env: {
      ...process.env,
      PORT: testPort,
      ONTOLOGY_OPTIONS_URL: `${MOCK_GATEWAY_BASE_URL}/api-gateway/ols4/api/ontologies`,
      DEBUG_MODE: "true",
      NEXT_DEBUG_MODE: "true",
    },
  },
});
