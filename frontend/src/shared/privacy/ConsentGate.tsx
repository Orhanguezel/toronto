'use client';
import { useEffect, useState } from 'react';

export default function ConsentGate(){
  const [ok,setOk] = useState(false);
  useEffect(()=>{
    const raw = localStorage.getItem('toronto_consent_v1');
    const c = raw? JSON.parse(raw): null;
    if (c?.analytics) {
      // örn. GTM/GA4 script inject
      const s = document.createElement('script'); s.async = true; s.src = '/gtm.js'; document.head.appendChild(s);
      setOk(true);
    }
  },[]);
  return ok? null: null;
}