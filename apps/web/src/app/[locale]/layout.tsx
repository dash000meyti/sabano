import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { localeMeta, type Locale } from '@sabano/i18n';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { RevealObserver } from '@/components/layout/RevealObserver';
import { SearchPalette } from '@/components/layout/SearchPalette';
import { routing } from '@/i18n/routing';
import { SITE_URL } from '@/lib/site';
import '../globals.css';

// Pages are rendered on first request and cached (ISR); admin edits revalidate them.
export function generateStaticParams() {
  return [];
}
export const dynamicParams = true;
export const revalidate = 3600;

export const viewport: Viewport = {
  themeColor: '#062140',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'common' });
  return {
    metadataBase: new URL(SITE_URL),
    applicationName: t('siteName'),
    authors: [{ name: t('orgName'), url: SITE_URL }],
    publisher: t('orgName'),
    creator: t('orgName'),
    formatDetection: { telephone: false, email: false, address: false },
    manifest: '/manifest.webmanifest',
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
      other: process.env.BING_SITE_VERIFICATION ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } : undefined,
      yandex: process.env.YANDEX_VERIFICATION || undefined,
    },
    alternates: {
      types: { 'application/rss+xml': `${SITE_URL}${locale === 'fa' ? '' : `/${locale}`}/news/rss.xml` },
    },
  };
}

// Only the namespaces client components need are sent to the browser.
const clientNamespaces = ['common', 'search', 'cooperation', 'faq', 'contact', 'portfolio', 'error'] as const;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const meta = localeMeta[locale as Locale];
  const messages = await getMessages();
  const clientMessages = Object.fromEntries(clientNamespaces.map((ns) => [ns, messages[ns]]));

  return (
    <html lang={meta.hreflang} dir={meta.dir} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        {locale === 'fa' ? (
          <link rel="preload" href="/fonts/vazirmatn-nl-v33.woff2" as="font" type="font/woff2" crossOrigin="" />
        ) : (
          <link rel="preload" href="/fonts/manrope-latin-v5.woff2" as="font" type="font/woff2" crossOrigin="" />
        )}
        {locale === 'ru' && <link rel="preload" href="/fonts/manrope-cyrillic-v5.woff2" as="font" type="font/woff2" crossOrigin="" />}
      </head>
      <body className="bg-paper text-ink antialiased">
        <NextIntlClientProvider locale={locale} messages={clientMessages}>
          <Header locale={locale as Locale} />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer locale={locale as Locale} />
          <SearchPalette />
          <RevealObserver />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
