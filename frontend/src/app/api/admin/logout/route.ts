import { cookies } from 'next/headers';
import { ADMIN_TOKEN_COOKIE } from '@/lib/auth/cookies';
export async function POST() { cookies().delete(ADMIN_TOKEN_COOKIE); return new Response(null, { status: 204 }); }