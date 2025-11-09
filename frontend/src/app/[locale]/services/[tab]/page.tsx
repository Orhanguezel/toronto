import LandingClient from "@/landing/LandingClient";

type Locale = "tr" | "en" | "de";
type Params = { locale: Locale; tab: string };

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ServicesTabPage({ params }: { params: Params }) {
  const { locale, tab } = params;
  // tab: "web" | "design" | "seo" | ...
  // services section + alt anchor’a kaydır
  return <LandingClient locale={locale} initialSection="services" initialHash={tab} />;
}
