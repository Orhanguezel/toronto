// Basit MVP: segment/dile göre en çok ziyaret edilen sayfaların
// statik/fallback listesi. (Analytics entegrasyonunu sonra bağlarız.)

export type Device = "m" | "d";
export type Lang = "tr" | "de" | "en";
type Input = { device: Device; lang: Lang };

// Her dil için önerilen rotalar (locale prefixsiz)
// "/tr" ile birleştirirken SpeculationRules zaten lang ekliyor.
const STATIC_BY_LANG: Record<Lang, string[]> = {
  tr: ["/", "/projects", "/services", "/ads", "/contact"],
  en: ["/", "/projects", "/services", "/ads", "/contact"],
  de: ["/", "/projects", "/services", "/ads", "/contact"],
};

// İstersen .env’de NEXT_PUBLIC_TOP_ROUTES="/,/projects,/services" ile override edebilirsin.
function fromEnv(): string[] | null {
  const raw = process.env.NEXT_PUBLIC_TOP_ROUTES;
  if (!raw) return null;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((p) => (p.startsWith("/") ? p : `/${p}`));
}

export async function getTopRoutes({ device, lang }: Input): Promise<string[]> {
  // Şimdilik device’ı kullanmıyoruz; ileride m/d ayrıştırırız.
  const envList = fromEnv();
  const base = envList && envList.length ? envList : STATIC_BY_LANG[lang] ?? STATIC_BY_LANG.en;
  // En fazla 6 benzersiz rota
  return Array.from(new Set(base)).slice(0, 6);
}
