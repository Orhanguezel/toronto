// src/app/[locale]/blog/author/[slug]/page.tsx

import Container from '@/shared/ui/common/Container';
import { fetchJSON } from '@/lib/api/fetcher';
export const revalidate = 600;
export default async function AuthorPage({ params }:{ params:{ locale:string; slug:string } }){
  const data = await fetchJSON<{author:any; posts:any[]}>(`/blog/author/${params.slug}`, { revalidate: 600, tags:[`author_${params.slug}`], locale: params.locale });
  return (
    <Container>
      <header style={{ display:'flex', gap:16, alignItems:'center' }}>
        {data.author.avatar_url && <img src={data.author.avatar_url} alt="" width={64} height={64} style={{ borderRadius: '50%' }} />}
        <div><h1>{data.author.name}</h1><p>{data.author.bio}</p></div>
      </header>
      <h3>Yazılar</h3>
      <ul>{data.posts.map((p:any)=> <li key={p.slug}><a href={`/${params.locale}/blog/${p.slug}`}>{p.title}</a></li>)}</ul>
    </Container>
  );
}