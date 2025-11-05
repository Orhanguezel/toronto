# Part 20 – Content Staging & Approval Workflow, Search Signals & Suggestions, Video HLS/ABR Pipeline, WCAG 2.2 Accessibility, Analytics Schema

Bu bölüm, içerik yayına alma güvenini, arama deneyimini, video yayın kalitesini, erişilebilirlik standartlarını ve ölçümlemeyi tamamlar.

- **Content Staging & Approvals**: rol‑bazlı durum makinesi, planlı yayın, sürümleme
- **Search UX**: sinyaller (CTR/dwell), dil/tenant boost, query suggestions (prefix/typo)
- **Video Pipeline**: Cloudinary HLS/ABR otomasyon, poster/thumbnail, player bileşeni
- **Accessibility**: WCAG 2.2 checklist, odak/fokus yönetimi, Axe + Playwright E2E
- **Analytics**: event şeması, frontend beacon, backend ingestion & raporlama

> FE: Next 15 (RSC/SSR/SSG/ISR) + styled‑components (tema: `ensotekTheme`). BE: Fastify + TS + Drizzle + MariaDB. Search: Meili/Algolia.

---

## 0) Content Staging & Approvals

### 0.1 Durum Makinesi
Durumlar: `draft → in_review → approved → scheduled? → published → archived` ve `rejected` (in_review’den geri düşüş).

**`BE: src/db/schema.content.workflow.ts`**
```ts
import { mysqlTable, varchar, text, datetime, tinyint, json } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const contentItems = mysqlTable('content_items', {
  id: varchar('id', { length: 36 }).primaryKey(),
  type: varchar('type', { length: 32 }).notNull(), // page|project|service|post
  slug: varchar('slug', { length: 191 }).notNull(),
  locale: varchar('locale', { length: 8 }).notNull(),
  tenant: varchar('tenant', { length: 32 }).default('default'),
  title: varchar('title', { length: 191 }),
  body: text('body'),
  status: varchar('status', { length: 16 }).notNull().default('draft'),
  scheduledAt: datetime('scheduled_at'),
  publishedAt: datetime('published_at'),
  version: tinyint('version').notNull().default(1),
  meta: json('meta'), // {seo:{...}, media:{coverId,...}}
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const contentRevisions = mysqlTable('content_revisions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  itemId: varchar('item_id', { length: 36 }).notNull(),
  version: tinyint('version').notNull(),
  diff: text('diff'), // JSON patch veya entire snapshot
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});
```

### 0.2 RBAC Kuralları (özet)
- **author**: draft oluşturur/düzenler, `submit_review` atar
- **editor**: `approve`/`reject`, küçük düzeltmeler
- **publisher**: `publish_now`/`schedule`
- **admin**: hepsi + revert

### 0.3 Geçiş Endpoint’i
**`BE: src/http/routes/admin.content.transitions.ts`**
```ts
import { FastifyPluginAsync } from 'fastify';
import { db } from '@/core/db';
import { contentItems, contentRevisions } from '@/db/schema.content.workflow';
import { z } from 'zod';
import { sql, eq } from 'drizzle-orm';
import { enqueueIndex } from '@/queue/producers';

const can = (role:string, action:string)=>{
  const map: Record<string, string[]> = {
    author: ['submit_review'],
    editor: ['approve','reject'],
    publisher: ['publish_now','schedule'],
    admin: ['submit_review','approve','reject','publish_now','schedule','revert']
  };
  return map[role]?.includes(action);
};

export const contentTransitionRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', app.auth);

  app.post('/content/:id/transition', async (req, rep) => {
    const { id } = (req.params as any);
    const body = z.object({ action: z.enum(['submit_review','approve','reject','publish_now','schedule','revert']), note: z.string().optional(), schedule: z.string().datetime().optional() }).parse(req.body);
    const role = (req.user as any).role || 'author';
    if (!can(role, body.action)) return rep.code(403).send({ error: 'forbidden' });

    const [item] = await db.select().from(contentItems).where(eq(contentItems.id, id));
    if (!item) return rep.code(404).send({ error: 'not_found' });

    const now = sql`CURRENT_TIMESTAMP`;
    switch (body.action) {
      case 'submit_review':
        if (item.status !== 'draft') return rep.code(409).send({ error:'bad_state' });
        await db.update(contentItems).set({ status: 'in_review', updatedAt: now }).where(eq(contentItems.id, id));
        break;
      case 'approve':
        if (item.status !== 'in_review') return rep.code(409).send({ error:'bad_state' });
        await db.update(contentItems).set({ status: 'approved', updatedAt: now }).where(eq(contentItems.id, id));
        break;
      case 'reject':
        if (item.status !== 'in_review') return rep.code(409).send({ error:'bad_state' });
        await db.update(contentItems).set({ status: 'rejected', updatedAt: now }).where(eq(contentItems.id, id));
        break;
      case 'publish_now':
        if (!['approved','scheduled'].includes(item.status)) return rep.code(409).send({ error:'bad_state' });
        await db.update(contentItems).set({ status: 'published', publishedAt: now, updatedAt: now }).where(eq(contentItems.id, id));
        await enqueueIndex('content', id, 'upsert');
        break;
      case 'schedule':
        if (item.status !== 'approved') return rep.code(409).send({ error:'bad_state' });
        await db.update(contentItems).set({ status: 'scheduled', scheduledAt: body.schedule as any, updatedAt: now }).where(eq(contentItems.id, id));
        break;
      case 'revert':
        const last = await db.execute(sql`SELECT * FROM content_revisions WHERE item_id=${id} ORDER BY version DESC LIMIT 1`);
        if (!Array.isArray(last) || !last[0]) return rep.code(404).send({ error:'no_revision' });
        // Basitçe version +1 ve snapshot'ı geri yaz
        await db.update(contentItems).set({ body: (last as any)[0].diff, version: item.version+1, status: 'draft', updatedAt: now }).where(eq(contentItems.id, id));
        break;
    }
    return { ok: true };
  });
};
```

### 0.4 Scheduler (cron)
- **Worker**: her dakika `scheduledAt <= NOW AND status='scheduled'` → `publish_now`
- **CDN purge** + FE revalidate (Part 13) tetikle

### 0.5 FE – Admin UI (kısa)
- İçerik listesi: durum rozetleri, tarih/sürüm, `Submit/Approve/Reject/Schedule/Publish now` butonları.
- `scheduledAt` için datetime picker (locale/timezone aware).

---

## 1) Search UX – Sinyaller & Öneriler

### 1.1 Sinyal Kaydı (click/dwell)
**`BE: src/db/schema.search.signals.ts`**
```ts
import { mysqlTable, varchar, int, datetime, text } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
export const searchSignals = mysqlTable('search_signals', {
  id: varchar('id', { length: 36 }).primaryKey(),
  q: varchar('q', { length: 191 }).notNull(),
  itemId: varchar('item_id', { length: 36 }).notNull(),
  locale: varchar('locale', { length: 8 }),
  tenant: varchar('tenant', { length: 32 }),
  dwellMs: int('dwell_ms').default(0),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});
```
**FE (client)**: sonuç tıklandığında `POST /public/search/signal` (q,itemId,locale,tenant). Dwell için `PerformanceObserver` veya `visibilitychange` ile arka planda `sendBeacon`.

### 1.2 Sıralama
- **Algolia**: `customRanking: ['desc(ctr)', 'desc(dwell_ms)']`; per-locale index veya `searchableAttributes` + `ranking` ile dil boost.
- **Meili**: `rankingRules` + `sort` alanları; dil/tenant boost’u için `distinct` + `filter` veya `scoringRules` (v1.7+) kullanın.

### 1.3 Query Suggestions (prefix/typo)
**`BE: src/jobs/search.suggestions.ts`**
```ts
// titles + queries -> n‑gram/prefix sözlüğü üret
export async function buildSuggestions(){
  // kaynak: contentItems(title, locale) + son 30 gün popüler aramalar (searchSignals.q)
  // n‑gram: 2..4; skor = popülerlik + tıklama sayısı
}
```
**Endpoint**: `GET /public/search/suggest?q=pro&locale=tr` → top 8 öneri (typo tolerant; TR i/İ normalizasyonu).

### 1.4 FE – Arama Inputu
- Debounce (250ms), `aria-controls=listbox` + `role=listbox` öneriler; ok tuşlarıyla gezinti, `Enter` ile seç.
- Çok dilli: locale/tenant parametreleri taşı.

---

## 2) Video Pipeline – Cloudinary HLS/ABR

### 2.1 Upload & Transcode
- **Signed upload** (Part 14) ile video dosyası.
- **Preset**: HLS playlist + renditions (240p/360p/480p/720p/1080p), `vc_auto`, `f_auto`.

**Eager örneği** (BE, upload sonrası):
```ts
await cloudinary.uploader.explicit(public_id, {
  resource_type: 'video',
  eager: [
    { streaming_profile: 'full_hd', format: 'm3u8' }
  ],
  eager_async: true,
  eager_notification_url: process.env.WEBHOOK_URL // iş bitti bildir
});
```

### 2.2 Poster & Thumb
- `poster`: `image/upload/.../${public_id}.jpg` (Frame‑extract).
- `thumbnail sprites`: isteğe bağlı; preview scrub için.

### 2.3 Player Bileşeni
**`FE: src/shared/ui/media/VideoPlayer.tsx`**
```tsx

```

### 2.4 SEO – VideoObject JSON‑LD
**`FE: src/shared/seo/VideoJsonLd.tsx`**
```tsx

```

---

## 3) Accessibility – WCAG 2.2 + Axe E2E

### 3.1 Checklist (özet)
- **Klavye gezilebilirlik**: navbar, carousel, modal, tabs (rozetler) – `role`, `aria-*`, `tabIndex`, `Escape` ile kapanma.
- **Kontrast**: minimum 4.5:1; tema token’ları için `colors.textMuted`/`text`/`primary` kontrast testi.
- **Odak görünürlüğü**: focus ring (tema ile uyumlu).
- **Form etiketleri**: `Label` ↔ `Input` id/for eşleşmesi; hata metni `aria-describedby`.
- **İsimlendirme**: simge butonlarda `aria-label`.
- **Medya altyazı**: videolarda `track`.
- **Skip link**: `#main`.

### 3.2 Axe + Playwright
```bash
bun add -D @axe-core/playwright @playwright/test
```
**`tests/a11y.home.spec.ts`**
```ts

```
**CI**: PR’da e2e a11y testi koşar; violation varsa merge bloklanır.

---

## 4) Analytics – Event Şeması & Ingestion

### 4.1 Şema
**`BE: src/db/schema.analytics.ts`**
```ts
import { mysqlTable, varchar, json, datetime } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
export const events = mysqlTable('events', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 64 }),
  sessionId: varchar('session_id', { length: 64 }),
  name: varchar('name', { length: 64 }).notNull(), // page_view|search|click|form_submit|lead
  path: varchar('path', { length: 191 }),
  locale: varchar('locale', { length: 8 }),
  tenant: varchar('tenant', { length: 32 }),
  props: json('props'), // {q:"proje", itemId:"...", value:...}
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});
```

### 4.2 FE – Event Emitter
**`FE: src/lib/analytics.ts`**
```ts

```
Kullanım örn.: arama yapılınca `emit('search', { q })`; iletişim formu gönderilince `emit('lead', { channel:'form' })`.

### 4.3 BE – Ingestion Endpoint
**`BE: src/http/routes/public.events.ts`**
```ts
import { FastifyPluginAsync } from 'fastify';
import { events } from '@/db/schema.analytics';
import { db } from '@/core/db';

export const eventsRoutes: FastifyPluginAsync = async (app) => {
  app.post('/events', async (req, rep) => {
    const b = (await req.body) as any; // küçük payload
    await db.insert(events).values({ id: crypto.randomUUID(), name: b.name, path: b.path, locale: b.locale, tenant: b.tenant||'default', props: b.props });
    return rep.code(204).send();
  });
};
```

### 4.4 Raporlama
- **Admin dashboard**: funnel (landing→search→project_view→lead), son 7 gün; dil/tenant kırılımı.
- **Goal mapping**: `lead` = başarı; A/B raporlarıyla birleşik görünüm (Part 18).

---

## 5) Kabul Kriterleri (Part 20)
- İçerik durumu geçişleri RBAC ile kontrol edilir; schedule → publish otomatiği işler; sürümleme kayıt altındadır.
- Arama sinyalleri kaydolur; öneriler (suggest) 250ms altında döner; locale/tenant boost uygulanır.
- Video yükle→HLS/ABR→poster akışı tamam; player diğer tarayıcılarda HLS.js ile çalışır; VideoObject JSON‑LD eklenir.
- WCAG 2.2 checklist maddeleri e2e Axe ile temiz; klavye, kontrast ve odak standarttır.
- Analytics olayları /events’e düşer; admin funnel raporu çalışır.

---

## 6) Sonraki Parça (Part 21)
- **Headless CMS Köprüleri** (Contentful/Strapi/Datocms)
- **Search Advanced**: semantic rerank (OpenAI API) + safelist kuralı
- **Video Live**: canlı yayın (HLS LL) + DVR
- **A11y**: görme engeli senaryoları (screen reader flow) + odak tuzak testleri
- **Analytics**: BigQuery/ClickHouse’a akış + temel dashboard şablonları

