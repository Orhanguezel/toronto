// src/app/[locale]/contact/page.tsx
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
  // ✅ Next 16: params Promise olabilir
  params: Promise<{ locale: string }>;
};

function asObj(x: any): Record<string, any> | null {
  return x && typeof x === "object" && !Array.isArray(x) ? x : null;
}
function asStr(x: any): string | null {
  return typeof x === "string" && x.trim() ? x.trim() : null;
}

/** 30+ dil için sabit EN fallback (locale if/else yok) */
function fallbackContactSeo() {
  return {
    title: "Contact",
    description:
      "Fill out the form and we will get back to you as soon as possible.",
  };
}

function resolveLocale(rawParam: string, activeLocales: string[]) {
  const raw = normalizeLocaleTag(rawParam);
  if (raw && activeLocales.includes(raw)) return raw;

  const def = normalizeLocaleTag(DEFAULT_LOCALE) || "en";
  if (activeLocales.includes(def)) return def;

  return activeLocales[0] || raw || def || "en";
}

/**
 * Öncelik:
 * 1) seo.pages.contact.{title,description}
 * 2) ui_contact JSON: ui_contact_meta_title/ui_contact_meta_desc (fallback zinciri)
 * 3) hard fallback
 */
async function pickContactSeoFromSettings(seo: Record<string, any>, locale: string) {
  const fb = fallbackContactSeo();

  // 1) seo.pages.contact override
  const pages = asObj(seo?.pages);
  const contactSeo = asObj(pages?.contact);
  const seoTitle = asStr(contactSeo?.title);
  const seoDesc = asStr(contactSeo?.description);

  // 2) ui_contact section json (locale fallback zinciri)
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
    const uiRow = await fetchSetting("ui_contact", l, { revalidate: 600 });
    const uiJson = asObj(uiRow?.value) || {};

    uiTitle = uiTitle || asStr(uiJson.ui_contact_meta_title);
    uiDesc = uiDesc || asStr(uiJson.ui_contact_meta_desc);

    if (uiTitle && uiDesc) break;
  }

  return {
    title: seoTitle || uiTitle || fb.title,
    description: seoDesc || uiDesc || fb.description,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;

  const activeLocales = (await fetchActiveLocales()).map(normalizeLocaleTag);
  const locale = resolveLocale(localeParam, activeLocales);

  const seo = await fetchSeoObject(locale);

  const base = await buildMetadataFromSeo(seo, {
    locale,
    pathname: "/contact",
    activeLocales,
  });

  const cseo = await pickContactSeoFromSettings(seo, locale);

  return {
    ...base,
    title: cseo.title,
    description: cseo.description,
    openGraph: {
      ...(base.openGraph || {}),
      title: cseo.title,
      description: cseo.description,
    },
    twitter: {
      ...(base.twitter || {}),
      title: cseo.title,
      description: cseo.description,
    } as any,
  };
}

export default async function ContactPage({ params }: PageProps) {
  const { locale: localeParam } = await params;

  const activeLocales = (await fetchActiveLocales()).map(normalizeLocaleTag);
  const locale = resolveLocale(localeParam, activeLocales);

  return <LandingClient locale={locale as any} initialSection="contact" />;
}
