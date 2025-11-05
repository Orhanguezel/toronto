export async function GET(_: Request, { params }:{ params:{ locale:string } }){
  const base = process.env.NEXT_PUBLIC_SITE_URL!; const loc = params.locale as 'tr'|'en'|'de';
  const res = await fetch(`${process.env.API_BASE_URL}/blog?locale=${loc}&page=1&pageSize=500`, { next: { revalidate: 600 } });
  const data = await res.json();
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`+
    (data.items||[]).map((p:any)=>`<url><loc>${base}/${loc}/blog/${p.slug}</loc><lastmod>${new Date(p.published_at).toISOString()}</lastmod></url>`).join('')+
    `</urlset>`;
  return new Response(xml, { headers: { 'Content-Type':'application/xml; charset=utf-8' } });
}