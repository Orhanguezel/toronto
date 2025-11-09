// src/shared/personalization/getSegment.ts
import { cookies, headers } from 'next/headers';

export type Segment = {
  key: string;
  lang: 'tr' | 'de' | 'en';
  device: 'm' | 'd';
  country?: string;
};

const isLang = (v: unknown): v is Segment['lang'] =>
  v === 'tr' || v === 'de' || v === 'en';
const isDevice = (v: unknown): v is Segment['device'] =>
  v === 'm' || v === 'd';

/** Server-only (RSC/Route Handler). Reads cookie+headers and returns a typed segment. */
export async function getSegment(): Promise<Segment> {
  const c = await cookies();
  const h = await headers();

  const segKey = c.get('seg')?.value ?? 'en-d';
  const [rawLang, rawDevice] = segKey.split('-');

  const lang = isLang(rawLang) ? rawLang : 'en';
  const device = isDevice(rawDevice) ? rawDevice : 'd';

  const country =
    h.get('cf-ipcountry') ??
    h.get('x-vercel-ip-country') ??
    undefined;

  return { key: segKey, lang, device, country };
}

/*
```
**Kullanım (RSC)**
import { getSegment } from '@/shared/personalization/getSegment';

export default async function Hero() {
  const seg = await getSegment(); // ← await şart
  const title =
    seg.lang === 'tr'
      ? 'Toronto – Yazılım & Reklam'
      : seg.lang === 'de'
        ? 'Toronto – Software & Werbung'
        : 'Toronto – Software & Ads';
  const cta = seg.device === 'm' ? 'Hemen Ara' : 'Teklif Al';
  return <HeroSection title={title} cta={cta} />;
}


*/