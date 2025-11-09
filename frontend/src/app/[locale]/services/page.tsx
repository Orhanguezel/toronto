// src/app/[locale]/services/page.tsx
import type { Metadata } from "next";
import LandingClient from "@/landing/LandingClient";
import { canonicalFor, languagesMap } from "@/shared/seo/alternates";

export const revalidate = 600;

export async function generateMetadata({ params }: { params: Promise<{ locale: "tr"|"en"|"de" }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Hizmetlerimiz",
    description: "Toronto – web geliştirme, tasarım ve SEO/perf hizmetleri",
    alternates: { canonical: canonicalFor(locale, "/services"), languages: languagesMap("/services") },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: "tr"|"en"|"de" }> }) {
  const { locale } = await params;
  return <LandingClient locale={locale} initialSection="services" />;
}
