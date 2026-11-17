import { expect, test, type Page } from '@playwright/test';

/**
 * Responsive guard. `body { overflow-x: clip }` hides sideways scrolling, so checking
 * scrollWidth would miss real bugs (e.g. a menu button pushed off-screen). Instead we
 * look for visible elements that stick out of the viewport and are not inside a
 * container that clips them on purpose.
 */
async function offenders(page: Page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const clipped = (el: Element) => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const cs = getComputedStyle(p);
        if (/(hidden|clip|auto|scroll)/.test(cs.overflowX)) {
          const r = p.getBoundingClientRect();
          if (r.left >= -1 && r.right <= vw + 1) return true;
        }
      }
      return false;
    };
    const bad: string[] = [];
    for (const el of document.body.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || el.closest('[inert], .sr-only')) continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      if ((r.right > vw + 1 || r.left < -1) && !clipped(el)) {
        bad.push(`${el.tagName.toLowerCase()}.${String(el.getAttribute('class') ?? '').split(' ').slice(0, 3).join('.')} [${Math.round(r.left)}..${Math.round(r.right)}]`);
      }
    }
    return bad.slice(0, 5);
  });
}

async function settle(page: Page) {
  await page.evaluate(() => document.querySelectorAll('[data-reveal],[data-words]').forEach((e) => e.setAttribute('data-visible', 'true')));
  await page.waitForTimeout(150);
}

const pages = ['/', '/about', '/services/guarantee', '/process', '/contact', '/cooperation', '/en', '/en/services', '/ru', '/ru/leadership', '/es/faq', '/zh/investment'];
const widths = [320, 390, 768, 1024, 1280];

for (const path of pages) {
  test(`nothing sticks out of the screen on ${path}`, async ({ page }) => {
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      await settle(page);
      expect(await offenders(page), `${path} at ${width}px`).toEqual([]);
    }
  });
}

for (const locale of ['fa', 'en', 'ru', 'es', 'zh']) {
  const path = locale === 'fa' ? '/' : `/${locale}`;
  test(`header fits from 320px to desktop (${locale})`, async ({ page }) => {
    for (const width of [320, 360, 640, 768, 1024, 1280, 1440]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(path);
      const header = page.locator('header').first();
      const items = header.locator(':scope > div').first().locator('a:visible, button:visible');
      const boxes = await items.evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((r) => [r.left, r.right]));
      for (const [left, right] of boxes) {
        expect(left, `${locale} ${width}px`).toBeGreaterThanOrEqual(0);
        expect(right, `${locale} ${width}px`).toBeLessThanOrEqual(width);
      }
    }
  });
}

test('mobile menu offers languages, theme and the proposal button', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 760 });
  await page.goto('/en/about');
  await page.getByRole('button', { name: 'Open menu' }).click();
  const dialog = page.getByRole('dialog', { name: 'Menu' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Русский' })).toBeVisible();
  await expect(dialog.getByRole('button', { name: /theme/i })).toBeVisible();
  await dialog.getByRole('link', { name: 'فارسی' }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
});

test.describe('admin on a phone', () => {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  test.skip(!email || !password, 'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD');

  test('top bar, slide-out menu and pages fit the screen', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 760 });
    await page.goto('/admin/login');
    await page.fill('input[name=email]', email!);
    await page.fill('input[name=password]', password!);
    await page.click('button[type=submit]');
    await expect(page).toHaveURL(/\/admin(\/|$)/, { timeout: 15_000 });

    const sidebar = page.locator('#admin-sidebar');
    await expect(sidebar).toBeHidden();
    await page.getByRole('button', { name: 'باز کردن منوی پنل' }).click();
    await expect(sidebar).toBeVisible();
    await sidebar.getByRole('link', { name: 'درخواست‌ها' }).click();
    await expect(page).toHaveURL(/\/admin\/submissions/);
    await expect(sidebar).toBeHidden();

    for (const path of ['/admin', '/admin/submissions', '/admin/posts', '/admin/content/faqs', '/admin/system', '/admin/settings']) {
      await page.goto(path);
      expect(await offenders(page), path).toEqual([]);
    }
  });
});
