import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';
export default async function PreviewPage({ params:{ locale, type, slug } }:{ params:{ locale:string; type:string; slug:string } }){
  const url = new URL(`${process.env.NEXT_PUBLIC_ORIGIN}/api/preview/fetch`);
  // URL admin imzalı link ile verilmiş olmalı, burada yalnız SSR render edilir.
  // Güvenlik için doğrudan query kabulü yerine Admin UI bu sayfaya redirect ederken signed URL’i cookie'ye yazar.
  const item = await fetch(url.toString(), { cache:'no-store', headers: { Cookie: cookies().toString() } }).then(r=>r.json());
  return <PreviewRenderer item={item.item} />;
}