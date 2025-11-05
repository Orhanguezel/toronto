'use client';
import { useEffect } from 'react';

export default function WebVitalsListener() {
  useEffect(() => {
    (async () => {
      let mod: any;
      try { mod = await import('web-vitals/attribution'); }
      catch { mod = await import('web-vitals'); }
      const { onCLS, onFID, onLCP, onINP, onTTFB } = mod;
      const send = (m: any) => {
        // burada kendi analytics endpoint’ine POST edebilirsin
        // fetch('/api/analytics/web-vitals', { method:'POST', body: JSON.stringify(m) });
        if (process.env.NODE_ENV !== 'production') console.log('[vitals]', m);
      };
      onCLS(send); onFID(send); onLCP(send); onINP?.(send); onTTFB(send);
    })();
  }, []);
  return null;
}