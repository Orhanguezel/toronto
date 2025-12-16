// src/modules/siteSettings/admin.controller.ts

import type { RouteHandler } from "fastify";
import { randomUUID } from "crypto";
import { db } from "@/db/client";
import { siteSettings } from "./schema";
import {
  and,
  asc,
  desc,
  eq,
  inArray,
  like,
  ne,
} from "drizzle-orm";
import {
  siteSettingUpsertSchema,
  siteSettingBulkUpsertSchema,
  type JsonLike,
} from "./validation";
import {
  DEFAULT_LOCALE,
  LOCALES,
  type Locale,
  fallbackChain,
  isSupported,
  normalizeLocale,
} from "@/core/i18n";

function parseDbValue(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

function stringifyValue(v: JsonLike): string {
  return JSON.stringify(v);
}

function rowToDto(r: typeof siteSettings.$inferSelect) {
  return {
    id: r.id,
    key: r.key,
    locale: r.locale,
    value: parseDbValue(r.value),
    created_at: r.created_at
      ? new Date(r.created_at).toISOString()
      : undefined,
    updated_at: r.updated_at
      ? new Date(r.updated_at).toISOString()
      : undefined,
  };
}

/* ---------- Yardımcılar ---------- */

/**
 * app_locales kaydından aktif locale listesini dinamik okur.
 * Kayıt yoksa / bozuksa LOCALES fallback kullanılır.
 */
async function getAppLocales(): Promise<Locale[]> {
  const rows = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, "app_locales"));

  if (!rows.length) {
    return LOCALES as Locale[];
  }

  try {
    const raw = String(rows[0].value ?? "[]");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return LOCALES as Locale[];

    const normalized = parsed
      .map((v) => normalizeLocale(String(v)))
      .filter(
        (v): v is Locale =>
          !!v && isSupported(v),
      );

    return normalized.length ? normalized : (LOCALES as Locale[]);
  } catch {
    return LOCALES as Locale[];
  }
}

async function upsertOne(key: string, locale: Locale, value: JsonLike) {
  const now = new Date();
  await db
    .insert(siteSettings)
    .values({
      id: randomUUID(),
      key,
      locale,
      value: stringifyValue(value),
      created_at: now,
      updated_at: now,
    })
    .onDuplicateKeyUpdate({
      set: { value: stringifyValue(value), updated_at: now },
    });
}

/**
 * 🔹 Tüm aktif locale’ler (app_locales) için aynı değeri yazar.
 * app_locales yoksa LOCALES fallback devreye girer.
 */
async function upsertAllLocales(key: string, value: JsonLike) {
  const appLocales = await getAppLocales();
  for (const l of appLocales) {
    await upsertOne(key, l, value);
  }
}

/**
 * Value bir "locale → değer" map'i mi?
 * Örn: { tr:{...}, en:{...} }
 *
 * Burada key'lerin LOCALES içinde olup olmadığına bakıyoruz ki
 * contact_info gibi sıradan objeleri yanlışlıkla locale map sanmayalım.
 */
function isLocaleMap(
  v: unknown,
): v is Partial<Record<Locale, JsonLike>> {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  const keys = Object.keys(o);
  if (!keys.length) return false;

  return keys.every((k) =>
    (LOCALES as readonly string[]).includes(
      normalizeLocale(k) || k,
    ),
  );
}

async function getFirstByFallback(
  key: string,
  fallbacks: Locale[],
) {
  const rows = await db
    .select()
    .from(siteSettings)
    .where(
      and(
        eq(siteSettings.key, key),
        inArray(siteSettings.locale, fallbacks),
      ),
    )
    .orderBy(asc(siteSettings.key));

  const byLocale = new Map(rows.map((r) => [r.locale, r]));
  for (const l of fallbacks) {
    const r = byLocale.get(l);
    if (r) return rowToDto(r).value;
  }
  return undefined;
}

/* ---------- Aggregate GET/PUT (FE’nin kullandığı) ---------- */

// GET /admin/site-settings?locale=en
export const adminGetSettingsAggregate: RouteHandler = async (
  req,
  reply,
) => {
  const qLocale = (req.query as any)?.locale as
    | string
    | undefined;

  const qLocaleNorm = normalizeLocale(qLocale);
  const primary: Locale =
    (qLocaleNorm && isSupported(qLocaleNorm)
      ? (qLocaleNorm as Locale)
      : ((req as any).locale as Locale)) || DEFAULT_LOCALE;

  const fallbacks = fallbackChain(primary);

  const keys = ["contact_info", "socials", "businessHours"] as const;

  const [contact_info, socials, businessHours] =
    await Promise.all(
      keys.map((k) => getFirstByFallback(k, fallbacks)),
    );

  return reply.send({
    contact_info: contact_info ?? {},
    socials: socials ?? {},
    businessHours: businessHours ?? [],
  });
};

// PUT /admin/site-settings[?locale=en]
// Body örn (tek dilli): { contact_info: {...}, socials: {...}, businessHours: [...] }
// Body örn (çok dilli): { contact_info: { tr:{...}, en:{...} }, socials:{ tr:{...}, en:{...} }, ... }
export const adminUpsertSettingsAggregate: RouteHandler = async (
  req,
  reply,
) => {
  const body = (req.body || {}) as Partial<
    Record<"contact_info" | "socials" | "businessHours", JsonLike>
  >;

  const qLocale = (req.query as any)?.locale as
    | string
    | undefined;
  const qLocaleNorm = normalizeLocale(qLocale);
  const localeParam = qLocaleNorm && isSupported(qLocaleNorm)
    ? (qLocaleNorm as Locale)
    : undefined;

  const entries = Object.entries(body).filter(
    ([, v]) => v !== undefined,
  ) as [string, JsonLike][];

  // 🔹 Dinamik aktif locale listesi
  const appLocales = await getAppLocales();

  for (const [key, value] of entries) {
    if (localeParam) {
      // Sadece belirtilen locale
      if (isLocaleMap(value)) {
        const val =
          (value as any)[localeParam] ??
          (value as any)[DEFAULT_LOCALE];
        if (val !== undefined) {
          await upsertOne(key, localeParam, val as JsonLike);
        }
      } else {
        await upsertOne(key, localeParam, value);
      }
    } else {
      // locale belirtilmemiş → ilkkurulum kolaylığı
      if (isLocaleMap(value)) {
        for (const l of appLocales) {
          const val =
            (value as any)[l] ??
            (value as any)[DEFAULT_LOCALE] ??
            value;
          await upsertOne(key, l, val as JsonLike);
        }
      } else {
        await upsertAllLocales(key, value);
      }
    }
  }

  return reply.send({ ok: true });
};

/* ---------- (Opsiyonel) granular uçların i18n'li sürümleri ---------- */

export const adminListSiteSettings: RouteHandler = async (
  req,
  reply,
) => {
  const q = (req.query || {}) as {
    q?: string;
    keys?: string;
    prefix?: string;
    order?: string;
    limit?: string | number;
    offset?: string | number;
    locale?: string;
  };

  const qLocaleNorm = normalizeLocale(q.locale);
  const locale: Locale =
    (qLocaleNorm && isSupported(qLocaleNorm)
      ? (qLocaleNorm as Locale)
      : ((req as any).locale as Locale)) || DEFAULT_LOCALE;

  let qb = db.select().from(siteSettings).$dynamic();

  const conds: any[] = [eq(siteSettings.locale, locale)];
  if (q.prefix) conds.push(like(siteSettings.key, `${q.prefix}%`));
  if (q.keys) {
    const arr = q.keys
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (arr.length) conds.push(inArray(siteSettings.key, arr));
  }
  if (q.q) conds.push(like(siteSettings.key, `%${q.q}%`));

  qb =
    conds.length === 1
      ? qb.where(conds[0])
      : qb.where(and(...conds));

  if (q.order) {
    const [col, dir] = q.order.split(".");
    const colRef = (siteSettings as any)[col];
    qb = colRef
      ? qb.orderBy(
          dir === "desc" ? desc(colRef) : asc(colRef),
        )
      : qb.orderBy(asc(siteSettings.key));
  } else {
    qb = qb.orderBy(asc(siteSettings.key));
  }

  if (q.limit != null && q.limit !== "") {
    const n = Number(q.limit);
    if (!Number.isNaN(n) && n > 0) qb = qb.limit(n);
  }
  if (q.offset != null && q.offset !== "") {
    const m = Number(q.offset);
    if (!Number.isNaN(m) && m >= 0) qb = qb.offset(m);
  }

  const rows = await qb;
  return reply.send(rows.map(rowToDto));
};

export const adminGetSiteSettingByKey: RouteHandler = async (
  req,
  reply,
) => {
  const { key } = req.params as { key: string };
  const qLocale = (req.query as any)?.locale as
    | string
    | undefined;

  const qLocaleNorm = normalizeLocale(qLocale);
  const primary: Locale =
    (qLocaleNorm && isSupported(qLocaleNorm)
      ? (qLocaleNorm as Locale)
      : ((req as any).locale as Locale)) || DEFAULT_LOCALE;

  const val = await getFirstByFallback(
    key,
    fallbackChain(primary),
  );
  if (val === undefined) {
    return reply
      .code(404)
      .send({ error: { message: "not_found" } });
  }
  return reply.send({ key, value: val, locale: primary });
};

export const adminCreateSiteSetting: RouteHandler = async (
  req,
  reply,
) => {
  const input = siteSettingUpsertSchema.parse(req.body || {});

  // tek dilli POST → tüm aktif dillere kopyala
  await upsertAllLocales(input.key, input.value);

  const rows = await db
    .select()
    .from(siteSettings)
    .where(
      and(
        eq(siteSettings.key, input.key),
        eq(siteSettings.locale, DEFAULT_LOCALE),
      ),
    )
    .limit(1);

  return reply.code(201).send(rowToDto(rows[0]));
};

export const adminUpdateSiteSetting: RouteHandler = async (
  req,
  reply,
) => {
  const { key } = req.params as { key: string };
  const body = (req.body || {}) as Partial<{ value: JsonLike }>;
  const qLocale = (req.query as any)?.locale as
    | string
    | undefined;

  const qLocaleNorm = normalizeLocale(qLocale);
  const locale = qLocaleNorm && isSupported(qLocaleNorm)
    ? (qLocaleNorm as Locale)
    : undefined;

  if (!("value" in body)) {
    return reply
      .code(400)
      .send({ error: { message: "validation_error" } });
  }

  if (locale) {
    // 🔹 Sadece belirtilen locale’i güncelle
    await upsertOne(key, locale, body.value as JsonLike);
  } else {
    // 🔹 Tüm aktif dillere aynısını yaz (global değişiklik)
    await upsertAllLocales(key, body.value as JsonLike);
  }

  return reply.send({ ok: true });
};

export const adminBulkUpsertSiteSettings: RouteHandler = async (
  req,
  reply,
) => {
  const input = siteSettingBulkUpsertSchema.parse(
    req.body || {},
  );

  // 🔹 Dinamik aktif locale listesi
  const appLocales = await getAppLocales();

  for (const item of input.items) {
    if (isLocaleMap(item.value)) {
      for (const l of appLocales) {
        const val =
          (item.value as any)[l] ??
          (item.value as any)[DEFAULT_LOCALE] ??
          item.value;
        await upsertOne(
          item.key,
          l as Locale,
          val as JsonLike,
        );
      }
    } else {
      await upsertAllLocales(item.key, item.value);
    }
  }

  return reply.send({ ok: true });
};

export const adminDeleteManySiteSettings: RouteHandler = async (
  req,
  reply,
) => {
  const q = (req.query || {}) as Record<
    string,
    string | undefined
  >;
  const conds: any[] = [];

  const idNe = q["id!"] ?? q["id_ne"];
  const key = q["key"];
  const keyNe = q["key!"] ?? q["key_ne"];
  const keyIn = q["key_in"] ?? q["keys"];
  const prefix = q["prefix"];
  const locale = q["locale"];

  if (idNe) conds.push(ne(siteSettings.id, idNe));
  if (key) conds.push(eq(siteSettings.key, key));
  if (keyNe) conds.push(ne(siteSettings.key, keyNe));
  if (keyIn) {
    const arr = keyIn
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (arr.length) conds.push(inArray(siteSettings.key, arr));
  }
  if (prefix) conds.push(like(siteSettings.key, `${prefix}%`));
  if (locale) {
    const locNorm = normalizeLocale(locale);
    if (locNorm) conds.push(eq(siteSettings.locale, locNorm));
  }

  let d = db.delete(siteSettings).$dynamic();
  if (conds.length === 1) d = d.where(conds[0]);
  else if (conds.length > 1) d = d.where(and(...conds));

  await d;
  return reply.code(204).send();
};

export const adminDeleteSiteSetting: RouteHandler = async (
  req,
  reply,
) => {
  const { key } = req.params as { key: string };
  const qLocale = (req.query as any)?.locale as
    | string
    | undefined;

  const locNorm = normalizeLocale(qLocale);

  if (locNorm && isSupported(locNorm)) {
    await db
      .delete(siteSettings)
      .where(
        and(
          eq(siteSettings.key, key),
          eq(siteSettings.locale, locNorm as Locale),
        ),
      );
  } else {
    // tüm diller için sil
    await db
      .delete(siteSettings)
      .where(eq(siteSettings.key, key));
  }

  return reply.code(204).send();
};
