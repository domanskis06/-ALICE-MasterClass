import { test, expect } from '@playwright/test';

test.describe('Teacher app', () => {
  test('login dev bypass reaches session and events UI', { tag: ['@teacher'] }, async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/session$/);
    await expect(page.getByTestId('teacher-events-title')).toBeVisible();
  });

  test('session lists seeded Playwright E2E event from Django', { tag: ['@teacher'] }, async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('PlaywrightE2EEvent')).toBeVisible();
  });
});
