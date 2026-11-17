import { expect, test, type Page } from '@playwright/test';

// The admin test reads the submission created by the form test.
test.describe.configure({ mode: 'serial' });

test('header menu, search palette and language switch work', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'خدمات' }).hover();
  await expect(page.getByRole('link', { name: /صدور ضمانت‌نامه/ }).first()).toBeVisible();
  await page.keyboard.press('Control+k');
  await page.getByRole('combobox').fill('ضمانت');
  await expect(page.getByRole('option').first()).toContainText('ضمانت');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'زبان سایت' }).click();
  await page.getByRole('option', { name: /English/ }).click();
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
});

test('cooperation form validates and submits', async ({ page }) => {
  await page.goto('/en/cooperation');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('form [role=alert]')).toContainText('choose');
  await page.getByText('Employment and careers').click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByLabel(/Your name/).fill('E2E Test');
  await page.getByLabel(/Email or mobile/).fill('not-valid');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('form [role=alert]')).toBeVisible();
  await page.getByLabel(/Email or mobile/).fill('e2e@example.com');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByLabel(/Brief description/).fill('Automated end-to-end test submission, please ignore.');
  await page.locator('input[type=file]').setInputFiles({ name: 'cv.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%test\n') });
  await page.getByLabel(/privacy policy/i).first().check();
  await page.waitForTimeout(2600); // the form rejects suspiciously fast submissions
  await page.getByRole('button', { name: 'Submit request' }).click();
  // The first submission on a cold server also warms the upload and database code paths.
  await expect(page.getByRole('status')).toContainText('SB-', { timeout: 15_000 });
});

test.describe('admin panel', () => {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  let page: Page;

  // Log in once per run (the login form is rate-limited).
  test.beforeAll(async ({ browser }) => {
    test.skip(!email || !password, 'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD');
    page = await browser.newPage();
    await page.goto('/admin/submissions');
    await expect(page).toHaveURL(/\/admin\/login/);
    await page.getByLabel('ایمیل').fill(email!);
    await page.getByLabel('رمز عبور').fill(password!);
    await page.getByRole('button', { name: 'ورود به پنل' }).click();
    // Password hashing plus a cold server can take a few seconds on a fresh container.
    await expect(page).toHaveURL(/\/admin\/submissions/, { timeout: 15_000 });
  });

  test.afterAll(async () => {
    await page?.close();
  });

  test('lists submissions after login redirect', async () => {
    // Phones get a card list, wider screens a table: check whichever is showing.
    await expect(page.getByText('E2E Test').filter({ visible: true }).first()).toBeVisible();
  });

  test('edits reach the cached public site immediately', async ({ request }) => {
    await request.get('/faq'); // warm the ISR cache first
    await page.goto('/admin/content/faqs');
    await page.locator('main ul li a').first().click();
    const field = page.locator('input[name="t.fa.question"]');
    const original = await field.inputValue();
    const marker = `${original} [e2e-${Date.now()}]`;
    await field.fill(marker);
    await page.getByRole('button', { name: 'ذخیره', exact: true }).click();
    await expect(page.getByText('ذخیره شد')).toBeVisible({ timeout: 15_000 }); // save + cache revalidation can be slow under parallel load
    await expect.poll(async () => (await (await request.get('/faq')).text()).includes(marker), { timeout: 10_000 }).toBe(true);
    // Restore the original text and wait until the public page no longer shows the marker.
    await page.locator('input[name="t.fa.question"]').fill(original);
    await page.getByRole('button', { name: 'ذخیره', exact: true }).click();
    await expect.poll(async () => (await (await request.get('/faq')).text()).includes(marker), { timeout: 10_000 }).toBe(false);
  });
});
