// src/app/[locale]/contact/page.tsx
import type { Metadata } from "next";
import LandingClient from "@/landing/LandingClient";
import { canonicalFor, languagesMap } from "@/shared/seo/alternates";

export const revalidate = 600;

export async function generateMetadata({ params }: { params: Promise<{ locale: "tr"|"en"|"de" }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "İletişim",
    description: "Formu doldurun, en kısa sürede dönüş yapalım.",
    alternates: { canonical: canonicalFor(locale, "/contact"), languages: languagesMap("/contact") },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: "tr"|"en"|"de" }> }) {
  const { locale } = await params;
  return <LandingClient locale={locale} initialSection="contact" />;
}
