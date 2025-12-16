// src/i18n/config.ts
import { SUPPORTED_LOCALES, type SupportedLocale } from "@/types/common";

/**
 * STATIC LOCALES:
 * - Bunlar build-time'da bilinen "mümkün" locale'ler.
 * - Hangi dillerin aktif olduğu ise runtime'da site_settings.app_locales üzerinden belirleniyor.
 */
export const LOCALES = SUPPORTED_LOCALES;
export const LOCALE_SET = new Set(LOCALES as readonly string[]);

/**
 * DEFAULT_LOCALE:
 * - Env'den (NEXT_PUBLIC_DEFAULT_LOCALE) alınan candidate'i normalize eder.
 * - Bu değer:
 *    * _document.tsx içinde <html lang="..."> için kullanılıyor
 *    * normalizeLocale için fallback görevi görüyor
 * - Aktif dillerin listesi değil; sadece "default" bayrak.
 */
export const DEFAULT_LOCALE: SupportedLocale = (() => {
  const cand = String(process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "")
    .split("-")[0]
    .toLowerCase();
  return (LOCALE_SET.has(cand) ? cand : "tr") as SupportedLocale;
})();

export const KNOWN_RTL = new Set([
  "ar", "fa", "he", "ur", "ckb", "ps", "sd", "ug", "yi", "dv",
]);

export const isSupportedLocale = (x?: string | null): x is SupportedLocale =>
  !!x && LOCALE_SET.has(String(x).toLowerCase());

export const normalizeLocale = (x?: string | null): SupportedLocale =>
  (isSupportedLocale(x)
    ? (String(x).toLowerCase() as SupportedLocale)
    : DEFAULT_LOCALE);
