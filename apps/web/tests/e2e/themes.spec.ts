import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const pages = ['/', '/about', '/services/guarantee', '/investment', '/process', '/news/what-is-a-research-and-technology-fund', '/faq', '/cooperation', '/contact', '/en', '/ru/leadership', '/no-such-page'];

for (const theme of ['light', 'dark'] as const) {
  test.describe(`${theme} theme`, () => {
    test.use({ colorScheme: theme });

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

test('theme toggle switches and persists', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveClass(/\bdark\b/);
  await page.getByRole('button', { name: 'تغییر تم روشن و تیره' }).first().click();
  await expect(page.locator('html')).toHaveClass(/\bdark\b/);
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/\bdark\b/);
  await page.goto('/en/about');
  await expect(page.locator('html')).toHaveClass(/\bdark\b/);
  await page.getByRole('button', { name: 'Toggle light and dark theme' }).first().click();
  await expect(page.locator('html')).not.toHaveClass(/\bdark\b/);
});
