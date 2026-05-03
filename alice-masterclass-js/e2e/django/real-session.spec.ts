import { test, expect } from '@playwright/test';

/** Must match Session.name in seed_playwright_e2e management command. */
const SESSION_NAME = 'PlaywrightE2ESession';

const password = process.env.E2E_SESSION_PASSWORD ?? 'playwright-e2e';

test.describe('Django API (no stubs)', () => {
  test('check_session from browser updates document title', async ({ page }) => {
    await page.addInitScript(
      ([pwd, dismissKey]: [string, string]) => {
        sessionStorage.setItem('password', pwd);
        sessionStorage.setItem('studentID', '0');
        sessionStorage.setItem(dismissKey, 'true');
      },
      [password, 'passwordDialogDismissed'],
    );

    await page.goto('/home');
    await expect(page).toHaveTitle(new RegExp(SESSION_NAME));
  });
});
