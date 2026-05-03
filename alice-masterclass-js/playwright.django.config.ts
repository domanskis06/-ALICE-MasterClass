import { defineConfig, devices } from '@playwright/test';

const packageRoot = __dirname;

export default defineConfig({
  testDir: './e2e/django',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [['html'], ['line']] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4200',
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
      command: 'npx ng serve -c web --host 127.0.0.1 --port 4200',
      cwd: packageRoot,
      url: 'http://127.0.0.1:4200',
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
