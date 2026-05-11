import { test, expect } from '@playwright/test';

const password = process.env.E2E_SESSION_PASSWORD ?? 'playwright-e2e';

test.describe('Django strangeness exercise', () => {
  test('visual analysis page loads with dataset selector', { tag: ['@django'] }, async ({ page }) => {
    await page.addInitScript(
      ([pwd, dismissKey]: [string, string]) => {
        sessionStorage.setItem('password', pwd);
        sessionStorage.setItem('studentID', '0');
        sessionStorage.setItem(dismissKey, 'true');
      },
      [password, 'passwordDialogDismissed'],
    );

    await page.goto('/strangeness-visual-analysis');
    await expect(page.getByTestId('strangeness-visual-analysis-page')).toBeVisible();
    await expect(page.getByTestId('va-dataset-select')).toBeVisible();
    await expect(page.getByTestId('cern-toolbar')).toBeVisible();
  });
});
