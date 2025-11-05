export async function GET(req: Request){
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')||''; const locale = searchParams.get('locale')||'tr';
  const res = await fetch(`${process.env.API_BASE_URL}/search?q=${encodeURIComponent(q)}&locale=${locale}`, { cache:'no-store' });
  return new Response(await res.text(), { headers: { 'Content-Type':'application/json' } });
}