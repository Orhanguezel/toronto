# Part 14 – Queue Hardening (Rate/Concurrency/DLQ), Cloudinary Custom Coordinates, Signed Uploads & Presets, Search Synonyms/Typos, Incident Response Runbook

Bu parçada prod sağlamlığını arttırıyoruz: BullMQ kuyruklarının dayanıklılığı, Cloudinary’de **custom coordinates (g_custom)** ile odak senkronu, **signed upload** ve transform preset’leri, Meili/Algolia **synonyms & typo tolerance** ayarları ve operasyonel **incident response** runbook’u.

> FE: Next 15 + styled‑components (Admin CSR, Public RSC/SSR/SSG/ISR). BE: Fastify + TS + Drizzle + MariaDB. Queue: BullMQ (+ Redis). Media: Cloudinary.

---

## 0) Queue Hardening – Rate limit, Concurrency, DLQ & Monitoring

### 0.1 Queue konfigürasyonları (limitler, varsayılan iş ayarları)
**`BE: src/queue/index.ts`**
```ts
import { Queue } from 'bullmq';
const base = { connection: { url: process.env.REDIS_URL! } };

export const indexQueue = new Queue('index', {
  ...base,
  defaultJobOptions: { attempts: 5, backoff: { type: 'exponential', delay: 1500 }, removeOnComplete: 200, removeOnFail: 1000 },
  // search provider rate‑limitini zorlamayalım
  limiter: { max: 50, duration: 1000 }
});

export const mailQueue = new Queue('mail', {
  ...base,
  defaultJobOptions: { attempts: 3, backoff: { type: 'fixed', delay: 2000 }, removeOnComplete: true },
  limiter: { max: 10, duration: 1000 }
});

export const webhookQueue = new Queue('webhook', {
  ...base,
  defaultJobOptions: { attempts: 5, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: 200 },
  limiter: { max: 30, duration: 1000 }
});
```

### 0.2 Worker’lar (concurrency, DLQ emit, metrics)
**`BE: src/worker.ts`**
```ts
import 'dotenv/config';
import { Worker, QueueEvents, MetricsTime } from 'bullmq';
import { indexAllMeili, indexAllAlgolia } from '@/jobs/search.index';
import { sendMail } from '@/http/utils/mailer';
import { recordQueueMetric } from '@/observability/queueMetrics';
import { pushDLQ } from '@/queue/dlq';

const base = { connection: { url: process.env.REDIS_URL! } };

new Worker('index', async (job) => {
  if (process.env.MEILI_URL) await indexAllMeili();
  else if (process.env.ALGOLIA_APP_ID) await indexAllAlgolia();
  return { ok: true };
}, { ...base, concurrency: 3 });

new Worker('mail', async (job) => { const { to, subject, html } = job.data; await sendMail(to, subject, html); return { ok: true }; }, { ...base, concurrency: 2 });
new Worker('webhook', async (job) => { const payload = job.data; /* gönder */ return { ok: true }; }, { ...base, concurrency: 4 });

// Events & simple metrics
for (const q of ['index','mail','webhook']){
  const ev = new QueueEvents(q, { ...base, defaultJobId: undefined, fetchEvents: true });
  ev.on('completed', (e)=> recordQueueMetric(q, 'completed'));
  ev.on('failed',    async (e)=> { recordQueueMetric(q, 'failed'); await pushDLQ(q, e.failedReason||'unknown', e.jobId||''); });
}
```

**`BE: src/observability/queueMetrics.ts`**
```ts
import client from 'prom-client';
const c = new client.Counter({ name: 'toronto_queue_events_total', help:'Queue events', labelNames:['queue','event'] });
export function recordQueueMetric(queue: string, event: 'completed'|'failed'){ c.inc({ queue, event }, 1); }
```

### 0.3 DLQ (Dead‑Letter Queue) – DB kayıt + admin görünüm
**`BE: src/db/schema.queue.ts`**
```ts
import { mysqlTable, varchar, text, datetime } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
export const queueFailures = mysqlTable('queue_failures', {
  id: varchar('id', { length: 36 }).primaryKey(),
  queue: varchar('queue', { length: 32 }).notNull(),
  jobId: varchar('job_id', { length: 64 }).notNull(),
  reason: text('reason'),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});
```
**`BE: src/queue/dlq.ts`**
```ts
import { db } from '@/core/db';
import { queueFailures } from '@/db/schema.queue';
export async function pushDLQ(queue: string, reason: string, jobId: string){
  await db.insert(queueFailures).values({ id: crypto.randomUUID(), queue, jobId, reason });
}
```
**Admin route (liste/yeniden dene/sil)** – basit CRUD ekleyin: `/admin/queue/dlq` (Part 13’teki audit listesine benzer tablo + "retry" butonu; `Queue.getJob(jobId)?.retry()`).

### 0.4 Bull Board (opsiyonel hızlı izleme)
```bash
bun add bull-board
```
**`BE: src/http/routes/admin.queue.board.ts`** – Fastify adapter ile basit panel (yalnızca admin). Prod’da temel kimlik doğrulaması ekleyin.

---

## 1) Cloudinary Custom Coordinates – Focal senkronu (g_custom)

### 1.1 Env ve SDK
```
CLOUDINARY_CLOUD=xxxx
CLOUDINARY_KEY=xxxx
CLOUDINARY_SECRET=xxxx
```
```ts
// BE: src/media/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD!, api_key: process.env.CLOUDINARY_KEY!, api_secret: process.env.CLOUDINARY_SECRET! });
export { cloudinary };
```

### 1.2 Focal (%→px) hesaplayıp custom coordinates yazma
**`BE: src/http/routes/admin.media.focal.ts`** (ek)
```ts
import { cloudinary } from '@/media/cloudinary';

app.post('/media/focal/sync', async (req) => {
  const b = z.object({ public_id: z.string(), width: z.number().int().positive().optional(), height: z.number().int().positive().optional(), focalX: z.number().min(0).max(100), focalY: z.number().min(0).max(100), box: z.number().int().min(10).max(400).default(200) }).parse(req.body);
  // Görsel boyutlarını bilmiyorsak Cloudinary’den çek
  let W = b.width, H = b.height;
  if (!W || !H){ const r = await cloudinary.api.resource(b.public_id); W = r.width; H = r.height; }
  // % → px merkez
  const cx = Math.round((b.focalX/100) * (W as number));
  const cy = Math.round((b.focalY/100) * (H as number));
  // Kare kutu
  const half = Math.round(b.box/2);
  const x = Math.max(0, cx - half), y = Math.max(0, cy - half);
  const w = Math.min(b.box, (W as number) - x), h = Math.min(b.box, (H as number) - y);
  // Custom coordinates: x,y,w,h
  await cloudinary.api.update(b.public_id, { custom_coordinates: `${x},${y},${w},${h}` });
  return { ok: true, coords: { x, y, w, h } };
});
```

### 1.3 Public kullanım (g_custom)
**`FE: src/shared/ui/media/ArtDirectedImage.tsx`** (güncelleme örneği)
```tsx
// ...

```
> Böylece admin’de seçilen odak noktası Cloudinary asset’ine yazılır ve her dönüşümde **g_custom** ile uygulanır. (Admin’de “Cloudinary ile senkronize et” checkbox’ı ekleyin.)

---

## 2) Signed Uploads & Transform Preset’leri

### 2.1 Backend – imza üretimi
**`BE: src/http/routes/admin.media.upload.ts`**
```ts
import { FastifyPluginAsync } from 'fastify';
import { cloudinary } from '@/media/cloudinary';
import { z } from 'zod';

export const adminMediaUploadRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', app.auth);
  app.post('/media/upload/sign', async (req) => {
    const b = z.object({ folder: z.string().default('toronto'), tags: z.array(z.string()).optional() }).parse(req.body);
    const ts = Math.floor(Date.now()/1000);
    const params = { timestamp: ts, folder: b.folder, tags: (b.tags||[]).join(',') } as any;
    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_SECRET!);
    return { timestamp: ts, api_key: process.env.CLOUDINARY_KEY, cloud_name: process.env.CLOUDINARY_CLOUD, signature, folder: b.folder, tags: params.tags };
  });
};
```
**`server.ts`**: `await app.register(adminMediaUploadRoutes, { prefix: '/admin' });`

### 2.2 FE – upload helper (XHR)
**`FE: src/shared/admin/media/upload.ts`**
```ts

```

### 2.3 Transform preset’leri
**`FE: src/lib/media/presets.ts`**
```ts

```
> Preset’ler tek merkezden; kart/hero/galeri vb. tüm bileşenler **IMG/VID** fonksiyonlarını kullanır.

---

## 3) Meili / Algolia – Synonyms & Typo Tolerance

### 3.1 Meilisearch ayarları
**`BE: src/jobs/search.settings.meili.ts`**
```ts
export async function setupMeili(){
  const { MeiliSearch } = await import('meilisearch');
  const cli = new MeiliSearch({ host: process.env.MEILI_URL!, apiKey: process.env.MEILI_MASTER_KEY! });
  const syn = {
    // TR
    proje: ['project','projekt'],
    hizmet: ['service','dienstleistung'],
    reklam: ['advertising','werbung'],
    // EN/DE varyasyonları
    project: ['proje','projekt'],
  } as const;
  const typ = { enabled: true, minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 }, disableOnWords: [], disableOnAttributes: [] };
  await cli.index('projects').updateSettings({ synonyms: syn, typoTolerance: typ });
  await cli.index('blog').updateSettings({ synonyms: syn, typoTolerance: typ });
}
```
**Tetikleme:** deploy sonrası veya `indexAll…` çağrısından önce bir kere çalıştırın.

### 3.2 Algolia ayarları
**`BE: src/jobs/search.settings.algolia.ts`**
```ts
export async function setupAlgolia(){
  const alg = (await import('algoliasearch')).default(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_ADMIN_KEY!);
  const syn = [ { objectID: 'core-syn', synonyms: ['proje','project','projekt'] }, { objectID: 'service-syn', synonyms: ['hizmet','service','dienstleistung'] } ];
  const settings = { attributesToIndex: ['title','summary','excerpt'], typoTolerance: 'min', minWordSizefor1Typo: 4, minWordSizefor2Typos: 8 } as any;
  await alg.initIndex(process.env.ALGOLIA_INDEX_PROJECTS!).setSettings(settings);
  await alg.initIndex(process.env.ALGOLIA_INDEX_BLOG!).setSettings(settings);
  await alg.initIndex(process.env.ALGOLIA_INDEX_PROJECTS!).saveSynonyms(syn, { replaceExistingSynonyms: true });
  await alg.initIndex(process.env.ALGOLIA_INDEX_BLOG!).saveSynonyms(syn, { replaceExistingSynonyms: true });
}
```

---

## 4) Incident Response Runbook (Operasyon)

**Amaç:** Olası kesintilerde hızla teşhis/çözüm; görev dağılımı, iletişim ve rollback prosedürleri.

### 4.1 SEV tanımları
- **SEV1**: Müşterilerin çoğunu etkileyen tam veya kritik servis kesintisi (HTTP 5xx yükseldi, ödeme/iletişim çalışmıyor).
- **SEV2**: Kısmi kesinti, önemli feature’lar etkileniyor (Admin giriş, arama, medya CDN gecikmeleri).
- **SEV3**: Hatalar workaround ile aşılabiliyor; düşük etki.

### 4.2 Roller
- **Incident Commander (IC)**: karar, iletişim, görev dağıtımı.
- **Comms Lead**: Slack/Discord/Email duyuruları; status page güncellemesi.
- **Ops/On‑Call**: log/metrics inceleme, rollback/scale.

### 4.3 Akış (ilk 15 dakika)
1) **Tespit**: Uptime alarmı, Sentry, Prometheus alert. IC atanır.
2) **Triyaj**: Etki alanı; ilgili servis (API/FE/DB/CDN/Media/Search/Queue).
3) **Müdahale**:
   - API 5xx artışı → `pm2 logs toronto-api` + `/metrics` + DB bağlantısı.
   - Queue birikimi → Redis/worker logları, DLQ tablosu; hatalı işin tekrar denenmesi.
   - CDN → purge, orijin sağlık kontrolü.
4) **Rollback**: Son deploy’u geri al (`pm2 deploy revert` veya git tag’ine dön).
5) **İletişim**: Status sayfası güncelle, müşteriye kısa net mesaj.

### 4.4 Playbook linkleri (repo içinde `docs/ops/`)
- **API down**: health→metrics→DB→reverse proxy kontrol listesi.
- **Search outage**: fallback LIKE arama aktifleştir; indexing jobs disable.
- **Media/Cloudinary error**: static poster fallback; `g_auto` devreye al; upload’u geçici kapat.
- **Redis/Queue outage**: worker’ları durdur, API içinde `enqueue*` no‑op/queue pausing; veri kaybı notları.

### 4.5 Postmortem şablonu (`docs/ops/postmortem.md`)
```
# Postmortem – <başlık>
- Tarih/Süre:
- SEV:
- Etki (kullanıcı/süreç):
- Zaman Çizelgesi:
- Kök Neden:
- Düzeltici aksiyonlar:
- Önleme/iyileştirme:
```

---

## 5) Kabul Kriterleri (Part 14)
- BullMQ kuyrukları rate‑limit ve concurrency ile çalışır; hata durumları DLQ tablosuna düşer; basit admin DLQ görünümü/yeniden dene.
- Cloudinary **custom coordinates** senkronu: admin’de focal kaydedildikten sonra `g_custom` ile public görseller odaklı kırpılır.
- Signed upload endpoint’i ile admin dosya yükleyebilir; preset URL helper’ları tüm görsel/video bileşenlerinde kullanılır.
- Meili/Algolia synonyms + typo ayarları uygulanır; çok dilli aramada isabet artar.
- Incident runbook repo’da; SEV/roller/akış/postmortem şablonu hazırdır.

---

## 6) Sonraki Parça (Part 15)
- **Admin Media Library**: arama, etiket, klasör; seç‑ekle (RSC uyumlu public render)
- **Sentry** hata izleme + release sourcemaps
- **Perf**: RUM toplama grafiği (percentiles), Slow API trace (pino-http + trace id)
- **Feature flags** (client/server) + safe rollout matrisi
- **Backups**: DB snapshot + asset lifecycle (retention/archival)

