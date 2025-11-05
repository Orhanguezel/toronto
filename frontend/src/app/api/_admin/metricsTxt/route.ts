export async function GET(){
  const res = await fetch(`${process.env.API_BASE_URL}/metrics`, { cache:'no-store' });
  return new Response(await res.text(), { headers: { 'Content-Type':'text/plain; charset=utf-8' } });
}