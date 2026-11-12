import path from 'node:path';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const isProd = process.env.NODE_ENV === 'production';
const legacyPages = 'about|services|investment|cooperation|contact|leadership';
const legacyLocales = 'en|zh|ru|es';

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? '' : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-src 'none'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.resolve(process.cwd(), '../..'),
  transpilePackages: ['@sabano/db', '@sabano/i18n', '@sabano/ui'],
  serverExternalPackages: ['better-sqlite3'],
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 828, 1080, 1280, 1600, 1920, 2400],
    imageSizes: [64, 96, 128, 200, 256, 384, 480],
    minimumCacheTTL: 60 * 60 * 24 * 31,
    localPatterns: [{ pathname: '/images/**' }, { pathname: '/media/**' }],
  },
  experimental: {
    serverActions: { bodySizeLimit: '9mb' },
  },
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: `/:page(${legacyPages}).html`, destination: '/:page', permanent: true },
      { source: `/:locale(${legacyLocales})/index.html`, destination: '/:locale', permanent: true },
      { source: `/:locale(${legacyLocales})/:page(${legacyPages}).html`, destination: '/:locale/:page', permanent: true },
      { source: '/submit-proposal.php', destination: '/cooperation', permanent: true },
      { source: '/assets/hero-tehran.png', destination: '/images/hero/tehran.jpg', permanent: true },
      { source: '/assets/office-tehran.png', destination: '/images/about/office.jpg', permanent: true },
    ];
  },
  async headers() {
    const security = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
      { key: 'Content-Security-Policy', value: csp },
      ...(isProd ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }] : []),
    ];
    return [
      { source: '/:path*', headers: security },
      { source: '/fonts/:file*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
      { source: '/decor/:file*', headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000' }] },
      { source: '/images/:file*', headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }] },
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ];
  },
};

export default withNextIntl(nextConfig);
