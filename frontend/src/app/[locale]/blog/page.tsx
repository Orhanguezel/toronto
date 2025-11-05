import Container from '@/shared/ui/common/Container';
import { getBlogPaged } from '@/lib/api/public';
import type { Metadata } from 'next';

export const revalidate = 600;
export const metadata: Metadata = { title: 'Blog', description: 'Toronto blog' };

export default async function BlogPage({ params, searchParams }:{ params:{ locale:string }, searchParams: Record<string,any> }){
  const data = await getBlogPaged(params.locale, searchParams);
  return (
    <Container>
      <h1>Blog</h1>
      <div style={{ display:'grid', gap:16, gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))' }}>
        {data.items.map((p:any)=> (
          <article key={p.slug}>
            {p.cover_url && <img src={p.cover_url} alt="" style={{ width:'100%', borderRadius:12 }} />}
            <h3><a href={`/${params.locale}/blog/${p.slug}`}>{p.title}</a></h3>
            <small>{p.author} • {new Date(p.published_at).toLocaleDateString()}</small>
            <p>{p.excerpt}</p>
          </article>
        ))}
      </div>
    </Container>
  );
}