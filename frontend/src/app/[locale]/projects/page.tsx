// ==============================
// src/app/[locale]/projects/page.tsx
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
    title: "Satılık Projeler",
    description: "Toronto satılık projeler – öne çıkan projeler ve fırsatlar",
    alternates: { canonical: canonicalFor(locale, "/projects"), languages: languagesMap("/projects") },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return <LandingClient locale={locale} initialSection="projects" />;
}
