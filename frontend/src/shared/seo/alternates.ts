import { SUPPORTED_LOCALES } from "@/lib/i18n/locales";

export type Locale = (typeof SUPPORTED_LOCALES)[number];

function normPath(path: string | undefined) {
  // boşsa kök, başında / olsun; kök dışı path’lerde sonda / olmasın
  let p = (path ?? "/").trim();
  if (!p.startsWith("/")) p = `/${p}`;
  if (p !== "/" && p.endsWith("/")) p = p.slice(0, -1);
  return p;
}

/** hreflang için mutlak URL haritası (tr/en/de) üretir */
export function languagesMap(path?: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const p = normPath(path);
  const trailing = p === "/" ? "/" : ""; // kök için sonda '/' bırak

  const map: Record<Locale, string> = {} as any;
  for (const l of SUPPORTED_LOCALES) {
    map[l as Locale] = `${base}/${l}${p}${trailing}`;
  }
  return map as Readonly<Record<Locale, string>>;
}

/** Canonical URL (mutlak) – seçilen dil için */
export function canonicalFor(locale: Locale, path?: string) {
  return languagesMap(path)[locale];
}
