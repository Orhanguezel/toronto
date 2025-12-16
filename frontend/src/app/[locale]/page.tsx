// src/app/[locale]/page.tsx
import type { Metadata } from "next";
import LandingClient from "@/landing/LandingClient";

import { normalizeLocaleTag, fetchActiveLocales, DEFAULT_LOCALE } from "@/i18n/server";
import { fetchSeoObject, buildMetadataFromSeo } from "@/seo/serverMetadata";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  // ✅ Next 16: params Promise olabilir
  params: Promise<{ locale: string }>;
};

function resolveLocale(rawParam: string, activeLocales: string[]) {
  const raw = normalizeLocaleTag(rawParam);
  const active = activeLocales.map(normalizeLocaleTag);

  if (raw && active.includes(raw)) return raw;

  const def = normalizeLocaleTag(DEFAULT_LOCALE) || "en";
  if (active.includes(def)) return def;

  return active[0] || raw || def || "en";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const p = await params; // ✅ unwrap
  const activeLocales = await fetchActiveLocales();

  const locale = resolveLocale(p.locale, activeLocales);

  const seo = await fetchSeoObject(locale);

  // Home page => pathname "/" (locale-prefixsiz)
  return buildMetadataFromSeo(seo, {
    locale,
    pathname: "/",
    activeLocales,
  });
}

export default async function HomePage({ params }: PageProps) {
  const p = await params; // ✅ unwrap
  const activeLocales = await fetchActiveLocales();

  const locale = resolveLocale(p.locale, activeLocales);

  return <LandingClient locale={locale as any} initialSection="" />;
}
