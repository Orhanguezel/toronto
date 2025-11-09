import type { Metadata } from "next";
import LandingClient from "@/landing/LandingClient";
import { canonicalFor, languagesMap } from "@/shared/seo/alternates";

type Locale = "tr" | "en" | "de";

export const revalidate = 600;

export function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Metadata {
  const { locale } = params;
  return {
    title: "İletişim",
    description: "Formu doldurun, en kısa sürede dönüş yapalım.",
    alternates: {
      canonical: canonicalFor(locale, "/contact"),
      languages: languagesMap("/contact"),
    },
  };
}

export default function ContactPage({
  params,
}: {
  params: { locale: Locale };
}) {
  const { locale } = params;
  return <LandingClient locale={locale} initialSection="contact" />;
}
