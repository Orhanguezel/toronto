# Part 11 – Tokens Automation (Figma→FE), Author Pages & Related Posts, Projects Attribute Matrix, Admin RBAC + Audit Log, Contact Email/Webhooks

Bu parçada tasarım token’larını **otomatik** üretiyor, Blog’a **author pages + related** ekliyor, projeler için **özellik matrisi** (dinamik karşılaştırma) kuruyor, admin tarafına **RBAC + audit log** ekliyor ve iletişim formunu **email + Slack/Discord webhook** ile entegre ediyoruz.

> Not: Kodlar, önceki Part 1‑10’da oluşturduğumuz dizin ve standartlara oturur. FE: styled‑components, Next 15; BE: Fastify + Drizzle + MariaDB.

---

## 0) Design Tokens Automation (Style Dictionary)

### 0.1 Bağımlılıklar & Script’ler
```bash
bun add -D style-dictionary
```

**`package.json`**
```json
{
  "scripts": {
    "tokens:build": "style-dictionary build"
  }
}
```

### 0.2 Kaynak Token’lar (Tokens Studio export)
**`tokens/global.json`** (örnek minimal set)
```json

```

### 0.3 Style Dictionary config
**`style-dictionary.config.cjs`**
```js

```

### 0.4 FE kullanımı
- **Global CSS Variables**: `src/styles/tokens/tokens.css` dosyasını `app/layout.tsx` içinde import edin.
- **Theme merge**: `src/styles/themes/torontoTheme.ts` içinde Style Dictionary çıktısını import edip TS theme ile birleştirin.

```ts
// src/styles/themes/torontoTheme.ts

```

> Akış: **Figma (Tokens Studio) → `tokens/*.json` → `bun run tokens:build` → CSS vars + TS export → Theme**

---

## 1) Blog – Author Pages & Related Posts

### 1.1 DB: authors tablosuna `slug` ekleme
**`BE: src/db/schema.blog.ts` (güncelle)**
```ts


```

### 1.2 Public routes
**`BE: src/http/routes/public.blog.ts` (eklemeler)**
```ts
// Author detail + posts
app.get('/blog/author/:slug', async (req, rep) => {
  const { slug } = (req.params as any); const locale = resolveLocale(req.headers['accept-language'] as string);
  const [a] = await db.execute(sql`SELECT id, slug, name, avatar_url, bio FROM authors WHERE slug=${slug} LIMIT 1`) as any[];
  if (!a) return rep.code(404).send({ message:'Not found' });
  const posts = await db.execute(sql`
    SELECT bp.slug, bp.cover_url, bp.published_at, bt.title, bt.excerpt
    FROM blog_posts bp JOIN blog_translations bt ON bt.post_id=bp.id AND bt.locale=${locale}
    WHERE bp.status='published' AND bp.author_id=${a.id}
    ORDER BY bp.published_at DESC
    LIMIT 100`);
  return { author: a, posts };
});

// Related posts by overlap (tags/categories) fallback title similarity
app.get('/blog/:slug/related', async (req) => {
  const { slug } = (req.params as any); const locale = resolveLocale(req.headers['accept-language'] as string);
  const [p] = await db.execute(sql`SELECT id FROM blog_posts WHERE slug=${slug} LIMIT 1`) as any[];
  if (!p) return [];
  const tagMatches = await db.execute(sql`
    SELECT bp.slug, bt.title, COUNT(*) as score
    FROM post_tags pt
    JOIN post_tags pt2 ON pt.tag_id=pt2.tag_id AND pt2.post_id!=pt.post_id
    JOIN blog_posts bp ON bp.id=pt2.post_id
    JOIN blog_translations bt ON bt.post_id=bp.id AND bt.locale=${locale}
    WHERE pt.post_id=${p.id} AND bp.status='published'
    GROUP BY bp.slug, bt.title
    ORDER BY score DESC, bp.published_at DESC
    LIMIT 6`);
  if ((tagMatches as any[]).length >= 3) return tagMatches;
  const titleSim = await db.execute(sql`
    SELECT bp.slug, bt.title
    FROM blog_posts bp
    JOIN blog_translations bt ON bt.post_id=bp.id AND bt.locale=${locale}
    WHERE bp.status='published' AND bp.slug!=${slug} AND bt.title LIKE (SELECT CONCAT('%', bt2.title, '%') FROM blog_translations bt2 WHERE bt2.post_id=${p.id} AND bt2.locale=${locale} LIMIT 1)
    LIMIT 6`);
  return titleSim;
});
```

### 1.3 FE sayfaları
**`FE: src/app/[locale]/blog/author/[slug]/page.tsx`**
```tsx

```

**Detail page related bölümü**
```tsx
// FE: src/app/[locale]/blog/[slug]/page.tsx içinde, içerikten sonra

const related = await fetchJSON<any[]>(`/blog/${params.slug}/related`, { revalidate: 600, tags:[`blog_item_${params.slug}_related`], locale: params.locale });
// render: related listesi
```

---

## 2) Projects – Attribute Matrix (Dinamik Karşılaştırma)

### 2.1 DB Şeması
**`BE: src/db/schema.project-attrs.ts`**
```ts

```

### 2.2 Admin Routes (özellik yönetimi & değer atama)
**`BE: src/http/routes/admin.project-attrs.ts`**
```ts

```

**`BE: src/http/server.ts`**
```ts
import { adminProjectAttrRoutes } from '@/http/routes/admin.project-attrs';
await app.register(adminProjectAttrRoutes, { prefix: '/admin' });
```

### 2.3 FE – Compare sayfasını dinamiğe bağlama
**`FE: src/lib/api/public.ts`** (yardımcı: attribute titles)
```ts
export async function getProjectAttrMatrix(locale: string, slugs: string[]){
  // BE tarafında public endpoint yazılabilir; basitçe admin’i proxy etmeyin.
  return fetchJSON<any>(`/projects/compare?ids=${encodeURIComponent(slugs.join(','))}`, { revalidate: 600, tags:['projects_compare'], locale });
}
```

**`BE: src/http/routes/public.projects.compare.ts`**
```ts
import { FastifyPluginAsync } from 'fastify';
import { db } from '@/core/db';
import { resolveLocale } from '@/http/utils/i18n';
import { sql } from 'drizzle-orm';

export const publicProjectsCompareRoutes: FastifyPluginAsync = async (app) => {
  app.get('/projects/compare', async (req) => {
    const ids = String((req as any).query.ids||'');
    const locale = resolveLocale(req.headers['accept-language'] as string);
    const slugs = ids.split(',').map((s:string)=>s.trim()).filter(Boolean);
    if (!slugs.length) return { items: [], attrs: [] };

    const items = await db.execute(sql`SELECT p.id, p.slug, pt.title, p.price_from, p.video_url FROM projects p JOIN project_translations pt ON pt.project_id=p.id AND pt.locale=${locale} WHERE p.slug IN (${sql.join(slugs, sql`,`)})`);
    const pids = (items as any[]).map(i=>i.id);
    const values = await db.execute(sql`SELECT pav.project_id, a.id as attribute_id, at.title, a.type, a.unit, pav.value FROM project_attr_values pav JOIN attributes a ON a.id=pav.attribute_id JOIN attribute_translations at ON at.attribute_id=a.id AND at.locale=${locale} WHERE pav.project_id IN (${sql.join(pids, sql`,`)}) ORDER BY a.order ASC`);
    return { items, values };
  });
};
```

**FE Compare render’ı (Part 10’daki sayfayı güncelleyin)**: `values`’ı satır bazlı gruplayıp tabloyu dinamik üretin (attribute order’a göre).

---

## 3) Admin RBAC (role‑based) + Audit Log

### 3.1 DB Şeması
**`BE: src/db/schema.authx.ts`**
```ts
import { mysqlTable, serial, varchar, text, datetime } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const roles = mysqlTable('roles', { id: serial('id').primaryKey(), name: varchar('name', { length: 32 }).notNull() }); // admin|editor|viewer
export const userRoles = mysqlTable('user_roles', { userId: varchar('user_id', { length: 36 }).notNull(), roleId: varchar('role_id', { length: 36 }).notNull() });

export const auditLogs = mysqlTable('audit_logs', {
  id: varchar('id', { length: 36 }).primaryKey(),
  actorId: varchar('actor_id', { length: 36 }).notNull(),
  action: varchar('action', { length: 64 }).notNull(), // ex: project.update
  entity: varchar('entity', { length: 64 }).notNull(), // ex: projects
  entityId: varchar('entity_id', { length: 64 }).notNull(),
  beforeJson: text('before_json'),
  afterJson: text('after_json'),
  ip: varchar('ip', { length: 64 }),
  userAgent: varchar('user_agent', { length: 255 }),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});
```

### 3.2 Yetki Orta Katmanı
**`BE: src/http/utils/authz.ts`**
```ts
import { FastifyInstance } from 'fastify';
export function authorize(app: FastifyInstance, allowed: string[]){
  return async function (req: any, rep: any){
    await app.auth(req, rep);
    const role = req.user?.role || 'viewer';
    if (!allowed.includes(role)) return rep.code(403).send({ message: 'Forbidden' });
  };
}
```
Kullanım: `app.get('/admin/secure', { onRequest: [authorize(app, ['admin','editor'])] }, handler)`

### 3.3 Audit Helper
**`BE: src/http/utils/audit.ts`**
```ts
import { db } from '@/core/db';
import { auditLogs } from '@/db/schema.authx';
export async function audit(actorId: string, action: string, entity: string, entityId: string, before?: unknown, after?: unknown, meta?: {ip?:string; ua?:string}){
  await db.insert(auditLogs).values({ id: crypto.randomUUID(), actorId, action, entity, entityId, beforeJson: before? JSON.stringify(before): null as any, afterJson: after? JSON.stringify(after): null as any, ip: meta?.ip, userAgent: meta?.ua });
}
```

**Örnek (projects update)**
```ts
app.put('/projects/:id', { onRequest: [authorize(app, ['admin','editor'])] }, async (req) => {
  const { id } = (req.params as any);
  const before = await db.execute(sql`SELECT * FROM projects WHERE id=${id}`);
  // ... update işlemleri
  const actor = (req.user as any)?.sub as string;
  await audit(actor, 'project.update', 'projects', id, before?.[0], { /* new fields */ }, { ip: req.ip, ua: req.headers['user-agent'] as string });
  return { ok: true };
});
```

**Admin UI**: basit bir **Audit Log** sayfası ekleyin (`/admin/audit`) – sayfalandırmalı liste + filtre (action/entity).

---

## 4) Contact → Email + Webhooks

### 4.1 Env
```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=secret
MAIL_FROM="Toronto <noreply@toronto.dev>"
SLACK_WEBHOOK=https://hooks.slack.com/services/XXX/YYY/ZZZ
DISCORD_WEBHOOK=https://discord.com/api/webhooks/ID/TOKEN
```

### 4.2 Mailer (Nodemailer)
**`BE: src/http/utils/mailer.ts`**
```ts
import nodemailer from 'nodemailer';
const tx = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT||587), secure: false, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
export async function sendMail(to: string, subject: string, html: string){ return tx.sendMail({ from: process.env.MAIL_FROM, to, subject, html }); }
```

### 4.3 Webhook helper
**`BE: src/http/utils/webhooks.ts`**
```ts
export async function slack(msg: string){ if (!process.env.SLACK_WEBHOOK) return; await fetch(process.env.SLACK_WEBHOOK, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ text: msg }) }); }
export async function discord(msg: string){ if (!process.env.DISCORD_WEBHOOK) return; await fetch(process.env.DISCORD_WEBHOOK, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ content: msg }) }); }
```

### 4.4 Public contact route’unda tetikleme
**`BE: src/http/routes/public.ts`** (Part 7’deki `/contact` içinde kayıttan sonra)
```ts
import { sendMail } from '@/http/utils/mailer';
import { slack, discord } from '@/http/utils/webhooks';
// kayıt tamamlandıktan sonra:
try{
  const html = `<h3>Yeni iletişim</h3><p><strong>${body.name}</strong> (${body.email})</p><p>${body.message}</p>`;
  await sendMail('info@toronto.dev', 'Yeni iletişim mesajı', html);
  await slack(`Yeni iletişim: ${body.name} <${body.email}>`);
  await discord(`Yeni iletişim: ${body.name} <${body.email}>`);
}catch(e){ req.log.error(e); }
```

> Not: Mail/Webhook tetiklemelerinde **timeout** ve **fail‑safe** uygulayın; kullanıcıya her zaman `{ ok: true }` döndürün.

---

## 5) Kabul Kriterleri (Part 11)
- **Tokens automation**: `bun run tokens:build` çıktılarıyla theme güncellenir; FE globalde CSS vars ve TS export kullanılır.
- **Author pages**: `/[locale]/blog/author/[slug]` yayınlanır; author’lara ait yazılar listelenir.
- **Related posts**: blog detayda 3‑6 ilişkili yazı görünür (tag/category skorlaması, fallback başlık benzerliği).
- **Project attribute matrix**: admin’de attribute tanımla/çevir; projeye değer ata; Compare sayfası **dinamik** satırlar üretir.
- **RBAC + Audit**: admin endpoint’lerinde role kontrolü; güncelleme sonrası audit kaydı; admin audit liste sayfası çalışır.
- **İletişim**: form gönderiminde email + Slack/Discord webhook’u tetiklenir.

---

## 6) Sonraki Parça (Part 12)
- **Admin dashboard** metrik kartları (Prometheus `/metrics` + iş metrikleri)
- **Algolia/Meilisearch** ile tam metin arama
- **Sitemap split** (locale & tür bazlı) + **hreflang** doğrulama testleri
- **Image focal point** ve **art‑direction** (responsive source set, Cloudinary transformations)
- **E2E genişletmeleri**: author/related/attributes & RBAC senaryoları

