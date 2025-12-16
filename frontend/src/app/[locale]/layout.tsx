// src/app/[locale]/layout.tsx

import type { Metadata } from "next";
import { headers } from "next/headers";

// import Navbar from "@/layout/Navbar";
import NavbarClient from "@/layout/NavbarClient";

import Footer from "@/layout/Footer";
import Toasts from "@/shared/ui/feedback/Toasts";
import JsonLd from "@/shared/seo/JsonLd";
import Speculation from "@/shared/perf/SpeculationRules";

import { SUPPORTED_LOCALES } from "@/lib/i18n/locales";
import { getSiteSettings } from "@/lib/api/public";

import {
  normalizeLocaleTag,
  fetchActiveLocales,
  DEFAULT_LOCALE,
} from "@/i18n/server";
import { fetchSeoObject, buildMetadataFromSeo } from "@/seo/serverMetadata";
import { org, website } from "@/seo/jsonld";
import { canonicalFor } from "@/shared/seo/alternates";

export function generateStaticParams() {
  return (SUPPORTED_LOCALES as readonly string[]).map((l) => ({ locale: l }));
}

function resolveLocale(rawParam: string, activeLocales: string[]) {
  const raw = normalizeLocaleTag(rawParam);
  const active = activeLocales.map(normalizeLocaleTag);

  if (raw && active.includes(raw)) return raw;

  const def = normalizeLocaleTag(DEFAULT_LOCALE) || "en";
  if (active.includes(def)) return def;

  return active[0] || raw || def || "en";
}

type LayoutParams = { locale: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<LayoutParams>;
}): Promise<Metadata> {
  const p = await params; // ✅ params'a dokunmadan önce unwrap
  const activeLocales = await fetchActiveLocales();
  const locale = resolveLocale(p.locale, activeLocales);

  const seo = await fetchSeoObject(locale);

  return buildMetadataFromSeo(seo, {
    locale,
    pathname: "/",
    activeLocales,
  });
}

export default async function LocaleLayout({
  params,
  children,
}: {
  params: Promise<LayoutParams>;
  children: React.ReactNode;
}) {
  const p = await params; // ✅ params'a dokunmadan önce unwrap
  const activeLocales = await fetchActiveLocales();
  const locale = resolveLocale(p.locale, activeLocales);

  const settings = await getSiteSettings(locale);

  const c = (settings as any)?.contact_info ?? {};
  const socials = (settings as any)?.socials ?? {};

  // UA / Save-Data
  const h = await headers(); // senin ortamında Promise dönüyor
  const ua = h.get("user-agent") || "";
  const device: "m" | "d" = /mobile/i.test(ua) ? "m" : "d";
  const saveData = h.get("save-data") === "on";

  const siteUrl =
    (canonicalFor as any)(locale, "/") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const orgName =
    (typeof (settings as any)?.site_name === "string" && (settings as any).site_name) ||
    "Toronto";

  const logo =
    (typeof (settings as any)?.logo === "string" && (settings as any).logo) ||
    undefined;

  const sameAs = Object.values(socials || {}).filter(Boolean) as string[];

  const orgLd = org({
    name: orgName,
    url: siteUrl,
    logo,
    sameAs: sameAs.length ? sameAs : undefined,
  });

  const webLd = website({
    name: orgName,
    url: siteUrl,
  });

  return (
    <>
      <div style={{ position: "relative", zIndex: 1000 }}>
        <NavbarClient
          locale={locale}
          contact={{ phones: c.phones, email: c.email }}
        />
      </div>


      {!saveData && <Speculation device={device} lang={locale as any} />}

      <div style={{ minHeight: "100dvh" }}>{children}</div>

      <Footer
        contact={{ phones: c.phones, email: c.email, address: c.address }}
        socials={socials as any}
      />

      <JsonLd id="org" data={orgLd as any} />
      <JsonLd id="website" data={webLd as any} />

      <Toasts />
    </>
  );
}
