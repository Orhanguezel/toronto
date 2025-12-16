// src/seo/serverMetadata.ts
import "server-only";

import type { Metadata } from "next";
import {
    fetchSetting,
    fetchActiveLocales, // varsa kullan; yoksa alttaki fallback’li versiyonu uygula
    DEFAULT_LOCALE,
    type JsonLike,
} from "@/i18n/server";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function asStr(x: any): string | null {
    return typeof x === "string" && x.trim() ? x.trim() : null;
}
function asBool(x: any): boolean | null {
    return typeof x === "boolean" ? x : null;
}
function asObj(x: any): Record<string, any> | null {
    return x && typeof x === "object" && !Array.isArray(x)
        ? (x as Record<string, any>)
        : null;
}
function asStrArr(x: any): string[] {
    if (!x) return [];
    if (Array.isArray(x)) return x.map((v) => String(v)).filter(Boolean);
    const s = asStr(x);
    return s ? [s] : [];
}

/** OpenGraph locale formatına map (ihtiyaca göre genişlet) */
function toOgLocale(l: string): string {
    const short = String(l || "").toLowerCase().split("-")[0];
    if (short === "tr") return "tr_TR";
    if (short === "de") return "de_DE";
    return "en_US";
}

/** URL birleştirme: base + path (path "/tr/..." gibi) */
function absUrl(pathOrUrl: string): string {
    const v = String(pathOrUrl || "").trim();
    if (!v) return BASE_URL;
    if (/^https?:\/\//i.test(v)) return v;
    const base = BASE_URL.replace(/\/+$/, "");
    const p = v.startsWith("/") ? v : `/${v}`;
    return `${base}${p}`;
}

/** /tr/... gibi absolute path üretimi */
function localizedPath(locale: string, pathname: string): string {
    const p = (pathname || "/").startsWith("/") ? pathname : `/${pathname}`;
    return `/${locale}${p === "/" ? "" : p}`;
}

async function fetchSeoRowWithFallback(locale: string) {
    const loc = String(locale || "").toLowerCase().split("-")[0] || DEFAULT_LOCALE;

    // Öncelik: seo -> site_seo
    const tryKeys = ["seo", "site_seo"] as const;
    const tryLocales = Array.from(
        new Set([loc, DEFAULT_LOCALE, "en"].filter(Boolean))
    );

    for (const l of tryLocales) {
        for (const k of tryKeys) {
            const row = await fetchSetting(k, l, { revalidate: 600 });
            if (row?.value != null) return row;
        }
    }
    return null;
}

/**
 * SEO value beklenen örnek:
 * {
 *  title_default, title_template, description, site_name,
 *  open_graph: { type, image, images?, ... },
 *  twitter: { card },
 *  robots: { index, follow, noindex? }
 * }
 */
export async function fetchSeoObject(locale: string): Promise<Record<string, any>> {
    const row = await fetchSeoRowWithFallback(locale);
    const v = row?.value as JsonLike;
    const obj = asObj(v);
    return obj ?? {};
}

type BuildMetadataArgs = {
    locale: string;
    /** canonical/alternates üretmek için sayfanın locale-prefixsiz path’i. örn: "/" veya "/blog" */
    pathname?: string;
    /** aktif diller (app_locales). verilmezse server’dan çekmeye çalışır. */
    activeLocales?: string[];
};

export async function buildMetadataFromSeo(
    seo: Record<string, any>,
    args: BuildMetadataArgs
): Promise<Metadata> {
    const locale = String(args.locale || "").toLowerCase().split("-")[0] || DEFAULT_LOCALE;

    const active =
        (args.activeLocales && args.activeLocales.length
            ? args.activeLocales
            : await (typeof fetchActiveLocales === "function"
                ? fetchActiveLocales()
                : Promise.resolve([DEFAULT_LOCALE]))
        ).map((x) => String(x).toLowerCase().split("-")[0]);

    const titleDefault = asStr(seo.title_default) || "Toronto";
    const titleTemplate = asStr(seo.title_template) || "%s | Toronto";
    const description = asStr(seo.description) || "Toronto portfolio site";
    const siteName = asStr(seo.site_name) || "Toronto";

    const og = asObj(seo.open_graph) || {};
    const ogType = asStr(og.type) || "website";

    // image / images desteği: string | string[]
    const ogImages = [
        ...asStrArr(og.image),
        ...asStrArr(og.images),
    ]
        .map(absUrl)
        .filter(Boolean);

    const tw = asObj(seo.twitter) || {};
    const twitterCard = asStr(tw.card) || "summary_large_image";

    const rb = asObj(seo.robots) || {};
    const robotsIndex = asBool(rb.index) ?? true;
    const robotsFollow = asBool(rb.follow) ?? true;
    const robotsNoindex = asBool(rb.noindex) ?? false;

    // Canonical + hreflang alternates
    const pathname = args.pathname ?? "/"; // locale-prefixsiz
    const canonical = absUrl(localizedPath(locale, pathname));

    const languages: Record<string, string> = {};
    for (const l of active) {
        languages[l] = absUrl(localizedPath(l, pathname));
    }

    const ogLocale = toOgLocale(locale);
    const ogAltLocales = active
        .filter((l) => l !== locale)
        .map((l) => toOgLocale(l));

    return {
        metadataBase: new URL(BASE_URL),

        title: { default: titleDefault, template: titleTemplate },
        description,

        alternates: {
            canonical,
            languages,
        },

        openGraph: {
            type: ogType as any,
            siteName,
            locale: ogLocale,
            ...(ogAltLocales.length ? { alternateLocale: ogAltLocales } : {}),
            ...(ogImages.length ? { images: ogImages.map((url) => ({ url })) } : {}),
        },

        twitter: {
            card: twitterCard as any,
            ...(ogImages[0] ? { images: [ogImages[0]] } : {}),
        },

        robots: robotsNoindex
            ? { index: false, follow: false }
            : { index: robotsIndex, follow: robotsFollow },
    };
}
