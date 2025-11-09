// src/app/[locale]/page.tsx

import type { Metadata } from "next";
import { canonicalFor, languagesMap } from "@/shared/seo/alternates";
import LandingClient from "@/landing/LandingClient";

export const revalidate = 300; // ISR

export async function generateMetadata(
  { params }: { params: Promise<{ locale: "tr" | "en" | "de" }> }
): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Toronto",
    description: "Toronto portfolio site – hizmetler, projeler ve reklam çözümleri",
    alternates: { canonical: canonicalFor(locale, "/"), languages: languagesMap("/") },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: "tr" | "en" | "de" }>;
}) {
  const { locale } = await params;
  // Tek sayfa landing → ana girişte 'hero' bölümüne gitmeye gerek yok; "" veriyoruz
  return <LandingClient locale={locale} initialSection="" />;
}
