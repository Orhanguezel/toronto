# Part 28 – Speculation Simulator (Monte‑Carlo), WhatsApp Two‑Way + CRM, Consent TTL (Per‑Purpose), Progressive Image Streaming (Blurhash → AVIF → HQ), Capacity‑Based Autoscaling (HPA/KEDA)

Bu parça; kullanıcı akışlarından **dinamik speculation** kuralları üretmek için **Monte‑Carlo** simülasyonunu ekler, **WhatsApp iki yönlü mesajlaşmayı** CRM notlarıyla bütünler, **rıza (consent)** için **per‑purpose TTL** yaklaşımını uygular, görsellerde **kademeli/progressive** yükleme stratejisini kurar ve **kuyruk/CPU** metriklerine göre **otomatik ölçeklemeyi** (HPA/KEDA) tanımlar.

> FE: Next.js 15 (RSC/SSR/SSG/ISR) + styled‑components (tema: `ensotekTheme`).  
> BE: Fastify + TS + Drizzle + MariaDB.  
> Data: ClickHouse/BQ (Part 21–22).  
> Observability: Prometheus + RUM.  
> Messaging: WhatsApp Cloud API (opsiyonel e‑posta yedek).  
> Queue: Redis/BullMQ.

---

## 0) Speculation Simulator – Monte‑Carlo ile Flow Üretimi

### 0.1 Hedef
- Part 27’deki akış çıkarımını **olasılıksal** hale getirip, segment bazlı **en muhtemel N sonraki rota** için **speculation rules** üretmek.

### 0.2 Veri Modeli
**`BE: src/db/schema.flows.ts`**
```ts
import { mysqlTable, varchar, int, float, datetime } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const flowEdges = mysqlTable('flow_edges', {
  seg: varchar('seg', { length: 8 }).notNull(),  // tr-m | de-d | en-d
  from: varchar('from', { length: 191 }).notNull(),
  to: varchar('to', { length: 191 }).notNull(),
  c: int('c').notNull().default(0),               // gözlem sayısı
  p: float('p').notNull().default(0),             // normalize olasılık
  updatedAt: datetime('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});
```

### 0.3 Simülatör (Node)
**`BE: src/jobs/flows.simulate.ts`** (özet)
```ts
import { db } from '@/core/db';
import { flowEdges } from '@/db/schema.flows';

export async function simulate({ seg, starts, steps = 3, sims = 5000 }:{ seg:string; starts:string[]; steps?:number; sims?:number }){
  // Edges → adjacency: from → [{to,p}]
  const edges = await db.select().from(flowEdges).where((r:any)=> r.seg.eq(seg));
  const adj = new Map<string, Array<{to:string, p:number}>>();
  for (const e of edges){
    const a = adj.get(e.from) || []; a.push({ to:e.to, p:e.p }); adj.set(e.from, a);
  }
  const hits = new Map<string, number>();
  function pick(arr: Array<{to:string,p:number}>){
    const r = Math.random(); let acc = 0; for(const x of arr){ acc += x.p; if (r <= acc) return x.to; } return arr[arr.length-1].to;
  }
  for (let s=0; s<sims; s++){
    let cur = starts[Math.floor(Math.random()*starts.length)];
    for (let i=0; i<steps; i++){
      const opts = adj.get(cur); if (!opts || !opts.length) break;
      cur = pick(opts); hits.set(cur, (hits.get(cur)||0)+1);
    }
  }
  // En muhtemel hedefler → speculation seti
  const ranked = [...hits.entries()].sort((a,b)=> b[1]-a[1]).slice(0,8).map(([to, n])=> ({ to, score: n/sims }));
  return ranked;
}
```

### 0.4 Speculation JSON üretimi
**`BE: src/http/routes/perf.speculation.dynamic.ts`**
```ts
app.get('/perf/speculation/dynamic', async (req)=>{
  const seg = String((req.query as any).seg || 'en-d');
  const starts = ['/', '/'+seg.split('-')[0]+'/projects'];
  const ranked = await simulate({ seg, starts });
  const prerender = ranked.slice(0,2).map(r=> ({ source:'document', where:{ href_matches: process.env.PUBLIC_ORIGIN + r.to }, eagerness:'moderate' }));
  const prefetch = ranked.slice(2,8).map(r=> ({ source:'document', where:{ href_matches: process.env.PUBLIC_ORIGIN + r.to }, eagerness:'eager' }));
  return { prerender, prefetch };
});
```

### 0.5 FE Entegrasyon (RSC)
**`FE: src/shared/perf/SpeculationMC.tsx`**
```tsx

```

### 0.6 Kabul
- Segment bazlı en muhtemel hedefler 5 dk’da bir yenilenir; INP ve sayfa geçiş süresi düşer.

---

## 1) WhatsApp Two‑Way + CRM

### 1.1 Şema
**`BE: src/db/schema.crm.ts`**
```ts
import { mysqlTable, varchar, text, json, datetime, tinyint } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const crmContacts = mysqlTable('crm_contacts', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 96 }),
  email: varchar('email', { length: 191 }),
  phone: varchar('phone', { length: 32 }),
  locale: varchar('locale', { length: 8 }).default('tr'),
  consent: json('consent') // { whatsapp:true, email:true }
});
export const crmConvos = mysqlTable('crm_convos', {
  id: varchar('id', { length: 36 }).primaryKey(),
  contactId: varchar('contact_id', { length: 36 }).notNull(),
  channel: varchar('channel', { length: 16 }).notNull(), // whatsapp|email
  status: varchar('status', { length: 16 }).notNull().default('open'),
  meta: json('meta'),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});
export const crmMessages = mysqlTable('crm_messages', {
  id: varchar('id', { length: 36 }).primaryKey(),
  convoId: varchar('convo_id', { length: 36 }).notNull(),
  direction: varchar('direction', { length: 8 }).notNull(), // in|out
  body: text('body'),
  payload: json('payload'), // media/link/buttons
  sentAt: datetime('sent_at'),
  readAt: datetime('read_at')
});
export const crmNotes = mysqlTable('crm_notes', {
  id: varchar('id', { length: 36 }).primaryKey(),
  contactId: varchar('contact_id', { length: 36 }).notNull(),
  body: text('body').notNull(),
  createdBy: varchar('created_by', { length: 36 }),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});
```

### 1.2 Inbound Webhook (WhatsApp Cloud API)
**`BE: src/http/routes/wa.webhook.ts`** (özet)
```ts
app.post('/webhooks/wa', async (req, rep) => {
  const ev = req.body as any; // doğrulama + signature
  const msg = parseWA(ev);
  const contactId = await upsertContact(msg.from);
  const convoId = await ensureOpenConvo(contactId, 'whatsapp');
  await saveInbound(convoId, msg);
  queueWorker('wa:auto-reply', { convoId, msg }); // opsiyonel bot/KB
  return { ok:true };
});
```

### 1.3 Outbound Gönderim
**`BE: src/http/routes/wa.send.ts`**
```ts
app.post('/admin/wa/send', { preHandler: app.auth }, async (req)=>{
  const { convoId, text } = req.body as any;
  const { to } = await getConvoTarget(convoId);
  await sendWA(to, { type:'text', text });
  await saveOutbound(convoId, text);
  return { ok:true };
});
```

### 1.4 Admin UI (özet)
- `/admin/crm`: sol panel **convos**, orta panel **mesaj akışı**, sağ panel **contact kartı + notlar**.  
- Kısa yollar: `Cmd+Enter` gönder, `/template` seçici, `@agent` mention.

### 1.5 Rıza & Hukuki
- `consent.whatsapp===true` olmadan outbound yok.  
- `/unsubscribe` kısa linki otomatik ekle (TR/DE/EN metinleri).

### 1.6 Kabul
- Inbound/outbound akışı işler; mesajlar okundu/teslim edildi durumları güncellenir; notlar kaydı tutulur.

---

## 2) Consent TTL – Per‑Purpose Refresh

### 2.1 Model
**`BE: src/db/schema.consent.state.ts`**
```ts
import { mysqlTable, varchar, json, datetime } from 'drizzle-orm/mysql-core';
export const consentState = mysqlTable('consent_state', {
  userId: varchar('user_id', { length: 64 }).primaryKey(), // veya anonId (cookie)
  region: varchar('region', { length: 8 }),
  purposes: json('purposes'), // { analytics:{val:true, ts:'2025-10-20'}, ads:{val:false,ts:'...'} }
  updatedAt: datetime('updated_at')
});
```

### 2.2 TTL Kuralları
- **Analytics**: 6 ay; **Ads**: 3 ay; **Personalization**: 12 ay (örnek).  
- Süresi geçen amaçlar için **fresh‑consent** banner’ı yalnız ilgili bloklarda tetiklenir.

### 2.3 FE Yardımcı
**`FE: src/shared/consent/useConsent.ts`**
```ts

```
**Kullanım**: `ScriptGate id="gtag" allow={hasConsent('analytics', state)}`.

### 2.4 Kabul
- Süresi dolan amaçlar için yeniden onay akışı görünür; vendor scriptleri TTL dışında yüklenmez.

---

## 3) Progressive Image Streaming – Blurhash → AVIF → HQ

### 3.1 Strateji
1) **SSR**: placeholder (blurhash/canvas veya ultra küçük JPEG) ile hızlı görüntü.  
2) **Küçük AVIF** (w=480–640, `q=40`) görünür olunca yüklenir.  
3) **Tam çözünürlük** (AVIF/WebP, `q_auto`) idle’da.

### 3.2 Sunucu Bileşeni
**`FE: src/shared/media/ProgImage.tsx`**
```tsx

```

### 3.3 Client Helper
**`FE: src/shared/media/ProgressiveSwap.tsx`**
```tsx

```

### 3.4 SEO & Performans
- `alt` zorunlu; `<figure><figcaption/>` opsiyonel.  
- LCP görsellerinde `fetchpriority="high"` ve `preload`.  
- Temadan gelen **ImageCard**/**ResponsiveFrame** stilleri kullanılmalı.

### 3.5 Kabul
- LCP görseli daha hızlı görünür; CLS sıfıra yakın; scrolled alan görselleri kademeli yükselir.

---

## 4) Capacity‑Based Autoscaling – HPA + KEDA

### 4.1 CPU/Memory HPA
**`k8s/hpa-backend.yaml`**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: toronto-backend
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: toronto-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### 4.2 Queue‑Depth ile KEDA (Redis/BullMQ)
**`k8s/keda-queue.yaml`**
```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: toronto-worker
spec:
  scaleTargetRef:
    name: toronto-worker
  minReplicaCount: 1
  maxReplicaCount: 20
  cooldownPeriod: 120
  pollingInterval: 5
  triggers:
  - type: redis
    metadata:
      addressFromEnv: REDIS_URL
      listName: bull:default:wait
      listLength: '100'   # 1 pod ≈ 100 bekleyen iş
```

### 4.3 Anti‑Flap & Degrade
- KEDA `cooldownPeriod` + HPA stabilizationWindow.  
- Part 26’daki **degrade mod** alarmda otomatik tetiklenir; ardından rollback gerekiyorsa CI çalışır (Part 25).

### 4.4 Kabul
- Spike sırasında worker’lar saniyeler içinde genişler; kuyruk hedef < 2 dk’ya iner; gereksiz dalgalanma yok.

---

## 5) Kabul Kriterleri (Part 28)
- Monte‑Carlo simülatöründen üretilen speculation kuralları RSC’de enjekte edilip performansı iyileştirir.  
- WhatsApp iki yönlü mesajlar ve CRM notları adminde yönetilir; rıza ve unsubscribe akışları doğru işler.  
- Consent TTL per‑purpose uygulanır; süresi dolan amaçlar için tazeleme istenir.  
- Progressive image stratejisi LCP/TBT/INP metriklerini iyileştirir; CLS yok.  
- HPA/KEDA ile kapasite otomatik ölçeklenir; kuyruk bekleme süresi limit altında kalır.

---

## 6) Sonraki Parça (Part 29)
- **Scenario‑based A/B**: akış segmentlerine göre deney tarifleri + otomatik analiz  
- **CRM**: çok kanallı sıra (e‑posta→WA→telefon), SLA ölçümü, agent rota  
- **Consent**: granular event log analizi ve denetim raporları  
- **Images**: AVIF tiling + priority hints için deneyler  
- **Autoscaling**: Karpenter/Cluster Autoscaler ve node sınıfı optimizasyonu

