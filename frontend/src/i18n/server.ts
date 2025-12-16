// src/i18n/server.ts
import "server-only";

import { cache } from "react";
import { headers, cookies } from "next/headers";
import {
    DEFAULT_LOCALE as DEFAULT_LOCALE_TYPED,
    LOCALE_SET,
} from "@/i18n/config";

const API = (process.env.API_BASE_URL || "").trim();

/** Server tarafında string default (config DEFAULT_LOCALE zaten SupportedLocale) */
export const DEFAULT_LOCALE = String(DEFAULT_LOCALE_TYPED || "tr");

export type JsonLike =
    | string
    | number
    | boolean
    | null
    | { [k: string]: JsonLike }
    | JsonLike[];

export type SiteSettingResp = {
    key?: string;
    locale?: string;
    value?: JsonLike;
    updated_at?: string;
};

function tryParse(x: unknown): unknown {
    if (typeof x === "string") {
        const s = x.trim();
        if (
            (s.startsWith("{") && s.endsWith("}")) ||
            (s.startsWith("[") && s.endsWith("]"))
        ) {
            try {
                return JSON.parse(s);
            } catch {
                /* ignore */
            }
        }
    }
    return x;
}

export function normalizeLocaleTag(x: unknown): string {
    return String(x || "")
        .toLowerCase()
        .trim()
        .split("-")[0]
        .trim();
}

/** Sadece build-time supported locale’leri bırak */
function filterSupported(locales: string[]): string[] {
    const cleaned = locales
        .map(normalizeLocaleTag)
        .filter(Boolean)
        .filter((l) => LOCALE_SET.has(l));
    return Array.from(new Set(cleaned));
}

export function normalizeLocales(raw: unknown): string[] {
    const v = tryParse(raw);

    const arr: unknown[] = Array.isArray(v)
        ? v
        : v && typeof v === "object" && Array.isArray((v as any).locales)
            ? (v as any).locales
            : [];

    const supported = filterSupported(arr.map((x) => String(x)));

    const def = normalizeLocaleTag(DEFAULT_LOCALE) || "tr";
    return supported.length ? supported : [def];
}

export async function fetchSetting(
    key: string,
    locale?: string,
    opts?: { revalidate?: number }
): Promise<SiteSettingResp | null> {
    if (!API) return null;

    try {
        const url = new URL(`${API.replace(/\/+$/, "")}/site_settings/${encodeURIComponent(key)}`);

        const l = normalizeLocaleTag(locale);
        if (l) url.searchParams.set("locale", l);

        const res = await fetch(url.toString(), {
            next: { revalidate: opts?.revalidate ?? 600 },
        });

        if (!res.ok) return null;

        const data = (await res.json()) as SiteSettingResp;
        if (!data || typeof data !== "object") return null;

        const value = tryParse((data as any).value) as JsonLike;
        return { ...data, value };
    } catch {
        return null;
    }
}

export async function fetchActiveLocales(): Promise<string[]> {
    const def = normalizeLocaleTag(DEFAULT_LOCALE) || "tr";

    if (!API) return [def];

    const row = await fetchSetting("app_locales", undefined, { revalidate: 600 });
    const locales = normalizeLocales(row?.value);

    // normalizeLocales zaten supported + fallback yapıyor
    return locales.length ? locales : [def];
}

export function pickFromAcceptLanguage(accept: string | null, active: string[]): string {
    const def = normalizeLocaleTag(DEFAULT_LOCALE) || "tr";
    const activeClean = filterSupported(active.length ? active : [def]);

    const a = (accept || "").toLowerCase();
    if (!a) return activeClean[0] || def;

    const prefs = a
        .split(",")
        .map((part) => part.trim().split(";")[0]?.trim())
        .filter(Boolean)
        .map((tag) => normalizeLocaleTag(tag))
        .filter(Boolean);

    for (const p of prefs) {
        if (activeClean.includes(p)) return p;
    }

    return activeClean.includes(def) ? def : (activeClean[0] || def);
}

export function pickFromCookie(cookieLocale: string | undefined, active: string[]): string | null {
    const c = normalizeLocaleTag(cookieLocale);
    if (!c) return null;

    const activeClean = filterSupported(active);
    return activeClean.includes(c) ? c : null;
}

/**
 * ✅ Tek noktadan request i18n context:
 * - activeLocales (app_locales)
 * - detectedLocale (cookie > accept-language)
 *
 * ✅ cache() => aynı request içinde (layout + generateMetadata) tekrar fetch yok.
 */
export const getServerI18nContext = cache(async () => {
    const h = await headers();
    const c = await cookies();

    const activeLocales = await fetchActiveLocales();

    const cookieLocale = c.get("NEXT_LOCALE")?.value;
    const fromCookie = pickFromCookie(cookieLocale, activeLocales);

    const detectedLocale =
        fromCookie ?? pickFromAcceptLanguage(h.get("accept-language"), activeLocales);

    return { activeLocales, detectedLocale };
});
