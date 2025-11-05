export async function GET(){
  const base = process.env.NEXT_PUBLIC_SITE_URL!;
  const urls = [ '/tr', '/en', '/de', '/tr/services', '/en/services', '/de/services' ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`+
    urls.map(u=>`<url><loc>${base}${u}</loc></url>`).join('')+`</urlset>`;
  return new Response(xml, { headers: { 'Content-Type':'application/xml; charset=utf-8' } });
}