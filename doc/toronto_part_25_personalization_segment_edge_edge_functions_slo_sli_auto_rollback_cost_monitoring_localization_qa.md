# Part 25 – Personalization (Segment + Edge), Edge Functions, SLO/SLI + Auto Rollback, Cost Monitoring, Localization QA

Bu parçada: **kişiselleştirme altyapısı** (segment + edge hints), **edge functions** (Vercel/CF), **SLO/SLI ve hata bütçesi** ile otomatik rollback, **maliyet izleme** ve **lokalizasyon QA** otomasyonu ekliyoruz.

> FE: Next 15 (RSC/SSR/SSG/ISR), styled‑components (tema: `ensotekTheme`).  
> BE: Fastify + TS + Drizzle + MariaDB.  
> Edge: Next Middleware (Vercel) & Cloudflare Workers.  
> Observability: Prometheus + Grafana (Part 18), RUM (INP) (Part 17/18).  
> Data: ClickHouse/BQ (Part 21), dbt (Part 22).

---

## 0) Personalization – Segment Motoru (Edge Hints + Cookie)

### 0.1 Hedef & Sinyaller
- **Dil**: `Accept-Language`, kullanıcı seçimi, `X-Tenant-Locale`.  
- **Lokasyon**: GeoIP (ülke/kıta).  
- **Cihaz**: `User-Agent` (mobile/desktop).  
- **Kanal**: `utm_*`, referer.  
- **Davranış**: ilk ziyaret/geri dönen, son ziyaret tarihi.  
- **Rıza**: CMP (TCF 2.2/GPP) → reklam/analytics varyantlarını kısıtla (Part 17–18).

### 0.2 Şema – Segment Tanımları
**`BE: src/db/schema.personalization.ts`**
```ts
import { mysqlTable, varchar, json, tinyint, datetime } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
export const segments = mysqlTable('segments', {
  key: varchar('key', { length: 48 }).primaryKey(), // tr-enterprise|de-retail|first-visit|returning
  name: varchar('name', { length: 96 }).notNull(),
  active: tinyint('active').notNull().default(1),
  conditions: json('conditions'), // { country:['DE','TR'], device:'mobile', utm:{source:'google'}, lang:['tr'], returning:true }
  payload: json('payload'), // UI ipuçları: { cta:'Get Offer', hero:'...' }
  updatedAt: datetime('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});
```

### 0.3 Edge Segment Ataması (Next Middleware)
**`FE: src/middleware.ts`**
```ts

```

### 0.4 RSC – Segment Kullanan Server Component
**`FE: src/shared/personalization/getSegment.ts`**
```ts

```

### 0.5 Admin – Segment Yönetimi (özet)
- `/admin/personalization/segments`: koşul builder (ülke, cihaz, dil, UTM), payload editörü (hero/cta/metin).  
- “Preview as…”: seçilen seg ile siteyi aç (signed preview link).

### 0.6 Kabul
- İlk ziyarette middleware cookie atar; RSC bileşenleri seg’e göre uyarlanır.  
- Edge cache `Vary` başlıkları ile güvenli; CMP reddinde reklam blokları yüklenmez.

---

## 1) Edge Functions – Vercel & Cloudflare

### 1.1 Vercel Edge Runtime Örneği (öneri API)
**`FE: src/app/api/edge/reco/route.ts`**
```ts

```

### 1.2 Cloudflare Worker (alternatif) – Early Hints + Geo
**`cloudflare/worker.ts`** (özet)
```ts
export default { async fetch(req: Request, env: any, ctx: any){
  const country = req.headers.get('CF-IPCountry')||'UN';
  const hints = new Headers();
  hints.append('Link','</fonts/Inter.woff2>; rel=preload; as=font; crossorigin');
  ctx.passThroughOnException();
  return new Response('OK', { status:103, headers:hints }); // Early Hints
} };
```

### 1.3 Kabul
- Edge API 60s içinde revalidate olur; ülke/dile göre öneriler döner.  
- CF Worker 103 Early Hints ile kritik kaynak preload eder.

---

## 2) SLO/SLI + Hata Bütçesi & Otomatik Rollback

### 2.1 Hedef SLO’lar
- **Web**: p95 TTFB < 400ms (SSR), p75 INP < 200ms, error rate < %1.  
- **API**: p95 latency < 300ms, availability ≥ 99.9%.  
- **Form**: başarısızlık oranı < %0.5.

### 2.2 Prometheus Kayıt Kuralları (örnek)
**`prom/rules/sli.rules.yml`**
```yaml
groups:
- name: slo
  rules:
  - record: api:rate:errors
    expr: sum(rate(http_requests_total{status=~"5.."}[5m]))
  - record: api:rate:all
    expr: sum(rate(http_requests_total[5m]))
  - record: api:error_ratio_5m
    expr: api:rate:errors / api:rate:all
  - record: web:ttfb_p95
    expr: histogram_quantile(0.95, sum(rate(http_server_timing_ms_bucket{name="app"}[5m])) by (le))
```

### 2.3 Burn‑Rate Alert (çok pencereli)
**`prom/alerts/slo.alerts.yml`**
```yaml
groups:
- name: error-budget
  rules:
  - alert: HighErrorBurn
    expr: (api:error_ratio_5m > 0.02 and api:error_ratio_5m[1h]) or (api:error_ratio_5m > 0.05 and api:error_ratio_5m[10m])
    for: 10m
    labels: { severity: critical }
    annotations: { summary: "Error budget burning fast" }
```

### 2.4 CI/CD – Otomatik Rollback (Part 18 canary ile)
**`.github/workflows/guard.yml`** (özet)
```yaml
on: [workflow_dispatch]
jobs:
  guard:
    runs-on: ubuntu-latest
    steps:
      - name: Query metrics
        run: |
          ERR=$(curl -s "$PROM/api/v1/query?query=api:error_ratio_5m" | jq '.data.result[0].value[1]' )
          if (( $(echo "$ERR > 0.05" | bc -l) )); then echo "ROLLBACK=1" >> $GITHUB_ENV; fi
      - name: Rollback if bad
        if: env.ROLLBACK == '1'
        run: ssh user@srv 'sudo bash /opt/toronto/scripts/rollback-to-blue.sh'
```
**`rollback-to-blue.sh`**: Nginx upstream default’u **blue** yap, canary %0; PM2 reload.

### 2.5 Kabul
- Hata oranı eşiği aşınca pipeline rollback tetikler; swap 1 dakikada tamamlanır.  
- SLO panelleri Grafana’da hazır.

---

## 3) Cost Monitoring – CDN/DB/Queue/Media

### 3.1 Toplayıcı Script (Node)
**`ops/costs/collect.ts`** (özet)
```ts
import fetch from 'node-fetch';
import { writeFileSync } from 'node:fs';
async function cloudflare(){ /* usage, egress GB, requests */ }
async function cloudinary(){ /* transformations, bandwidth */ }
async function maria(){ /* exporter metrics */ }
async function redis(){ /* queue depth → iş/s */ }
(async()=>{
  const t = Date.now();
  const data = { cf: await cloudflare(), cld: await cloudinary(), db: await maria(), rq: await redis(), ts:t };
  writeFileSync('/tmp/costs.json', JSON.stringify(data));
})();
```

### 3.2 Tahmin & Bütçe Uyarısı
**`ops/costs/forecast.ts`**
```ts
import data from '/tmp/costs.json';
const budget = { month: { cf: 80, cld: 120, db: 60, total: 300 } };
function trend(cur:number, day:number){ const days = new Date().getDate(); return (cur/days)*30; }
const over = [] as string[];
if (trend(data.cf.usd, data.day) > budget.month.cf) over.push('Cloudflare');
if (trend(data.cld.usd, data.day) > budget.month.cld) over.push('Cloudinary');
if (over.length) notifySlack('Budget risk: '+over.join(', '));
```
**Slack**: Incoming Webhook.  
**CI**: `schedule: daily` çalıştır; çıktıyı ClickHouse’a yaz (time‑series).

### 3.3 Kabul
- Günlük rapor Slack’e düşer; aşım riski olduğunda uyarır; aylık toplam sapması ±%10 içinde tahminlenir.

---

## 4) Localization QA – Görsel + Hreflang Doğrulayıcı

### 4.1 Sayfa Kapsamı & Eksik Çeviri Linter
**`scripts/i18n/check-keys.ts`**
```ts
import fs from 'node:fs';
const langs = ['tr','de','en'];
const base = JSON.parse(fs.readFileSync('src/i18n/en.json','utf8'));
for (const l of langs){
  const j = JSON.parse(fs.readFileSync(`src/i18n/${l}.json`,'utf8'));
  const missing = Object.keys(base).filter(k=> j[k]===undefined);
  if (missing.length) { console.error(l+' missing: '+missing.join(',')); process.exitCode = 1; }
}
```

### 4.2 Playwright Görsel Test (per‑locale)
**`tests/visual.i18n.spec.ts`**
```ts
import { test, expect } from '@playwright/test';
const LOCALES = ['tr','de','en'];
const PAGES = ['/', '/projects', '/services', '/ads', '/contact'];
for (const L of LOCALES){
  for (const P of PAGES){
    test(`${L} ${P} visual`, async ({ page }) => {
      await page.goto(`http://localhost:3000/${L}${P}`);
      await expect(page).toHaveScreenshot(`${L}${P.replace(/\//g,'_')}.png`, { maxDiffPixelRatio: 0.01 });
    });
  }
}
```

### 4.3 Hreflang/Canonical Testi
**`tests/seo.hreflang.spec.ts`**
```ts

```

### 4.4 Tipografi Taşması (Overflow) Kontrolü
**`tests/ux.overflow.spec.ts`**
```ts

```

### 4.5 Kabul
- Tüm dillerde görsel diffs stabil; eksik çeviri yok; hreflang/canonical doğru; kritik bileşenlerde overflow yok.

---

## 5) Kabul Kriterleri (Part 25)
- Segment cookie edge’te atanır, RSC’da güvenle kullanılır; `Vary` başlıkları doğru.  
- Edge API/Worker örnekleri çalışır ve cache/geo uyumlu.  
- Prometheus SLI/SLO panelleri ve burn‑rate alert’leri devrede; yüksek hata oranında otomatik rollback yapar.  
- Maliyet toplama/tahmin script’leri günlük çalışır, Slack uyarısı üretir.  
- Lokalizasyon QA: görsel test, hreflang doğrulama, i18n linter ve overflow testleri yeşil.

---

## 6) Sonraki Parça (Part 26)
- **Zeki CDN Prefetch**: kullanıcı segmentine göre rotaları/asset’leri önceden getir (Quicklink/Speculation Rules)
- **Recommendations**: sinyaller + embedding tabanlı ürün/hizmet önerileri (re‑rank sonrası)  
- **Privacy Sandbox**: Protected Audiences/Topics (reklam) deneyleri  
- **App Shell**: RSC + Island hydration için ayrı bundle stratejisi  
- **Back‑pressure**: queue/DB sınırları için otomatik degrade modları

