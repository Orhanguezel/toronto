import { draftMode } from 'next/headers';
export async function GET(req: Request){
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  if (secret !== process.env.PREVIEW_SECRET) return new Response('Forbidden', { status: 403 });
  draftMode().enable();
  return new Response('OK, preview on', { status: 200, headers: { 'Set-Cookie': 'preview=1; Path=/; HttpOnly; Secure; SameSite=Lax' } });
}


/*
**Kullanım**: Admin’de “Önizleme” → `/api/preview?secret=...&redirect=/tr/projects/slug` linki oluşturur.*/