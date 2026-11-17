import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const pages = ['/', '/about', '/services/guarantee', '/investment', '/process', '/news/what-is-a-research-and-technology-fund', '/faq', '/cooperation', '/contact', '/en', '/ru/leadership', '/no-such-page'];

for (const theme of ['light', 'dark'] as const) {
  test.describe(`${theme} theme`, () => {
    // Dark is only ever the visitor's saved choice; the OS preference is ignored.
    test.beforeEach(async ({ page }) => {
      if (theme === 'dark') await page.addInitScript(() => localStorage.setItem('sabano-theme', 'dark'));
    });

    for (const path of pages) {
      test(`${path} has no accessibility violations`, async ({ page }) => {
        await page.goto(path);
        await expect(page.locator('html')).toHaveClass(theme === 'dark' ? /\bdark\b/ : /^(?!.*\bdark\b).*/);
        // Let intro/scroll animations settle so contrast is measured on final colours.
        await page.evaluate(() => document.querySelectorAll<HTMLElement>('[data-reveal],[data-words]').forEach((el) => (el.dataset.visible = 'true')));
        await page.waitForTimeout(1300);
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          // Decorative giant wordmark and outlined numbers are aria-hidden; the scroll-lit statement is animated by design.
          .exclude('[aria-hidden="true"]')
          .analyze();
        const summary = results.violations.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
        expect(summary).toEqual([]);
      });
    }
  });
}

test('light is the default, even when the OS prefers dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  for (const path of ['/', '/en/about', '/no-such-page', '/admin/login']) {
    await page.goto(path);
    await expect(page.locator('html')).not.toHaveClass(/\bdark\b/);
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#ffffff');
  }
});

test('theme toggle switches and persists', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveClass(/\bdark\b/);
  await page.getByRole('button', { name: 'تغییر تم روشن و تیره' }).first().click();
  await expect(page.locator('html')).toHaveClass(/\bdark\b/);
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/\bdark\b/);
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#020a18');
  await page.goto('/en/about');
  await expect(page.locator('html')).toHaveClass(/\bdark\b/);
  await page.getByRole('button', { name: 'Toggle light and dark theme' }).first().click();
  await expect(page.locator('html')).not.toHaveClass(/\bdark\b/);
});
