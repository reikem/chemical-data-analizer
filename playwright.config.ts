import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 45_000,
  retries: 0,
  use: {
    baseURL:"http://localhost:5173",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    viewport: { width: 1366, height: 768 },
    video: "off",
  },
  webServer: {
    command: "npm run dev",          // vite preview | next dev | astro dev…
    url: "http://localhost:5173",
    reuseExistingServer: true,
  },
  projects:[
    {
      name: "chromium",
      use: { browserName: "chromium" }
    },
    {
      name: "firefox",
      use: { browserName: "firefox" }
    },
    {
      name: "webkit",
      use: { browserName: "webkit" }
    }
    
  ]
});
