# Part 26 – Smart CDN Prefetch (Speculation Rules), Recommendations (Hybrid), Privacy Sandbox (Topics/Protected Audiences), App‑Shell & Island Hydration, Back‑Pressure/Degrade

Bu bölümde; **akıllı prefetch/prerender** (Speculation Rules) ile hızlanma, **hibrit öneri motoru**, **Privacy Sandbox** denemeleri, **App‑Shell + island hydration** stratejisi ve **yük altında otomatik degrade** modlarını ekliyoruz.

> FE: Next.js 15 (RSC/SSR/SSG/ISR), styled‑components (tema: `ensotekTheme`).  
> BE: Fastify + TS + Drizzle + MariaDB.  
> Data: ClickHouse/BQ (Part 21–22).  
> Observability: Prometheus + RUM (Part 17–18).  
> CMP: TCF 2.2 / GPP (Part 18).

---

## 0) Smart Prefetch/Prerender – Speculation Rules + Heuristik

### 0.1 Neden Speculation Rules?
Chrome/Edge’de **Speculation Rules** ile link bazlı **prefetch** (fetch only) ve **prerender** (tam render + anında geçiş) yapabiliriz. SSR + i18n sayfalarda hero/CTA navigasyonları için ciddi INP/TBT kazancı sağlar.

### 0.2 Heuristikler
- **Sinyaller**: son 7 gün **CTR yüksek** rotalar (admin → analytics), segment (Part 25), cihaz (m/d), network (Save-Data/RTT) → sadece uygun koşullarda çalıştır.
- **Güvenlik**: sadece **aynı origin**; kişisel/ticari gizli admin rotaları hariç.
- **CMP**: rıza yoksa reklam/analytics prefetch yok.

### 0.3 Uygulama (RSC – layout’a eklenen Speculation Rules)
**`FE: src/app/[locale]/layout.tsx`** (özet)
```tsx


export default async function LocaleLayout({ children }:{ children: React.ReactNode }){
 
  return (
    <html lang={lang}>
      <body>
       
        {children}
      </body>
    </html>
  );
}
```
**`FE: src/shared/perf/SpeculationRules.tsx`**
```tsx
// Server Component – Speculation Rules JSON üretir

```
> **Not**: Safari/Firefox desteklemiyorsa etkisiz. Eski tarayıcılar için **quicklink** alternatifi eklenebilir.

### 0.4 Edge‑header: Early Hints + Priority Hints
- 103 Early Hints: font/hero görsel preload (Part 19).  
- `<img fetchpriority="high">` + `rel=preload` kritik asset’ler.

### 0.5 Kabul
- INP p75 ve TTFB p95’de düşüş; sayfa geçişleri anlık; **error/noop** durumlarında geriye uyum.

---

## 1) Recommendations – Hybrid (Co‑visitation + Embedding + Signals)

### 1.1 Mimari
1) **Co‑visitation**: aynı oturumda ardışık görüntülenen içerik çiftleri (ClickHouse ile hızlı).  
2) **Semantic yakınlık**: Part 21 embedding vektörleri ile `kNN`.  
3) **Signals**: CTR/dwell (Part 20) ağırlığı.  
4) **Hybrid skor**: `0.5*sem + 0.3*covis + 0.2*signal`.

### 1.2 ClickHouse – Co‑visit sorgusu (örnek)
```sql
SELECT a.item_id AS seed, b.item_id AS rec, count() AS c
FROM events a
INNER JOIN events b ON a.session_id=b.session_id AND a.item_id!=b.item_id
WHERE a.name='project_view' AND b.name='project_view' AND a.ts>now()-INTERVAL 30 DAY
GROUP BY seed, rec
HAVING c>5
ORDER BY seed, c DESC
```
Sonuçlar `reco_covis` tablosuna yazılır.

### 1.3 BE – Rekomendasyon API
**`BE: src/http/routes/public.reco.ts`** (özet)
```ts
import { FastifyPluginAsync } from 'fastify';
import { hybridReco } from '@/reco/hybrid';
export const recoRoutes: FastifyPluginAsync = async (app)=>{
  app.get('/reco/:itemId', async (req)=>{
    const { itemId } = (req.params as any);
    return { items: await hybridReco(itemId) };
  });
};
```
**`BE: src/reco/hybrid.ts`**
```ts
export async function hybridReco(seed:string){
  const sem = await topSemantic(seed, 20); // embedding kNN
  const cov = await topCovis(seed, 20);    // co‑visit
  const sig = await topSignals(seed, 20);  // CTR/dwell ağırlığı
  // normalize 0..1 ve birleştir
  function norm(xs:{id:string,score:number}[]){
    const max = Math.max(1e-9, ...xs.map(x=>x.score));
    return new Map(xs.map(x=> [x.id, x.score/max]));
  }
  const M = [norm(sem), norm(cov), norm(sig)];
  const ids = new Set([...sem,...cov,...sig].map(x=>x.id));
  const out = [...ids].map(id=> ({ id, score: 0.5*(M[0].get(id)||0)+0.3*(M[1].get(id)||0)+0.2*(M[2].get(id)||0) }));
  return out.sort((a,b)=> b.score-a.score).slice(0,8);
}
```

### 1.4 FE – RSC Öneri Bileşeni
**`FE: src/shared/reco/Recommended.tsx`** (server)
```tsx

```

### 1.5 Kabul
- Öneriler 300ms altı; CTR ve dwell artışı raporda görünür; dil/tenant uyumlu.

---

## 2) Privacy Sandbox – Topics & Protected Audiences (Deney)

### 2.1 Topics API (tarayıcıya dayalı ilgi alanı)
**Gating**: Yalnız **rıza varsa** ve **desteklenen tarayıcı** ise; degrade: bağlamsal hedefleme.

**`FE: src/shared/ads/topics.ts`**
```ts

```

### 2.2 Protected Audiences (eski FLEDGE) – iskelet
- Reklam slotu doldurma yerine **deney**: A/A veya A/B varyant atama; kitle seçimi tarayıcı tarafında.
- BE’de **kitle çağrısı** kaydı analyticse gönderilir; rıza yoksa çalışmaz.

### 2.3 Uyum & Loglama
- CMP logları: hangi API’ler aktive edildi; EU/US ayrımı (Part 18 GPP/TCF).  
- Deneyler yalnız **public sayfalar** ve **yasal metin** güncelken.

### 2.4 Kabul
- Destekli tarayıcıda Topics array elde edilir (boş olabilir); Protected Audiences deneyi loglanır; rıza yoksa pasif.

---

## 3) App‑Shell & Island Hydration Stratejisi

### 3.1 Hedef
- SSR/RSC ile **ilk piksel** hızlı; yalnız etkileşimli adalara (island) minimal JS hidratasyonu.

### 3.2 Ada (island) tanımı
- `use client` bileşenleri **dinamik import** + `ssr:false` yerine **progressive**: SSR + küçük client ekleri.

**`FE: src/shared/islands/LocaleSwitcher.tsx`**
```tsx

```
**RSC kullanımı**
```tsx
// server
import dynamic from 'next/dynamic';
const LocaleSwitcher = dynamic(()=> import('@/shared/islands/LocaleSwitcher'), { ssr: true });
export default async function Navbar(){
  return <LocaleSwitcher current={'tr'} options={['tr','de','en']} />;
}
```

### 3.3 App‑Shell cache
- SW (Part 24) ile shell rotaları **stale‑while‑revalidate**; içerik bölümleri RSC fetch ile tazelenir.

### 3.4 CSS – kritik CSS inline
- styled‑components SSR ile critical CSS zaten inline (babel plugin). **Non‑critical** CSS late‑load.

### 3.5 Kabul
- JS yükü azalır; Lighthouse **TBT/INP** iyileşir; interaktif adalar dışında global JS yok.

---

## 4) Back‑Pressure & Degrade Modları

### 4.1 Göstergeler
- Queue derinliği (Redis), DB `Threads_connected`, CPU load, 5xx oranı, HLS segment gecikmesi.

### 4.2 BE – Degrade Controller
**`BE: src/http/plugins/degrade.ts`**
```ts
import type { FastifyPluginAsync } from 'fastify';
let MODE: 'normal'|'soft'|'hard' = 'normal';
export const getMode = ()=> MODE;
export const degrade: FastifyPluginAsync = async (app) => {
  app.get('/__ops/degrade', async ()=> ({ mode: MODE }));
  app.post('/__ops/degrade', { preHandler: app.auth }, async (req)=> { MODE = (req.body as any).mode; return { ok:true, mode: MODE }; });
  app.addHook('preHandler', (req, rep, done)=>{
    if (MODE==='soft' && req.url.startsWith('/public/search')) rep.header('Cache-Control','public, s-maxage=120');
    if (MODE==='hard' && req.url.startsWith('/public/search')) return rep.code(503).send({ error:'temporarily_unavailable' });
    done();
  });
};
```

### 4.3 FE – Mode‑aware UI
- `soft`: görsel kalite `q_auto:eco`, animasyonlar kapalı, video autoplay yok.  
- `hard`: ağır bloklar gizli; yalnız kritik içerik.

### 4.4 Otomasyon
- Prometheus alert → GitHub Action (Part 25) → `POST /__ops/degrade` (soft) → gerekirse rollback.

### 4.5 Kabul
- Yük artışında sistem kademeli degrade olur; 5xx artışı durur; kullanıcı deneyimi kontrollü düşer.

---

## 5) Kabul Kriterleri (Part 26)
- Speculation Rules çalışır; A/B’de geçiş süresi düşer, INP iyileşir.  
- Hybrid öneri API’si 8 öğe döndürür; tıklanma oranı artar.  
- Privacy Sandbox deneyi rıza‑gated; Topics alınırsa loglanır, yoksa sessiz düşer.  
- App‑Shell & island yaklaşımı ile JS boyutu azalır, SSR korunur.  
- Degrade Controller ile modlar elle/otomatik değiştirilebilir; kullanıcıya bilgilendirme bandı gösterilir.

---

## 6) Sonraki Parça (Part 27)
- **Speculation 2.0**: kullanıcı akışı simülasyonu → önceden render rotaları  
- **Reco**: kişiselleştirilmiş e‑posta/WhatsApp tetikleyici (admin onaylı)  
- **Privacy**: GPP vendor‑list yönetimi ve log raporları  
- **App‑Shell**: route‑level streaming sınırları + skeleton stratejisi  
- **Resilience**: HLS multi‑origin ve otomatik encoder failover

