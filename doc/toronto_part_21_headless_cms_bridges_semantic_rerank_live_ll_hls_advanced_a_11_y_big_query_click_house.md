# Part 21 – Headless CMS Köprüleri, Semantic Rerank (OpenAI), Canlı Yayın (LL‑HLS + DVR), Gelişmiş Erişilebilirlik, BigQuery/ClickHouse Analytics

Bu bölümde içerik kaynaklarını headless CMS’lerle köprüleyip tek şemaya normalize ediyor, aramayı **semantic rerank** ile güçlendiriyor, canlı yayın (LL‑HLS + DVR) akışını ekliyor, erişilebilirliği (screen‑reader akışları, focus‑trap) seviyelendiriyor ve olay verilerini **BigQuery/ClickHouse**’a akıtıyoruz.

> FE: Next 15 (RSC + SSR/SSG/ISR), styled‑components (tema: `ensotekTheme`). BE: Fastify + TS + Drizzle + MariaDB. Search: Meili/Algolia (+ signals). Media: Cloudinary. Queue: BullMQ.

---

## 0) Headless CMS Köprüleri (Contentful / Strapi / DatoCMS)

### 0.1 Hedef
- Figma tasarıma sadık UI’ı bozmadan **çoklu CMS kaynağı** → **tek içerik şeması**.
- i18n (locale) ve multi‑tenant (X‑Tenant) ile kalıcı eşleme; webhook ile anında güncelleme.

### 0.2 Şema (normalize katmanı)
**`BE: src/db/schema.cms.bridge.ts`**
```ts
import { mysqlTable, varchar, text, json, datetime, int } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const cmsItems = mysqlTable('cms_items', {
  id: varchar('id', { length: 36 }).primaryKey(),
  provider: varchar('provider', { length: 16 }).notNull(), // contentful|strapi|dato
  extId: varchar('ext_id', { length: 191 }).notNull(),
  type: varchar('type', { length: 32 }).notNull(), // page|project|service|post
  slug: varchar('slug', { length: 191 }).notNull(),
  locale: varchar('locale', { length: 8 }).notNull(),
  tenant: varchar('tenant', { length: 32 }).notNull().default('default'),
  title: varchar('title', { length: 191 }),
  body: text('body'),      // HTML/MD (sanitize edilmiş)
  seo: json('seo'),        // {title,desc,og...}
  media: json('media'),    // {coverId, gallery[], videoId}
  checksum: varchar('checksum', { length: 64 }), // değişikliği anlamak için
  updatedAt: datetime('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});
```

### 0.3 Bridge Arayüzü
**`BE: src/cms/bridge.ts`**
```ts
export type RawItem = any;
export type Normalized = { type:string; slug:string; locale:string; title?:string; body?:string; seo?:any; media?:any };
export interface CMSBridge {
  pullById(id: string, opts?: { locale?: string }): Promise<RawItem|null>;
  normalize(raw: RawItem, tenant: string): Normalized;
}
```

**Contentful örneği**: `ContentfulBridge implements CMSBridge` (CDA token ile fetch); **StrapiBridge** (REST `/api/*?populate=*`), **DatoBridge** (GraphQL).

### 0.4 Webhook → Sync
**`BE: src/http/routes/cms.webhooks.ts`** (özet)
```ts
import { FastifyPluginAsync } from 'fastify';
import crypto from 'node:crypto';
import { upsertNormalized } from '@/cms/sync';

function verifyHmac(raw: string, sig: string, secret: string){
  const mac = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(sig));
}

export const cmsWebhookRoutes: FastifyPluginAsync = async (app) => {
  app.post('/webhooks/contentful', { config:{ rawBody:true } }, async (req, rep) => {
    const raw = (req as any).rawBody as Buffer; const sig = String(req.headers['x-contentful-signature']||'');
    if (!verifyHmac(raw.toString('utf8'), sig, process.env.CF_WEBHOOK_SECRET!)) return rep.code(401).send();
    const body = JSON.parse(raw.toString('utf8'));
    await upsertNormalized('contentful', body);
    return { ok:true };
  });
  app.post('/webhooks/strapi', { config:{ rawBody:true } }, async (req, rep) => {
    const raw = (req as any).rawBody as Buffer; const sig = String(req.headers['x-strapi-signature']||'');
    if (!verifyHmac(raw.toString('utf8'), sig, process.env.STRAPI_WEBHOOK_SECRET!)) return rep.code(401).send();
    const body = JSON.parse(raw.toString('utf8'));
    await upsertNormalized('strapi', body);
    return { ok:true };
  });
};
```

**`BE: src/cms/sync.ts`** (normalize & upsert)
```ts
import { db } from '@/core/db';
import { cmsItems } from '@/db/schema.cms.bridge';
import { ContentfulBridge, StrapiBridge, DatoBridge } from './providers';

const bridges = { contentful: new ContentfulBridge(), strapi: new StrapiBridge(), dato: new DatoBridge() } as const;

export async function upsertNormalized(provider: keyof typeof bridges, payload: any){
  const raw = await bridges[provider].pullById(/* extId */ bridges[provider].extractId(payload), { locale: bridges[provider].extractLocale(payload) });
  if (!raw) return;
  const n = bridges[provider].normalize(raw, bridges[provider].inferTenant(payload));
  const checksum = await computeChecksum(n);
  await db.insert(cmsItems).values({ id: crypto.randomUUID(), provider, extId: bridges[provider].extractId(payload), checksum, ...n }).onDuplicateKeyUpdate({ set: { checksum, ...n } });
}
```

### 0.5 RSC Fetch & Revalidate
**`FE: src/app/[locale]/(public)/projects/[slug]/page.tsx`**
```tsx

export default async function Project({ params:{ locale, slug } }:{ params:{ locale:string; slug:string } }){
  
  return  // SSR (RSC) – SEO friendly
}
```
**Invalidation**: Webhook→`revalidateTag('cms:project:<slug>:<locale>')`.

---

## 1) Semantic Rerank (OpenAI) – Algolia/Meili Sonrası Yeniden Sıralama

### 1.1 Strateji
1) Hızlı **ilk 50** sonuç (Meili/Algolia).  
2) Her sonucun `title+summary+tags` metninden **embedding** (cache) – tablo: `search_embeddings(item_id, provider, vector)`.
3) Sorgu için embedding üret → kosinüs benzerliği ile skorla.  
4) **Sinyal ayarı**: CTR/dwell (Part 20) ile ağırlık karışımı.  
5) Locale/tenant boost.

### 1.2 Env
```
OPENAI_API_KEY=...
EMBED_MODEL=text-embedding-3-small
```

### 1.3 Embedding & Rerank
**`BE: src/search/semantic.ts`**
```ts
import { db } from '@/core/db';
import { searchEmbeddings } from '@/db/schema.search.emb';
import { cosineSim } from '@/utils/math';

async function embed(text: string){
  const r = await fetch('https://api.openai.com/v1/embeddings', { method:'POST', headers:{ 'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type':'application/json' }, body: JSON.stringify({ input: text, model: process.env.EMBED_MODEL||'text-embedding-3-small' }) }).then(r=>r.json());
  return r.data[0].embedding as number[];
}

export async function rerank(query: string, locale: string, tenant: string, candidates: Array<{ id:string; title:string; summary?:string; boost?:number }>) {
  const qv = await embed(query);
  // fetch embeddings from cache
  const rows = await db.select().from(searchEmbeddings).where((r:any)=> r.itemId.in(candidates.map(c=>c.id)));
  const vecMap = new Map(rows.map((r:any)=> [r.itemId, JSON.parse(r.vector)]));
  const scored = candidates.map(c=>{
    const v = vecMap.get(c.id); if (!v) return { ...c, score: 0 };
    const sem = cosineSim(qv, v);
    const ctrAdj = typeof c.boost==='number'? c.boost : 1; // sinyal karışımı: CTR/dwell normalize
    const localeAdj = 1.1; // örnek: aynı locale ise 1.1, değilse 0.95
    return { ...c, score: sem * ctrAdj * localeAdj };
  }).sort((a,b)=> b.score - a.score);
  return scored;
}
```

### 1.4 Embedding Cache (ETL)
- Worker: yeni/degisen içerik için embedding üretir ve `search_embeddings` tablosuna yazar.
- Hata olursa fallback: yalnız Meili/Algolia sırası.

### 1.5 Kabul
- Rerank sonrası CTR ↑; Türkçe/Almanca eş anlamlılarda isabet artar (Part 14 synonyms + semantic kombo).

---

## 2) Canlı Yayın – LL‑HLS + DVR

### 2.1 Yayın Topolojisi
- **Ingest**: RTMP → (Provider: Cloudinary Live / Mux / Cloudflare Stream).  
- **Playback**: LL‑HLS playlist (`.m3u8`) + **DVR** (son N dakika geri sarma).  
- **Status**: webhook ile `is_live` toggle + FE revalidate.

### 2.2 Admin Akışı
- `/admin/live` sayfası: `Start/Stop`, stream key, anlık izleyici, latency.  
- Webhook endpoint: `POST /webhooks/live { status:'started'|'ended', playbackUrl }` → DB güncelle, cache invalidate.

### 2.3 Player (hls.js – lowLatencyMode)
**`FE: src/shared/ui/media/LivePlayer.tsx`**
```tsx
'use client';
import { useEffect, useRef } from 'react';
export default function LivePlayer({ src, dvr=true }:{ src:string; dvr?:boolean }){
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(()=>{
    const el = ref.current!;
    const setup = async ()=>{
      const canNative = el.canPlayType('application/vnd.apple.mpegurl');
      if (canNative) return; // Safari
      const { default: Hls } = await import('hls.js');
      const hls = new Hls({ lowLatencyMode: true, backBufferLength: 30, liveDurationInfinity: !dvr });
      hls.loadSource(src); hls.attachMedia(el);
    }; setup();
  },[src,dvr]);
  return <video ref={ref} controls playsInline style={{ width:'100%', borderRadius:12 }} />;
}
```

### 2.4 SEO – BroadcastEvent JSON‑LD
**`FE: src/shared/seo/LiveJsonLd.tsx`**
```tsx
export default function LiveJsonLd({ name, startDate, endDate, url }:{ name:string; startDate:string; endDate?:string; url:string }){
  const json = { '@context':'https://schema.org', '@type':'BroadcastEvent', isLiveBroadcast:true, name, startDate, endDate, publication:{ '@type':'BroadcastService', name:'Toronto Live' }, url };
  return <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}
```

### 2.5 Kabul
- LL‑HLS 3–5 sn hedef; DVR açıkken geri sarma çalışır; canlı bittiğinde VOD’a düşüş.

---

## 3) Gelişmiş Erişilebilirlik (A11y)

### 3.1 Screen‑Reader Akışları
- **Navbar**: `nav` landmark + `aria-current` aktif link.  
- **Arama Önerileri**: `role="combobox"`, `aria-expanded`, `aria-controls`, liste `role="listbox"`, öğeler `role="option"` + `aria-selected`.  
- **Carousel**: `aria-roledescription="carousel"`, `aria-live="polite"`, roving tabindex.  
- **Dil seçici**: `role="listbox"` + `aria-activedescendant`.  
- **Modals**: `role="dialog"`, `aria-modal="true"`, focus‑trap, Escape ile kapanma.

### 3.2 Focus‑Trap Yardımcısı
**`FE: src/shared/a11y/focusTrap.ts`**
```ts

```

### 3.3 Live Regions
- Dinamik içerik (arama sonuç sayacı, form gönderim sonucu) → `aria-live="polite"` / `assertive`.

### 3.4 Testler
- Playwright + Axe: **Home, Projects, Contact, Admin**
- Odak görünürlüğü, kontrast, landmark hataları sıfır; klavye ile tam gezilebilirlik.

---

## 4) BigQuery / ClickHouse Analytics Pipeline

### 4.1 ClickHouse – DDL ve Insert
**DDL**: `MergeTree` + günlük partisyon; JSON `props` için `JSONExtract*` ile türetilmiş alanlar.
```sql
CREATE TABLE IF NOT EXISTS events (
  day Date DEFAULT toDate(now()),
  id String,
  name LowCardinality(String),
  path String,
  locale FixedString(5),
  tenant LowCardinality(String),
  created_at DateTime DEFAULT now(),
  props_json String
) ENGINE = MergeTree PARTITION BY day ORDER BY (name, created_at);
```
**Insert (BE)**: HTTP API ile toplu yazma (5s batch) – worker `flushEventsToCH`.

### 4.2 BigQuery – Şema ve Load
- Dataset: `toronto.events`, Partition: `TIMESTAMP_TRUNC(created_at, DAY)`.
- BE günlük NDJSON export → GCS → BQ load job (`bq load --source_format=NEWLINE_DELIMITED_JSON`).

### 4.3 Örnek Sorgular
- **Funnel**: landing→search→project_view→lead (7 gün)
- **A/B join**: `events` × `experiment_assignments` ile varyant kırılımı CTR/CR.

### 4.4 Kabul
- ClickHouse’a 1–5 saniye gecikme ile veri düşer; BigQuery’de günlük raporlar üretilebilir.

---

## 5) Kabul Kriterleri (Part 21)
- CMS webhook → normalize → DB upsert → RSC sayfa invalidate akışı çalışır.
- Semantic rerank, ilk 50 sonucu yeniden sıralar; sinyal + locale boost uygulanır; OpenAI hatasında graceful fallback.
- Canlı yayın LL‑HLS + DVR oynar; SEO için BroadcastEvent JSON‑LD eklenir; admin start/stop akışı tamam.
- A11y: combobox, dialog, carousel, language switch akışları SR ile doğrulanır; focus‑trap ve live region’lar çalışır.
- Analytics: ClickHouse hızlı sorgu; BigQuery günlük raporlar; örnek funnel ve A/B join sorguları çalışır.

---

## 6) Sonraki Parça (Part 22)
- **CMS Preview 2.0**: provider‑native preview (draft tokens) ve iki yönlü senkron
- **Semantic Search**: hybrid (BM25 + dense) index; ANN (HNSW) katmanı
- **Live Ops**: izleyici sayaçları, chat/QA, yayın kesintisi runbook’u
- **A11y**: hareket azaltma (prefers‑reduced‑motion), renk körlüğü simülasyonu
- **Data**: dbt/Transform + Looker/Metabase dashboard şablonları

