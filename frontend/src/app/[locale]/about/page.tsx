// ==============================
// src/app/[locale]/about/page.tsx
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

/**
 * Öncelik:
 * 1) seo.pages.about.{title,description}
 * 2) site_settings: ui_about içindeki ui_about_meta_title/ui_about_meta_desc (locale -> en -> default)
 * 3) hard fallback
 */
async function pickAboutSeo(seo: Record<string, any>, locale: string) {
  const fallback = {
    title: "About",
    description: "Learn more about us.",
  };

  const pages = asObj(seo?.pages);
  const aboutSeo = asObj(pages?.about);
  const seoTitle = asStr(aboutSeo?.title);
  const seoDesc = asStr(aboutSeo?.description);

  const tryLocales = Array.from(
    new Set(
      [normalizeLocaleTag(locale), "en", normalizeLocaleTag(DEFAULT_LOCALE)].filter(
        Boolean
      )
    )
  ) as string[];

  let uiTitle: string | null = null;
  let uiDesc: string | null = null;

  for (const l of tryLocales) {
    const row = await fetchSetting("ui_about", l, { revalidate: 600 });
    const json = asObj(row?.value) || {};
    uiTitle = uiTitle || asStr(json.ui_about_meta_title);
    uiDesc = uiDesc || asStr(json.ui_about_meta_desc);
    if (uiTitle && uiDesc) break;
  }

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
    pathname: "/about",
    activeLocales,
  });

  const pseo = await pickAboutSeo(seo, locale);

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

export default async function AboutPage({ params }: PageProps) {
  const { locale: localeParam } = await params;

  const activeLocales = (await fetchActiveLocales()).map(normalizeLocaleTag);
  const locale = resolveLocale(localeParam, activeLocales);

  return <LandingClient locale={locale as any} initialSection="about" />;
}
