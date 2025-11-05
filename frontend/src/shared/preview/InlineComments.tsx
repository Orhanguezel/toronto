'use client';
import { useEffect, useRef, useState } from 'react';
export default function InlineComments({ itemId, version }:{ itemId:string; version:string }){
  const [notes,setNotes] = useState<any[]>([]);
  useEffect(()=>{ fetch(`/api/_admin/content/${itemId}/comments?version=${version}`).then(r=>r.json()).then(setNotes); },[itemId,version]);
  // hedefe atla: css selector → textQuote fallback
  return <div className="comment-layer">{notes.map(n=> <Pin key={n.id} anchor={n.anchor} text={n.body} />)}</div>;
}