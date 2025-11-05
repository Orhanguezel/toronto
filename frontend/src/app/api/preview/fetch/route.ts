// src/app/api/preview/fetch/route.ts

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { fetchDraftFromProvider } from '@/lib/cms/preview';

export async function GET(req: NextRequest){
  const p = req.nextUrl.searchParams;
  const type = p.get('type')!, slug = p.get('slug')!, locale = p.get('locale')!, exp = p.get('exp')!, sig = p.get('sig')!;
  const payload = `${type}:${slug}:${locale}:${exp}`;
  const ok = crypto.createHmac('sha256', process.env.PREVIEW_SECRET!).update(payload).digest('hex') === sig;
  if (!ok || Number(exp) < Math.floor(Date.now()/1000)) return NextResponse.json({ error:'forbidden' }, { status:403 });
  const item = await fetchDraftFromProvider({ type, slug, locale }); // Contentful CDA/Preview API, Strapi draft token vs.
  return NextResponse.json({ item }, { headers: { 'Cache-Control':'no-store', 'X-Robots-Tag':'noindex' } });
}