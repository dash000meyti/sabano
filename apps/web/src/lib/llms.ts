import 'server-only';
import { getTranslations } from 'next-intl/server';
import { getSetting, listFaqs, listPeople, listPublishedPostIndex, listShareholders } from '@sabano/db';
import { locales, localeMeta, type Locale } from '@sabano/i18n';
import { formatPhone } from './format';
import { areaKeys, pageUrl, serviceSlugs, SITE_URL } from './site';

/** Builds llms.txt (index) or llms-full.txt (index + full facts, services and FAQ) in Markdown. */
export async function buildLlmsTxt(full: boolean): Promise<string> {
  const out: string[] = [];
  const fa = await getTranslations({ locale: 'fa' });
  const en = await getTranslations({ locale: 'en' });
  const contact = getSetting('contact');

  out.push(`# ${en('common.orgName')} (${fa('common.orgName')})`);
  out.push('');
  out.push(`> ${en('about.hero.lead')}`);
  out.push('');
  out.push(`- Website: ${SITE_URL}`);
  out.push(`- Languages: ${locales.map((l) => `${localeMeta[l].name} (${pageUrl(l, '/')})`).join(', ')}`);
  out.push(`- Email: ${contact.email}`);
  out.push(`- Phone: ${contact.phones.map((p) => formatPhone(p, 'en')).join(', ')}`);
  out.push(`- Address: ${contact.address.en ?? ''} (postal code ${contact.postalCode})`);
  out.push('');
  out.push('## Key facts');
  for (const k of ['type', 'focus', 'services', 'horizon', 'shareholder', 'location'] as const) {
    out.push(`- ${en(`facts.${k}.label`)}: ${en(`facts.${k}.value`)} — ${fa(`facts.${k}.label`)}: ${fa(`facts.${k}.value`)}`);
  }
  out.push('');

  const section = async (locale: Locale) => {
    const t = await getTranslations({ locale });
    const lines: string[] = [];
    lines.push(`## ${localeMeta[locale].name} — ${t('common.orgName')}`);
    lines.push('');
    lines.push('### ' + t('nav.services'));
    for (const s of serviceSlugs) {
      lines.push(`- [${t(`services.items.${s}.title`)}](${pageUrl(locale, `/services/${s}`)}): ${t(`services.items.${s}.short`)}`);
    }
    lines.push('');
    lines.push('### ' + t('nav.investmentAreas'));
    for (const a of areaKeys) lines.push(`- ${t(`investment.areas.${a}.title`)}: ${t(`investment.areas.${a}.text`)}`);
    lines.push('');
    lines.push('### Pages');
    for (const [path, key] of [
      ['/about', 'about'],
      ['/leadership', 'leadership'],
      ['/investment', 'investment'],
      ['/process', 'process'],
      ['/faq', 'faq'],
      ['/news', 'news'],
      ['/cooperation', 'cooperation'],
      ['/contact', 'contact'],
    ] as const) {
      lines.push(`- [${t(`${key}.meta.title`)}](${pageUrl(locale, path)}): ${t(`${key}.meta.description`)}`);
    }
    if (full) {
      lines.push('');
      lines.push(`### ${t('about.what.title')}`);
      lines.push(t('about.what.text'));
      lines.push('');
      lines.push(`### ${t('about.horizon.title')}`);
      lines.push(t('about.horizon.text'));
      lines.push('');
      lines.push(`### ${t('about.shareholders.title')}`);
      for (const s of listShareholders(locale)) lines.push(`- ${s.name}${s.isMain ? ` (${t('about.shareholders.main')})` : ''}`);
      lines.push('');
      lines.push(`### ${t('leadership.hero.title')}`);
      for (const p of listPeople(locale)) lines.push(`- ${p.name} — ${p.role}`);
      lines.push('');
      for (const s of serviceSlugs) {
        lines.push(`### ${t(`services.items.${s}.title`)}`);
        lines.push(t(`services.items.${s}.lead`));
        for (const f of t.raw(`services.items.${s}.faqs`) as { q: string; a: string }[]) {
          lines.push(`- **${f.q}** ${f.a}`);
        }
        lines.push('');
      }
      lines.push(`### ${t('process.stepsTitle')}`);
      (t.raw('process.steps') as { title: string; text: string }[]).forEach((s, i) => lines.push(`${i + 1}. **${s.title}** — ${s.text}`));
      lines.push('');
      lines.push(`### ${t('faq.hero.title')}`);
      for (const f of listFaqs(locale)) lines.push(`- **${f.question}** ${f.answer}`);
    }
    const posts = listPublishedPostIndex().filter((p) => p.translations.some((x) => x.locale === locale));
    if (posts.length) {
      lines.push('');
      lines.push('### ' + t('nav.news'));
      for (const p of posts.slice(0, full ? 100 : 20)) {
        const tr = p.translations.find((x) => x.locale === locale)!;
        lines.push(`- [${tr.title}](${pageUrl(locale, `/news/${p.slug}`)}): ${tr.excerpt}`);
      }
    }
    lines.push('');
    return lines.join('\n');
  };

  for (const l of full ? locales : (['fa', 'en'] as Locale[])) out.push(await section(l));
  if (!full) out.push(`## Optional\n- [Full content for AI systems](${SITE_URL}/llms-full.txt)\n- [Sitemap](${SITE_URL}/sitemap.xml)\n`);
  return out.join('\n');
}
