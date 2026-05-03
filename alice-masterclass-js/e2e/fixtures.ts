import type { Page } from '@playwright/test';

/** Skip the home password dialog on first visit (see HomeComponent). */
export const PASSWORD_DIALOG_DISMISSED_KEY = 'passwordDialogDismissed';

export async function dismissPasswordDialog(page: Page): Promise<void> {
  await page.addInitScript((key: string) => {
    sessionStorage.setItem(key, 'true');
  }, PASSWORD_DIALOG_DISMISSED_KEY);
}
