// src/modules/siteSettings/controller.ts
import type { RouteHandler } from 'fastify';
import { db } from '@/db/client';
import { eq, like, inArray, asc, desc, and } from 'drizzle-orm';
import { siteSettings } from './schema';
import {
  type JsonLike,
} from './validation';

function parseDbValue(s: string): unknown {
  try { return JSON.parse(s); } catch { return s; }
}
function stringifyValue(v: JsonLike): string {
  return JSON.stringify(v);
}

/** Tek satırı FE'nin beklediği DTO'ya çevir */
function rowToDto(r: typeof siteSettings.$inferSelect) {
  return {
    id: r.id,
    key: r.key,
    value: parseDbValue(r.value),
    created_at: r.created_at ? new Date(r.created_at).toISOString() : undefined,
    updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
  };
}

export const listSiteSettings: RouteHandler = async (req, reply) => {
  const q = (req.query || {}) as {
    select?: string;
    key?: string;
    key_in?: string;
    prefix?: string;
    order?: string;
    limit?: string | number;
    offset?: string | number;
  };

  let qb = db.select().from(siteSettings).$dynamic();

  const conditions: unknown[] = [];
  if (q.prefix) conditions.push(like(siteSettings.key, `${q.prefix}%`));
  if (q.key)    conditions.push(eq(siteSettings.key, q.key));
  if (q.key_in) {
    const keys = q.key_in.split(',').map(s => s.trim()).filter(Boolean);
    if (keys.length) conditions.push(inArray(siteSettings.key, keys));
  }

  if (conditions.length === 1) qb = qb.where(conditions[0] as any);
  else if (conditions.length > 1) qb = qb.where(and(...(conditions as any)));

  // order
  if (q.order) {
    const [col, dir] = q.order.split('.');
    const colRef = (siteSettings as any)[col];
    if (colRef) {
      qb = qb.orderBy(dir === 'desc' ? desc(colRef) : asc(colRef));
    } else {
      qb = qb.orderBy(asc(siteSettings.key));
    }
  } else {
    qb = qb.orderBy(asc(siteSettings.key));
  }

  // limit/offset
  if (q.limit != null && q.limit !== '') {
    const n = Number(q.limit);
    if (!Number.isNaN(n) && n > 0) qb = qb.limit(n);
  }
  if (q.offset != null && q.offset !== '') {
    const m = Number(q.offset);
    if (!Number.isNaN(m) && m >= 0) qb = qb.offset(m);
  }

  const rows = await qb;
  return reply.send(rows.map(rowToDto));
};

/** GET /site_settings/:key */
export const getSiteSettingByKey: RouteHandler = async (req, reply) => {
  const { key } = req.params as { key: string };

  const rows = await db.select().from(siteSettings)
    .where(eq(siteSettings.key, key))
    .limit(1);

  if (!rows.length) return reply.code(404).send({ error: { message: 'not_found' } });

  return reply.send(rowToDto(rows[0]));
};
