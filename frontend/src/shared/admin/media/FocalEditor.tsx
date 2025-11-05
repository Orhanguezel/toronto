'use client';
import styled from 'styled-components';
import { useEffect, useRef, useState } from 'react';

const Backdrop = styled.div` position:fixed; inset:0; background:rgba(0,0,0,.6); display:grid; place-items:center; z-index:1000; `;
const Sheet = styled.div` width:min(960px,96vw); background:${({theme})=>theme.colors.surface}; border-radius:12px; padding:16px; `;
const Box = styled.div` position:relative; width:100%; aspect-ratio:16/9; overflow:hidden; border-radius:12px; `;
const Dot = styled.div` position:absolute; width:16px; height:16px; border-radius:50%; background:${({theme})=>theme.colors.primary}; transform:translate(-50%, -50%); `;

export default function FocalEditor({ src, id, onClose }:{ src:string; id:string; onClose:()=>void }){
  const ref = useRef<HTMLDivElement>(null);
  const [pt, setPt] = useState<{x:number;y:number}>({ x:50, y:50 });
  useEffect(()=>{ (async()=>{ const r=await fetch(`/api/_admin/media/focal?id=${encodeURIComponent(id)}`); const j=await r.json(); setPt({ x:j.focalX||50, y:j.focalY||50 }); })(); },[id]);
  const click = (e: React.MouseEvent)=>{
    const box = ref.current!.getBoundingClientRect();
    const x = ((e.clientX - box.left) / box.width) * 100;
    const y = ((e.clientY - box.top) / box.height) * 100;
    setPt({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };
  const save = async()=>{
    await fetch('/api/_admin/media/focal', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ id, focalX: Math.round(pt.x), focalY: Math.round(pt.y) }) });
    onClose();
  };
  return (
    <Backdrop onClick={onClose}>
      <Sheet onClick={e=>e.stopPropagation()}>
        <Box ref={ref} onClick={click}>
          <img src={src} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition: `${pt.x}% ${pt.y}%` }} />
          <Dot style={{ left: `${pt.x}%`, top: `${pt.y}%` }} />
        </Box>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:12 }}>
          <button onClick={onClose}>Vazgeç</button>
          <button onClick={save}>Kaydet</button>
        </div>
      </Sheet>
    </Backdrop>
  );
}