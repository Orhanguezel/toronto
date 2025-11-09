// /src/app/sitemap-static.xml/route.ts
export const revalidate = 600;

// Sitede kullanılan diller
const LOCALES = ['tr', 'en', 'de'] as const;

// Statik sayfaların path'leri (locale prefixsiz). İhtiyaca göre genişlet.
const PATHS = [
  '/',            // ana sayfa
  '/projects',
  '/services',
  '/blog',
  '/contact',
] as const;

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

function xmlEscape(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const nowIso = new Date().toISOString();

  const urls = LOCALES.flatMap((locale) =>
    PATHS.map((p) => {
      const loc = `${BASE}/${locale}${p === '/' ? '' : p}`;
      return `<url><loc>${xmlEscape(loc)}</loc><lastmod>${nowIso}</lastmod></url>`;
    })
  ).join('');

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls +
    `</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=600, stale-while-revalidate=300',
    },
  });
}
