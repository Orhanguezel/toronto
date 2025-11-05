import { cookies } from 'next/headers';
import { ADMIN_TOKEN_COOKIE } from '@/lib/auth/cookies';

export async function POST(req: Request) {
  const body = await req.json();
  const res = await fetch(`${process.env.API_BASE_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) return new Response('Unauthorized', { status: 401 });
  const data = await res.json(); // { token, user }
  cookies().set(ADMIN_TOKEN_COOKIE, data.token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/admin', maxAge: 60 * 60 * 8 });
  return Response.json({ ok: true, user: data.user });
}