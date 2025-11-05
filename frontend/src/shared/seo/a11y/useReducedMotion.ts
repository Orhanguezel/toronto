'use client';
import { useEffect, useState } from 'react';
export function useReducedMotion(){
  const mq = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const [reduced,setReduced] = useState(!!mq?.matches);
  useEffect(()=>{ if(!mq) return; const fn=()=>setReduced(mq.matches); mq.addEventListener('change', fn); return ()=>mq.removeEventListener('change', fn); },[]);
  return reduced;
}