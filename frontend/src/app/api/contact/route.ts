import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // basit honeypot
    if (body.website) return new Response('ok', { status: 200 });

    const locale = req.headers.get('x-locale') || 'tr';
    const url = `${process.env.API_BASE_URL}/contact`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept-Language': locale },
      body: JSON.stringify({ name: body.name, email: body.email, message: body.message, consent: true }),
      // timeout opsiyonu için: AbortController kullanılabilir
    });
    if (!res.ok) return new Response('Upstream error', { status: 502 });

    return Response.json({ ok: true });
  } catch (e) {
    return new Response('Bad request', { status: 400 });
  }
}