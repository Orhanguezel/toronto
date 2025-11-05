# Part 13 – RBAC UI, Audit Log Viewer, BullMQ Queues, Focal‑Point Editor, CDN Purge Hooks, Uptime/Alerting

Bu parçada admin yetkilendirmeyi görünür hale getiriyor, audit kayıtlarını okunur kılıyor, ağır işleri kuyruklara atıyoruz; görseller için **focal‑point** düzenleyicisi, CDN purge kancaları ve uptime/alerting ekliyoruz.

> FE: Next 15 + styled‑components (Admin CSR, Public RSC/SSG/ISR/SSR). BE: Fastify + TS + Drizzle + MariaDB. Queue: BullMQ (Redis).

---

## 0) Önkoşullar

**Redis** gereklidir (BullMQ için):
```bash
docker run -d --name toronto-redis -p 6379:6379 redis:7
```

`.env` (BE):
```
REDIS_URL=redis://127.0.0.1:6379
# CDN (opsiyonel)
CLOUDFLARE_ZONE=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLOUDFLARE_TOKEN=cf_api_token_with_purge_perm
BUNNY_ZONE_ID=12345
BUNNY_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

PM2: Worker’ı ayrı process olarak çalıştıracağız.

---

## 1) BullMQ – Kuyruklar (Index, Mail, Webhook)

### 1.1 Queue tanımları
**`BE: src/queue/index.ts`**
```ts
import { Queue } from 'bullmq';
const connection = { connection: { url: process.env.REDIS_URL! } };
export const indexQueue   = new Queue('index', connection);
export const mailQueue    = new Queue('mail', connection);
export const webhookQueue = new Queue('webhook', connection);
```

### 1.2 Producer yardımcıları (admin CRUD sonlarına konur)
**`BE: src/queue/producers.ts`**
```ts
import { indexQueue, mailQueue, webhookQueue } from './index';
export async function enqueueIndex(entity: string, id: string, action: 'upsert'|'delete'){
  await indexQueue.add('index', { entity, id, action }, { removeOnComplete: 100, attempts: 3, backoff: { type: 'exponential', delay: 1000 } });
}
export async function enqueueMail(msg: { to:string; subject:string; html:string }){
  await mailQueue.add('mail', msg, { removeOnComplete: true, attempts: 3 });
}
export async function enqueueWebhook(payload: any){
  await webhookQueue.add('webhook', payload, { removeOnComplete: 100, attempts: 5, backoff: { type: 'fixed', delay: 2000 } });
}
```

> Örnek: `admin.blog.ts` içinde create/update/delete sonunda `enqueueIndex('blog', id, 'upsert')` çağırın.

### 1.3 Worker (consumer’lar)
**`BE: src/worker.ts`**
```ts
import 'dotenv/config';
import { Worker } from 'bullmq';
import { indexAllMeili, indexAllAlgolia } from '@/jobs/search.index';
import { sendMail } from '@/http/utils/mailer';

const connection = { connection: { url: process.env.REDIS_URL! } };

new Worker('index', async (job) => {
  const { entity } = job.data as { entity:string; id:string; action:string };
  if (process.env.MEILI_URL) await indexAllMeili();
  else if (process.env.ALGOLIA_APP_ID) await indexAllAlgolia();
  return { ok: true, entity };
}, connection);

new Worker('mail', async (job) => {
  const { to, subject, html } = job.data as any;
  await sendMail(to, subject, html);
  return { ok: true };
}, connection);

new Worker('webhook', async (job) => {
  const payload = job.data;
  try {
    const url = process.env.SLACK_WEBHOOK || process.env.DISCORD_WEBHOOK;
    if (url) await fetch(url, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ text: JSON.stringify(payload).slice(0,1800) }) });
  } catch {}
  return { ok: true };
}, connection);

console.log('[worker] started');
```

**PM2** (ekleme):
```js
// ecosystem.config.cjs
module.exports = { apps: [
  // ...toronto-api, toronto-fe
  { name: 'toronto-worker', cwd: '/var/www/toronto-api', script: 'bun', args: 'run worker', env: { NODE_ENV:'production', REDIS_URL: 'redis://127.0.0.1:6379' } }
]}
```

---

## 2) RBAC UI – Rol Yönetimi ve Policy İpuçları

### 2.1 BE – Users & Roles endpoints
**`BE: src/http/routes/admin.rbac.ts`**
```ts
import { FastifyPluginAsync } from 'fastify';
import { db } from '@/core/db';
import { users } from '@/db/schema';
import { roles, userRoles } from '@/db/schema.authx';
import { sql, eq } from 'drizzle-orm';
import { z } from 'zod';

export const adminRbacRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', app.auth);

  app.get('/rbac/users', async () => {
    const rows = await db.execute(sql`
      SELECT u.id, u.email, u.name,
        GROUP_CONCAT(r.name ORDER BY r.name SEPARATOR ',') as roles
      FROM users u
      LEFT JOIN user_roles ur ON ur.user_id=u.id
      LEFT JOIN roles r ON r.id=ur.role_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    return rows;
  });

  app.get('/rbac/roles', async () => db.select().from(roles));

  app.post('/rbac/users/:id/roles', async (req) => {
    const { id } = (req.params as any);
    const body = z.object({ roles: z.array(z.string()) }).parse(req.body);
    await db.execute(sql`DELETE FROM user_roles WHERE user_id=${id}`);
    if (body.roles.length) {
      const rids = await db.execute(sql`SELECT id, name FROM roles WHERE name IN (${sql.join(body.roles, sql`,`)})`);
      const values = (rids as any[]).map(r => `('${id}','${r.id}')`).join(',');
      await db.execute(sql`INSERT INTO user_roles (user_id, role_id) VALUES ${values}`);
    }
    return { ok: true };
  });
};
```
**`BE: src/http/server.ts`**
```ts
import { adminRbacRoutes } from '@/http/routes/admin.rbac';
await app.register(adminRbacRoutes, { prefix: '/admin' });
```

### 2.2 FE – RTK ve UI
**`FE: src/integrations/admin/rbac.endpoints.ts`**
```ts
import { baseApi } from '@/integrations/baseApi';
export const rbacApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    listUsers: b.query<any[], void>({ query: () => ({ url: '/admin/rbac/users' }) }),
    listRoles: b.query<any[], void>({ query: () => ({ url: '/admin/rbac/roles' }) }),
    setUserRoles: b.mutation<{ ok:true }, { id:string; roles:string[] }>({ query: ({ id, roles }) => ({ url: `/admin/rbac/users/${id}/roles`, method: 'POST', body: { roles } }) })
  })
});
export const { useListUsersQuery, useListRolesQuery, useSetUserRolesMutation } = rbacApi as any;
```

**`FE: src/app/(admin)/admin/rbac/page.tsx`**
```tsx
'use client';
import styled from 'styled-components';
import { useListUsersQuery, useListRolesQuery, useSetUserRolesMutation } from '@/integrations/admin/rbac.endpoints';
import { useState } from 'react';

const Table = styled.table` width:100%; border-collapse: collapse; th,td{ padding:10px; border-bottom:1px solid ${({theme})=>theme.colors.border}; }`;

export default function RbacPage(){
  const { data: users } = useListUsersQuery();
  const { data: roles } = useListRolesQuery();
  const [save] = useSetUserRolesMutation();

  return (
    <div>
      <h1>Role Management</h1>
      <Table>
        <thead><tr><th>Kullanıcı</th><th>Roller</th><th></th></tr></thead>
        <tbody>
          {(users||[]).map((u:any)=> <UserRow key={u.id} u={u} roles={roles||[]} onSave={save} />)}
        </tbody>
      </Table>
      <p style={{ opacity:.8, marginTop:8 }}>Policy ipuçları: <code>admin</code> tüm CRUD; <code>editor</code> içerik CRUD (publish hariç); <code>viewer</code> salt okunur.</p>
    </div>
  );
}

function UserRow({ u, roles, onSave }:{ u:any; roles:any[]; onSave:(args:any)=>any }){
  const [sel, setSel] = useState<string[]>(String(u.roles||'').split(',').filter(Boolean));
  const toggle = (r:string)=> setSel(v=> v.includes(r)? v.filter(x=>x!==r): [...v,r]);
  return (
    <tr>
      <td>{u.name||u.email}<div style={{ opacity:.6, fontSize:12 }}>{u.email}</div></td>
      <td>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {(roles||[]).map((r:any)=> (
            <label key={r.id} style={{ display:'inline-flex', gap:6 }}>
              <input type="checkbox" checked={sel.includes(r.name)} onChange={()=>toggle(r.name)} />
              {r.name}
            </label>
          ))}
        </div>
      </td>
      <td>
        <button onClick={async()=>{ await onSave({ id:u.id, roles: sel }).unwrap(); alert('Kaydedildi'); }}>Kaydet</button>
      </td>
    </tr>
  );
}
```

---

## 3) Audit Log Viewer – Filtreler ve Sayfalandırma

### 3.1 BE – Listeleme
**`BE: src/http/routes/admin.audit.ts`**
```ts
import { FastifyPluginAsync } from 'fastify';
import { db } from '@/core/db';
import { auditLogs } from '@/db/schema.authx';
import { sql } from 'drizzle-orm';

export const adminAuditRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', app.auth);
  app.get('/audit', async (req) => {
    const q = (req as any).query || {}; const page = Number(q.page||1), size = Number(q.pageSize||50);
    const wh = [] as any[];
    if (q.entity) wh.push(sql`entity=${q.entity}`);
    if (q.action) wh.push(sql`action=${q.action}`);
    if (q.actor)  wh.push(sql`actor_id=${q.actor}`);
    const where = wh.length? sql`WHERE ${sql.join(wh, sql` AND `)}`: sql``;
    const total = await db.execute(sql`SELECT COUNT(*) c FROM audit_logs ${where}`);
    const items = await db.execute(sql`SELECT * FROM audit_logs ${where} ORDER BY created_at DESC LIMIT ${size} OFFSET ${(page-1)*size}`);
    return { items, total: Number((total as any)[0].c||0), page, pageSize: size };
  });
};
```
**`BE: src/http/server.ts`**
```ts
import { adminAuditRoutes } from '@/http/routes/admin.audit';
await app.register(adminAuditRoutes, { prefix: '/admin' });
```

### 3.2 FE – Sayfa
**`FE: src/app/(admin)/admin/audit/page.tsx`**
```tsx
'use client';
import { useEffect, useState } from 'react';

export default function AuditPage(){
  const [data, setData] = useState<any>(null);
  const [q, setQ] = useState({ entity:'', action:'', actor:'', page:1 });
  const load = async()=>{
    const p = new URLSearchParams(Object.fromEntries(Object.entries(q).filter(([,v])=> String(v))))
    const res = await fetch('/api/_admin/audit?'+p.toString());
    setData(await res.json());
  };
  useEffect(()=>{ load(); },[q]);
  return (
    <div>
      <h1>Audit Log</h1>
      <div style={{ display:'flex', gap:8 }}>
        <input placeholder="entity" value={q.entity} onChange={e=>setQ({...q, entity:e.target.value})} />
        <input placeholder="action" value={q.action} onChange={e=>setQ({...q, action:e.target.value})} />
        <input placeholder="actor"  value={q.actor}  onChange={e=>setQ({...q, actor:e.target.value})} />
      </div>
      <div style={{ height:12 }} />
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead><tr><th>Zaman</th><th>Actor</th><th>Action</th><th>Entity</th><th>Before→After</th><th>IP</th></tr></thead>
        <tbody>
          {(data?.items||[]).map((r:any)=> (
            <tr key={r.id}>
              <td>{new Date(r.created_at).toLocaleString()}</td>
              <td>{r.actor_id}</td>
              <td>{r.action}</td>
              <td>{r.entity}:{r.entity_id}</td>
              <td>
                <details>
                  <summary>diff</summary>
                  <pre>{r.before_json}</pre>
                  <hr />
                  <pre>{r.after_json}</pre>
                </details>
              </td>
              <td>{r.ip}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display:'flex', gap:8, marginTop:8 }}>
        <button disabled={(q.page||1)<=1} onClick={()=>setQ({...q, page:(q.page||1)-1})}>Prev</button>
        <button onClick={()=>setQ({...q, page:(q.page||1)+1})}>Next</button>
      </div>
    </div>
  );
}
```

---

## 4) Focal‑Point Editor – Görsel Odak Noktası

**Amaç:** Kapak/hero görsellerinde odak noktasını seçip (x,y: 0‑100%), public tarafta bu noktayı merkez alarak gösterim yapmak.

### 4.1 DB – media_meta
**`BE: src/db/schema.media.ts`**
```ts
import { mysqlTable, varchar, int, uniqueIndex } from 'drizzle-orm/mysql-core';
export const mediaMeta = mysqlTable('media_meta', {
  id: varchar('id', { length: 191 }).primaryKey(), // public_id veya url hash
  focalX: int('focal_x').default(50), // 0..100
  focalY: int('focal_y').default(50),
}, (t)=>({ ux: uniqueIndex('ux_media').on(t.id) }));
```

### 4.2 BE – API
**`BE: src/http/routes/admin.media.focal.ts`**
```ts
import { FastifyPluginAsync } from 'fastify';
import { db } from '@/core/db';
import { mediaMeta } from '@/db/schema.media';
import { z } from 'zod';

export const adminFocalRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', app.auth);
  app.get('/media/focal', async (req) => {
    const id = String((req as any).query.id||'');
    const [m] = await db.select().from(mediaMeta).where((row)=> row.id.eq(id) as any);
    return m || { id, focalX:50, focalY:50 };
  });
  app.post('/media/focal', async (req) => {
    const b = z.object({ id: z.string().min(3), focalX: z.number().min(0).max(100), focalY: z.number().min(0).max(100) }).parse(req.body);
    await db.insert(mediaMeta).values(b).onDuplicateKeyUpdate({ set: { focalX: b.focalX, focalY: b.focalY } });
    return { ok: true };
  });
};
```
**`server.ts`**: `await app.register(adminFocalRoutes, { prefix: '/admin' });`

> İsteğe bağlı: Cloudinary Admin API ile asset’e **custom coordinates** yazıp dönüşümlerde `g_custom` kullanabilirsiniz. Bu adım servis konfigürasyonuna bağlıdır; yoksa FE’de `object-position` ile odak uygulanır.

### 4.3 FE – Focal editor modal
**`FE: src/shared/admin/media/FocalEditor.tsx`**
```tsx

```

### 4.4 Public render – object-position (ve/ya Cloudinary dönüşümü)
**`FE: src/shared/ui/media/FocalImage.tsx`**
```tsx
import React from 'react';
export default function FocalImage({ src, focal }:{ src:string; focal?:{ x:number; y:number } }){
  const pos = focal? `${focal.x}% ${focal.y}%` : '50% 50%';
  return <img src={src} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition: pos }} />;
}
```

> Cloudinary kullanan projelerde, focal noktayı asset metadata’sına yazıp dönüşümlerde **`g_custom`** ile kullanmak mümkündür; bu durumda URL helper’da focal’i `g_custom` kombinasyonu ile uygularsınız. (Servis detaylarına göre eklenebilir.)

---

## 5) CDN Purge Hooks – Cloudflare & Bunny

**Amaç:** Admin’de içerik güncellendiğinde (ve FE tarafında revalidate tetiklendiğinde) CDN tarafındaki eski kopyaları temizlemek.

**`BE: src/http/utils/cdn.ts`**
```ts
export async function purgeCloudflare(urls: string[]){
  if (!process.env.CLOUDFLARE_TOKEN || !process.env.CLOUDFLARE_ZONE) return;
  await fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE}/purge_cache`, {
    method: 'POST', headers: { 'Authorization': `Bearer ${process.env.CLOUDFLARE_TOKEN}`, 'Content-Type':'application/json' },
    body: JSON.stringify({ files: urls })
  });
}
export async function purgeBunny(urls: string[]){
  if (!process.env.BUNNY_API_KEY || !process.env.BUNNY_ZONE_ID) return;
  await Promise.all(urls.map(u => fetch(`https://api.bunny.net/purge?url=${encodeURIComponent(u)}&cdn=${process.env.BUNNY_ZONE_ID}`, { headers: { 'AccessKey': process.env.BUNNY_API_KEY } })));
}
```

**Kullanım (örnek):** `admin.blog.ts` ve `admin.projects.ts` update işlemi sonunda site URL’leri üretip purge çağırın.

---

## 6) Uptime & Alerting – Health Checks + Status Page

### 6.1 Healthcheck ping (Healthchecks.io / Uptime Kuma uyumlu)
**`BE: src/http/utils/healthPing.ts`**
```ts
export async function healthPing(){
  const url = process.env.HEALTHCHECKS_URL; // örn. https://hc-ping.com/uuid
  if (url) { try { await fetch(url, { method:'GET' }); } catch {} }
}
```
**`BE: src/http/server.ts`** içinde **onReady**: `healthPing()` çağrısı (deployment sonrası). Ayrıca cron ile periyodik ping (PM2 cron veya systemd timer) eklenebilir.

### 6.2 Status Page (basit)
**`FE: src/app/status/page.tsx`**
```tsx

```

> İsteğe bağlı: Prometheus’tan seçili metrikleri okuyup küçük grafikli bir status sayfası üretebilirsiniz.

---

## 7) Kabul Kriterleri (Part 13)
- Redis ile **BullMQ worker** çalışır; admin CRUD sonrası index/mail/webhook işler kuyruğa düşer ve tüketilir.
- **RBAC UI** kullanıcı rollerini listeler ve günceller; policy ipuçları görünür; role kontrolü BE’de uygulanır.
- **Audit Log Viewer** filtreleyip sayfalandırır; before/after diff görülebilir (raw JSON).
- **Focal‑Point Editor** ile odak noktası seçilip kaydedilir; public render’da `object-position` veya servis dönüşümüyle uygulanır.
- İçerik güncellemelerinde **CDN purge** çalışır (Cloudflare/Bunny örnekleri).
- **Status** sayfası ve opsiyonel health ping’leri aktiftir.

---

## 8) Sonraki Parça (Part 14)
- **Queue** iyileştirmeleri (rate limit, concurrency, dead‑letter logs)
- **Image focal‑point → Cloudinary custom coordinates** otomatik yazımı
- **Admin media upload** (signed upload) ve transform preset’leri
- **Search synonyms/typos** (Meili/Algolia)
- **Incident response** runbook + on‑call bildirim akışı

