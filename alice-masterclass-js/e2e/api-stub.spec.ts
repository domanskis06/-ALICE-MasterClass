import { test, expect } from '@playwright/test';

/**
 * When sessionStorage contains password + studentID, ApiService.init() calls
 * PUT /api/v1/check_session/ on startup. This test stubs that endpoint so E2E
 * does not require a running Django server.
 */
test.describe('API stub (check_session)', () => {
  test('stubbed session updates document title', { tag: ['@smoke'] }, async ({ page }) => {
    await page.route('**/api/v1/check_session/**', async (route) => {
      if (route.request().method() !== 'PUT') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ error: false, name: 'E2E Session' }),
      });
    });

    await page.addInitScript(() => {
      sessionStorage.setItem('password', 'e2e-password');
      sessionStorage.setItem('studentID', '0');
      sessionStorage.setItem('passwordDialogDismissed', 'true');
    });

    await page.goto('/home');
    await expect(page).toHaveTitle(/E2E Session/);
  });
});
