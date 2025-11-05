import { NextRequest } from 'next/server';
import { ADMIN_TOKEN_COOKIE } from '@/lib/auth/cookies';

const BASE = process.env.API_BASE_URL!;

async function handler(req: NextRequest, ctx: { params: { path: string[] } }) {
  const token = req.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const path = ctx.params.path.join('/');
  const url = `${BASE}/admin/${path}${req.nextUrl.search}`;

  const init: RequestInit = {
    method: req.method,
    headers: { 'Content-Type': req.headers.get('content-type') || 'application/json', 'Accept': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: ['GET','HEAD'].includes(req.method) ? undefined : await req.text(),
  };
  const res = await fetch(url, init);
  const text = await res.text();
  return new Response(text, { status: res.status, headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' } });
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };