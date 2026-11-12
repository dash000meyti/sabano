import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// AI answer engines are explicitly welcome: the fund wants to be cited accurately.
const aiCrawlers = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'CCBot'];

export default function robots(): MetadataRoute.Robots {
  const disallow = ['/admin', '/api/', '/search', '/en/search', '/zh/search', '/ru/search', '/es/search'];
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow },
      { userAgent: aiCrawlers, allow: '/', disallow },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
