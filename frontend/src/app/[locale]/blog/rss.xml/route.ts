import { getBlogPaged } from '@/lib/api/public';

export async function GET(_: Request, { params }:{ params:{ locale:string } }){
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const data = await getBlogPaged(params.locale, { page:1, pageSize:50 });
  const items = (data.items||[]).map((p:any)=> `
    <item>
      <title>${p.title}</title>
      <link>${site}/${params.locale}/blog/${p.slug}</link>
      <guid>${site}/${params.locale}/blog/${p.slug}</guid>
      <pubDate>${new Date(p.published_at).toUTCString()}</pubDate>
      <description><![CDATA[${p.excerpt||''}]]></description>
    </item>`).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0"><channel>
    <title>Toronto Blog (${params.locale})</title>
    <link>${site}/${params.locale}/blog</link>
    <description>Toronto blog feed</description>
    ${items}
  </channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}