import 'server-only';
import { cache } from 'react';
import {
  countPublishedCompanies,
  getCompany,
  getPost,
  getSetting,
  listCompanies,
  listFaqs,
  listPartners,
  listPeople,
  listPosts,
  listShareholders,
  type FaqCategory,
  type PostCategory,
} from '@sabano/db';
import type { Locale } from '@sabano/i18n';

// Per-request memoisation around the synchronous SQLite queries.
export const getContact = cache(() => getSetting('contact'));
export const getSocial = cache(() => getSetting('social'));
export const getOrg = cache(() => getSetting('org'));
export const getStats = cache(() => getSetting('stats'));
export const getPeople = cache((locale: Locale) => listPeople(locale));
export const getPartners = cache((locale: Locale) => listPartners(locale));
export const getShareholders = cache((locale: Locale) => listShareholders(locale));
export const getFaqs = cache((locale: Locale, category?: FaqCategory) => listFaqs(locale, category));
export const getCompanies = cache((locale: Locale) => listCompanies(locale));
export const getCompanyBySlug = cache((slug: string, locale: Locale) => getCompany(slug, locale));
export const getCompanyCount = cache(() => countPublishedCompanies());
export const getPosts = cache(
  (locale: Locale, category?: PostCategory, limit = 12, offset = 0) => listPosts(locale, { category, limit, offset }),
);
export const getPostBySlug = cache((slug: string, locale: Locale) => getPost(slug, locale));
