// ==============================
// src/app/[locale]/portfolio/page.tsx
// ==============================
import type { Metadata } from "next";
import LandingClient from "@/landing/LandingClient";

import {
  normalizeLocaleTag,
  fetchActiveLocales,
  fetchSetting,
  DEFAULT_LOCALE,
} from "@/i18n/server";
import { fetchSeoObject, buildMetadataFromSeo } from "@/seo/serverMetadata";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{ locale: string }>;
};

function asObj(x: any): Record<string, any> | null {
  return x && typeof x === "object" && !Array.isArray(x) ? x : null;
}
function asStr(x: any): string | null {
  return typeof x === "string" && x.trim() ? x.trim() : null;
}

function resolveLocale(rawParam: string, active: string[]) {
  const raw = normalizeLocaleTag(rawParam);
  if (raw && active.includes(raw)) return raw;

  const def = normalizeLocaleTag(DEFAULT_LOCALE) || "en";
  if (active.includes(def)) return def;

  return active[0] || raw || def || "en";
}

async function pickPortfolioSeo(seo: Record<string, any>, locale: string) {
  const fallback = {
    title: "Portfolio",
    description: "Selected work and case studies.",
  };

  // 1) seo.pages.portfolio
  const pages = asObj(seo?.pages);
  const pSeo = asObj(pages?.portfolio);
  const seoTitle = asStr(pSeo?.title);
  const seoDesc = asStr(pSeo?.description);

  // 2) site_settings: ui_portfolio
  const uiRow = await fetchSetting("ui_portfolio", locale, { revalidate: 600 });
  const uiJson = asObj(uiRow?.value) || {};

  const uiTitle = asStr(uiJson.ui_portfolio_meta_title);
  const uiDesc = asStr(uiJson.ui_portfolio_meta_desc);

  return {
    title: seoTitle || uiTitle || fallback.title,
    description: seoDesc || uiDesc || fallback.description,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;

  const activeLocales = (await fetchActiveLocales()).map(normalizeLocaleTag);
  const locale = resolveLocale(localeParam, activeLocales);

  const seo = await fetchSeoObject(locale);

  const base = await buildMetadataFromSeo(seo, {
    locale,
    pathname: "/portfolio",
    activeLocales,
  });

  const pseo = await pickPortfolioSeo(seo, locale);

  return {
    ...base,
    title: pseo.title,
    description: pseo.description,
    openGraph: {
      ...(base.openGraph || {}),
      title: pseo.title,
      description: pseo.description,
    },
    twitter: {
      ...(base.twitter || {}),
      title: pseo.title,
      description: pseo.description,
    } as any,
  };
}

export default async function PortfolioPage({ params }: PageProps) {
  const { locale: localeParam } = await params;

  const activeLocales = (await fetchActiveLocales()).map(normalizeLocaleTag);
  const locale = resolveLocale(localeParam, activeLocales);

  return <LandingClient locale={locale as any} initialSection="portfolio" />;
}
