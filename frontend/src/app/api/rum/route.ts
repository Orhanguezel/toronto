export async function POST(req: Request) {
  const body = await req.json().catch(()=>null);
  console.log('[RUM]', body); // prod’da bir queue’ye yazın
  return new Response(null, { status: 204 });
}