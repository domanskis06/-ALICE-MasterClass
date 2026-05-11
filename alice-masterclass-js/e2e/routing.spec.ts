import { test, expect } from '@playwright/test';
import { dismissPasswordDialog } from './fixtures';

test.describe('Routing', () => {
  test('strangeness visual analysis route loads', { tag: ['@smoke'] }, async ({ page }) => {
    await dismissPasswordDialog(page);
    await page.goto('/strangeness-visual-analysis');
    await expect(page).toHaveURL(/\/strangeness-visual-analysis$/);
    await expect(page.getByTestId('strangeness-visual-analysis-page')).toBeVisible();
  });
});
