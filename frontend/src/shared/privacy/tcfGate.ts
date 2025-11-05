export function tcfQuery(cmd: string, cb: (...a:any[])=>void){
  if (typeof window === 'undefined') return;
  if (typeof (window as any).__tcfapi === 'function') (window as any).__tcfapi(cmd, 2, cb);
}

export function loadAnalyticsIfConsent(){
  tcfQuery('getTCData', (tcData: any, success: boolean) => {
    if (!success) return;
    const pc = tcData?.purpose?.consents || {}; // Purpose 1: Storage & Access
    const ok = pc['1'] === true; // minimum örnek
    if (ok) {
      const s = document.createElement('script'); s.src = '/gtm.js'; s.async = true; document.head.appendChild(s);
    }
  });
}