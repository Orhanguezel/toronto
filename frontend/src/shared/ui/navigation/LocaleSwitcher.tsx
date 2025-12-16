"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";

import { useResolvedLocale } from "@/i18n/locale";
import { localizePath } from "@/i18n/url";
import { useActiveLocales } from "@/i18n/activeLocales";
import { toRoute } from "@/shared/routing/toRoute";

export default function LocaleSwitcher() {
  const pathname = usePathname() || "/";
  const sp = useSearchParams();
  const router = useRouter();

  // aktif diller (DB → site_settings.app_locales)
  const { locales, isLoading } = useActiveLocales();

  // current locale (params.locale + normalize)
  const current = useResolvedLocale(null);

  const switchTo = (l: string) => {
    // query + hash koru
    const qs = sp?.toString();
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const asPath = `${pathname}${qs ? `?${qs}` : ""}${hash || ""}`;

    // /<targetLocale> + rest
    const hrefStr = localizePath(l as any, asPath);

    // cookie (1 yıl)
    document.cookie = `NEXT_LOCALE=${encodeURIComponent(l)}; path=/; max-age=${60 * 60 * 24 * 365}`;

    // typed routes güvenli
    router.push(toRoute(hrefStr, ("/" as Route)));
  };

  return (
    <select
      value={current}
      onChange={(e) => switchTo((e.target as HTMLSelectElement).value)}
      aria-label="Language selector"
      disabled={isLoading || !locales?.length}
      style={{
        appearance: "none",
        background: "var(--input-bg)",
        color: "var(--input-text)",
        border: "1px solid var(--input-border)",
        borderRadius: "var(--radius-md)",
        padding: "8px 12px",
        outlineOffset: 2,
      }}
    >
      {locales.map((l) => (
        <option key={l} value={l}>
          {String(l).toUpperCase()}
        </option>
      ))}
    </select>
  );
}
