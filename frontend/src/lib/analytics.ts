export function emit(name:string, props:any={}){
  try { navigator.sendBeacon('/api/events', JSON.stringify({ name, props, path: location.pathname, locale: document.documentElement.lang })); } catch {}
}

/*
Kullanım örn.: arama yapılınca `emit('search', { q })`; iletişim formu gönderilince `emit('lead', { channel:'form' })`.**/