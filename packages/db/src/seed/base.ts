import type { FaqCategory, PostCategory } from '../schema';

/** Structural seed data. Texts live in ./content/<locale>.json under the same keys. */

export const seedPeople = [
  { slug: 'mehdi-sedaghat', group: 'management', photo: '/images/people/mehdi-sedaghat.jpg', linkedin: 'https://www.linkedin.com/in/mahdi-sedaghat-ir/' },
  { slug: 'mohammadreza-nazari', group: 'board', photo: '/images/people/mohammadreza-nazari.jpg', linkedin: 'https://www.linkedin.com/in/mohammadreza-nazari-900577b1/' },
  { slug: 'akbar-ghanbarpour', group: 'board', photo: '/images/people/akbar-ghanbarpour.jpg', linkedin: 'https://www.linkedin.com/in/akbar-ghanbarpour-01206b264/' },
  { slug: 'ali-salimi', group: 'board', photo: null, linkedin: null },
] as const;

export const seedPartners = [
  { key: 'inif', logo: '/images/partners/inif.png', url: 'https://www.inif.ir/' },
  { key: 'isti', logo: '/images/partners/science-vice-presidency.png', url: 'https://isti.ir/' },
  { key: 'rtfunds', logo: '/images/partners/rtfunds-secretariat.png', url: 'https://www.rtfunds.ir/' },
  { key: 'irvc', logo: '/images/partners/irvc.png', url: 'https://irvc.ir/' },
] as const;

export const seedShareholders = [
  { key: 'saba-mihan', isMain: true },
  { key: 'jabiz', isMain: false },
  { key: 'yas', isMain: false },
  { key: 'ala', isMain: false },
] as const;

export const seedFaqs: { key: string; category: FaqCategory }[] = [
  { key: 'what-is-sabano', category: 'general' },
  { key: 'what-is-rt-fund', category: 'general' },
  { key: 'shareholders', category: 'general' },
  { key: 'office', category: 'general' },
  { key: 'focus-areas', category: 'investment' },
  { key: 'what-we-look-for', category: 'investment' },
  { key: 'commitment', category: 'investment' },
  { key: 'which-services', category: 'services' },
  { key: 'guarantee', category: 'services' },
  { key: 'review-time', category: 'services' },
  { key: 'how-to-submit', category: 'cooperation' },
  { key: 'file-types', category: 'cooperation' },
  { key: 'jobs', category: 'cooperation' },
  { key: 'contact', category: 'cooperation' },
];

export const seedPosts: { slug: string; category: PostCategory; cover: string; publishedAt: string }[] = [
  { slug: 'what-is-a-research-and-technology-fund', category: 'guide', cover: '/images/topics/digital.jpg', publishedAt: '2026-11-01T08:00:00Z' },
  { slug: 'how-to-prepare-an-investment-proposal', category: 'guide', cover: '/images/topics/ai.jpg', publishedAt: '2026-11-05T08:00:00Z' },
  { slug: 'guarantees-for-technology-companies', category: 'guide', cover: '/images/topics/fintech.jpg', publishedAt: '2026-11-09T08:00:00Z' },
];
