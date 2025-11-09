// ==============================
// src/app/[locale]/contact/page.tsx
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
    title: "İletişim",
    description: "Formu doldurun, en kısa sürede dönüş yapalım.",
    alternates: { canonical: canonicalFor(locale, "/contact"), languages: languagesMap("/contact") },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return <LandingClient locale={locale} initialSection="contact" />;
}
