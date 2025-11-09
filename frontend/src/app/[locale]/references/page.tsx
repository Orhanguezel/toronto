// ==============================
// src/app/[locale]/references/page.tsx
// ==============================
import type { Metadata } from "next";
import LandingClient from "@/landing/LandingClient";
import { canonicalFor, languagesMap } from "@/shared/seo/alternates";

type Locale = "tr" | "en" | "de";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Referanslar",
    description: "Çalıştığımız markalardan seçkiler.",
    alternates: { canonical: canonicalFor(locale, "/references"), languages: languagesMap("/references") },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return <LandingClient locale={locale} initialSection="references" />;
}
