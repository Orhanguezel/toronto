import { revalidateTag } from 'next/cache';

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const hdr = request.headers.get('x-revalidate-secret');
  if (!secret || hdr !== secret) return new Response('Unauthorized', { status: 401 });

  const body = await request.json().catch(() => ({} as any));
  const tags: string[] = Array.isArray(body?.tags) ? body.tags : [];
  tags.forEach(t => revalidateTag(t));
  return Response.json({ revalidated: true, tags });
}