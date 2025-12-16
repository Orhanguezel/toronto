// ==============================
// src/app/[locale]/services/page.tsx
// ==============================
import type { Metadata } from "next";
import LandingClient from "@/landing/LandingClient";

import {
  normalizeLocaleTag,
  fetchActiveLocales,
  DEFAULT_LOCALE,
} from "@/i18n/server";
import { fetchSeoObject, buildMetadataFromSeo } from "@/seo/serverMetadata";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{ locale: string }>;
};

function resolveLocale(rawParam: string, activeLocales: string[]) {
  const raw = normalizeLocaleTag(rawParam);
  const active = (activeLocales || []).map(normalizeLocaleTag).filter(Boolean);

  if (raw && active.includes(raw)) return raw;

  const def = normalizeLocaleTag(DEFAULT_LOCALE) || "en";
  if (active.includes(def)) return def;

  return active[0] || raw || def || "en";
}

function pickServicesSeo(seo: Record<string, any>, locale: string) {
  // opsiyonel: seo.pages.services.{title,description}
  const pages = seo?.pages && typeof seo.pages === "object" ? seo.pages : null;
  const svc = pages?.services && typeof (pages as any).services === "object" ? (pages as any).services : null;

  const title =
    (typeof svc?.title === "string" && svc.title.trim()) ||
    (locale === "tr" ? "Hizmetlerimiz" : locale === "de" ? "Leistungen" : "Services");

  const description =
    (typeof svc?.description === "string" && svc.description.trim()) ||
    (locale === "tr"
      ? "Toronto – web geliştirme, tasarım ve SEO/perf hizmetleri"
      : locale === "de"
        ? "Toronto – Webentwicklung, Design und SEO/Performance-Services"
        : "Toronto – web development, design and SEO/performance services");

  return { title, description };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;

  const activeLocales = await fetchActiveLocales();
  const locale = resolveLocale(localeParam, activeLocales);

  const seo = await fetchSeoObject(locale);

  const base = await buildMetadataFromSeo(seo, {
    locale,
    pathname: "/services",
    activeLocales,
  });

  const pageSeo = pickServicesSeo(seo, locale);

  return {
    ...base,
    title: pageSeo.title,
    description: pageSeo.description,
    openGraph: {
      ...(base.openGraph || {}),
      title: pageSeo.title,
      description: pageSeo.description,
    },
    twitter: {
      ...(base.twitter || {}),
      title: pageSeo.title,
      description: pageSeo.description,
    } as any,
  };
}

export default async function ServicesPage({ params }: PageProps) {
  const { locale: localeParam } = await params;

  const activeLocales = await fetchActiveLocales();
  const locale = resolveLocale(localeParam, activeLocales);

  return <LandingClient locale={locale as any} initialSection="services" />;
}
