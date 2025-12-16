// /src/app/sitemap-blog.xml/route.ts
export const revalidate = 600;

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
const API = process.env.API_BASE_URL || "";

function xmlEscape(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** BE bazen value'yu JSON-string döndürebilir; normalize et. */
function tryParse(x: unknown): unknown {
  if (typeof x === "string") {
    const s = x.trim();
    if (
      (s.startsWith("{") && s.endsWith("}")) ||
      (s.startsWith("[") && s.endsWith("]"))
    ) {
      try {
        return JSON.parse(s);
      } catch {
        /* ignore */
      }
    }
    if (s === "true") return true;
    if (s === "false") return false;
    if (!Number.isNaN(Number(s)) && s !== "") return Number(s);
  }
  return x;
}

/**
 * app_locales value normalize:
 * - ["tr","en"] veya { locales: ["tr","en"] } veya ["tr-TR","en-US"]
 */
function normalizeLocales(raw: unknown): string[] {
  const v = tryParse(raw);

  const arr: unknown[] =
    Array.isArray(v)
      ? v
      : v && typeof v === "object" && Array.isArray((v as any).locales)
        ? (v as any).locales
        : [];

  const cleaned = arr
    .map((x) => String(x).toLowerCase().split("-")[0])
    .filter(Boolean);

  // unique + stable order
  return Array.from(new Set(cleaned));
}

/** API'den aktif locale'leri çek; yoksa fallback. */
async function fetchActiveLocales(): Promise<string[]> {
  const fallbackDefault =
    String(process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "tr")
      .toLowerCase()
      .split("-")[0] || "tr";

  if (!API) return [fallbackDefault];

  try {
    const res = await fetch(
      `${API}/site_settings/${encodeURIComponent("app_locales")}`,
      { next: { revalidate } }
    );

    if (!res.ok) return [fallbackDefault];

    const data = (await res.json()) as any;
    const locales = normalizeLocales(data?.value);

    return locales.length ? locales : [fallbackDefault];
  } catch {
    return [fallbackDefault];
  }
}

async function fetchPosts(locale: string) {
  if (!API) return [];
  try {
    const res = await fetch(
      `${API}/blog?locale=${encodeURIComponent(locale)}&page=1&pageSize=500`,
      { next: { revalidate } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.items) ? data.items : [];
  } catch {
    return [];
  }
}

export async function GET() {
  // ✅ Locale listesi artık dinamik
  const locales = await fetchActiveLocales();

  // Her locale için blog listesi çek
  const all = await Promise.all(
    locales.map(async (locale) => {
      const items = await fetchPosts(locale);
      return { locale, items };
    })
  );

  const nowIso = new Date().toISOString();

  const urlEntries = all
    .flatMap(({ locale, items }) => {
      // Blog index sayfasını da ekle
      const idx = `<url><loc>${xmlEscape(
        `${BASE}/${locale}/blog`
      )}</loc><lastmod>${nowIso}</lastmod></url>`;

      const posts = items
        .map((p: any) => {
          const slug = p?.slug ?? "";
          if (!slug) return "";

          const last =
            p?.updated_at ||
            p?.published_at ||
            p?.created_at ||
            nowIso;

          let lastIso = nowIso;
          try {
            lastIso = new Date(last).toISOString();
          } catch {
            lastIso = nowIso;
          }

          const loc = `${BASE}/${locale}/blog/${slug}`;
          return `<url><loc>${xmlEscape(loc)}</loc><lastmod>${xmlEscape(
            lastIso
          )}</lastmod></url>`;
        })
        .join("");

      return [idx, posts];
    })
    .join("");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urlEntries +
    `</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=600, stale-while-revalidate=300",
    },
  });
}
