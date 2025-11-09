// src/modules/siteSettings/controller.ts
import type { RouteHandler } from 'fastify';
import { db } from '@/db/client';
import { eq, like, inArray, asc, and } from 'drizzle-orm';
import { siteSettings } from './schema';
import { fallbackChain, isSupported, DEFAULT_LOCALE, type Locale } from '@/core/i18n';

function parseDbValue(s: string): unknown { try { return JSON.parse(s); } catch { return s; } }
function rowToDto(r: typeof siteSettings.$inferSelect) {
  return { id: r.id, key: r.key, locale: r.locale, value: parseDbValue(r.value),
    created_at: r.created_at?.toISOString?.(), updated_at: r.updated_at?.toISOString?.() };
}

// GET /site_settings?locale=en  → seçili locale için anahtar-değer listesi (fallback'li)
export const listSiteSettings: RouteHandler = async (req, reply) => {
  const q = (req.query || {}) as { locale?: string; prefix?: string; key?: string; key_in?: string; order?: string; limit?: string | number; offset?: string | number; };

  const primary: Locale =
    (isSupported(q.locale || '') ? (q.locale as Locale)
      : ((req as any).locale as Locale)) || DEFAULT_LOCALE;
  const fallbacks = fallbackChain(primary);

  // İlgili anahtarları çek
  let conds: any[] = [];
  if (q.prefix) conds.push(like(siteSettings.key, `${q.prefix}%`));
  if (q.key)    conds.push(eq(siteSettings.key, q.key));
  if (q.key_in) {
    const keys = q.key_in.split(',').map(s => s.trim()).filter(Boolean);
    if (keys.length) conds.push(inArray(siteSettings.key, keys));
  }

  const rows = await db.select().from(siteSettings)
    .where(conds.length ? (conds.length === 1 ? conds[0] : and(...conds)) : undefined as any)
    .orderBy(asc(siteSettings.key));

  // Fallback’e göre tekilleştir
  const map = new Map<string, any>();
  for (const k of Array.from(new Set(rows.map(r => r.key)))) {
    const cands = rows.filter(r => r.key === k);
    const byLocale = new Map(cands.map(r => [r.locale, r]));
    for (const l of fallbacks) {
      const r = byLocale.get(l);
      if (r) { map.set(k, rowToDto(r)); break; }
    }
  }

  return reply.send(Array.from(map.values()));
};

export const getSiteSettingByKey: RouteHandler = async (req, reply) => {
  const { key } = req.params as { key: string };
  const qLocale = (req.query as any)?.locale as string | undefined;
  const primary: Locale =
    (isSupported(qLocale || '') ? (qLocale as Locale)
      : ((req as any).locale as Locale)) || DEFAULT_LOCALE;

  const rows = await db.select().from(siteSettings)
    .where(eq(siteSettings.key, key));

  const fallbacks = fallbackChain(primary);
  const byLocale = new Map(rows.map(r => [r.locale, r]));
  for (const l of fallbacks) {
    const found = byLocale.get(l);
    if (found) return reply.send(rowToDto(found));
  }
  return reply.code(404).send({ error: { message: 'not_found' } });
};
