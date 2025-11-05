export const runtime = 'edge';
export async function GET(req: Request){
  const url = new URL(req.url);
  const country = (req.headers.get('x-vercel-ip-country')||'UN').toUpperCase();
  const lang = (req.headers.get('accept-language')||'en').split(',')[0].slice(0,2);
  // Hafif cache: 60s revalidate
  const body = JSON.stringify({ items: recommend(country, lang) });
  return new Response(body, { headers: { 'Cache-Control':'public, s-maxage=60, stale-while-revalidate=300', 'Content-Type':'application/json' } });
}
function recommend(country:string, lang:string){
  // Basit: ülke+dile göre hizmet kartları
  if (country==='TR' && lang==='tr') return ['Kurumsal Web', 'Google Ads'];
  if (country==='DE' && lang==='de') return ['Shop‑System', 'SEA/SEO'];
  return ['Web Development','SEO'];
}