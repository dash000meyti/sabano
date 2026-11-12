/**
 * Data access for the admin panel. Every function here assumes the caller has
 * already authenticated and authorised the user.
 */
import { and, asc, count, desc, eq, inArray, like, or, sql, type SQL } from 'drizzle-orm';
import { locales, type Locale } from '@sabano/i18n';
import { getDb } from './client';
import {
  companies,
  companyTranslations,
  faqs,
  faqTranslations,
  media,
  partners,
  partnerTranslations,
  people,
  personTranslations,
  posts,
  postTranslations,
  sessions,
  shareholders,
  shareholderTranslations,
  submissions,
  users,
  type SubmissionStatus,
  type SubmissionType,
} from './schema';

/* ------------------------------------------------------------------ */
/* Translatable entities                                              */
/* ------------------------------------------------------------------ */

const registry = {
  people: { table: people, tr: personTranslations, fk: 'personId', sortable: true },
  partners: { table: partners, tr: partnerTranslations, fk: 'partnerId', sortable: true },
  shareholders: { table: shareholders, tr: shareholderTranslations, fk: 'shareholderId', sortable: true },
  companies: { table: companies, tr: companyTranslations, fk: 'companyId', sortable: true },
  faqs: { table: faqs, tr: faqTranslations, fk: 'faqId', sortable: true },
  posts: { table: posts, tr: postTranslations, fk: 'postId', sortable: false },
} as const;

export type EntityKey = keyof typeof registry;
type Row = Record<string, unknown> & { id: number };
export type EntityRecord = Row & { translations: Partial<Record<Locale, Record<string, unknown>>> };

/* Drizzle's table types differ per entity; this module treats them uniformly. */
/* eslint-disable @typescript-eslint/no-explicit-any */
function reg(key: EntityKey) {
  const r = registry[key];
  return { table: r.table as any, tr: r.tr as any, fkCol: (r.tr as any)[r.fk], fk: r.fk, sortable: r.sortable };
}

export function adminList(key: EntityKey): EntityRecord[] {
  const db = getDb();
  const { table, tr, fkCol, fk, sortable } = reg(key);
  const order = sortable ? [asc(table.sortOrder), asc(table.id)] : [desc(table.createdAt), desc(table.id)];
  const rows = db.select().from(table).orderBy(...order).all() as Row[];
  if (!rows.length) return [];
  const trs = db.select().from(tr).where(inArray(fkCol, rows.map((r) => r.id))).all() as Record<string, unknown>[];
  return rows.map((r) => ({
    ...r,
    translations: Object.fromEntries(trs.filter((t) => t[fk] === r.id).map((t) => [t.locale as Locale, t])),
  }));
}

export function adminGet(key: EntityKey, id: number): EntityRecord | undefined {
  const db = getDb();
  const { table, tr, fkCol } = reg(key);
  const row = db.select().from(table).where(eq(table.id, id)).get() as Row | undefined;
  if (!row) return undefined;
  const trs = db.select().from(tr).where(eq(fkCol, id)).all() as Record<string, unknown>[];
  return { ...row, translations: Object.fromEntries(trs.map((t) => [t.locale as Locale, t])) };
}

/**
 * Creates or updates an entity and its translations in one transaction.
 * Locales missing from `translations` are deleted (so a cleared language disappears from the site).
 */
export function adminSave(
  key: EntityKey,
  id: number | null,
  base: Record<string, unknown>,
  translations: Partial<Record<Locale, Record<string, unknown>>>,
): number {
  const db = getDb();
  const { table, tr, fkCol, fk } = reg(key);
  return db.transaction((tx) => {
    let entityId = id;
    const now = new Date();
    if (entityId) {
      tx.update(table).set({ ...base, updatedAt: now }).where(eq(table.id, entityId)).run();
    } else {
      if (registry[key].sortable && base.sortOrder === undefined) {
        const max = tx.select({ m: sql<number>`coalesce(max(${table.sortOrder}), -1)` }).from(table).get() as { m: number };
        base.sortOrder = max.m + 1;
      }
      const row = tx.insert(table).values({ ...base, createdAt: now, updatedAt: now }).returning({ id: table.id }).get() as { id: number };
      entityId = row.id;
    }
    const keep = locales.filter((l) => translations[l]);
    tx.delete(tr)
      .where(and(eq(fkCol, entityId), keep.length ? sql`${tr.locale} not in (${sql.join(keep.map((l) => sql`${l}`), sql`, `)})` : undefined))
      .run();
    for (const l of keep) {
      const values = { ...translations[l], [fk]: entityId, locale: l, ...(key === 'posts' ? { updatedAt: now } : {}) };
      tx.insert(tr)
        .values(values)
        .onConflictDoUpdate({ target: [fkCol, tr.locale], set: translations[l] as Record<string, unknown> })
        .run();
    }
    return entityId!;
  });
}

export function adminDelete(key: EntityKey, id: number) {
  const { table } = reg(key);
  getDb().delete(table).where(eq(table.id, id)).run();
}

/** Persists a new order (array of ids, first = top). */
export function adminReorder(key: EntityKey, ids: number[]) {
  const { table } = reg(key);
  getDb().transaction((tx) => {
    ids.forEach((id, i) => tx.update(table).set({ sortOrder: i }).where(eq(table.id, id)).run());
  });
}

export function slugExists(key: 'people' | 'companies' | 'posts', slug: string, exceptId?: number): boolean {
  const { table } = reg(key);
  const row = getDb().select({ id: table.id }).from(table).where(eq(table.slug, slug)).get() as { id: number } | undefined;
  return !!row && row.id !== exceptId;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/* ------------------------------------------------------------------ */
/* Submissions                                                         */
/* ------------------------------------------------------------------ */

export function listSubmissions(opts: { status?: SubmissionStatus; type?: SubmissionType; q?: string; page?: number; perPage?: number }) {
  const db = getDb();
  const conds: SQL[] = [];
  if (opts.status) conds.push(eq(submissions.status, opts.status));
  if (opts.type) conds.push(eq(submissions.type, opts.type));
  if (opts.q) {
    const q = `%${opts.q}%`;
    conds.push(or(like(submissions.name, q), like(submissions.contact, q), like(submissions.code, q), like(submissions.company, q), like(submissions.message, q))!);
  }
  const where = conds.length ? and(...conds) : undefined;
  const perPage = opts.perPage ?? 25;
  const page = Math.max(1, opts.page ?? 1);
  const total = db.select({ n: count() }).from(submissions).where(where).get()?.n ?? 0;
  const items = db
    .select()
    .from(submissions)
    .where(where)
    .orderBy(desc(submissions.createdAt), desc(submissions.id))
    .limit(perPage)
    .offset((page - 1) * perPage)
    .all();
  return { items, total, page, pages: Math.max(1, Math.ceil(total / perPage)) };
}

export function submissionCounts(): Record<SubmissionStatus | 'all', number> {
  const rows = getDb().select({ status: submissions.status, n: count() }).from(submissions).groupBy(submissions.status).all();
  const out = { all: 0, new: 0, reviewing: 0, replied: 0, archived: 0 } as Record<SubmissionStatus | 'all', number>;
  for (const r of rows) {
    out[r.status] = r.n;
    out.all += r.n;
  }
  return out;
}

export function getSubmission(id: number) {
  return getDb().select().from(submissions).where(eq(submissions.id, id)).get();
}

export function updateSubmission(id: number, patch: { status?: SubmissionStatus; notes?: string | null }) {
  getDb().update(submissions).set({ ...patch, updatedAt: new Date() }).where(eq(submissions.id, id)).run();
}

export function deleteSubmission(id: number) {
  return getDb().delete(submissions).where(eq(submissions.id, id)).returning({ path: submissions.attachmentPath }).get();
}

export function allSubmissionsForExport() {
  return getDb().select().from(submissions).orderBy(desc(submissions.createdAt)).all();
}

/* ------------------------------------------------------------------ */
/* Users & sessions                                                    */
/* ------------------------------------------------------------------ */

export function listUsers() {
  return getDb()
    .select({ id: users.id, email: users.email, name: users.name, role: users.role, lastLoginAt: users.lastLoginAt, createdAt: users.createdAt })
    .from(users)
    .orderBy(asc(users.id))
    .all();
}

export function getUser(id: number) {
  return getDb().select().from(users).where(eq(users.id, id)).get();
}

export function updateUser(id: number, patch: Partial<{ name: string; role: 'admin' | 'editor'; passwordHash: string; lastLoginAt: Date }>) {
  getDb().update(users).set({ ...patch, updatedAt: new Date() }).where(eq(users.id, id)).run();
}

export function deleteUser(id: number) {
  getDb().delete(users).where(eq(users.id, id)).run();
}

export function createSessionRow(id: string, userId: number, expiresAt: Date, userAgent: string | null) {
  getDb().insert(sessions).values({ id, userId, expiresAt, userAgent }).run();
}

export function findSession(id: string) {
  return getDb()
    .select({ session: sessions, user: { id: users.id, email: users.email, name: users.name, role: users.role } })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(eq(sessions.id, id))
    .get();
}

export function deleteSession(id: string) {
  getDb().delete(sessions).where(eq(sessions.id, id)).run();
}

export function deleteUserSessions(userId: number) {
  getDb().delete(sessions).where(eq(sessions.userId, userId)).run();
}

export function purgeExpiredSessions() {
  getDb().delete(sessions).where(sql`${sessions.expiresAt} < unixepoch()`).run();
}

/* ------------------------------------------------------------------ */
/* Media                                                               */
/* ------------------------------------------------------------------ */

export function listMedia() {
  return getDb().select().from(media).orderBy(desc(media.createdAt), desc(media.id)).all();
}

export function insertMedia(row: typeof media.$inferInsert) {
  return getDb().insert(media).values(row).returning().get();
}

export function deleteMediaRow(id: number) {
  return getDb().delete(media).where(eq(media.id, id)).returning().get();
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

export function dashboardStats() {
  const db = getDb();
  const n = (q: { n: number } | undefined) => q?.n ?? 0;
  const postLocales = db.select({ locale: postTranslations.locale, n: count() }).from(postTranslations).groupBy(postTranslations.locale).all();
  const faqLocales = db.select({ locale: faqTranslations.locale, n: count() }).from(faqTranslations).groupBy(faqTranslations.locale).all();
  return {
    posts: n(db.select({ n: count() }).from(posts).get()),
    published: n(db.select({ n: count() }).from(posts).where(eq(posts.status, 'published')).get()),
    faqs: n(db.select({ n: count() }).from(faqs).get()),
    companies: n(db.select({ n: count() }).from(companies).get()),
    people: n(db.select({ n: count() }).from(people).get()),
    postLocales: Object.fromEntries(postLocales.map((r) => [r.locale, r.n])) as Partial<Record<Locale, number>>,
    faqLocales: Object.fromEntries(faqLocales.map((r) => [r.locale, r.n])) as Partial<Record<Locale, number>>,
  };
}
