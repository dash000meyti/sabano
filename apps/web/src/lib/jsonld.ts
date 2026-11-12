import type {
  Article,
  BreadcrumbList,
  FAQPage,
  FinancialService,
  HowTo,
  ItemList,
  Organization,
  Person,
  Service,
  WebPage,
  WebSite,
  WithContext,
} from 'schema-dts';
import { locales, localeMeta, type Locale } from '@sabano/i18n';
import type { ContactSettings, OrgSettings, SocialSettings } from '@sabano/db/settings';
import { intlPhone } from './format';
import { absoluteUrl, pageUrl, SITE_URL } from './site';

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

type OrgInput = {
  locale: Locale;
  name: string;
  description: string;
  contact: ContactSettings;
  social: SocialSettings;
  org: OrgSettings;
  services: { name: string; url: string }[];
  knowsAbout: string[];
};

/** The fund as a FinancialService + Organization entity (single @id across the site). */
export function organizationLd(i: OrgInput): WithContext<FinancialService> {
  const legalNames = Object.values(i.org.legalName).filter(Boolean) as string[];
  const sameAs = Object.values(i.social).filter((v): v is string => !!v && v.startsWith('http'));
  return {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    '@id': ORG_ID,
    name: i.name,
    legalName: i.org.legalName[i.locale] ?? i.org.legalName.fa,
    alternateName: Array.from(new Set(['Sabano', 'صبانو', 'Sabano Research and Technology Fund', 'صندوق پژوهش و فناوری صبانو', ...legalNames])).filter((n) => n !== i.name),
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: absoluteUrl('/icon-512.png'), width: '512', height: '512' },
    image: absoluteUrl('/images/about/office.jpg'),
    description: i.description,
    email: i.contact.email,
    telephone: i.contact.phones.map(intlPhone),
    address: {
      '@type': 'PostalAddress',
      streetAddress: i.contact.address[i.locale] ?? i.contact.address.en,
      addressLocality: i.locale === 'fa' ? 'تهران' : 'Tehran',
      addressCountry: 'IR',
      postalCode: i.contact.postalCode,
    },
    ...(i.contact.lat && i.contact.lng ? { geo: { '@type': 'GeoCoordinates', latitude: i.contact.lat, longitude: i.contact.lng } } : {}),
    areaServed: { '@type': 'Country', name: 'Iran' },
    contactPoint: i.contact.phones.map((p) => ({
      '@type': 'ContactPoint',
      telephone: intlPhone(p),
      email: i.contact.email,
      contactType: 'customer service',
      availableLanguage: ['fa', 'en'],
    })),
    ...(i.org.foundingYear ? { foundingDate: i.org.foundingYear } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    knowsAbout: i.knowsAbout,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: i.name,
      itemListElement: i.services.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.name, url: s.url },
      })),
    },
  };
}

export function websiteLd(locale: Locale, name: string, description: string): WithContext<WebSite> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name,
    description,
    inLanguage: locales.map((l) => localeMeta[l].hreflang),
    publisher: { '@id': ORG_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${pageUrl(locale, '/search')}?q={search_term_string}` },
      // schema-dts lacks the query-input extension used by Google
      ...({ 'query-input': 'required name=search_term_string' } as object),
    },
  };
}

export function webPageLd(input: {
  locale: Locale;
  path: string;
  name: string;
  description: string;
  type?: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage' | 'FAQPage' | 'SearchResultsPage';
  dateModified?: Date;
}): WithContext<WebPage> {
  return {
    '@context': 'https://schema.org',
    '@type': (input.type ?? 'WebPage') as 'WebPage',
    '@id': `${pageUrl(input.locale, input.path)}#webpage`,
    url: pageUrl(input.locale, input.path),
    name: input.name,
    description: input.description,
    inLanguage: localeMeta[input.locale].hreflang,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORG_ID },
    ...(input.dateModified ? { dateModified: input.dateModified.toISOString() } : {}),
  };
}

export function breadcrumbLd(items: { name: string; url: string }[]): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function faqLd(items: { q: string; a: string }[], locale: Locale): WithContext<FAQPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: localeMeta[locale].hreflang,
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function serviceLd(input: {
  locale: Locale;
  path: string;
  name: string;
  description: string;
  serviceType: string;
  audience: string[];
}): WithContext<Service> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${pageUrl(input.locale, input.path)}#service`,
    name: input.name,
    serviceType: input.serviceType,
    description: input.description,
    url: pageUrl(input.locale, input.path),
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'Country', name: 'Iran' },
    audience: { '@type': 'BusinessAudience', audienceType: input.audience.join('; ') },
    inLanguage: localeMeta[input.locale].hreflang,
  } as WithContext<Service>;
}

export function personLd(input: {
  name: string;
  jobTitle: string;
  image?: string | null;
  sameAs?: string | null;
}): Person {
  return {
    '@type': 'Person',
    name: input.name,
    jobTitle: input.jobTitle,
    worksFor: { '@id': ORG_ID },
    ...(input.image ? { image: absoluteUrl(input.image) } : {}),
    ...(input.sameAs ? { sameAs: [input.sameAs] } : {}),
  };
}

export function itemListLd(items: { name: string; url?: string; description?: string; item?: unknown }[]): WithContext<ItemList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      ...(it.item ? { item: it.item as never } : { name: it.name, ...(it.url ? { url: it.url } : {}), ...(it.description ? { description: it.description } : {}) }),
    })),
  };
}

export function articleLd(input: {
  locale: Locale;
  path: string;
  headline: string;
  description: string;
  image?: string | null;
  published: Date;
  modified: Date;
  section: string;
  wordCountHint?: number;
  type?: 'Article' | 'NewsArticle';
}): WithContext<Article> {
  return {
    '@context': 'https://schema.org',
    '@type': (input.type ?? 'Article') as 'Article',
    '@id': `${pageUrl(input.locale, input.path)}#article`,
    mainEntityOfPage: pageUrl(input.locale, input.path),
    headline: input.headline.slice(0, 110),
    description: input.description,
    inLanguage: localeMeta[input.locale].hreflang,
    datePublished: input.published.toISOString(),
    dateModified: input.modified.toISOString(),
    articleSection: input.section,
    ...(input.image ? { image: [absoluteUrl(input.image)] } : {}),
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
  };
}

export function howToLd(input: {
  locale: Locale;
  path: string;
  name: string;
  description: string;
  steps: { title: string; text: string }[];
  supplies: string[];
}): WithContext<HowTo> {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: input.name,
    description: input.description,
    inLanguage: localeMeta[input.locale].hreflang,
    supply: input.supplies.map((s) => ({ '@type': 'HowToSupply', name: s })),
    step: input.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.title,
      text: s.text,
      url: `${pageUrl(input.locale, input.path)}#step-${i + 1}`,
    })),
  };
}

export function organizationRefLd(): Organization {
  return { '@type': 'Organization', '@id': ORG_ID };
}

/** Serialises JSON-LD safely for embedding in a <script> tag. */
export function serializeLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/[\u2028\u2029]/g, '');
}
