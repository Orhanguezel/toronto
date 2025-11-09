import type { Metadata } from "next";
import LandingClient from "@/landing/LandingClient";
import { canonicalFor, languagesMap } from "@/shared/seo/alternates";

type Locale = "tr" | "en" | "de";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  const { locale } = params;
  return {
    title: "Reklam Çözümleri",
    description: "Ölçülebilir kampanyalar, görünür sonuçlar.",
    alternates: { canonical: canonicalFor(locale, "/ad-solutions"), languages: languagesMap("/ad-solutions") },
  };
}

export default function Page({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  return <LandingClient locale={locale} initialSection="ad-solutions" />;
}
