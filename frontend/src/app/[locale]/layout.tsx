import type { Metadata } from "next";
import { headers } from "next/headers";
import Navbar from "@/layout/Navbar";
import Footer from "@/layout/Footer";
import { SUPPORTED_LOCALES } from "@/lib/i18n/locales";
import Toasts from "@/shared/ui/feedback/Toasts";
import JsonLd from "@/shared/seo/JsonLd";
import { getSiteSettings } from "@/lib/api/public";
import Speculation from "@/shared/perf/SpeculationRules";

export function generateStaticParams() {
  // Tip: Next validator için burada 'string' yeterli, build zamanı zaten sabitler.
  return SUPPORTED_LOCALES.map((l: string) => ({ locale: l }));
}

export const metadata: Metadata = {
  title: { default: "Toronto", template: "%s | Toronto" },
  description: "Toronto portfolio site",
};

// ✅ Dış imzada GENİŞ tut: string
export default async function LocaleLayout({
  params,
  children,
}: {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}) {
  const { locale: raw } = await params;

  // İçeride daralt
  const isSupported = (v: unknown): v is "tr" | "en" | "de" =>
    typeof v === "string" && (SUPPORTED_LOCALES as readonly string[]).includes(v);
  const locale: "tr" | "en" | "de" = isSupported(raw) ? raw : "en";

  const settings = await getSiteSettings(locale);
  const c = settings?.contact_info ?? {};
  const socials = settings?.socials ?? {};

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Toronto",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    logo: (settings as any)?.logo || undefined,
    contactPoint: c.phones?.[0]
      ? [{ "@type": "ContactPoint", telephone: c.phones[0], contactType: "customer support" }]
      : undefined,
    sameAs: Object.values(socials).filter(Boolean),
  };

  const h = await headers(); // senin ortamında Promise => await doğru
  const ua = h.get("user-agent") || "";
  const device: "m" | "d" = /mobile/i.test(ua) ? "m" : "d";
  const saveData = h.get("save-data") === "on";

  return (
    <>
      <div style={{ position: "relative", zIndex: 1000 }}>
        <Navbar locale={locale} />
      </div>

      {!saveData && <Speculation device={device} lang={locale} />}

      <div style={{ minHeight: "100dvh" }}>{children}</div>

      <Footer
        contact={{ phones: c.phones, email: c.email, address: c.address }}
        socials={socials as any}
      />

      <JsonLd data={orgLd} />
      <Toasts />
    </>
  );
}
