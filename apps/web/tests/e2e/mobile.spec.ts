import { expect, test } from '@playwright/test';

for (const path of ['/', '/services/guarantee', '/cooperation', '/en', '/en/contact']) {
  test(`no horizontal overflow on ${path}`, async ({ page }) => {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('mobile menu opens and navigates', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'باز کردن منو' }).click();
  const dialog = page.getByRole('dialog', { name: 'منو' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('link', { name: 'تماس با ما' }).click();
  await expect(page).toHaveURL(/\/contact$/);
});
