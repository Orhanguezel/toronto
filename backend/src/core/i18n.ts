// src/core/i18n.ts

import { db } from "@/db/client";
import { siteSettings } from "@/modules/siteSettings/schema";
import { eq } from "drizzle-orm";

// ---------------------------------------------------------------------------
// NOT:
// - LOCALES artık string[] (union değil) → Locale = string
// - Liste başlangıçta ENV'den gelir; runtime'da siteSettings ile override edilir
// - SiteSettings key'i: "app_locales"  (ör: ["tr","en","de"])
// ---------------------------------------------------------------------------

export const APP_LOCALES_SETTING_KEY = "app_locales";

/** "tr-TR" → "tr" normalize */
export function normalizeLocale(input?: string | null): string | undefined {
  if (!input) return undefined;
  const s = String(input).trim().toLowerCase().replace("_", "-");
  if (!s) return undefined;
  const base = s.split("-")[0];
  return base;
}

// Başlangıç locale listesi: ENV'den ya da varsayılan "tr,en"
const initialLocaleCodes = (process.env.APP_LOCALES || "tr,en")
  .split(",")
  .map((s) => normalizeLocale(s) || "")
  .filter(Boolean);

// Tekilleştir
const uniqueInitial: string[] = [];
for (const l of initialLocaleCodes) {
  if (!uniqueInitial.includes(l)) uniqueInitial.push(l);
}

// Runtime'da mutasyona açık dizi
export const LOCALES: string[] = uniqueInitial.length ? uniqueInitial : ["tr"];

// Artık Locale = string (union değil)
export type Locale = (typeof LOCALES)[number];

// Default locale: ENV’de varsa onu, yoksa ilk locale, o da yoksa "tr"
// (NOT: runtime'da LOCALES değişse bile DEFAULT_LOCALE sabit kalır)
export const DEFAULT_LOCALE: Locale =
  normalizeLocale(process.env.DEFAULT_LOCALE) ||
  LOCALES[0] ||
  "tr";

export function isSupported(l?: string | null): l is Locale {
  if (!l) return false;
  const n = normalizeLocale(l);
  if (!n) return false;
  return LOCALES.includes(n);
}

function parseAcceptLanguage(header?: string | null): string[] {
  if (!header) return [];
  const items = String(header)
    .split(",")
    .map((part) => {
      const [tag, ...rest] = part.trim().split(";");
      const qMatch = rest.find((p) => p.trim().startsWith("q="));
      const q = qMatch ? Number(qMatch.split("=")[1]) : 1;
      return { tag: tag.toLowerCase(), q: Number.isFinite(q) ? q : 1 };
    })
    .filter((x) => x.tag)
    .sort((a, b) => b.q - a.q)
    .map((x) => x.tag);
  return items;
}

export function bestFromAcceptLanguage(
  header?: string | null,
): Locale | undefined {
  const candidates = parseAcceptLanguage(header);
  for (const cand of candidates) {
    const base = normalizeLocale(cand);
    if (base && isSupported(base)) return base as Locale;
  }
  return undefined;
}

export function resolveLocaleFromHeaders(
  headers: Record<string, unknown>,
): { locale: Locale; selectedBy: "x-locale" | "accept-language" | "default" } {
  const rawXL = (headers["x-locale"] ??
    (headers as any)["X-Locale"] ??
    (headers as any)["x_locale"]) as string | undefined;

  const xlNorm = normalizeLocale(rawXL);
  if (xlNorm && isSupported(xlNorm)) {
    return { locale: xlNorm as Locale, selectedBy: "x-locale" };
  }

  const al = bestFromAcceptLanguage(
    (headers["accept-language"] ??
      (headers as any)["Accept-Language"]) as string | undefined,
  );
  if (al && isSupported(al)) {
    return { locale: al as Locale, selectedBy: "accept-language" };
  }

  return { locale: DEFAULT_LOCALE, selectedBy: "default" };
}

// 👇 Tip güvenli ve sade fallback zinciri
export function fallbackChain(primary: Locale): Locale[] {
  const seen = new Set<Locale>();
  const order: Locale[] = [primary, DEFAULT_LOCALE, ...LOCALES];
  const uniq: Locale[] = [];

  for (const l of order) {
    const n = normalizeLocale(l) || l;
    if (!seen.has(n)) {
      seen.add(n as Locale);
      uniq.push(n as Locale);
    }
  }
  return uniq;
}

/**
 * LOCALES dizisini runtime'da siteSettings / ENV vs.
 * üzerinden gelen değerlerle güncellemek için helper.
 *
 * Örn:
 *   setLocalesFromSettings(['tr', 'en', 'de'])
 */
export function setLocalesFromSettings(localeCodes: string[]) {
  const next: string[] = [];
  for (const code of localeCodes) {
    const n = normalizeLocale(code);
    if (!n) continue;
    if (!next.includes(n)) next.push(n);
  }
  if (!next.length) return;

  // LOCALES dizisini yerinde mutate et (referanslar bozulmasın)
  LOCALES.splice(0, LOCALES.length, ...next);
}

/* ------------------------------------------------------------------
 * SiteSettings'ten LOCALES yükleme
 * ------------------------------------------------------------------ */

let lastLocalesLoadedAt = 0;
const LOCALES_REFRESH_MS = 60_000; // 60sn cache

/** site_settings.key = "app_locales" kaydını okuyup LOCALES'i günceller */
export async function loadLocalesFromSiteSettings() {
  try {
    const rows = await db
      .select({ value: siteSettings.value })
      .from(siteSettings)
      .where(eq(siteSettings.key, APP_LOCALES_SETTING_KEY))
      .limit(1);

    if (!rows.length) return;

    const raw = rows[0].value;
    let parsed: unknown = raw;

    try {
      parsed = JSON.parse(raw);
    } catch {
      // plain string ise olduğu gibi bırak
    }

    if (Array.isArray(parsed)) {
      const codes = parsed
        .map((v) => (typeof v === "string" ? v : String(v)))
        .filter(Boolean);
      if (codes.length) {
        setLocalesFromSettings(codes);
      }
    }
  } catch (err) {
    // Burada Fastify log'u yok; en azından console'a yaz
    console.error("loadLocalesFromSiteSettings failed:", err);
  } finally {
    lastLocalesLoadedAt = Date.now();
  }
}

/**
 * Middleware / bootstrap vs. tarafında çağrılacak helper:
 * - İlk istekte ve her LOCALES_REFRESH_MS sürede bir siteSettings'i yoklar
 * - Böylece admin panelden app_locales değişince backend’in LOCALES’i de güncellenir
 */
export async function ensureLocalesLoadedFromSettings() {
  const now = Date.now();
  if (now - lastLocalesLoadedAt < LOCALES_REFRESH_MS) return;
  await loadLocalesFromSiteSettings();
}

declare module "fastify" {
  interface FastifyRequest {
    locale: Locale;
    localeFallbacks: Locale[];
  }
}
