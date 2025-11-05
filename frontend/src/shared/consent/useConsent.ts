'use client';
export function hasConsent(purpose:'analytics'|'ads'|'personalization', state:any){
  const p = state?.purposes?.[purpose]; if (!p) return false;
  const ttl = purpose==='analytics'? 180 : purpose==='ads'? 90 : 365; // gün
  const age = (Date.now() - new Date(p.ts).getTime()) / 86400000;
  return p.val === true && age <= ttl;
}