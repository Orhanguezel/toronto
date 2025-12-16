// /src/app/sitemap-static.xml/route.ts
export const revalidate = 600;

// Statik sayfaların path'leri (locale prefixsiz). İhtiyaca göre genişlet.
const PATHS = ["/", "/projects", "/services", "/blog", "/contact"] as const;

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
const API = process.env.API_BASE_URL || "";

function xmlEscape(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// BE bazen value'yu JSON-string döndürebilir; normalize et.
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

  return Array.from(new Set(cleaned));
}

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

export async function GET() {
  const nowIso = new Date().toISOString();

  // ✅ Locale listesi artık dinamik (app_locales)
  const locales = await fetchActiveLocales();

  const urls = locales
    .flatMap((locale) =>
      PATHS.map((p) => {
        const loc = `${BASE}/${locale}${p === "/" ? "" : p}`;
        return `<url><loc>${xmlEscape(
          loc
        )}</loc><lastmod>${nowIso}</lastmod></url>`;
      })
    )
    .join("");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls +
    `</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=600, stale-while-revalidate=300",
    },
  });
}
