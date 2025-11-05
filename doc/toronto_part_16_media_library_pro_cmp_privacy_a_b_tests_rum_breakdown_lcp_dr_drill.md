# Part 16 – Media Library Pro, CMP/Privacy, A/B Tests (Feature Flags), RUM Breakdown, LCP Optimization, DR Drill

Bu bölüm, prod kalitesini son kullanıcı deneyimi ve operasyon tarafında ileri seviyeye taşır:

- **Media Library Pro**: drag‑drop upload, multi-select, crop/resize preset’leri
- **CMP/Privacy**: çerez rızası, script gating (analytics/ads), çok dilli policy sayfaları
- **A/B Tests**: feature flag tabanlı deneyler, sticky assignment, metrik toplama
- **RUM Breakdown**: URL/cihaz/ülke kırılımları ve grafikler
- **LCP Optimizasyonu**: preload/priority hints/early hints + kritik CSS
- **DR Drill**: Disaster Recovery tatbikatı (RTO/RPO), runbook + doğrulama checklist’leri

> FE: Next 15 (RSC + SSR/SSG/ISR), styled‑components. BE: Fastify + TS + Drizzle + MariaDB. Cloudinary/Algolia/Meili/CF/Bunny önceki parçalarla uyumlu.

---

## 0) Media Library Pro

### 0.1 UI: Drag‑Drop + Çoklu Seçim
- **Drag‑drop alanı** (admin media sayfasının üst kısmı):
  - `dragenter/over/leave/drop` event’leri, `preventDefault` + highlight.
  - Birden fazla dosyada **paralel** upload (limit: eşzamanlı 3) + progress bar.
- **Grid**: klavye ile seçim (Shift range, Ctrl/Cmd toggle), seçili öğe sayacı + toolbar (sil, etiket ata, kırp/preset uygula).
- **A11y**: her kart `button`/`role="option"` + `aria-selected`.

**Bileşen iskeleti**: `src/shared/admin/media/ProLibrary.tsx`
```tsx

```

### 0.2 Crop/Resize Preset’leri
- **Presets** (tek merkez, Part 14 `presets.ts` ile uyumlu): `thumb 320x320`, `card 600x400`, `hero 1600x700`.
- **Crop UI**: `react-easy-crop` veya benzeri; seçilen alan → Cloudinary **eager transformation** veya `custom_coordinates` update (Part 14).
- **Toplu preset uygula**: birden fazla medyaya aynı preset’i uygula; sonuç URL’leri DB `media_items`’a ekle (child variant kaydı opsiyonel `media_variants`).

### 0.3 BE: Batch Upload & Tagging
- **`POST /admin/media/batch`**: body `{ items:[{ id, kind, url, width, height, folder, title, tags[] }] }` → `INSERT ... ON DUPLICATE KEY UPDATE`.
- **`PUT /admin/media/:id/tags`**: ekle/kaldır.
- **`POST /admin/media/crop`**: `{ id, x,y,w,h, preset }` → Cloudinary transformation oluştur, yeni URL dön.

### 0.4 Kabul
- 100+ öğede fluid scroll/virtual list (opsiyonel) gecikme yok.
- Çoklu seçim + toplu tag/transform çalışır.
- Upload sırasında progress, hata, retry var.

---

## 1) CMP / Privacy – Consent Management

### 1.1 Consent Store & Script Gating
- **Store** (client): `localStorage('toronto_consent_v1')` → `{ analytics: true|false, ads: true|false }`.
- **Gating**: analytics/ads script’leri **yalnız consent=true** ise enjekte edilir.

**Helper**: `src/shared/privacy/ConsentGate.tsx`
```tsx

```
- **Banner/Modal**: `src/shared/privacy/ConsentBanner.tsx` → onay/ret/özelleştir; çok dilli metinler **admin**’den yönetilir (Part 7 site settings).

### 1.2 Policy Sayfaları (çok dilli)
- `/[locale]/privacy` ve `/[locale]/cookies` statik içerik + **admin managed** HTML/MD (RSC ile SSG/ISR). Hreflang/canonical eklenir.

### 1.3 Kabul
- Consent alınmadan analytics/ads yüklenmez.
- Reddet/iptal etme linki footer’da bulunur (preferences modalı açar).

---

## 2) A/B Tests – Feature Flags ile Deneyler

### 2.1 DB Şeması
`src/db/schema.experiments.ts`
```ts
import { mysqlTable, varchar, text, datetime, serial, uniqueIndex, int } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const experiments = mysqlTable('experiments', {
  id: varchar('id', { length: 36 }).primaryKey(),
  key: varchar('key', { length: 64 }).notNull(),
  name: varchar('name', { length: 191 }).notNull(),
  status: varchar('status', { length: 16 }).notNull().default('draft'), // draft|running|paused|stopped
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
}, (t)=>({ ux: uniqueIndex('ux_exp_key').on(t.key) }));

export const variants = mysqlTable('experiment_variants', {
  id: serial('id').primaryKey(),
  expId: varchar('exp_id', { length: 36 }).notNull(),
  key: varchar('key', { length: 32 }).notNull(), // A|B|C
  weight: int('weight').notNull().default(50) // 0..100 sum
});

export const assignments = mysqlTable('experiment_assignments', {
  userKey: varchar('user_key', { length: 64 }).notNull(), // anon cookie veya user id
  expId: varchar('exp_id', { length: 36 }).notNull(),
  variantKey: varchar('variant_key', { length: 32 }).notNull(),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
}, (t)=>({ ux: uniqueIndex('ux_exp_user').on(t.userKey, t.expId) }));

export const expEvents = mysqlTable('experiment_events', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userKey: varchar('user_key', { length: 64 }).notNull(),
  expId: varchar('exp_id', { length: 36 }).notNull(),
  variantKey: varchar('variant_key', { length: 32 }).notNull(),
  name: varchar('name', { length: 64 }).notNull(), // view|click|convert
  value: int('value').notNull().default(1),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});
```

### 2.2 BE – Assignment & Events
- `GET /public/exp/assign?key=<exp>&uid=<userKey>` → sticky assignment (hash + ağırlıklar), DB’ye yaz.
- `POST /public/exp/event` → `{ expKey, userKey, name }` metrik kaydı.
- Admin: `/admin/experiments` CRUD, variant ağırlıkları.

### 2.3 FE – Kullanım
- RSC **server‑first**: request cookie `uid` yoksa set (HttpOnly). RSC içinde BE assignment endpoint’i çağır, varyanta göre **HeroV1/HeroV2** render et.
- Client event: view/click/convert beacon’ları.

### 2.4 Raporlama
- `/admin/experiments/:id/report`: p50/p90 CTR, conversion rate, baseline karşılaştırması; **Wilson interval** ile güven aralığı.

### 2.5 Kabul
- Aynı kullanıcı her ziyarette aynı varyantı alır.
- Variant kapatıldığında trafikte değişim anında yansır.

---

## 3) RUM Breakdown (URL/Device/Country)

### 3.1 DB ve Toplama
- RUM tablosuna `url_path`, `device` (mobile|tablet|desktop), `country` (ISO‑2) ek sütunlar.
- Client beacon: UA parser + `Intl.DateTimeFormat().resolvedOptions().timeZone` (opsiyonel) → device/country türetme (privacy: IP‑to‑Country backend).

### 3.2 Özet Endpoint
- `/admin/rum/summary?dim=url_path|device|country&period=24h|7d` → name + p50/p90/p99.

### 3.3 FE Grafik
- Bar/line grafiklerle filtrelenebilir tablo; en yavaş 10 URL ve p90 değerleri.

### 3.4 Kabul
- 24h/7d kırılımlar doğrulanır; p90 hedefi **< 2500ms** (mobil).

---

## 4) LCP Optimization – Detay Adımlar

### 4.1 Görsel Hazırlığı
- **Hero görselini preload**: `<link rel="preload" as="image" href="...w_1600,h_700..." imagesrcset="..." imagesizes="(min-width:1024px) 1600px, 100vw" fetchpriority="high">`
- **Priority Hints**: hero `<img fetchpriority="high">`.
- **Aspect‑ratio**: CLS önlemek için container’da sabitle.

### 4.2 Font & CSS
- Font **preload** + `font-display: swap`.
- **Critical CSS**: hero ve above‑the‑fold minimal CSS’i inline (styled‑components SSR extract) + kalanını lazy.

### 4.3 HTTP 103 Early Hints (opsiyonel)
- Nginx/CF: kritik preload link’lerini 103 ile erken gönder.

### 4.4 Streaming & Cache
- RSC streaming açık; ana segment **ISR** ile 10dk (Part 10); dinamik bloklar `suspense`.

### 4.5 Kabul
- Lighthouse (mobile) **LCP < 2.5s**, CLS < 0.1, FID/INP iyi.

---

## 5) DR Drill – Tatbikat ve Runbook

### 5.1 Hedefler
- **RTO**: 30 dk (API) / 60 dk (tam servis)
- **RPO**: 15 dk (DB snapshot + binlog streaming opsiyonel)

### 5.2 Tatbikat Senaryoları
1) **DB node kaybı** → yeni node’a restore (`mysqldump` + `migrate`) → API yeniden bağlanma.
2) **Media CDN problem** → Cloudinary fallback preset’ler + CDN purge yeniden ısıtma.
3) **Search down** → LIKE fallback (Part 10) + index jobs pause.
4) **Queue/Redis outage** → Worker pause; DLQ birikim sonrası retry.

### 5.3 Checklist (özet)
- **Pre**: son yedek mevcut mu? versiyon notları.
- **Uygulama**: backup restore, env kontrol, `server.ts /health` OK.
- **Verifikasyon**: Smoke testleri (Ana sayfa, Proje detay, İletişim formu, Admin login, Upload, Search, Payments ‑ opsiyonel).
- **Post**: Postmortem draft + kalıcı iyileştirmeler backlog’a.

### 5.4 Otomasyon
- Quarterly cron: status sayfasına “DR Drill running” banner’ı + read‑only mode (feature flag: `maintenance_mode`).

---

## 6) Kabul Kriterleri (Part 16)
- Media Pro: drag‑drop, multi‑select, crop/presets, toplu taglama çalışır.
- CMP: consent alınmadan 3rd‑party script’ler yüklenmez; çok dilli policy sayfaları yayında.
- A/B: sticky assignment, event toplama ve basit raporlar hazır.
- RUM: URL/device/country kırılımları görünür; en yavaş 10 URL raporu.
- LCP: hero preload + priority; CLS sabit; mobil LCP hedefe yakın.
- DR Drill: runbook ve otomasyon planı yazıldı, tatbikat yapılabilir durumda.

---

## 7) Sonraki Parça (Part 17)
- **Media Pro**: kırpma preset yöneticisi + focal auto detect (Cloudinary AI)
- **Consent**: TCF v2.2 uyum (IAB) – gerekirse vendor list adaptörü
- **A/B**: dene‑kazan otomasyonu (multi‑armed bandit) ve sequential testing notları
- **Perf**: route‑bazlı `server-timing` header’ları; INP odaklı etkileşim optimizasyonu
- **Resilience**: blue‑green deploy + canary + database read‑replica promosyonu

