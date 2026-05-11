import { test, expect } from '@playwright/test';
import { dismissPasswordDialog } from './fixtures';

test.describe('Home (smoke)', () => {
  test('shows welcome heading', { tag: ['@smoke'] }, async ({ page }) => {
    await dismissPasswordDialog(page);
    await page.goto('/home');
    await expect(
      page.getByRole('heading', { name: 'Welcome to the ALICE Masterclass!' }),
    ).toBeVisible();
  });

  test('default route redirects to home', { tag: ['@smoke'] }, async ({ page }) => {
    await dismissPasswordDialog(page);
    await page.goto('/');
    await expect(page).toHaveURL(/\/home$/);
  });
});
