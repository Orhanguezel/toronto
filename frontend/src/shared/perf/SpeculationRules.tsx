import { getTopRoutes } from "@/shared/perf/topRoutes";

export default async function Speculation({
  device,
  lang,
}: {
  device: "m" | "d";
  lang: "tr" | "de" | "en";
}) {
  const routes = await getTopRoutes({ device, lang });

  // NEXT_PUBLIC_ORIGIN'e bağlı kalma; relative pattern kullan (aynı origin şart).
  const entries = routes.map((p) => ({
    source: "document",
    where: { href_matches: `/${lang}${p}` },
    eagerness: "moderate",
  }));

  const json = {
    prerender: entries.slice(0, 2),
    prefetch: entries.slice(2, 6),
  };

  return (
    <script
      type="speculationrules"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
