# Part 9 – Rich Editor (Tiptap), FAQ Builder, Media/CDN Optimizasyonları, Observability (Logs/Metrics), QA Genişletmeleri

Bu parçada admin içerik üretimini güçlendiriyor ve prod kalitesini yükseltiyoruz:

- **Zengin Editör (Tiptap)**: Services / Ad Solutions / Projects body alanları
- **FAQ Builder**: Service sayfalarına JSON‑LD uyumlu SSS yönetimi
- **Media/CDN**: Cloudinary image/video loader + i18n image maps + HLS poster
- **Observability**: Pino + Loki transport, Prometheus metrics, under‑pressure
- **QA**: Playwright senaryolar (admin login, i18n kaydetme), a11y (axe), Lighthouse bütçeleri

> Not: Tüm admin sayfaları **CSR**, public sayfalar **RSC + SSG/ISR/SSR** (Part 1‑6 ile uyumlu). Stil: **styled‑components**.

---

## 0) Bağımlılıklar

```bash
# FE (editor & a11y)
bun add @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image @tiptap/extension-heading
bun add -D @axe-core/playwright

# BE (observability)
bun add pino-http pino-loki prom-client @fastify/under-pressure
```

---

## 1) Admin – Zengin Editör (Tiptap)

**Amaç:** Service, Ad Solutions ve Project çeviri gövdelerini HTML olarak düzenlemek.

**`FE: src/shared/admin/editor/RichEditor.tsx`**
```tsx

```

**Entegrasyon (Service Detail Admin)**

`FE: src/app/(admin)/admin/services/[id]/page.tsx` içinde body alanını `RichEditor` ile değiştirin:
```tsx
// ... import RichEditor
const [body, setBody] = useState(cur.body || '');
<RichEditor html={body} onChange={setBody} />
// save sırasında data: { title, body }
```

> Projects ve Ad Solutions detay sayfalarında da aynı yaklaşımı kullanın (Part 8 form yapısına ekleyin).

---

## 2) Admin – FAQ Builder (Service)

**`FE: src/shared/admin/faq/FAQBuilder.tsx`**
```tsx

```

**Entegrasyon (Service Translation Tab)**

```tsx
// Service edit sayfasında locale sekmesinde:
const [faq, setFaq] = useState<Array<{q:string;a:string}>>(cur.faq_json || []);
<FAQBuilder value={faq} onChange={setFaq} />
// save: upsertServiceTranslation({ id, locale: current, data: { title, body, faq_json: faq } })
```

**Public JSON‑LD** (Part 5’teki Service detayda zaten ekledik). `faq_json` geldiğinde FAQPage şemasını render ediyoruz.

---

## 3) Media/CDN – Cloudinary Loader, i18n Image Maps, Video HLS

### 3.1 Next Image – Cloudinary Loader

**`FE: src/lib/media/cloudinaryLoader.ts`**
```ts

```

**Kullanım**
```tsx
import Image from 'next/image';
import cloudinaryLoader from '@/lib/media/cloudinaryLoader';

<Image loader={cloudinaryLoader} src={coverPublicIdOrUrl} alt={title} width={1200} height={800} sizes="(max-width: 768px) 100vw, 50vw" />
```

### 3.2 i18n Image Maps

**`FE: src/lib/media/i18nImage.ts`**
```ts

```

``

### 3.3 Video CDN (HLS + Poster)

**`FE: src/shared/ui/media/VideoCdn.tsx`**
```tsx

```

**Cloudinary ipucu:** HLS için `.../video/upload/f_auto,vc_auto:video/hls/<public_id>.m3u8`; poster için aynı public_id’ye `.../image/upload/.../<public_id>.jpg`.

---

## 4) Observability – Logs, Metrics, Backpressure

### 4.1 Pino + Loki Transport

**`BE: src/http/logging.ts`**
```ts

```

**`BE: src/http/server.ts`** (entegrasyon)
```ts

```

### 4.2 Correlation ID

**`BE: src/http/plugins/requestId.ts`**
```ts

```

**`server.ts`** içinde `await app.register(requestIdPlugin)` ekleyin; log çıktısına `req.id` düşer.

---

## 5) QA – Playwright & a11y & Lighthouse Bütçeleri

### 5.1 Admin Login ve i18n Kaydetme Testi

**`FE: tests/admin.i18n.spec.ts`**
```ts

```

### 5.2 A11y (axe)

**`FE: tests/a11y.home.spec.ts`**
```ts

```

> Gerekirse `bun add -D axe-playwright` ekleyin veya kendi helper’ınızı yazın.

### 5.3 Lighthouse Bütçeleri (güncelle)

**`lighthouserc.js`** (ek/sertleştirme)
```js

```

---

## 6) RUM (Web Vitals) – Basit Toplama (Opsiyonel)

**`FE: src/app/api/rum/route.ts`**
```ts

```

**`FE: src/shared/analytics/reportWebVitals.ts`**
```ts

```

**`FE: src/app/[locale]/layout.tsx`** (en alta, body sonuna yakına)
```tsx

```

---

## 7) Kabul Kriterleri (Part 9)

- Admin’de **RichEditor** ile body alanları düzenlenebilir; HTML FE’de güvenli render edilir (Prose bileşeni).
- **FAQ Builder** ile SSS eklenir/sıralanır; public Service detayında **FAQPage JSON‑LD** çıkar.
- Görseller Cloudinary loader ile **f_auto, q_auto** benzeri dönüşümlerle gelir; i18n image map ile locale’e özel görseller kullanılır; videolar HLS/mp4 + poster ile yüklenir.
- BE’de **/metrics** (Prometheus) ve under‑pressure aktif; loglar Pino ile structured formatta çıkar; request id header’ı döner.
- QA: Playwright testleri (admin login + i18n kaydetme) geçer; a11y testi “serious” issue vermez; Lighthouse bütçeleri sağlanır.

---

## 8) Sonraki Parça (Part 10)

- Figma → FE tasarım uyarlama kiti (token’lar, spacing/typography scale, grid)
- Blog/News modülü (SSG) + i18n + RSS feed + sitemap entry
- Arama sayfası (server search + debounced client hint), proje karşılaştırma sayfası
- Cache stratejileri: `stale-while-revalidate` varyasyonları ve tag bazlı invalidation matrisi

