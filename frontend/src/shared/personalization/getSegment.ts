import { cookies, headers } from 'next/headers';
export type Segment = { key:string; lang:'tr'|'de'|'en'; device:'m'|'d'; country?:string };
export function getSegment(): Segment{
  const c = cookies(); const h = headers();
  const seg = c.get('seg')?.value || 'en-d';
  const [lang, device] = seg.split('-') as any;
  const country = h.get('cf-ipcountry')||h.get('x-vercel-ip-country')||undefined;
  return { key: seg, lang, device, country };
}
```
**Kullanım (RSC)**
```tsx
import { getSegment } from '@/shared/personalization/getSegment';
export default async function Hero(){
  const seg = getSegment();
  const title = seg.lang==='tr' ? 'Toronto – Yazılım & Reklam' : (seg.lang==='de' ? 'Toronto – Software & Werbung' : 'Toronto – Software & Ads');
  const cta = seg.device==='m' ? 'Hemen Ara' : 'Teklif Al';
  return <HeroSection title={title} cta={cta} />; // SSR → SEO dostu
}