'use client';
import { useEffect, useRef, useState } from 'react';

function Pin({ anchor, text }:{ anchor:string; text:string }){
  const ref = useRef<HTMLElement|null>(null);
  useEffect(()=>{
    let el:HTMLElement|null = null;
    // önce css selector dene
    try { el = document.querySelector(anchor); } catch {}
    // bulamazsa textQuote fallback
    if(!el){
      const all = Array.from(document.body.querySelectorAll('*'));
      el = all.find(e=> e.textContent && e.textContent.includes(anchor)) as HTMLElement|null;
    }
    if(el) ref.current = el;
  },[anchor]);
  return ref.current ? <div className="inline-comment-pin" style={{ position:'absolute', top:ref.current.getBoundingClientRect().top + window.scrollY, left:ref.current.getBoundingClientRect().left + window.scrollX }}>{text}</div> : null;
}

export default function InlineComments({ itemId, version }:{ itemId:string; version:string }){
  const [notes,setNotes] = useState<any[]>([]);
  useEffect(()=>{ fetch(`/api/_admin/content/${itemId}/comments?version=${version}`).then(r=>r.json()).then(setNotes); },[itemId,version]);
  // hedefe atla: css selector → textQuote fallback
  return <div className="comment-layer">{notes.map(n=> <Pin key={n.id} anchor={n.anchor} text={n.body} />)}</div>;
}

/* Kullanimi */
<Pin anchor="#section-1" text="Bu bir yorumdur." />

