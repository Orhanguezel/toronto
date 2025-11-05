// src/app/[locale]/projects/compare/page.tsx

import Container from '@/shared/ui/common/Container';
import { getProjectBySlug } from '@/lib/api/public';

export const revalidate = 600;

export default async function ComparePage({ params, searchParams }:{ params:{ locale:string }, searchParams: Record<string,any> }){
  const ids = String(searchParams.ids||'').split(',').map(s=>s.trim()).filter(Boolean);
  const items = await Promise.all(ids.map(slug => getProjectBySlug(params.locale, slug).catch(()=>null)));
  const rows = [
    { k: 'Başlık', v: (x:any)=> x?.title || '-' },
    { k: 'Başlangıç Fiyatı', v: (x:any)=> x?.price_from ? `${x.price_from} €` : '-' },
    { k: 'Video', v: (x:any)=> x?.video_url? 'Var':'Yok' },
  ];
  return (
    <Container>
      <h1>Projeleri Karşılaştır</h1>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead><tr><th>Özellik</th>{items.map((x,i)=>(<th key={i}>{x?.title||'-'}</th>))}</tr></thead>
        <tbody>
          {rows.map((r)=> (
            <tr key={r.k}><td>{r.k}</td>{items.map((x,i)=>(<td key={i}>{r.v(x)}</td>))}</tr>
          ))}
        </tbody>
      </table>
    </Container>
  );
}