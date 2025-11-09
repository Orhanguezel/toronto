// src/app/[locale]/page.tsx
import type { Metadata } from "next";
import LandingClient from "@/landing/LandingClient";
import { canonicalFor, languagesMap } from "@/shared/seo/alternates";

type Locale = "tr" | "en" | "de";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(
  { params }: { params: Promise<{ locale: Locale }> }
): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Toronto",
    description: "Toronto portfolio site – hizmetler, projeler ve reklam çözümleri",
    alternates: { canonical: canonicalFor(locale, "/"), languages: languagesMap("/") },
  };
}

export default async function HomePage(
  { params }: { params: Promise<{ locale: Locale }> }
) {
  const { locale } = await params;
  return <LandingClient locale={locale} initialSection="" />;
}
