// src/app/[locale]/page.tsx
import type { Metadata } from "next";
import ReferencesStrip from "@/app/[locale]/references/ReferencesStrip";
import { getSiteSettings, getFlag } from "@/lib/api/public";
import { canonicalFor, languagesMap } from "@/shared/seo/alternates";
import Hero from "@/features/home/Hero";

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

export default async function HomePage({ params }: { params: Promise<{ locale: "tr" | "en" | "de" }> }) {
  const { locale } = await params;
  await getFlag("newHero", { locale }).catch(() => null);

  const settings = await getSiteSettings(locale);
  const wa = settings?.contact_info?.whatsappNumber ?? undefined;

  return (
    <>
      <Hero locale={locale} whatsapp={wa} />
      <ReferencesStrip locale={locale} />
    </>
  );
}
