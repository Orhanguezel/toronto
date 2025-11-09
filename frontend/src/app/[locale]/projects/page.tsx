import type { Metadata } from "next";
import LandingClient from "@/landing/LandingClient";
import { canonicalFor, languagesMap } from "@/shared/seo/alternates";

type Locale = "tr" | "en" | "de";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  const { locale } = params;
  return {
    title: "Satılık Projeler",
    description: "Toronto satılık projeler – öne çıkan projeler ve fırsatlar",
    alternates: { canonical: canonicalFor(locale, "/projects"), languages: languagesMap("/projects") },
  };
}

export default function Page({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  return <LandingClient locale={locale} initialSection="projects" />;
}
