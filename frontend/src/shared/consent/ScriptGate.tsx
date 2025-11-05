'use client';
import { useEffect } from 'react';
export default function ScriptGate({ id, src, allow }:{ id:string; src:string; allow:boolean }){
  useEffect(()=>{
    if (!allow) return; if (document.getElementById(`v-${id}`)) return;
    const s = document.createElement('script'); s.id=`v-${id}`; s.src=src; s.async=true; s.dataset.consent='granted';
    document.head.appendChild(s);
  },[allow, id, src]);
  return null;
}