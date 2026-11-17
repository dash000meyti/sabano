import type { Metadata, Viewport } from 'next';
import { ThemeSync } from '@/components/layout/ThemeSync';
import { THEME_COLORS } from '@/lib/theme';
import { ThemeScript } from '@/components/layout/ThemeScript';
import '../globals.css';

export const metadata: Metadata = {
  title: { default: 'پنل مدیریت صبانو', template: '%s | پنل مدیریت صبانو' },
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: THEME_COLORS.light },
    { media: '(prefers-color-scheme: dark)', color: THEME_COLORS.dark },
  ],
  colorScheme: 'light dark',
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa-IR" dir="rtl" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <link rel="preload" href="/fonts/vazirmatn-nl-v33.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body className="min-h-dvh bg-canvas-alt text-fg antialiased">
        {children}
        <ThemeSync />
      </body>
    </html>
  );
}
