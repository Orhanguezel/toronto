export const SUPPORTED_LOCALES = (process.env.SUPPORTED_LOCALES || "tr,en,de").split(",");
export const DEFAULT_LOCALE = process.env.DEFAULT_LOCALE || "tr";
export const isSupportedLocale = (l: string) => SUPPORTED_LOCALES.includes(l);