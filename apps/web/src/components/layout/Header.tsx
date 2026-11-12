import { getTranslations } from 'next-intl/server';
import type { Locale } from '@sabano/i18n';
import { getCompanyCount } from '@/lib/data';
import { HeaderClient } from './HeaderClient';
import type { NavGroup, NavIconName } from './nav-types';

const serviceIcons: Record<string, NavIconName> = {
  guarantee: 'shield',
  credit: 'credit',
  investment: 'chart',
  'fund-agency': 'vault',
  consulting: 'chats',
};

export async function Header({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'nav' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const ts = await getTranslations({ locale, namespace: 'services' });
  const th = await getTranslations({ locale, namespace: 'home' });
  const hasPortfolio = getCompanyCount() > 0;

  const groups: NavGroup[] = [
    {
      key: 'about',
      label: t('about'),
      items: [
        { href: '/about', label: t('aboutOverview'), desc: t('aboutOverviewDesc'), icon: 'buildings' },
        { href: '/leadership', label: t('leadership'), desc: t('leadershipDesc'), icon: 'users' },
      ],
    },
    {
      key: 'services',
      label: t('services'),
      mega: true,
      items: (['guarantee', 'credit', 'investment', 'fund-agency', 'consulting'] as const).map((slug) => ({
        href: `/services/${slug}`,
        label: ts(`items.${slug}.title`),
        desc: ts(`items.${slug}.short`),
        icon: serviceIcons[slug],
      })),
      featured: {
        title: th('services.cooperationTitle'),
        text: th('services.cooperationText'),
        href: '/cooperation',
        cta: tc('submitProposal'),
      },
    },
    {
      key: 'investment',
      label: t('investment'),
      items: [
        { href: '/investment', label: t('investmentAreas'), desc: t('investmentAreasDesc'), icon: 'rocket' },
        { href: '/process', label: t('process'), desc: t('processDesc'), icon: 'compass' },
        ...(hasPortfolio
          ? [{ href: '/portfolio', label: t('portfolio'), desc: t('portfolioDesc'), icon: 'briefcase' as const }]
          : []),
      ],
    },
    {
      key: 'resources',
      label: t('resources'),
      items: [
        { href: '/news', label: t('news'), desc: t('newsDesc'), icon: 'news' },
        { href: '/faq', label: t('faq'), desc: t('faqDesc'), icon: 'question' },
      ],
    },
    { key: 'contact', label: t('contact'), href: '/contact' },
  ];

  return (
    <HeaderClient
      groups={groups}
      labels={{
        openMenu: tc('openMenu'),
        closeMenu: tc('closeMenu'),
        menu: tc('menu'),
        search: tc('search'),
        language: tc('language'),
        cta: tc('submitProposal'),
        home: tc('home'),
        brandName: tc('siteName'),
        brandSub: tc('brandSub'),
        skip: tc('skipToContent'),
      }}
    />
  );
}
