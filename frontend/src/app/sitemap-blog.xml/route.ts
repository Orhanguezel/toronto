// /src/app/sitemap-blog.xml/route.ts
export const revalidate = 600;

const LOCALES = ['tr', 'en', 'de'] as const;
const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
const API  = process.env.API_BASE_URL || '';

function xmlEscape(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
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
  // Her locale için blog listesi çek
  const all = await Promise.all(
    LOCALES.map(async (locale) => {
      const items = await fetchPosts(locale);
      return { locale, items };
    })
  );

  const urlEntries = all.flatMap(({ locale, items }) => {
    // Blog index sayfasını da ekle
    const idx = `<url><loc>${xmlEscape(`${BASE}/${locale}/blog`)}</loc><lastmod>${new Date().toISOString()}</lastmod></url>`;

    const posts = items.map((p: any) => {
      const slug = p?.slug ?? '';
      if (!slug) return '';
      const last =
        p?.updated_at || p?.published_at || p?.created_at || new Date().toISOString();
      const loc = `${BASE}/${locale}/blog/${slug}`;
      return `<url><loc>${xmlEscape(loc)}</loc><lastmod>${new Date(last).toISOString()}</lastmod></url>`;
    }).join('');

    return idx + posts;
  }).join('');

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urlEntries +
    `</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=600, stale-while-revalidate=300',
    },
  });
}
