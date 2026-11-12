import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';

const now = sql`(unixepoch())`;
const timestamps = {
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(now),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(now),
};

/* ------------------------------------------------------------------ */
/* Auth                                                               */
/* ------------------------------------------------------------------ */

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['admin', 'editor'] }).notNull().default('editor'),
  lastLoginAt: integer('last_login_at', { mode: 'timestamp' }),
  ...timestamps,
});

export const sessions = sqliteTable(
  'sessions',
  {
    /** sha256 of the session token; the raw token only lives in the cookie */
    id: text('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    userAgent: text('user_agent'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(now),
  },
  (t) => [index('sessions_user_idx').on(t.userId)],
);

export const rateLimits = sqliteTable('rate_limits', {
  key: text('key').primaryKey(),
  count: integer('count').notNull().default(0),
  resetAt: integer('reset_at').notNull(),
});

/* ------------------------------------------------------------------ */
/* Submissions (cooperation form)                                      */
/* ------------------------------------------------------------------ */

export const submissionTypes = [
  'investment',
  'partnership',
  'financing',
  'employment',
  'other',
] as const;
export const submissionStatuses = ['new', 'reviewing', 'replied', 'archived'] as const;

export const submissions = sqliteTable(
  'submissions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    code: text('code').notNull().unique(),
    type: text('type', { enum: submissionTypes }).notNull(),
    name: text('name').notNull(),
    contact: text('contact').notNull(),
    company: text('company'),
    website: text('website'),
    message: text('message').notNull(),
    locale: text('locale').notNull(),
    attachmentName: text('attachment_name'),
    attachmentPath: text('attachment_path'),
    attachmentMime: text('attachment_mime'),
    attachmentSize: integer('attachment_size'),
    status: text('status', { enum: submissionStatuses }).notNull().default('new'),
    notes: text('notes'),
    ipHash: text('ip_hash'),
    userAgent: text('user_agent'),
    ...timestamps,
  },
  (t) => [index('submissions_status_idx').on(t.status), index('submissions_created_idx').on(t.createdAt)],
);

/* ------------------------------------------------------------------ */
/* News & insights                                                     */
/* ------------------------------------------------------------------ */

export const postCategories = ['news', 'insight', 'guide'] as const;

export const posts = sqliteTable(
  'posts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    slug: text('slug').notNull().unique(),
    category: text('category', { enum: postCategories }).notNull().default('news'),
    coverImage: text('cover_image'),
    status: text('status', { enum: ['draft', 'published'] }).notNull().default('draft'),
    featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
    publishedAt: integer('published_at', { mode: 'timestamp' }),
    ...timestamps,
  },
  (t) => [index('posts_published_idx').on(t.status, t.publishedAt)],
);

export const postTranslations = sqliteTable(
  'post_translations',
  {
    postId: integer('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    locale: text('locale').notNull(),
    title: text('title').notNull(),
    excerpt: text('excerpt').notNull().default(''),
    /** sanitized HTML */
    body: text('body').notNull().default(''),
    coverAlt: text('cover_alt'),
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    readingMinutes: integer('reading_minutes').notNull().default(1),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(now),
  },
  (t) => [primaryKey({ columns: [t.postId, t.locale] })],
);

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

export const faqCategories = ['general', 'investment', 'services', 'cooperation'] as const;

export const faqs = sqliteTable('faqs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  category: text('category', { enum: faqCategories }).notNull().default('general'),
  sortOrder: integer('sort_order').notNull().default(0),
  published: integer('published', { mode: 'boolean' }).notNull().default(true),
  ...timestamps,
});

export const faqTranslations = sqliteTable(
  'faq_translations',
  {
    faqId: integer('faq_id')
      .notNull()
      .references(() => faqs.id, { onDelete: 'cascade' }),
    locale: text('locale').notNull(),
    question: text('question').notNull(),
    answer: text('answer').notNull(),
  },
  (t) => [primaryKey({ columns: [t.faqId, t.locale] })],
);

/* ------------------------------------------------------------------ */
/* People (leadership)                                                 */
/* ------------------------------------------------------------------ */

export const people = sqliteTable('people', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  group: text('group', { enum: ['management', 'board'] }).notNull().default('board'),
  photo: text('photo'),
  linkedin: text('linkedin'),
  sortOrder: integer('sort_order').notNull().default(0),
  published: integer('published', { mode: 'boolean' }).notNull().default(true),
  ...timestamps,
});

export const personTranslations = sqliteTable(
  'person_translations',
  {
    personId: integer('person_id')
      .notNull()
      .references(() => people.id, { onDelete: 'cascade' }),
    locale: text('locale').notNull(),
    name: text('name').notNull(),
    role: text('role').notNull(),
    bio: text('bio'),
  },
  (t) => [primaryKey({ columns: [t.personId, t.locale] })],
);

/* ------------------------------------------------------------------ */
/* Portfolio                                                           */
/* ------------------------------------------------------------------ */

export const sectors = ['ai', 'fintech', 'digital', 'future'] as const;

export const companies = sqliteTable('companies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  sector: text('sector', { enum: sectors }).notNull().default('digital'),
  logo: text('logo'),
  website: text('website'),
  year: integer('year'),
  sortOrder: integer('sort_order').notNull().default(0),
  published: integer('published', { mode: 'boolean' }).notNull().default(true),
  ...timestamps,
});

export const companyTranslations = sqliteTable(
  'company_translations',
  {
    companyId: integer('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    locale: text('locale').notNull(),
    name: text('name').notNull(),
    summary: text('summary').notNull().default(''),
    description: text('description'),
  },
  (t) => [primaryKey({ columns: [t.companyId, t.locale] })],
);

/* ------------------------------------------------------------------ */
/* Related institutions & shareholders                                 */
/* ------------------------------------------------------------------ */

export const partners = sqliteTable('partners', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  logo: text('logo'),
  url: text('url'),
  sortOrder: integer('sort_order').notNull().default(0),
  published: integer('published', { mode: 'boolean' }).notNull().default(true),
  ...timestamps,
});

export const partnerTranslations = sqliteTable(
  'partner_translations',
  {
    partnerId: integer('partner_id')
      .notNull()
      .references(() => partners.id, { onDelete: 'cascade' }),
    locale: text('locale').notNull(),
    name: text('name').notNull(),
  },
  (t) => [primaryKey({ columns: [t.partnerId, t.locale] })],
);

export const shareholders = sqliteTable('shareholders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  isMain: integer('is_main', { mode: 'boolean' }).notNull().default(false),
  logo: text('logo'),
  url: text('url'),
  sortOrder: integer('sort_order').notNull().default(0),
  published: integer('published', { mode: 'boolean' }).notNull().default(true),
  ...timestamps,
});

export const shareholderTranslations = sqliteTable(
  'shareholder_translations',
  {
    shareholderId: integer('shareholder_id')
      .notNull()
      .references(() => shareholders.id, { onDelete: 'cascade' }),
    locale: text('locale').notNull(),
    name: text('name').notNull(),
    description: text('description'),
  },
  (t) => [primaryKey({ columns: [t.shareholderId, t.locale] })],
);

/* ------------------------------------------------------------------ */
/* Settings & media                                                    */
/* ------------------------------------------------------------------ */

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  /** JSON-encoded value */
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(now),
});

export const media = sqliteTable(
  'media',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    /** path relative to the media dir, served at /media/<path> */
    path: text('path').notNull().unique(),
    originalName: text('original_name').notNull(),
    mime: text('mime').notNull(),
    size: integer('size').notNull(),
    width: integer('width'),
    height: integer('height'),
    alt: text('alt'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(now),
  },
);

export type User = typeof users.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type PostTranslation = typeof postTranslations.$inferSelect;
export type SubmissionType = (typeof submissionTypes)[number];
export type SubmissionStatus = (typeof submissionStatuses)[number];
export type PostCategory = (typeof postCategories)[number];
export type FaqCategory = (typeof faqCategories)[number];
export type Sector = (typeof sectors)[number];
