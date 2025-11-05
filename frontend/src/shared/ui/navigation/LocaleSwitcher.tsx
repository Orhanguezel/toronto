"use client";

import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";
import { SUPPORTED_LOCALES } from "@/lib/i18n/locales";

export default function LocaleSwitcher() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const parts = pathname.split("/");
  const current = parts[1] || "en";

  const switchTo = (l: string) => {
    const rest = parts.slice(2).filter(Boolean).join("/");
    const href = (rest ? `/${l}/${rest}` : `/${l}`) as Route;
    document.cookie = `NEXT_LOCALE=${l}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.push(href);
  };

  return (
    <select
      value={current}
      onChange={(e) => switchTo((e.target as HTMLSelectElement).value)}
      aria-label="Dil seçici"
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
      {SUPPORTED_LOCALES.map((l) => (
        <option key={l} value={l}>
          {l.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
