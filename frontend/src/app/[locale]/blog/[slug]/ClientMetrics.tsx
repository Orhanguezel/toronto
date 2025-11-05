// src/app/[locale]/blog/[slug]/ClientMetrics.tsx

'use client';
import { useEffect, useState } from 'react';
export default function ClientMetrics(){
  const [txt, setTxt] = useState('');
  useEffect(()=>{ fetch('/api/_admin/metricsTxt').then(r=>r.text()).then(setTxt); },[]);
  return <pre style={{ whiteSpace:'pre-wrap' }}>{txt}</pre>;
}
