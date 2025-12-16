// src/i18n/locale-helpers.ts
export { DEFAULT_LOCALE, isSupportedLocale, KNOWN_RTL } from "./config";

export const SITE_NAME = (process.env.NEXT_PUBLIC_SITE_NAME || "ensotek.de").trim();
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

export const isRTL = (l: string) => new Set(["ar","fa","he","ur","ckb","ps","sd","ug","yi","dv"]).has(l);

/** <link rel="alternate" hreflang="..."> map’i */
export function languageAlternates(defaultLocale: string) {
  const map: Record<string, string> = {};
  // Burada common.ts’ten alanlar doğrudan kullanılmıyor; SEO tarafında gerekmiyorsa silebilirsin.
  map["x-default"] = `/${defaultLocale}/`;
  return map;
}
