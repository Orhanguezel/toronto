'use client';
import styled from 'styled-components';
import { useEffect, useRef, useState } from 'react';

const Box = styled.div` position:relative; `;
const List = styled.div` position:absolute; inset-inline:0; top:100%; background:${({theme})=>theme.colors.surface}; border:1px solid ${({theme})=>theme.colors.border}; border-radius:${({theme})=>theme.radii.md}px; padding:8px; display:grid; gap:6px; z-index:${({theme})=>theme.z.overlay}; `;

export default function SearchBox({ locale }:{ locale: string }){
  const [v, setV] = useState('');
  const [items, setItems] = useState<any>(null);
  const t = useRef<any>();
  useEffect(()=>{
    clearTimeout(t.current);
    if (!v || v.length<2) { setItems(null); return; }
    t.current = setTimeout(async ()=>{
      const res = await fetch(`/api/search?q=${encodeURIComponent(v)}&locale=${locale}`, { cache: 'no-store' });
      setItems(await res.json());
    }, 200);
  },[v, locale]);

  return (
    <Box>
      <input value={v} onChange={e=>setV(e.target.value)} placeholder="Arayın…" />
      {items && (
        <List>
          <div><strong>Projeler</strong></div>
          {(items.projects||[]).map((p:any)=> <a key={p.slug} href={`/${locale}/projects/${p.slug}`}>{p.title}</a>)}
          <div><strong>Blog</strong></div>
          {(items.posts||[]).map((p:any)=> <a key={p.slug} href={`/${locale}/blog/${p.slug}`}>{p.title}</a>)}
        </List>
      )}
    </Box>
  );
}