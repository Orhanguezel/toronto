# Part 17 – Media Preset Manager + AI Focal, TCF 2.2 CMP, Bandit A/B, Server‑Timing/INP, Blue‑Green/Canary

Bu parçada Media Pro’yu bir üst seviyeye taşıyor, TCF 2.2 uyumlu rıza akışını ekliyor, A/B için çok kollu bandit (Thompson Sampling) mantığını kuruyor, `Server-Timing` + INP’yi ölçümlüyor ve mavi‑yeşil/canary dağıtımı ile DB failover stratejilerini tamamlıyoruz.

> FE: Next 15 (RSC + SSR/SSG/ISR), styled‑components. BE: Fastify + TS + Drizzle + MariaDB. Media: Cloudinary. Queue: BullMQ.

---

## 0) Media Preset Manager + AI Focal

### 0.1 Şema – Preset ve Variant’lar
**`BE: src/db/schema.media.presets.ts`**
```ts
import { mysqlTable, varchar, int, text, datetime, serial, uniqueIndex, tinyint } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const mediaPresets = mysqlTable('media_presets', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 64 }).notNull(), // hero|card|thumb|banner
  width: int('width').notNull(),
  height: int('height').notNull(),
  crop: varchar('crop', { length: 16 }).notNull().default('fill'), // fill|thumb|crop
  gravity: varchar('gravity', { length: 32 }).notNull().default('custom'), // custom|auto|face|faces|subject
  quality: varchar('quality', { length: 16 }).notNull().default('auto'), // auto|80|...
  format: varchar('format', { length: 16 }).notNull().default('auto'),
  active: tinyint('active').notNull().default(1)
}, (t)=>({ ux: uniqueIndex('ux_media_preset').on(t.key) }));

export const mediaVariants = mysqlTable('media_variants', {
  id: serial('id').primaryKey(),
  mediaId: varchar('media_id', { length: 191 }).notNull(), // media_items.id (public_id)
  presetKey: varchar('preset_key', { length: 64 }).notNull(),
  url: text('url').notNull(),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
}, (t)=>({ ux: uniqueIndex('ux_media_variant').on(t.mediaId, t.presetKey) }));
```

### 0.2 Admin – Preset CRUD + Toplu Variant Üretimi
**`BE: src/http/routes/admin.media.presets.ts`**
```ts
import { FastifyPluginAsync } from 'fastify';
import { db } from '@/core/db';
import { mediaPresets, mediaVariants } from '@/db/schema.media.presets';
import { sql } from 'drizzle-orm';
import { z } from 'zod';

export const adminMediaPresetRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', app.auth);
  app.get('/media/presets', async ()=> db.select().from(mediaPresets));
  app.put('/media/presets/:key', async (req)=>{
    const { key } = (req.params as any);
    const b = z.object({ width:z.number(), height:z.number(), crop:z.string(), gravity:z.string(), quality:z.string().default('auto'), format:z.string().default('auto'), active:z.boolean().default(true) }).parse(req.body);
    await db.insert(mediaPresets).values({ key, ...b, active: b.active?1:0 }).onDuplicateKeyUpdate({ set: { width:b.width, height:b.height, crop:b.crop, gravity:b.gravity, quality:b.quality, format:b.format, active:b.active?1:0 } });
    return { ok:true };
  });
  app.post('/media/:id/variants/rebuild', async (req)=>{
    const { id } = (req.params as any);
    // Kuyruğa iş at: her aktif preset için variant oluştur
    await app.queues.webhookQueue.add('media_rebuild', { mediaId: id });
    return { ok:true };
  });
};
```

**Worker – variant üretimi**
**`BE: src/workers/media.variants.ts`**
```ts
import { Worker } from 'bullmq';
import { db } from '@/core/db';
import { mediaPresets, mediaVariants } from '@/db/schema.media.presets';
import { mediaMeta } from '@/db/schema.media';

new Worker('webhook', async (job)=>{
  if (job.name !== 'media_rebuild') return; const { mediaId } = job.data as any;
  const [meta] = await db.select().from(mediaMeta).where((r)=> r.id.eq(mediaId) as any);
  const presets = await db.select().from(mediaPresets).where((r)=> r.active.eq(1) as any);
  for (const p of presets){
    const g = p.gravity === 'custom' ? `g_custom` : (p.gravity === 'face' ? `g_face` : (p.gravity === 'faces' ? `g_faces` : (p.gravity === 'subject' ? `g_auto:subject` : `g_auto`)));
    const url = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD}/image/upload/f_${p.format},q_${p.quality},c_${p.crop},${g},w_${p.width},h_${p.height}/${mediaId}`;
    await db.insert(mediaVariants).values({ mediaId, presetKey: p.key, url }).onDuplicateKeyUpdate({ set: { url } });
  }
  return { ok:true };
}, { connection: { url: process.env.REDIS_URL! } });
```

> Not: `g_custom` için Part 14’teki **custom coordinates** senkronu gereklidir; yoksa `g_auto`/`g_face(s)` kullanılır.

### 0.3 AI Focal – Otomatik odak noktası tespiti
**`BE: src/http/routes/admin.media.ai.ts`** (özet)
```ts
import { FastifyPluginAsync } from 'fastify';
import { cloudinary } from '@/media/cloudinary';
import { db } from '@/core/db';
import { mediaMeta } from '@/db/schema.media';
import { z } from 'zod';

export const adminMediaAIRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', app.auth);
  app.post('/media/focal/auto', async (req)=>{
    const b = z.object({ public_id: z.string() }).parse(req.body);
    const r = await cloudinary.api.resource(b.public_id, { faces: true, quality_analysis: false });
    // yüz bbox → merkez
    let fx = 50, fy = 50;
    if (Array.isArray(r.faces) && r.faces.length){
      const [x,y,w,h] = r.faces[0] as number[]; fx = Math.round(((x + w/2)/r.width)*100); fy = Math.round(((y + h/2)/r.height)*100);
    }
    await db.insert(mediaMeta).values({ id: b.public_id, focalX: fx, focalY: fy }).onDuplicateKeyUpdate({ set: { focalX: fx, focalY: fy } });
    return { focalX: fx, focalY: fy };
  });
};
```
> Yüz yoksa Cloudinary `g_auto:subject` ile variant üretiminde konu merkezleme denenir. İsteğe bağlı: çoklu yüzlerin ağırlıklı merkezi.

### 0.4 FE – Preset Manager UI
- `/admin/media/presets` sayfası: liste + edit modal; **Toplu rebuild** butonu (seçili media’lar için).
- Media card’da “Auto Focal” → `/admin/media/focal/auto` çağır, ardından **Sync to custom coords** (Part 14 `/media/focal/sync`).

---

## 1) CMP (TCF 2.2) – Rıza ve Tag Gating

### 1.1 Global Stub ve TC String erişimi
- **CMP entegrasyonu** sonrası tarayıcıda `__tcfapi` mevcuttur. Script gating katmanı TC string’i kontrol ederek 3rd‑party tag’leri yükler.

**`FE: src/shared/privacy/tcfGate.ts`**
```ts

```
- **Banner**: TCF 2.2 uyumlu CMP sağlayıcısı (ör. bir CMP SaaS) ile konfigüre edilir; Vendor List (GVL) otomatik güncellenir.
- **Locale**: CMP UI metinleri Part 7 **site settings** üzerinden yönetilir; `lang` = `[locale]`.

### 1.2 Gelişmiş Kurallar
- Reklam tag’leri için **Purpose 3/4/7** vb. kontrol; Google Ads/GA4 mapping.
- **TC string** backend’e (isteğe bağlı) loglanmaz; yalnız **policy** gereği gerekmiyorsa saklamayın.

### 1.3 Kabul
- Rıza olmadan analytics/ads tag’leri yüklenmez.
- CMP açık kapalı durumları e2e testleri ile doğrulanır (UI stub + `window.__tcfapi` mock).

---

## 2) A/B – Çok Kollu Bandit (Thompson Sampling)

### 2.1 İstatistik Deposu
**`BE: src/db/schema.experiments.stats.ts`**
```ts
import { mysqlTable, varchar, int } from 'drizzle-orm/mysql-core';
export const expStats = mysqlTable('experiment_stats', {
  expId: varchar('exp_id', { length: 36 }).primaryKey(),
  // Toplam deneme ve başarı
  trialsA: int('trials_a').notNull().default(0), successA: int('success_a').notNull().default(0),
  trialsB: int('trials_b').notNull().default(0), successB: int('success_b').notNull().default(0),
  // opsiyonel C,D ... genişletilebilir
});
```

### 2.2 Atama (sticky) – mevcut altyapıyla uyumlu
- Kullanıcı `uid` cookie’si ile sticky atanır (Part 16).
- Bandit **gösterim ağırlıkları** admin tarafından başta %50/%50; sonra worker günceller.

### 2.3 Thompson Sampling Worker
**`BE: src/workers/experiments.bandit.ts`**
```ts
import { Worker } from 'bullmq';
import { db } from '@/core/db';
import { experiments, variants } from '@/db/schema.experiments';
import { expStats } from '@/db/schema.experiments.stats';

function sampleBeta(alpha:number, beta:number){
  // Basit kabul: Math.random() tabanlı approx. (daha iyi için Box–Muller vs.)
  const a = alpha, b = beta; // alpha = success+1, beta = failures+1
  // naive: Monte Carlo ile birkaç örnek alınıp max seçilebilir
  let best = 0; for (let i=0;i<5;i++){ best = Math.max(best, Math.random() ** (1/a) * Math.random() ** (1/b)); }
  return best;
}

new Worker('index', async (job)=>{
  if (job.name !== 'bandit_update') return;
  const exps = await db.select().from(experiments).where((r:any)=> r.status.eq('running'));
  for (const e of exps){
    const st = (await db.select().from(expStats).where((r:any)=> r.expId.eq(e.id)))[0]; if (!st) continue;
    const sucA = st.successA, failA = st.trialsA - st.successA;
    const sucB = st.successB, failB = st.trialsB - st.successB;
    const sA = sampleBeta(sucA+1, failA+1);
    const sB = sampleBeta(sucB+1, failB+1);
    let wA = 50, wB = 50; if (sA !== sB){ const sum = sA + sB; wA = Math.round((sA/sum)*100); wB = 100 - wA; }
    // guardrails: aşırı sıçrama engeli
    const clamp = (w:number)=> Math.max(10, Math.min(90, w));
    wA = clamp(wA); wB = clamp(wB);
    await db.execute(`UPDATE experiment_variants SET weight = CASE key WHEN 'A' THEN ${wA} WHEN 'B' THEN ${wB} END WHERE exp_id='${e.id}' AND key IN ('A','B')`);
  }
  return { ok:true };
}, { connection: { url: process.env.REDIS_URL! } });
```

> Minimum veri eşiği (ör. her varyant ≥ 200 deneme) olmadan ağırlık güncellenmez. Stop kuralı: p90 güven aralığı ayrışınca veya max süre dolunca.

### 2.4 FE – Atama Ağırlıklarının Kullanımı
- Assign endpoint (Part 16) varyantı seçerken **ağırlıklı** seçim yapar.
- Event toplama: `convert` olayını önemli hedeften tetikleyin (örn. “iletişim gönder” veya “teklif talebi”).

---

## 3) Server‑Timing + INP

### 3.1 Fastify – Server‑Timing header
**`BE: src/http/plugins/serverTiming.ts`**
```ts
import { FastifyPluginAsync } from 'fastify';
export const serverTiming: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', (req:any, _rep, done)=>{ req._t = { start: process.hrtime.bigint(), db: 0n }; done(); });
  app.decorateReply('timing', function(name:string, durMs:number){
    const h = this.getHeader('Server-Timing');
    const val = `${String(h||'')}${h? ', ': ''}${name};dur=${durMs.toFixed(1)}`; this.header('Server-Timing', val);
  });
  app.addHook('onResponse', (req:any, rep:any, done)=>{ const total = Number((process.hrtime.bigint() - req._t.start)/1000000n); rep.timing('app', total); done(); });
};
```
**Kullanım**: DB çağrısı sonrası `reply.timing('db', ms)`.

### 3.2 INP – Client toplama
**`FE: src/app/inp-listener.ts`**
```ts

```
**Layout**: `<Script dangerouslySetInnerHTML={{ __html: 'window.addEventListener("load",()=>{try{window.__initINP&&window.__initINP()}catch(e){}});' }} />` + globalda `window.__initINP = initINP`.

---

## 4) Blue‑Green Deploy, Canary, DB Failover

### 4.1 Nginx – Mavi/Yeşil upstream
**`/etc/nginx/conf.d/toronto.conf`** (özet)
```nginx
upstream toronto_blue  { server 127.0.0.1:4001; }
upstream toronto_green { server 127.0.0.1:4002; }
map $cookie_canary $toronto_upstream {
  default toronto_blue;
  ~^v2$   toronto_green; # canary cookie = v2
}
server {
  listen 443 ssl http2; server_name toronto.dev;
  location / { proxy_pass http://$toronto_upstream; }
}
```
**Akış**: Yeni sürümü `green`’e deploy → canary cookie alan %5 trafik → metrikler ok → tamam ise **swap** (cookie kaldır, default=green).

### 4.2 PM2 – İki FE/BE örneği
- `toronto-api-blue` (:4001), `toronto-api-green` (:4002) – aynı şekilde FE SSR portları.
- Deploy script: symlink `current_blue`/`current_green` ve PM2 reload.

### 4.3 DB – Read Replica ve Failover (MariaDB)
- **Replica**: `server_id`, `binlog_format=row`, `replicate_do_db=toronto`.
- **Failover** (manuel): replica STOP SLAVE → read/write enable → app `DB_HOST` switch (feature flag: maintenance + revalidate cache) → eski master onar.
- **ProxySQL/Haproxy** opsiyonel: otomatik role switch riskli; önce manuel doğrulama önerilir.

---

## 5) Kabul Kriterleri (Part 17)
- Preset Manager ile aktif preset’ler düzenlenir; rebuild kuyruğu variant URL’lerini üretir; `g_custom/auto/face` çalışır.
- “Auto Focal” yüz merkezini bularak focal kaydeder; istenirse custom coords’a senkron edilir.
- TCF 2.2 gate: rıza yoksa analytics/ads yüklenmez; TC data ile şartlı yükleme doğrulanır.
- A/B bandit: Thompson Sampling ile ağırlıklar zamanla adapte olur; guardrails uygulanır.
- Server‑Timing header’ı cevaplarda görünür; INP eventi RUM’a aktarılır.
- Mavi‑yeşil dağıtım ve canary cookie ile kademeli geçiş yapılabilir; DB failover runbook’u hazırdır.

---

## 6) Sonraki Parça (Part 18)
- **Preset Designer**: sürükle‑bırak crop alanı → preset kaydetme; preset test matrisi (farklı ekranlarda önizleme)
- **CMP**: GPP (Global Privacy Platform) adaptörü + US/CA bölgesel sinyaller
- **Bandit**: çok varyant (A/B/C/D) + min‑risk durdurma; Bayesian credible interval raporları
- **Perf**: `Server-Timing` → Prometheus exporter; INP yüksek sayfalar için oto analiz raporu
- **Ops**: canary otomasyonu (CI deploy aşamasında küçük trafik dilimi), DB semi‑auto failover scriptleri

