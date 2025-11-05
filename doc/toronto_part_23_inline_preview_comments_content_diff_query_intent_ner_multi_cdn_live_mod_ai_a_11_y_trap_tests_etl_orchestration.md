# Part 23 – Inline Preview Comments & Content Diff, Query Intent/NER, Multi‑CDN Live & Mod‑AI, A11y Auto Trap Tests, ETL Orchestration (Argo/Airflow)

Bu parçada: **önizleme üzerinde satır‑içi yorumlar ve içerik diff**, arama tarafında **intent/NER** ile sorgu anlama, canlı yayın için **multi‑CDN + AI moderasyon**, **klavye tuzağı** otomatik testleri ve veri iş hatlarını **Argo/Airflow** ile orkestre ediyoruz.

> FE: Next 15 (RSC/SSR/SSG/ISR), styled‑components (tema: `ensotekTheme`).  
> BE: Fastify + TS + Drizzle + MariaDB.  
> Search: Meili/Algolia + semantic rerank (Part 21).  
> Live: Cloudinary/Mux/CF + hls.js.  
> Data: ClickHouse/BQ + dbt (Part 22).

---

## 0) CMS Preview – Inline Comments & Content Diff

### 0.1 Şema (yorum & işaretleme)
**`BE: src/db/schema.content.comments.ts`**
```ts
import { mysqlTable, varchar, text, json, datetime } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const contentComments = mysqlTable('content_comments', {
  id: varchar('id', { length: 36 }).primaryKey(),
  itemId: varchar('item_id', { length: 36 }).notNull(),
  version: varchar('version', { length: 16 }).notNull(), // taslak sürümü
  authorId: varchar('author_id', { length: 36 }).notNull(),
  body: text('body').notNull(),
  anchor: json('anchor'), // { css?: string, textQuote?: { exact, prefix?, suffix? } }
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});
```
> **Anchor**: `css` (öğe seçicisi) + `textQuote` (dom‑anchor‑text‑quote benzeri) — içerik değişse bile bağlamı bulmaya çalışır.

### 0.2 API
- `GET /admin/content/:id/comments?version=...`
- `POST /admin/content/:id/comments` → `{ version, body, anchor }`
- RBAC: author/editor/publisher/admin (Part 20) – herkes görebilir, silme yalnız admin.

### 0.3 FE – Preview Overlay
**`FE: src/shared/preview/InlineComments.tsx`** (özet)
```tsx

```
- **Pin** bileşeni hedef öğeye göre konumlanır; tıklayınca sağ panelde tartışma açılır.

### 0.4 Content Diff
- Basit: `diff‑match‑patch` veya `jsdiff` ile **yan‑yana** görünüm; değişiklik highlight.
- Admin UI: `/admin/content/:id/diff?from=v12&to=v13`.

### 0.5 Kabul
- Önizleme üzerinde yorum ekleme/okuma çalışır; yorumlar versiyona bağlıdır.
- Diff ekranı sürümler arası farklılıkları doğru işaretler.

---

## 1) Search – Query Intent & NER (Alan‑özgü)

### 1.1 Hedef
- Sorgudan **niyet** (intent) ve **varlıklar** (NER) çıkarıp indeks filtreleme/sıralamada kullanmak.

### 1.2 Şema (intent & ner izleri)
**`BE: src/db/schema.search.intent.ts`**
```ts
import { mysqlTable, varchar, json, datetime } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
export const searchIntents = mysqlTable('search_intents', {
  id: varchar('id', { length: 36 }).primaryKey(),
  q: varchar('q', { length: 191 }).notNull(),
  locale: varchar('locale', { length: 8 }),
  tenant: varchar('tenant', { length: 32 }),
  intent: varchar('intent', { length: 32 }), // browse|buy|info|contact|support
  entities: json('entities'), // { service?:string[], city?:string, priceRange?:[min,max], tag?:string[] }
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});
```

### 1.3 İnference – Hafif kural seti + opsiyonel LLM
**`BE: src/search/intent.ts`** (özet)
```ts
export function inferIntent(q: string){
  const s = q.toLowerCase();
  if (/fiyat|ücret|satın al|satilik|price|cost/.test(s)) return 'buy';
  if (/iletişim|contact|bize ulaş/.test(s)) return 'contact';
  if (/destek|support|hata|problem/.test(s)) return 'support';
  if (/nedir|nasıl|how|what/.test(s)) return 'info';
  return 'browse';
}
export function extractEntities(q:string){
  // domain sözlükleri: hizmet adları, şehirler, tag'ler
  return { service: matchServices(q), city: matchCities(q), tag: matchTags(q) };
}
```
> **Opsiyonel**: OpenAI mini sınıflandırma çağrısı → kural setinin üstüne; hata halinde sadece kurallar.

### 1.4 Kullanım
- Intent `buy` ise **satılık projeler** indeksine boost.
- `city` yakalanırsa filter ile şehir eşleşen içeriklere öncelik.
- Kaydedilen `searchIntents` ile kalite izlenir (admin rapor).

### 1.5 Kabul
- En az %80 doğru niyet sınıflaması (manuel örneklemle ölçülür);
- intent/NER bilgisi arama sonuçlarını görünür biçimde iyileştirir.

---

## 2) Live – Multi‑CDN + Moderation AI

### 2.1 Dağıtım Topolojisi
- **Primary CDN**: Cloudflare Stream/Cloudinary, **Secondary CDN**: Bunny/Backblaze.  
- Manifest fallback: player önce primary `.m3u8` dener; fail → secondary URL.

**`FE: src/shared/ui/media/useHlsFallback.ts`**
```ts

```

### 2.2 Chat Moderation Pipeline
**Kurallar**: kötü söz listesi + flood tespiti + link filtresi.  
**AI** (opsiyonel): OpenAI Moderation → `block|flag|allow`.

**`BE: src/live/moderation.ts`** (özet)
```ts
export async function moderate(text:string){
  if (hasBadWords(text) || isFlood(text)) return { action:'block', reason:'policy' };
  if (process.env.OPENAI_API_KEY){ /* call moderation */ }
  return { action:'allow' };
}
```
- WS katmanında mesaj yayından **önce** moderasyondan geçer; flag’ler mod paneline düşer.

### 2.3 Sağlık Denetimi
- Worker: her 30 sn `.m3u8` + örnek `.ts/.m4s` çek → gecikme/HTTP kodu logla.  
- `p95 fetch` > eşik ise **banner** (feature flag) + fallback CDN’e otomatik geçiş.

### 2.4 Kabul
- CDN kesintisinde player 1–2 sn içinde fallback’e geçer.  
- Moderasyon spam/küfürü engeller; hatalı pozitif oranı < %2.

---

## 3) A11y – Otomatik Klavye Tuzak Testleri

### 3.1 Playwright helper
**`tests/a11y.keyboard-trap.spec.ts`**
```ts

```
> Basit heuristik: fokus döngüye giriyorsa test fail olur; modallar açıldığında `focusTrap` helper (Part 21) devrededir.

### 3.2 Kabul
- Ana sayfa, liste, detay, iletişim, admin’de test yeşil.

---

## 4) ETL Orchestration – Argo/Airflow

### 4.1 Argo Workflows (K8s) – Örnek
**`k8s/argo/etl-workflow.yaml`**
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: toronto-etl-
spec:
  entrypoint: etl
  templates:
  - name: etl
    steps:
    - - name: export-events
        template: ch-export
    - - name: gcs-upload
        template: gcs-upload
    - - name: bq-load
        template: bq-load
    - - name: dbt-run
        template: dbt
  - name: ch-export
    container:
      image: clickhouse/clickhouse-server:latest
      command: ["bash","-lc"]
      args: ["clickhouse-client --query='SELECT * FROM events FORMAT JSONEachRow' > /tmp/events.ndjson"]
  - name: gcs-upload
    container:
      image: google/cloud-sdk:latest
      command: ["bash","-lc"]
      args: ["gsutil cp /tmp/events.ndjson gs://toronto-data/events/$(date +%F)/"]
  - name: bq-load
    container:
      image: google/cloud-sdk:latest
    args: ["bq load --source_format=NEWLINE_DELIMITED_JSON toronto.events gs://toronto-data/events/$(date +%F)/events.ndjson"]
  - name: dbt
    container:
      image: ghcr.io/dbt-labs/dbt-bigquery:latest
      command: ["dbt","run"]
```

### 4.2 Apache Airflow – DAG (alternatif)
**`dags/toronto_etl.py`**
```py
from airflow import DAG
from airflow.operators.bash import BashOperator
from datetime import datetime

with DAG('toronto_etl', start_date=datetime(2025,1,1), schedule='@hourly', catchup=False) as dag:
  export = BashOperator(task_id='export_ch', bash_command="clickhouse-client --query='SELECT * FROM events FORMAT JSONEachRow' > /tmp/events.ndjson")
  upload = BashOperator(task_id='upload_gcs', bash_command="gsutil cp /tmp/events.ndjson gs://toronto-data/events/{{ ds }}/")
  load = BashOperator(task_id='bq_load', bash_command="bq load --source_format=NEWLINE_DELIMITED_JSON toronto.events gs://toronto-data/events/{{ ds }}/events.ndjson")
  dbt = BashOperator(task_id='dbt_run', bash_command='dbt run')
  export >> upload >> load >> dbt
```

### 4.3 Kabul
- Saatlik ETL akışı uçtan uca çalışır; hatada adım bazlı retry; dbt modelleri güncellenir.

---

## 5) Kabul Kriterleri (Part 23)
- Preview üzerinde yorum/işaret pin’leri çalışır; sürüme bağlı; diff ekranı doğru.
- Intent/NER çıkarımı uygulanır; arama sonuç kalite metrikleri iyileşir (CTR/dwell ↑).
- Canlı yayın player’ı CDN arızasında fallback’e geçer; chat moderasyonu politika ihlallerini engeller.
- A11y klavye tuzak testi ana sayfalarda geçer.
- ETL orkestrasyonu (Argo veya Airflow) ile veri hattı düzenli çalışır.

---

## 6) Sonraki Parça (Part 24)
- **Admin SSO** (OIDC/SAML) + çok faktör
- **Tenant Faturalama**: plan/limit/overage ölçümleri
- **Plugin Marketplace**: modüler sayfa blokları (dynamic import)
- **Offline/Edge**: Service Worker + stale‑while‑revalidate + form queue
- **Compliance**: ISO27001/SoC2 hazırlık checklist’i

