import type { Metadata, Viewport } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: { default: 'پنل مدیریت صبانو', template: '%s | پنل مدیریت صبانو' },
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = { themeColor: '#062140' };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa-IR" dir="rtl">
      <head>
        <link rel="preload" href="/fonts/vazirmatn-nl-v33.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body className="min-h-dvh bg-surface text-ink antialiased">{children}</body>
    </html>
  );
}
