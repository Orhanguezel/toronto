'use client';
import styled from 'styled-components';
import { useState } from 'react';
import { Button } from '@/shared/ui/buttons/Button';

const List = styled.div` display:grid; gap:10px; `;
const Item = styled.div` border:1px solid rgba(255,255,255,.12); border-radius:12px; padding:10px; display:grid; gap:6px; `;
const Input = styled.input` padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,.12); background:${({theme})=>theme.colors.surface}; color:inherit;`;
const Area  = styled.textarea` padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,.12); background:${({theme})=>theme.colors.surface}; color:inherit; min-height:100px;`;

export type Faq = { q: string; a: string };
export default function FAQBuilder({ value, onChange }:{ value?: Faq[]; onChange:(v:Faq[])=>void }){
  const [list, setList] = useState<Faq[]>(value || []);
  const push = ()=>{ const v=[...list, { q:'', a:'' }]; setList(v); onChange(v); };
  return (
    <div>
      <List>
        {list.map((f, i) => (
          <Item key={i}>
            <Input placeholder="Soru" defaultValue={f.q} onChange={e=>{ const v=[...list]; v[i]={...v[i], q:e.target.value}; setList(v); onChange(v); }} />
            <Area placeholder="Cevap" defaultValue={f.a} onChange={e=>{ const v=[...list]; v[i]={...v[i], a:e.target.value}; setList(v); onChange(v); }} />
            <div style={{ display:'flex', gap:8 }}>
              <Button variant="ghost" onClick={()=>{ const v=list.toSpliced(i,1); setList(v); onChange(v); }}>Sil</Button>
              {i>0 && <Button variant="ghost" onClick={()=>{ const v=[...list]; [v[i-1], v[i]]=[v[i], v[i-1]]; setList(v); onChange(v); }}>Yukarı</Button>}
              {i<list.length-1 && <Button variant="ghost" onClick={()=>{ const v=[...list]; [v[i+1], v[i]]=[v[i], v[i+1]]; setList(v); onChange(v); }}>Aşağı</Button>}
            </div>
          </Item>
        ))}
      </List>
      <div style={{ marginTop:10 }}><Button onClick={push}>Soru ekle</Button></div>
    </div>
  );
}