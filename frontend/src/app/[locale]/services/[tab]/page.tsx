// ==============================
// src/app/[locale]/services/[tab]/page.tsx
// ==============================
import LandingClient from "@/landing/LandingClient";

import {
  normalizeLocaleTag,
  fetchActiveLocales,
  DEFAULT_LOCALE,
} from "@/i18n/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{ locale: string; tab: string }>;
};

function resolveLocale(rawParam: string, activeLocales: string[]) {
  const raw = normalizeLocaleTag(rawParam);
  const active = (activeLocales || []).map(normalizeLocaleTag).filter(Boolean);

  if (raw && active.includes(raw)) return raw;

  const def = normalizeLocaleTag(DEFAULT_LOCALE) || "en";
  if (active.includes(def)) return def;

  return active[0] || raw || def || "en";
}

export default async function ServicesTabPage({ params }: PageProps) {
  const { locale: localeParam, tab } = await params;

  const activeLocales = await fetchActiveLocales();
  const locale = resolveLocale(localeParam, activeLocales);

  // tab: "web" | "design" | "seo" | ...
  return (
    <LandingClient
      locale={locale as any}
      initialSection="services"
      initialHash={tab}
    />
  );
}
