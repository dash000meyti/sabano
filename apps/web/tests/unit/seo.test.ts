import { describe, expect, it } from 'vitest';
import { withHeadingIds } from '@/lib/html';
import { faqLd, serializeLd } from '@/lib/jsonld';
import { buildMetadata } from '@/lib/seo';
import { normalize } from '@/lib/search';
import { formatPhone, localizeDigits, phoneHref } from '@/lib/format';

describe('metadata', () => {
  it('builds canonical + hreflang for every locale with x-default to Persian', () => {
    const m = buildMetadata({ locale: 'en', path: '/about', title: 'About', description: 'd' });
    expect(m.alternates?.canonical).toBe('https://sabano.ir/en/about');
    const langs = m.alternates?.languages as Record<string, string>;
    expect(langs['fa-IR']).toBe('https://sabano.ir/about');
    expect(langs['zh-Hans']).toBe('https://sabano.ir/zh/about');
    expect(langs['x-default']).toBe('https://sabano.ir/about');
    expect(Object.keys(langs)).toHaveLength(6);
  });
  it('limits hreflang to available locales', () => {
    const m = buildMetadata({ locale: 'fa', path: '/news/x', title: 't', description: 'd', availableLocales: ['fa'] });
    expect(Object.keys(m.alternates?.languages as object)).toEqual(['fa-IR', 'x-default']);
  });
});

describe('json-ld', () => {
  it('escapes script-breaking characters', () => {
    const out = serializeLd({ a: '</script><script>alert(1)</script>' });
    expect(out).not.toContain('</script>');
  });
  it('builds FAQPage', () => {
    const ld = faqLd([{ q: 'Q?', a: 'A.' }], 'fa');
    expect(ld['@type']).toBe('FAQPage');
  });
});

describe('article headings', () => {
  it('adds ids and returns a table of contents', () => {
    const { html, toc } = withHeadingIds('<p>x</p><h2>One</h2><h3 class="c">Two</h3>');
    expect(html).toContain('<h2 id="section-1">One</h2>');
    expect(html).toContain('<h3 id="section-2" class="c">Two</h3>');
    expect(toc.map((t) => t.level)).toEqual([2, 3]);
  });
});

describe('formatting', () => {
  it('localises digits and phones', () => {
    expect(localizeDigits('021-88517259', 'fa')).toBe('۰۲۱-۸۸۵۱۷۲۵۹');
    expect(formatPhone('021-88517259', 'en')).toBe('+98 21 8851 7259');
    expect(phoneHref('021-88517259')).toBe('tel:+982188517259');
  });
  it('normalises Arabic letter variants and ZWNJ for search', () => {
    expect(normalize('ضمانت‌نامه')).toBe('ضمانت نامه');
    expect(normalize('كيفيت')).toBe('کیفیت');
  });
});
