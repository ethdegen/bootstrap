import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const isExternalTarget = !!process.env.PLAYWRIGHT_EXTERNAL_TARGET;
const chromiumArgs = ["--disable-dev-shm-usage"];

// Start the web server with whichever package manager launched Playwright
// (`pnpm run test:e2e` or `npm run test:e2e`); npm when launched directly,
// e.g. by the VS Code Playwright extension.
const packageManager = process.env.npm_config_user_agent?.startsWith("pnpm/") ? "pnpm" : "npm";
const run = (script: string) => `${packageManager} run ${script}`;

export default defineConfig({
    testDir: "./e2e",
    outputDir: "./test-results",
    fullyParallel: true,
    forbidOnly: isCI,
    retries: isCI ? 2 : 0,
    workers: isCI ? 1 : undefined,
    timeout: 30_000,
    expect: {
        timeout: 10_000,
    },
    reporter: isCI ? [["github"], ["html", { open: "never" }], ["list"]] : [["list"], ["html", { open: "never" }]],
    use: {
        baseURL,
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        locale: "en-US",
        timezoneId: "UTC",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"], launchOptions: { args: chromiumArgs } },
        },
        {
            name: "firefox",
            use: { ...devices["Desktop Firefox"] },
        },
        {
            name: "webkit",
            use: { ...devices["Desktop Safari"] },
        },
        {
            name: "mobile-chrome",
            use: { ...devices["Pixel 7"], launchOptions: { args: chromiumArgs } },
        },
    ],
    webServer: isExternalTarget
        ? undefined
        : {
              command: isCI ? `${run("build")} && ${run("start")}` : run("dev"),
              url: baseURL,
              reuseExistingServer: !isCI,
              timeout: 180_000,
              stdout: "pipe",
              stderr: "pipe",
          },
});
