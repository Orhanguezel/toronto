// ==============================
// src/app/[locale]/blog/page.tsx
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
 * 1) seo.pages.blog.{title,description}
 * 2) site_settings: ui_blog içindeki ui_blog_meta_title/ui_blog_meta_desc
 *    - locale -> en -> DEFAULT_LOCALE fallback zinciri
 * 3) hard fallback
 */
async function pickBlogSeo(seo: Record<string, any>, locale: string) {
  const fallback = {
    title: "Blog",
    description: "Updates, insights, and articles.",
  };

  // 1) seo.pages.blog
  const pages = asObj(seo?.pages);
  const blogSeo = asObj(pages?.blog);
  const seoTitle = asStr(blogSeo?.title);
  const seoDesc = asStr(blogSeo?.description);

  // 2) ui_blog json (locale fallback zinciri)
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
    const row = await fetchSetting("ui_blog", l, { revalidate: 600 });
    const json = asObj(row?.value) || {};
    uiTitle = uiTitle || asStr(json.ui_blog_meta_title);
    uiDesc = uiDesc || asStr(json.ui_blog_meta_desc);
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
    pathname: "/blog",
    activeLocales,
  });

  const pseo = await pickBlogSeo(seo, locale);

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

export default async function BlogPage({ params }: PageProps) {
  const { locale: localeParam } = await params;

  const activeLocales = (await fetchActiveLocales()).map(normalizeLocaleTag);
  const locale = resolveLocale(localeParam, activeLocales);

  return <LandingClient locale={locale as any} initialSection="blog" />;
}
