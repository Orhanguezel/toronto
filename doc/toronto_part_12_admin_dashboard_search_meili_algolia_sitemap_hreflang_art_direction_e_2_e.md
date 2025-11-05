# Part 12 – Admin Dashboard Metrics, Search (Meilisearch/Algolia), Sitemap/Hreflang, Cloudinary Art‑Direction, E2E Genişletmeleri

Bu parça, prod kalitesini tamamlayan görünürlük, arama, SEO ve medya tarafını güçlendirir:

- **Admin Dashboard**: iş + runtime metrikleri (Prometheus + DB)
- **Search**: Meilisearch **veya** Algolia entegrasyonu, incremental index
- **Sitemap/Hreflang**: locale ve tür bazlı bölünmüş sitemap, alternates.languages
- **Cloudinary Art‑Direction**: focal‑point kesimler, `<picture>` kaynakları
- **E2E**: dashboard, search, hreflang, image art‑direction testleri

> FE public: **RSC + SSG/ISR/SSR**. Admin: **CSR**. Stil: **styled‑components**. BE: Fastify + MariaDB + Drizzle.

---

## 0) Admin Dashboard – İş & Runtime Metrikleri

### 0.1 BE – İş metrikleri endpoint’i
**`BE: src/http/routes/admin.metrics.business.ts`**
```ts
import { FastifyPluginAsync } from 'fastify';
import { db } from '@/core/db';
import { sql } from 'drizzle-orm';

export const adminBusinessMetricsRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', app.auth);
  app.get('/metrics/business', async () => {
    const [projectsTotal] = await db.execute(sql`SELECT COUNT(*) c FROM projects`);
    const [projectsPublished] = await db.execute(sql`SELECT COUNT(*) c FROM projects WHERE status='published'`);
    const [servicesTotal] = await db.execute(sql`SELECT COUNT(*) c FROM services`);
    const [contacts7d] = await db.execute(sql`SELECT COUNT(*) c FROM contact_messages WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`);
    const dailyContacts = await db.execute(sql`
      SELECT DATE(created_at) d, COUNT(*) c FROM contact_messages
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
      GROUP BY DATE(created_at) ORDER BY d ASC`);
    return {
      counters: {
        projects: Number(projectsTotal?.c||0),
        projectsPublished: Number(projectsPublished?.c||0),
        services: Number(servicesTotal?.c||0),
        contacts7d: Number(contacts7d?.c||0)
      },
      charts: { dailyContacts }
    };
  });
};
```
**`BE: src/http/server.ts`**
```ts
import { adminBusinessMetricsRoutes } from '@/http/routes/admin.metrics.business';
await app.register(adminBusinessMetricsRoutes, { prefix: '/admin' });
```

### 0.2 Admin UI – Dashboard sayfası
**`FE: src/app/(admin)/admin/page.tsx`** (örnek minimal)
```tsx
'use client';
import styled from 'styled-components';
import { useEffect, useState } from 'react';

const Grid = styled.div` display:grid; grid-template-columns: repeat(4, 1fr); gap:12px; `;
const Card = styled.div` padding:16px; border:1px solid ${({theme})=>theme.colors.border}; border-radius:${({theme})=>theme.radii.lg}px; background:${({theme})=>theme.colors.surface}; `;

export default function AdminDashboard(){
  const [data, setData] = useState<any>(null);
  useEffect(()=>{ fetch('/api/_admin/metrics/business').then(r=>r.json()).then(setData); },[]);
  return (
    <div>
      <h1>Dashboard</h1>
      <Grid>
        <Card><small>Projects</small><div style={{ fontSize:28 }}>{data?.counters?.projects ?? '—'}</div></Card>
        <Card><small>Published</small><div style={{ fontSize:28 }}>{data?.counters?.projectsPublished ?? '—'}</div></Card>
        <Card><small>Services</small><div style={{ fontSize:28 }}>{data?.counters?.services ?? '—'}</div></Card>
        <Card><small>Contacts (7d)</small><div style={{ fontSize:28 }}>{data?.counters?.contacts7d ?? '—'}</div></Card>
      </Grid>
      <div style={{ height:16 }} />
      <Card>
        <h3>Günlük İletişimler (14g)</h3>
        <LineChart data={data?.charts?.dailyContacts||[]} />
      </Card>
    </div>
  );
}

function LineChart({ data }:{ data: Array<{ d:string; c:number }> }){
  // Basit SVG çizim (3rd‑party bağımlılığı olmadan)
  if (!data?.length) return null;
  const w = 800, h = 200, p = 24;
  const xs = data.map((_,i)=> p + (i*(w-2*p))/(data.length-1));
  const max = Math.max(...data.map((x:any)=>Number(x.c)||0), 1);
  const ys = data.map((x:any)=> h - p - (Number(x.c)||0) * (h-2*p)/max);
  const path = xs.map((x,i)=> `${i?'L':'M'} ${x} ${ys[i]}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="240">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
      {xs.map((x,i)=> <circle key={i} cx={x} cy={ys[i]} r="2.5" />)}
    </svg>
  );
}
```

### 0.3 Runtime metrikleri (Prometheus)
Admin, `/api/_admin/metrics/runtime` üzerinden `/metrics` metnini alıp parse edebilir:
**`FE: src/app/(admin)/admin/runtime-metrics/page.tsx`**
```tsx

```
**`FE: src/app/api/_admin/metricsTxt/route.ts`** (proxy)
```ts

```

---

## 1) Search – Meilisearch / Algolia Entegrasyonu

### 1.1 Env
```
# Meilisearch
MEILI_URL=http://127.0.0.1:7700
MEILI_MASTER_KEY=xxxxx

# Algolia
ALGOLIA_APP_ID=xxx
ALGOLIA_ADMIN_KEY=xxx
ALGOLIA_INDEX_PROJECTS=toronto_projects
ALGOLIA_INDEX_BLOG=toronto_blog
```

### 1.2 Indexing – backend jobs
**`BE: src/jobs/search.index.ts`**
```ts
import { db } from '@/core/db';
import { projects, projectTranslations, blogPosts, blogTranslations } from '@/db/schema';

// Meili (önerilen self‑host)
export async function indexAllMeili(){
  const { MeiliSearch } = await import('meilisearch');
  const cli = new MeiliSearch({ host: process.env.MEILI_URL!, apiKey: process.env.MEILI_MASTER_KEY! });
  const proj = await db.execute(`SELECT p.slug, pt.locale, pt.title, pt.summary FROM projects p JOIN project_translations pt ON pt.project_id=p.id`);
  const posts = await db.execute(`SELECT bp.slug, bt.locale, bt.title, bt.excerpt FROM blog_posts bp JOIN blog_translations bt ON bt.post_id=bp.id WHERE bp.status='published'`);
  await cli.index('projects').addDocuments(proj as any[]);
  await cli.index('blog').addDocuments(posts as any[]);
}

// Algolia (SaaS)
export async function indexAllAlgolia(){
  const alg = (await import('algoliasearch')).default(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_ADMIN_KEY!);
  const projIndex = alg.initIndex(process.env.ALGOLIA_INDEX_PROJECTS!);
  const blogIndex = alg.initIndex(process.env.ALGOLIA_INDEX_BLOG!);
  const proj = await db.execute(`SELECT CONCAT(pt.locale,'_',p.slug) objectID, p.slug, pt.locale, pt.title, pt.summary FROM projects p JOIN project_translations pt ON pt.project_id=p.id`);
  const posts = await db.execute(`SELECT CONCAT(bt.locale,'_',bp.slug) objectID, bp.slug, bt.locale, bt.title, bt.excerpt FROM blog_posts bp JOIN blog_translations bt ON bt.post_id=bp.id WHERE bp.status='published'`);
  await projIndex.saveObjects(proj as any[]);
  await blogIndex.saveObjects(posts as any[]);
}
```

**Trigger noktaları**: admin CRUD’da create/update/delete sonrası `queueMicrotask(()=> indexAllMeili())` gibi **debounced** tetikleyin veya belirli alanlar değiştiğinde sadece ilgili kayıtları güncelleyin.

### 1.3 Public Search endpoint (Meili tercihli)
**`BE: src/http/routes/public.search.ts`** (güncelle)
```ts
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

export const publicSearchRoutes: FastifyPluginAsync = async (app) => {
  app.get('/search', async (req) => {
    const q = z.object({ q: z.string().min(2), limit: z.coerce.number().default(8), locale: z.string().default('tr') }).parse((req as any).query);
    if (process.env.MEILI_URL) {
      const { MeiliSearch } = await import('meilisearch');
      const cli = new MeiliSearch({ host: process.env.MEILI_URL!, apiKey: process.env.MEILI_MASTER_KEY! });
      const [proj, blog] = await Promise.all([
        cli.index('projects').search(q.q, { limit: q.limit, filter: `locale = ${q.locale}` }),
        cli.index('blog').search(q.q, { limit: q.limit, filter: `locale = ${q.locale}` }),
      ]);
      return { projects: proj.hits, posts: blog.hits };
    }
    // fallback: LIKE (Part 10)
    // ...
  });
};
```

### 1.4 FE – SearchBox (typeahead)
**`FE: src/shared/search/SearchBox.tsx`**
```tsx

```
**`FE: src/app/api/search/route.ts`** (proxy)
```ts

```

---

## 2) Sitemap/Hreflang – Bölünmüş sitemap ve alternates

### 2.1 FE – Sitemap split (locale + content türü)
**`FE: src/app/sitemap.ts`** (index)
```ts

```
**`FE: src/app/sitemap-static.xml/route.ts`** (SSG sayfalar)
```ts

```
**`FE: src/app/sitemap-blog-[locale].xml/route.ts`** (dinamik locale)
```ts

```
> Projects için aynı pattern’le `sitemap-projects-[locale].xml` üretin.

### 2.2 Hreflang (alternates.languages)
Detail sayfalarında `generateMetadata` içinde:
```ts
export async function generateMetadata({ params }:{ params:{ locale:'tr'|'en'|'de'; slug:string } }){
  const base = process.env.NEXT_PUBLIC_SITE_URL!;
  const hrefs = {
    'tr': `${base}/tr/blog/${params.slug}`,
    'en': `${base}/en/blog/${params.slug}`,
    'de': `${base}/de/blog/${params.slug}`,
  } as const;
  return { alternates: { canonical: hrefs[params.locale], languages: hrefs } } as any;
}
```
> Projeler ve services için de ekleyin. **Canonical** aktif locale’e işaret ediyor.

---

## 3) Cloudinary Art‑Direction & Focal Point

### 3.1 Focal point’li URL helper
**`FE: src/lib/media/cloudinaryArt.ts`**
```ts

```

### 3.2 `<picture>` ile art‑direction
**`FE: src/shared/ui/media/ArtDirectedImage.tsx`**
```tsx

```
**Kullanım (Hero)**
```tsx
<ArtDirectedImage
  publicId="toronto/hero"
  alt="Hero"
  sources={[
    { media: '(min-width: 1024px)', variant: { w:1600, h:700, crop:'fill', g:'auto' } },
    { media: '(min-width: 640px)',  variant: { w:1200, h:600, crop:'fill', g:'auto' } },
  ]}
  fallback={{ w: 800, h: 600 }}
/>
```
> Portrelerde `g: 'face'` veya özel odak noktası için `g: 'x,y'` (Cloudinary **custom gravity**).

---

## 4) E2E – Dashboard, Search, Hreflang, Art‑Direction

### 4.1 Dashboard counters & chart
**`FE: tests/admin.dashboard.spec.ts`**
```ts

```

### 4.2 Search results SSR & typeahead
**`FE: tests/search.spec.ts`**
```ts

```

### 4.3 Hreflang link’leri
**`FE: tests/hreflang.spec.ts`**
```ts

```

### 4.4 Art‑direction görsel varlığı
**`FE: tests/artdirection.spec.ts`**
```ts

```

---

## 5) Kabul Kriterleri (Part 12)
- Dashboard’da counters ve 14 günlük iletişim çizgisi görünür; BE `/admin/metrics/business` döner.
- Meilisearch **veya** Algolia ile arama sonuçları locale filtresiyle döner; FE typeahead 200ms debounce ile çalışır.
- Sitemap’ler statik/dinamik olarak bölünür; detail sayfalarında **hreflang** link’leri ve canonical doğru.
- Cloudinary art‑direction ile hero/portre görselleri odaklı kesilir; `<picture>` kaynakları doğru yüklenir.
- E2E testleri dashboard/search/hreflang/art‑direction senaryolarını kapsar.

---

## 6) Sonraki Parça (Part 13)
- **RBAC UI** (role matrix, policy hints) + **Audit Log viewer** filtreleri
- **Queue** (BullMQ) ile index ve mail/webhook işleri
- **Image focal‑point editor** (admin pick) → Cloudinary API update
- **CDN cache purge** hook’ları (Cloudflare/Bunny) revalidate ile senkronizasyon
- **Uptime & Alerting** (Health checks + status page)

