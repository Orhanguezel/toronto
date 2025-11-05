# Part 22 – CMS Preview 2.0 (Provider‑Native), Hybrid Semantic Search (BM25 + Dense/HNSW), Live Ops, A11y (Motion/Color), dbt + Dashboards

Bu parça; editoryal ekiplerin CMS içinden anlık **taslak önizleme** yapmasını güvenli şekilde sağlar, aramayı **hibrit** (BM25 + dense) yapıya taşır, canlı yayın için **operasyon** araçlarını ekler, **hareket azaltma/renk körlüğü** duyarlı bir arayüz sağlar ve veri katmanını **dbt + dashboard** ile olgunlaştırır.

> FE: Next.js 15 (RSC/SSR/SSG/ISR), styled‑components (tema: `ensotekTheme`).  
> BE: Fastify + TS + Drizzle + MariaDB.  
> Search: Meili/Algolia + (opsiyonel) Qdrant/Weaviate (HNSW).  
> Media: Cloudinary.  
> Data: ClickHouse/BigQuery (Part 21) + dbt.

---

## 0) CMS Preview 2.0 – Provider‑Native Draft

### 0.1 Amaç
- CMS (Contentful/Strapi/Dato) içindeki **taslak** içeriği, yayın akışına girmeden direkt site üzerinde render etmek.
- Önizleme linki **zaman kısıtlı**, **imzalı** ve **cache‑bypass** olmalı; RSC/SSR ile SEO etkilenmez (noindex).

### 0.2 İmza ve Geçerlilik
**`BE: src/http/routes/preview.sign.ts`** (admin → imzalı link üretir)
```ts
import { FastifyPluginAsync } from 'fastify';
import crypto from 'node:crypto';

export const previewSignRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', app.auth);
  app.post('/admin/preview/sign', async (req) => {
    const { type, slug, locale, ttlSec = 600 } = req.body as any;
    const exp = Math.floor(Date.now()/1000) + Number(ttlSec);
    const payload = `${type}:${slug}:${locale}:${exp}`;
    const sig = crypto.createHmac('sha256', process.env.PREVIEW_SECRET!).update(payload).digest('hex');
    return { url: `/api/preview/fetch?type=${type}&slug=${slug}&locale=${locale}&exp=${exp}&sig=${sig}` };
  });
};
```

**`FE: src/app/api/preview/fetch/route.ts`** (provider‑native fetch + sanitize)
```ts

```

**`FE: src/app/[locale]/preview/[type]/[slug]/page.tsx`** (RSC SSR, cache yok)
```tsx

```
> **Not**: Admin UI, “Önizleme” tuşunda `/admin/preview/sign` çağırır, dönen URL’e yönlendirir. RSC tarafında **draftMode** gerekmeden provider taslağı render eder.

### 0.3 Sanitization
- Strapi/Contentful HTML alanları için **DOMPurify** (server‑side) uygulanır.
- Script/style inline engeli; izinli embed listesi (YouTube/Vimeo) beyaz liste.

### 0.4 Kabul
- İmzalı link 10 dk geçerli; süresi dolunca 403.
- Önizleme sayfaları `noindex`; cache yok.
- Admin’den tek tuşla önizleme.

---

## 1) Hybrid Semantic Search – BM25 + Dense/HNSW

### 1.1 Yaklaşım
- **Aşama 1 (recall)**: Meili/Algolia’dan BM25 ilk 200 sonuç.
- **Aşama 2 (rerank)**: OpenAI embedding (Part 21) ile semantik skor + **sinyal (CTR/dwell)** karışımı.
- **Opsiyonel ANN (HNSW)**: Qdrant/Weaviate’de vektör uzayı kurarak **dense‑first recall** ve BM25 ile **fusion**.

### 1.2 Fusion Skoru
```ts
// 0..1 normalize edilmiş skorlar: bm25N, denseN, signalN
const score = 0.50 * denseN + 0.35 * bm25N + 0.15 * signalN; // locale/tenant boost çarpanı ayrıca uygulanır
```

### 1.3 Qdrant Entegrasyon (opsiyonel)
**`BE: src/search/qdrant.ts`** (özet)
```ts
export async function upsertVector(id:string, vector:number[], payload:any){ /* qdrant upsert */ }
export async function searchVector(queryVec:number[], topK=50, filter?:any){ /* qdrant search */ }
```
Index ETL: içerik değiştikçe embedding üret → Qdrant upsert. Aramada: **dense 50** + Meili **50** → fusion + rerank.

### 1.4 Tipografi/Çok Dilli
- TR/DE karakter normalizasyonu; eş anlamlılar (Part 14) korunur.

### 1.5 Kabul
- CTR ve dwell artışı izlenir; **p90 response < 300ms** (saf BM25) ve **< 700ms** (fusion) hedefleri.

---

## 2) Live Ops – İzleyici Sayaçları, Chat/Q&A, Outage Runbook

### 2.1 İzleyici Sayaçları
- **Server‑Sent Events (SSE)**: `/live/stats` endpoint’i anlık `viewers`, `bitrate`, `lag`. Nginx `proxy_buffering off`.
- Player mount → `POST /live/view` (join), unmount/visibilitychange → `POST /live/leave` (leave). TTL ile düşen bağlantılar temizlenir.

### 2.2 Chat/Q&A (opsiyonel)
- **WebSocket** kanal: `room=streamId`.
- Mod tools: timeout/ban, yavaş mod (slowmode), link filtreleme.
- **Persistence**: son 100 mesaj cache (Redis) + arşiv (MariaDB/ClickHouse).

### 2.3 Outage Runbook (özet)
1) **Ingest down** → encoder fallback profile + yeniden bağlan (OBS);  
2) **Playback stall** → CDN sağlığı, origin status; segment süresi + playlist TTL kontrol;  
3) **High latency** → LL profile’ı düşür (HLS part duration ↑), DVR kapat;  
4) **Failover** → yedek publish key’e geç; site “yayın yeniden bağlanıyor” banner (feature flag) + otomatik retry.

### 2.4 Kabul
- Canlı sırasında izleyici sayacı ±1 doğrulukla güncellenir; chat moderasyonu çalışır; outage adımları dokümante.

---

## 3) A11y – Motion & Color

### 3.1 Prefers‑Reduced‑Motion
**`FE: src/shared/a11y/useReducedMotion.ts`**
```ts

```
Kullanım: carousel/hero animasyonlarında `if (reduced) disableAnimation()`.

### 3.2 Renk Körlüğü Simülasyonu (dev‑only)
- **Design review** sırasında: `html[data-sim="deuteranopia"]` sınıfı ile CSS filtreleri; Storybook’ta toggle.

**`.storybook/preview.ts`** (ek)
```ts

```

### 3.3 Kontrast & Token Guard
- Token lint: `contrast(text, bg) >= 4.5` değilse CI fail. (küçük metin)

### 3.4 Kabul
- Reduced motion açıkken tüm ağır animasyonlar devre dışı; Storybook simülasyonlarıyla kritik ekranlar okunur; kontrast testi geçer.

---

## 4) dbt + Dashboard (Looker/Metabase)

### 4.1 dbt Projeleri
**Dizin**: `/analytics/dbt/toronto`  
**sources**: `events_raw` (ClickHouse/BQ), `experiments`, `assignments`  
**staging**: `stg_events`, `stg_ab`  
**marts**: `mrt_funnel_daily`, `mrt_ab_summary`

**`models/staging/stg_events.sql`**
```sql
select
  id,
  name,
  path,
  coalesce(locale, 'und') as locale,
  tenant,
  cast(created_at as timestamp) as ts,
  json_extract_scalar(props_json,'$.q') as q,
  json_extract_scalar(props_json,'$.itemId') as item_id
from {{ source('raw','events_raw') }}
```

**`models/marts/mrt_funnel_daily.sql`**
```sql
with pv as (
  select date(ts) d, countif(name='page_view') pv from {{ ref('stg_events') }} group by 1
), sr as (
  select date(ts) d, countif(name='search') sr from {{ ref('stg_events') }} group by 1
), pr as (
  select date(ts) d, countif(name='project_view') pr from {{ ref('stg_events') }} group by 1
), ld as (
  select date(ts) d, countif(name='lead') ld from {{ ref('stg_events') }} group by 1
)
select pv.d, pv.pv, sr.sr, pr.pr, ld.ld from pv
left join sr using(d)
left join pr using(d)
left join ld using(d)
```

### 4.2 Dashboard Şablonları
- **Funnel**: PV→Search→Project→Lead dönüşüm oranları, dil/tenant filtreleri.
- **A/B**: varyant bazlı CR ve credible interval (Part 18) görselleri.

### 4.3 Zamanlama
- dbt Cloud/cron: her saat. BQ/CH deposuna göre adapter seçin.

### 4.4 Kabul
- dbt modelleri çalışır; dashboard’lar veri gösterir; PR’da şema değişikliği testleri koşar.

---

## 5) Kabul Kriterleri (Part 22)
- Provider‑native draft preview imzalı ve süreli; sanitize uygulanır; noindex; cache yok.
- Hybrid arama fusion’ı çalışır; ANN (Qdrant/Weaviate) opsiyonu entegre; p90 hedefleri içinde.
- Live Ops: canlı sayaç/WS chat işler; outage runbook tamam.
- A11y: reduced‑motion desteği ve color‑vision simülasyonu; kontrast guard CI’da aktif.
- dbt: staging → marts akışı kurulu; funnel ve A/B dashboard’ları hazır.

---

## 6) Sonraki Parça (Part 23)
- **CMS Preview**: iki yönlü edit (inline comments) + content diff
- **Search**: sorgu anlama (ner‑label, intent), otomatık synonym öğrenimi
- **Live**: otomatik re‑ingest ve multi‑CDN; chat için mod AI (toxic/off‑topic)
- **A11y**: klavye tuzak tespiti otomasyonu (playwright)
- **Data**: Argo Workflows veya Airflow ile çok aşamalı ETL orkestrasyonu

