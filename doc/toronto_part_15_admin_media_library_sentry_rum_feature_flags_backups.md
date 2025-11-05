# Part 15 – Admin Media Library, Sentry + Sourcemaps, RUM Grafikleri, Slow API Trace, Feature Flags, Backups

Bu parça ile prod düzeyinde görünürlük ve işletim kolaylığı ekliyoruz:

- **Admin Media Library** (arama, etiket, klasör, seç‑ekle; RichEditor ve formlar ile entegrasyon)
- **Sentry** (FE Next.js + BE Fastify) + **release/sourcemaps** CI adımları
- **RUM** (Web Vitals toplanması → percentiles, grafikler) + **Slow API Trace** (pino + Sentry perf)
- **Feature Flags** (server‑first değerlendirme, yüzdeyle rollout, locale/tenant kuralları) + Admin UI
- **Backups** (MariaDB snapshot rotasyonu, asset lifecycle/archival) + **restore** notları

> FE: Next 15 (RSC + SSR/SSG/ISR), styled‑components. BE: Fastify + TS + Drizzle + MariaDB. Search/CDN/Cloudinary yapılandırmaları önceki parçalara uyumludur.

---

## 0) Media Library – Şema, Endpoint’ler, UI

### 0.1 DB Şeması (etiket/klasör)
**`BE: src/db/schema.media.lib.ts`**
```ts
import { mysqlTable, varchar, text, datetime, serial, uniqueIndex } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const mediaItems = mysqlTable('media_items', {
  id: varchar('id', { length: 191 }).primaryKey(), // cloudinary public_id veya url hash
  kind: varchar('kind', { length: 16 }).notNull(), // image|video|other
  url: text('url').notNull(),
  width: varchar('width', { length: 16 }),
  height: varchar('height', { length: 16 }),
  folder: varchar('folder', { length: 191 }).default('toronto'),
  title: varchar('title', { length: 191 }),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const mediaTags = mysqlTable('media_tags', {
  id: serial('id').primaryKey(),
  tag: varchar('tag', { length: 64 }).notNull(),
}, (t)=>({ ux: uniqueIndex('ux_media_tag').on(t.tag) }));

export const mediaItemTag = mysqlTable('media_item_tag', {
  itemId: varchar('item_id', { length: 191 }).notNull(),
  tagId: varchar('tag_id', { length: 36 }).notNull()
}, (t)=>({ ux: uniqueIndex('ux_media_tag_rel').on(t.itemId, t.tagId) }));
```

### 0.2 Admin – Media Routes
**`BE: src/http/routes/admin.media.lib.ts`**
```ts
import { FastifyPluginAsync } from 'fastify';
import { db } from '@/core/db';
import { mediaItems, mediaTags, mediaItemTag } from '@/db/schema.media.lib';
import { sql, inArray, eq } from 'drizzle-orm';
import { z } from 'zod';

export const adminMediaLibRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', app.auth);

  app.get('/media', async (req) => {
    const q = z.object({ page: z.coerce.number().default(1), pageSize: z.coerce.number().default(30), keyword: z.string().optional(), folder: z.string().optional(), tags: z.string().optional() }).parse((req as any).query);
    const where: any[] = [];
    if (q.keyword) where.push(sql`(title LIKE ${'%' + q.keyword + '%'} OR url LIKE ${'%' + q.keyword + '%'})`);
    if (q.folder) where.push(sql`folder=${q.folder}`);
    if (q.tags){
      const tags = q.tags.split(',').map(s=>s.trim()).filter(Boolean);
      if (tags.length){
        const ids = await db.execute(sql`SELECT DISTINCT mit.item_id FROM media_item_tag mit JOIN media_tags mt ON mt.id=mit.tag_id WHERE mt.tag IN (${sql.join(tags, sql`,`)})`);
        const arr = (ids as any[]).map(r=>r.item_id); if (arr.length) where.push(inArray(mediaItems.id, arr)); else return { items: [], total: 0, page: q.page, pageSize: q.pageSize };
      }
    }
    const total = Number(((await db.execute(sql`SELECT COUNT(*) c FROM media_items ${where.length? sql`WHERE ${sql.join(where, sql` AND `)}`: sql``}`)) as any)[0].c||0);
    const off = (q.page-1)*q.pageSize;
    const items = await db.execute(sql`SELECT * FROM media_items ${where.length? sql`WHERE ${sql.join(where, sql` AND `)}`: sql``} ORDER BY created_at DESC LIMIT ${q.pageSize} OFFSET ${off}`);
    return { items, total, page: q.page, pageSize: q.pageSize };
  });

  app.post('/media', async (req) => {
    const b = z.object({ id: z.string(), kind: z.enum(['image','video','other']), url: z.string().url(), width: z.string().optional(), height: z.string().optional(), folder: z.string().default('toronto'), title: z.string().optional(), tags: z.array(z.string()).optional() }).parse(req.body);
    await db.insert(mediaItems).values({ id: b.id, kind: b.kind, url: b.url, width: b.width, height: b.height, folder: b.folder, title: b.title });
    if (b.tags?.length){
      const existing = await db.execute(sql`SELECT id, tag FROM media_tags WHERE tag IN (${sql.join(b.tags, sql`,`)})`);
      const missing = (b.tags||[]).filter(t => !(existing as any[]).some(e=>e.tag===t));
      if (missing.length){
        await db.execute(sql`INSERT INTO media_tags (tag) VALUES ${sql.join(missing.map(m=>sql`(${m})`), sql`,`)}`);
      }
      const tagRows = await db.execute(sql`SELECT id, tag FROM media_tags WHERE tag IN (${sql.join(b.tags, sql`,`)})`);
      const values = (tagRows as any[]).map(r=> sql`(${b.id}, ${r.id})`);
      if (values.length) await db.execute(sql`INSERT IGNORE INTO media_item_tag (item_id, tag_id) VALUES ${sql.join(values, sql`,`)}`);
    }
    return { ok: true };
  });

  app.delete('/media/:id', async (req) => {
    const { id } = (req.params as any);
    await db.execute(sql`DELETE FROM media_item_tag WHERE item_id=${id}`);
    await db.execute(sql`DELETE FROM media_items WHERE id=${id}`);
    return { ok: true };
  });
};
```
**`server.ts`**: `await app.register(adminMediaLibRoutes, { prefix: '/admin' });`

### 0.3 FE – Media Modal & Library Page
**`FE: src/shared/admin/media/MediaPickerModal.tsx`**
```tsx

```

**Entegrasyon örnekleri**
- RichEditor (Part 9): resim ekle butonu → `MediaPickerModal` aç, seçilen `url` ile `editor.setImage({ src:url })`.
- Proje/Hizmet formlarında kapak görseli: `onPick` → `setValue('cover_url', m.url)`.

---

## 1) Sentry – FE (Next.js) + BE (Fastify) & Sourcemaps

### 1.1 FE – @sentry/nextjs
```bash
bun add @sentry/nextjs
bun sentry-wizard -i nextjs  # veya manuel kurulum
```
**`sentry.client.config.ts`**
```ts

```
**`sentry.server.config.ts`**
```ts

```
**`next.config.js`** (sourcemaps prod)
```js
const { withSentryConfig } = require('@sentry/nextjs');
module.exports = withSentryConfig({ reactStrictMode: true, productionBrowserSourceMaps: true }, { org: 'toronto', project: 'frontend' });
```

### 1.2 BE – @sentry/node Fastify
```bash
bun add @sentry/node @sentry/profiling-node
```
**`BE: src/http/sentry.ts`**
```ts
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
export function initSentry(){
  if (!process.env.SENTRY_DSN) return;
  Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.2, integrations: [nodeProfilingIntegration()] });
}
export { Sentry };
```
**`BE: src/http/server.ts`** (hook)
```ts
import { Sentry, initSentry } from './sentry';
initSentry();
app.addHook('onError', async (req, rep, err) => { Sentry.captureException(err, { extra: { path: req.raw.url } }); });
```

### 1.3 CI – Release & Sourcemap Upload
**Env**
```
SENTRY_AUTH_TOKEN=...  # org project yetkili
SENTRY_ORG=toronto
SENTRY_PROJECT=frontend  # FE
SENTRY_BE_PROJECT=backend # BE
SENTRY_RELEASE=toronto@${GIT_SHA}
```
**FE CI adımı**
```bash
bun run build  # Next build sourcemap üretir (productionBrowserSourceMaps)
npx sentry-cli releases new "$SENTRY_RELEASE"
npx sentry-cli releases files "$SENTRY_RELEASE" upload-sourcemaps .next --url-prefix "~/_next" --rewrite
npx sentry-cli releases set-commits "$SENTRY_RELEASE" --auto
npx sentry-cli releases finalize "$SENTRY_RELEASE"
```
**BE CI adımı** (bun build/tsc çıktı dizininden)
```bash
npx sentry-cli releases new "$SENTRY_RELEASE"
npx sentry-cli releases files "$SENTRY_RELEASE" upload-sourcemaps dist --rewrite
npx sentry-cli releases set-commits "$SENTRY_RELEASE" --auto
npx sentry-cli releases finalize "$SENTRY_RELEASE"
```

---

## 2) RUM – Percentiles & Grafikleri

### 2.1 BE – Toplama & Agg
**`BE: src/http/routes/public.rum.ts`**
```ts
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { db } from '@/core/db';
import { sql } from 'drizzle-orm';

export const rumRoutes: FastifyPluginAsync = async (app) => {
  app.post('/rum', async (req, rep) => {
    const b = await req.body as any; // { name, value, id, url, delta }
    await db.execute(sql`INSERT INTO rum (name, value, url, created_at) VALUES (${b.name}, ${b.value}, ${b.url||''}, NOW())`);
    return rep.code(204).send();
  });
  app.get('/admin/rum/summary', async () => {
    const rows = await db.execute(sql`
      SELECT name,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY value) AS p50,
        PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY value) AS p90,
        PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY value) AS p99
      FROM rum WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      GROUP BY name`);
    return rows;
  });
};
```

### 2.2 FE – Grafik (Admin)
**`FE: src/app/(admin)/admin/rum/page.tsx`**
```tsx

```
> Part 9’daki `reportWebVitals` beacon’ı bu route’a yönlendirin (`/api/rum` → API proxy `/rum`).

---

## 3) Slow API Trace – pino + Sentry perf

### 3.1 pino responseTime threshold
**`BE: src/http/plugins/slow.ts`**
```ts
import { FastifyPluginAsync } from 'fastify';
export const slowTrace: FastifyPluginAsync<{ threshold?: number }> = async (app, opts) => {
  const TH = opts.threshold ?? 500; // ms
  app.addHook('onResponse', (req, rep, done) => {
    const rt = rep.getResponseTime?.() || 0;
    if (rt > TH) req.log.warn({ rt, url: req.url }, 'slow-response');
    done();
  });
};
```
**`server.ts`**: `await app.register(slowTrace, { threshold: 700 });`

### 3.2 Sentry Transaction
**`BE: src/http/server.ts`** (örnek)
```ts
app.addHook('onRequest', (req, _rep, done) => { (req as any)._sentryTx = Sentry.startTransaction({ name: req.routerPath||req.url||'http', op: 'http.server' }); done(); });
app.addHook('onResponse', (req, _rep, done) => { const tx = (req as any)._sentryTx; if (tx) tx.finish(); done(); });
```

---

## 4) Feature Flags – Server‑First, Yüzde Rollout, Locale/Tenant Kuralları

### 4.1 DB
**`BE: src/db/schema.flags.ts`**
```ts
import { mysqlTable, varchar, text, tinyint, uniqueIndex } from 'drizzle-orm/mysql-core';
export const flags = mysqlTable('flags', {
  key: varchar('key', { length: 64 }).primaryKey(),
  enabled: tinyint('enabled').notNull().default(0),
  rules: text('rules') // JSON: { percent: 0..100, locales:['tr','en'], tenants:['default','x'], since:'2025-01-01' }
}, (t)=>({ ux: uniqueIndex('ux_flag_key').on(t.key) }));
```

### 4.2 BE – Eval helper & Routes
**`BE: src/feature/flags.ts`**
```ts
import crypto from 'node:crypto';
import { db } from '@/core/db';
import { flags } from '@/db/schema.flags';

export type FlagEvalCtx = { userId?: string; locale?: string; tenant?: string };
export async function isEnabled(key: string, ctx: FlagEvalCtx){
  const [f] = await db.select().from(flags).where((r)=> r.key.eq(key) as any);
  if (!f) return false;
  if (!f.enabled) return false;
  const rules = f.rules ? JSON.parse(f.rules) : {};
  if (rules.locales?.length && ctx.locale && !rules.locales.includes(ctx.locale)) return false;
  if (rules.tenants?.length && ctx.tenant && !rules.tenants.includes(ctx.tenant)) return false;
  if (typeof rules.percent === 'number' && rules.percent >= 0){
    const id = ctx.userId || 'anon';
    const h = crypto.createHash('sha1').update(`${key}:${id}`).digest('hex');
    const bucket = parseInt(h.slice(0,4), 16) % 100; // 0..99
    return bucket < rules.percent;
  }
  return true;
}
```
**`BE: src/http/routes/admin.flags.ts`** – CRUD + quick eval
```ts
import { FastifyPluginAsync } from 'fastify';
import { db } from '@/core/db';
import { flags } from '@/db/schema.flags';
import { z } from 'zod';

export const adminFlagsRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', app.auth);
  app.get('/flags', async () => db.select().from(flags));
  app.put('/flags/:key', async (req) => {
    const { key } = (req.params as any);
    const b = z.object({ enabled: z.boolean(), rules: z.any().optional() }).parse(req.body);
    await db.insert(flags).values({ key, enabled: b.enabled? 1:0, rules: JSON.stringify(b.rules||{}) }).onDuplicateKeyUpdate({ set: { enabled: b.enabled?1:0, rules: JSON.stringify(b.rules||{}) } });
    return { ok: true };
  });
};
```

### 4.3 FE – Admin UI & Server Eval Kullanımı
**Admin UI**: `/admin/flags` sayfası; key listesi, enabled toggle, percent/locales/tenants alanları (JSON editör veya form).

**Server eval (RSC)** örn. ana sayfada yeni Hero’yu koşullu göstermek:
```tsx
// FE: src/app/[locale]/page.tsx (RSC)

export default async function Home({ params }:{ params:{ locale:string } }){
  
  return newHero ? <HeroV2/> : <HeroV1/>;
}
```
**`FE: src/lib/flags.ts`**
```ts

```
> Alternatif: Public eval endpoint yazmayın; RSC sunucusunda BE’ye **server‑to‑server** istek yapın (güvenli). Tag invalidation: `/admin/flags` güncellemesinde `revalidateTags(['flags','flag_<key>'])`.

---

## 5) Backups – DB Snapshot & Asset Lifecycle

### 5.1 MariaDB Snapshot (mysqldump) + Rotasyon
**`ops/backup/db-backup.sh`**
```bash
#!/usr/bin/env bash
set -euo pipefail
TS=$(date +"%Y%m%d-%H%M%S")
OUT="/var/backups/toronto/db-${TS}.sql.gz"
mysqldump -u$DB_USER -p$DB_PASS -h$DB_HOST --routines --triggers --single-transaction $DB_NAME | gzip > "$OUT"
# Retention: son 7 günlük günlük, son 4 haftalık haftalık
find /var/backups/toronto -name 'db-*.sql.gz' -mtime +7 -delete
```
**systemd timer** (`/etc/systemd/system/toronto-db-backup.service/.timer`) ile her gece çalıştırın.

### 5.2 Restore notu
```bash
gunzip < db-20251031-020000.sql.gz | mysql -u$DB_USER -p$DB_PASS -h$DB_HOST $DB_NAME
```

### 5.3 Asset Lifecycle / Archival
- **Cloudinary**: klasör bazlı düzen; `auto_backup` açık (opsiyonel), fazla eski ve kullanılmayan asset’ler için **lifecycle tags**: `archive:2025-Q4`.
- **Export**: kritik media klasörlerini periyodik olarak `cloudinary-cli` veya API ile **tar.gz** arşivleyip Object Storage’a (Bunny/S3) kopyalayın.
- **CDN Cache**: purge script’leri (Part 13) backup/restore sonrası yeniden ısıtma (sitemap prefetch, hero preload).

---

## 6) Kabul Kriterleri (Part 15)
- Admin Media Library: arama, klasör ve etiket filtreleriyle listeler; modal üzerinden RichEditor/form alanlarına seçim aktarılır.
- Sentry FE/BE aktif; CI’da release/sourcemaps yüklenir; Sentry’de transaction’lar görünür.
- RUM beacon’ları 24 saatlik p50/p90/p99 ile toplanır ve admin sayfasında görünür.
- Slow API trace: 700ms üzeri istekler loglanır; Sentry perf transaction’ları oluşturulur.
- Feature Flags: server‑first değerlendirme ile yüzde rollout ve locale/tenant kuralı uygulanır; admin sayfasından değiştirilebilir.
- Backups: günlük mysqldump rotasyonu çalışır; restore adımı dokümante; asset lifecycle için prosedür belirlenir.

---

## 7) Sonraki Parça (Part 16)
- **Media Library Pro**: drag‑drop upload, çoklu seçim, kırpma/resize preset ekranı
- **Consent & Privacy**: CMP entegrasyonu, analytics opt‑in/out, cookies policy
- **A/B Testleri** (feature flags ile entegre) + istatistik toplama
- **Perf iyileştirme**: RUM grafikleri (URL/cihaz kırılımı), LCP lazy‑hydrate stratejileri
- **Disaster Recovery**: tam geri dönüş tatbikatı (DB+assets), runbook adımları

