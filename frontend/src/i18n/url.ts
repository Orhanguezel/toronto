// src/i18n/url.ts
import { LOCALES, LOCALE_SET } from "./config";
import type { SupportedLocale } from "@/types/common";

// Başta tek bir locale varsa sök
const leadingLocaleRe = new RegExp(`^\\/(${LOCALES.join("|")})(?=\\/|$)`, "i");

export function stripLeadingLocale(pathname: string): string {
  return pathname.replace(leadingLocaleRe, "") || "/";
}

// Yan yana iki locale varsa ilkini at ("/tr/en/..." -> "/en/...")
export function collapseDoubleLocale(pathname: string): string {
  const parts = pathname.replace(/^\/+/, "").split("/");
  if (parts.length >= 2 && LOCALE_SET.has(parts[0]!) && LOCALE_SET.has(parts[1]!)) {
    parts.shift();
    return "/" + parts.join("/");
  }
  return pathname || "/";
}

// Hedef dile göre absolute path üret (query/hash korunur)
export function localizePath(target: SupportedLocale, asPath: string) {
  const [pathOnly, rest = ""] = asPath.split("?");
  const [pathname, hash = ""] = pathOnly.split("#");
  const base = stripLeadingLocale(collapseDoubleLocale(pathname || "/"));
  const query = rest ? `?${rest}` : "";
  const h = hash ? `#${hash}` : "";
  return `/${target}${base}${query}${h}`;
}
