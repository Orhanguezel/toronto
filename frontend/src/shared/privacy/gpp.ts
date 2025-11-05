export function gppQuery(cb:(str:string|null)=>void){
  const w:any = typeof window==='undefined'? {}: window;
  if (typeof w.__gpp==='function') w.__gpp('getGPPString', (res:any)=> cb(res?.gppString||null));
  else cb(null);
}

export function allowAdsByRegion(gppStr:string|null){
  // Basit örnek: US‑State ya da TCF segmentlerine göre karar verilebilir
  if (!gppStr) return false; // conservative default
  // Üretimde: GPP segment parse edilerek Purpose/Notice durumlarına bakılır
  return true;
}