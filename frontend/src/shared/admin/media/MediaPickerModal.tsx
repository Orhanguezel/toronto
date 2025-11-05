'use client';
import styled from 'styled-components';
import { useEffect, useState } from 'react';

const Backdrop = styled.div` position:fixed; inset:0; background:rgba(0,0,0,.6); display:grid; place-items:center; z-index:1000; `;
const Sheet = styled.div` width:min(1080px,96vw); background:${({theme})=>theme.colors.surface}; border-radius:${({theme})=>theme.radii.lg}px; padding:16px; `;
const Grid = styled.div` display:grid; grid-template-columns: repeat(auto-fill, minmax(160px,1fr)); gap:12px; `;

export default function MediaPickerModal({ open, onClose, onPick }:{ open:boolean; onClose:()=>void; onPick:(item:any)=>void }){
  const [q, setQ] = useState({ keyword:'', folder:'', tags:'' });
  const [data, setData] = useState<any>({ items: [] });
  useEffect(()=>{ if (!open) return; const s = new URLSearchParams(Object.fromEntries(Object.entries(q).filter(([,v])=>String(v)))); fetch('/api/_admin/media?'+s.toString()).then(r=>r.json()).then(setData); }, [open, q]);
  if (!open) return null;
  return (
    <Backdrop onClick={onClose}>
      <Sheet onClick={e=>e.stopPropagation()}>
        <div style={{ display:'flex', gap:8, marginBottom:8 }}>
          <input placeholder="Ara" value={q.keyword} onChange={e=>setQ({...q, keyword:e.target.value})} />
          <input placeholder="Klasör" value={q.folder} onChange={e=>setQ({...q, folder:e.target.value})} />
          <input placeholder="Etiketler (virgül)" value={q.tags} onChange={e=>setQ({...q, tags:e.target.value})} />
        </div>
        <Grid>
          {(data.items||[]).map((m:any)=> (
            <button key={m.id} onClick={()=>onPick(m)} style={{ border:'1px solid rgba(255,255,255,.08)', borderRadius:12, overflow:'hidden' }}>
              {m.kind==='image' ? <img src={m.url} alt="" style={{ width:'100%', height:120, objectFit:'cover' }} /> : <div style={{height:120,display:'grid',placeItems:'center'}}>Video</div>}
              <div style={{ padding:8, opacity:.8 }}>{m.title||m.id}</div>
            </button>
          ))}
        </Grid>
        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:12 }}>
          <button onClick={onClose}>Kapat</button>
        </div>
      </Sheet>
    </Backdrop>
  );
}