import { defineConfig, devices } from '@playwright/test';

const packageRoot = __dirname;

export default defineConfig({
  testDir: './e2e-teacher',
  outputDir: 'test-results-teacher',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI
    ? [
        ['html', { open: 'never', outputFolder: 'playwright-report-teacher' }],
        ['line'],
      ]
    : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4201',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'bash ./e2e/scripts/start-django-e2e.sh',
      cwd: packageRoot,
      url: 'http://127.0.0.1:8000/api/v1/events/',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: 'bash ./e2e/scripts/start-teacher-e2e.sh',
      cwd: packageRoot,
      url: 'http://127.0.0.1:4201',
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
