import React from 'react';
import { searchAll } from '@/lib/api/public';
import Container from '@/shared/ui/common/Container';

export const revalidate = 60;

export default async function SearchPage({ params, searchParams }:{ params:{ locale:string }, searchParams: Record<string,any> }){
  const term = (searchParams.q||'').trim();
  const data = term ? await searchAll(params.locale, term) : null;
  return (
    <Container>
      <h1>Arama</h1>
      <SearchBox />
      {term && data && (
        <div style={{ display:'grid', gap:24, gridTemplateColumns: '1fr 1fr' }}>
          <section>
            <h3>Projeler</h3>
            <ul>{data.projects.map((p:any)=> <li key={p.slug}><a href={`/${params.locale}/projects/${p.slug}`}>{p.title}</a></li>)}</ul>
          </section>
          <section>
            <h3>Blog</h3>
            <ul>{data.posts.map((p:any)=> <li key={p.slug}><a href={`/${params.locale}/blog/${p.slug}`}>{p.title}</a></li>)}</ul>
          </section>
        </div>
      )}
    </Container>
  );
}

function SearchBox(){
  'use client';
  const [v, setV] = React.useState('');
  React.useEffect(()=>{ const s = new URLSearchParams(location.search); setV(s.get('q')||''); },[]);
  const submit = (e: React.FormEvent)=>{ e.preventDefault(); const u = new URL(location.href); if (v) u.searchParams.set('q', v); else u.searchParams.delete('q'); location.href = u.toString(); };
  return (
    <form onSubmit={submit} style={{ display:'flex', gap:8 }}>
      <input value={v} onChange={e=>setV(e.target.value)} placeholder="Arayın…" />
      <button>Ara</button>
    </form>
  );
}