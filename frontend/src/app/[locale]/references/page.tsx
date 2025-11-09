import type { Metadata } from "next";
import LandingClient from "@/landing/LandingClient";
import { canonicalFor, languagesMap } from "@/shared/seo/alternates";

type Locale = "tr" | "en" | "de";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  const { locale } = params;
  return {
    title: "Referanslar",
    description: "Çalıştığımız markalardan seçkiler.",
    alternates: { canonical: canonicalFor(locale, "/references"), languages: languagesMap("/references") },
  };
}

export default function Page({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  return <LandingClient locale={locale} initialSection="references" />;
}
