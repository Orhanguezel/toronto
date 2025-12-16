// src/i18n/routing.ts
import Link from "next/link";
import { useRouter } from "next/router";
import { LOCALES, DEFAULT_LOCALE } from "./config";
import type { NextRouter } from "next/router";
import type { SupportedLocale } from "@/types/common";

export const locales = LOCALES;

const isLocale = (x?: string): x is SupportedLocale =>
  !!x && (LOCALES as readonly string[]).includes(x);

export const defaultLocale: SupportedLocale = DEFAULT_LOCALE;

/** SEO-dostu path sabitleri */
export const pathnames = {
  "/": "/",
  "/about": "/about",
  "/contact": "/contact",

  "/library": "/library",
  "/library/[slug]": "/library/[slug]",

  "/references": "/references",
  "/references/[slug]": "/references/[slug]",

  "/products": "/products",
  "/products/[slug]": "/products/[slug]",

  "/spare-parts": "/spare-parts",
  "/spare-parts/[slug]": "/spare-parts/[slug]",

  "/news": "/news",
  "/news/[slug]": "/news/[slug]",

  "/search": "/search",
} as const;

/** /{locale}/... kalıbı üretir; slug varsa doldurur */
export function localePath(
  pathname: keyof typeof pathnames | string,
  locale?: SupportedLocale,
  params?: Record<string, string | number>
) {
  const p = typeof pathname === "string" ? pathname : pathnames[pathname];
  const l = isLocale(locale) ? locale : defaultLocale;

  let filled = p;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      filled = filled.replace(`[${k}]`, String(v));
    }
  }
  return filled === "/" ? `/${l}` : `/${l}${filled}`;
}

/** Next.js Link'i aynı isimle dışa verelim */
export { Link };

/** Kendi custom hook'un: hook içinde hook kullanımı OK */
export function usePathname() {
  const r = useRouter();
  return r.asPath;
}

/**
 * Hook OLMAYAN, SSR-safe yardımcı: hook çağırmaz.
 * (İstersen tamamen kaldırabilirsin; lint kuralını ihlal ETMİYOR.)
 */
export function getPathnameFrom(router?: Pick<NextRouter, "asPath">) {
  if (router?.asPath) return router.asPath;
  if (typeof window !== "undefined") {
    const { pathname, search, hash } = window.location;
    return `${pathname}${search}${hash}`;
  }
  return "/";
}

/** Basit redirect helper (client tarafı) */
export function redirect(href: string) {
  if (typeof window !== "undefined") window.location.assign(href);
}
