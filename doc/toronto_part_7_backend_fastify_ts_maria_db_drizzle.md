# Part 7 – Backend (Fastify + TypeScript + MariaDB + Drizzle)

Bu bölümde **tam çalışan API** iskeleti: auth (JWT), public & admin router’lar, i18n (Accept‑Language), Projects filtreleri, revalidate webhook ve rate‑limit. **Next FE** bu API’yı zaten Part 2–6’da kullanacak şekilde kurgulanmıştı.

---

## 0) Repo Bootstrap

```bash
mkdir toronto-api && cd toronto-api
bun init -y
bun add fastify @fastify/cors @fastify/helmet @fastify/rate-limit @fastify/jwt \
        zod drizzle-orm mysql2 argon2 undici
bun add -D typescript tsx @types/node drizzle-kit \
         eslint eslint-config-prettier

# dosyalar
mkdir -p src/{core,db,http/{plugins,routes,utils},modules/{auth,projects,services,adSolutions,references,settings,contact},scripts}
```

**`tsconfig.json`**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["node"],
    "noEmit": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
```

**`package.json` (scripts)**
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/index.js",
    "db:push": "drizzle-kit push",
    "db:generate": "drizzle-kit generate",
    "seed": "tsx src/scripts/seed.ts"
  }
}
```

**`.env.example`**
```env
# Server
PORT=8081
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# DB (MariaDB)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=pass
DB_NAME=toronto

# Auth
JWT_SECRET=devsecret
JWT_EXPIRES=8h

# Revalidate → Next API route (FE Part 2: /api/revalidate)
NEXT_REVALIDATE_URL=http://localhost:3000/api/revalidate
REVALIDATE_SECRET=changeme
```

**`drizzle.config.ts`**
```ts
import type { Config } from 'drizzle-kit';
export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    host: process.env.DB_HOST!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASS!,
    database: process.env.DB_NAME!,
    port: Number(process.env.DB_PORT || 3306)
  }
} satisfies Config;
```

---

## 1) Core: env, db, server

**`src/core/env.ts`**
```ts
import 'dotenv/config';
function req(name: string, def?: string) {
  const v = process.env[name] ?? def;
  if (v == null) throw new Error(`Missing env ${name}`);
  return v;
}
export const ENV = {
  PORT: Number(process.env.PORT || 8081),
  CORS_ORIGIN: req('CORS_ORIGIN'),
  DB: {
    HOST: req('DB_HOST'), PORT: Number(process.env.DB_PORT || 3306),
    USER: req('DB_USER'), PASS: req('DB_PASS'), NAME: req('DB_NAME')
  },
  JWT: { SECRET: req('JWT_SECRET'), EXPIRES: process.env.JWT_EXPIRES || '8h' },
  REVALIDATE: { URL: req('NEXT_REVALIDATE_URL'), SECRET: req('REVALIDATE_SECRET') }
};
```

**`src/core/db.ts`**
```ts
import { createPool } from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { ENV } from './env';

const pool = createPool({
  host: ENV.DB.HOST,
  port: ENV.DB.PORT,
  user: ENV.DB.USER,
  password: ENV.DB.PASS,
  database: ENV.DB.NAME,
  connectionLimit: 10,
  supportBigNumbers: true,
  dateStrings: true,
});

export const db = drizzle(pool);
export type DB = typeof db;
```

**`src/index.ts`**
```ts
import { buildServer } from './http/server';
import { ENV } from './core/env';

const app = await buildServer();
app.listen({ port: ENV.PORT, host: '0.0.0.0' })
  .then((addr) => app.log.info(`API up → ${addr}`))
  .catch((err) => { app.log.error(err); process.exit(1); });
```

---

## 2) DB Şeması (Drizzle)

**`src/db/schema.ts`**
```ts
import { mysqlTable, serial, int, varchar, text, datetime, tinyint, index, uniqueIndex } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

// USERS (admin)
export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 191 }).notNull(),
  passwordHash: varchar('password_hash', { length: 191 }).notNull(),
  role: varchar('role', { length: 32 }).notNull().default('admin'),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({ emailIdx: uniqueIndex('ux_users_email').on(t.email) }));

// SITE SETTINGS (key → JSON)
export const siteSettings = mysqlTable('site_settings', {
  key: varchar('key', { length: 64 }).primaryKey(),
  valueJson: text('value_json').notNull(),
  updatedAt: datetime('updated_at').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// REFERENCES
export const references = mysqlTable('references', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 191 }).notNull(),
  logoUrl: varchar('logo_url', { length: 512 }).notNull(),
  url: varchar('url', { length: 512 }),
  order: int('order').notNull().default(0),
}, (t)=>({ nameIdx: index('ix_refs_name').on(t.name) }));

// PROJECTS + translations + categories/tags
export const projects = mysqlTable('projects', {
  id: varchar('id', { length: 36 }).primaryKey(),
  slug: varchar('slug', { length: 191 }).notNull(),
  coverUrl: varchar('cover_url', { length: 512 }),
  priceFrom: int('price_from'),
  status: varchar('status', { length: 32 }).default('active'),
  videoUrl: varchar('video_url', { length: 512 }),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at').notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (t)=>({ slugUx: uniqueIndex('ux_projects_slug').on(t.slug) }));

export const projectTranslations = mysqlTable('project_translations', {
  id: serial('id').primaryKey(),
  projectId: varchar('project_id', { length: 36 }).notNull(),
  locale: varchar('locale', { length: 8 }).notNull(),
  title: varchar('title', { length: 191 }).notNull(),
  summary: text('summary'),
  body: text('body'),
  metaTitle: varchar('meta_title', { length: 191 }),
  metaDesc: varchar('meta_desc', { length: 255 }),
}, (t)=>({ ux: uniqueIndex('ux_proj_tr').on(t.projectId, t.locale) }));

export const categories = mysqlTable('categories', {
  id: varchar('id', { length: 36 }).primaryKey(),
  slug: varchar('slug', { length: 191 }).notNull(),
}, (t)=>({ ux: uniqueIndex('ux_cat_slug').on(t.slug) }));
export const categoryTranslations = mysqlTable('category_translations', {
  id: serial('id').primaryKey(),
  categoryId: varchar('category_id', { length: 36 }).notNull(),
  locale: varchar('locale', { length: 8 }).notNull(),
  title: varchar('title', { length: 191 }).notNull(),
}, (t)=>({ ux: uniqueIndex('ux_cat_tr').on(t.categoryId, t.locale) }));

export const tags = mysqlTable('tags', {
  id: varchar('id', { length: 36 }).primaryKey(),
  slug: varchar('slug', { length: 191 }).notNull(),
}, (t)=>({ ux: uniqueIndex('ux_tag_slug').on(t.slug) }));
export const tagTranslations = mysqlTable('tag_translations', {
  id: serial('id').primaryKey(),
  tagId: varchar('tag_id', { length: 36 }).notNull(),
  locale: varchar('locale', { length: 8 }).notNull(),
  title: varchar('title', { length: 191 }).notNull(),
}, (t)=>({ ux: uniqueIndex('ux_tag_tr').on(t.tagId, t.locale) }));

export const projectCategories = mysqlTable('project_categories', {
  projectId: varchar('project_id', { length: 36 }).notNull(),
  categoryId: varchar('category_id', { length: 36 }).notNull(),
}, (t)=>({ idx: uniqueIndex('ux_proj_cat').on(t.projectId, t.categoryId) }));

export const projectTags = mysqlTable('project_tags', {
  projectId: varchar('project_id', { length: 36 }).notNull(),
  tagId: varchar('tag_id', { length: 36 }).notNull(),
}, (t)=>({ idx: uniqueIndex('ux_proj_tag').on(t.projectId, t.tagId) }));

// SERVICES + translations
export const services = mysqlTable('services', {
  id: varchar('id', { length: 36 }).primaryKey(),
  slug: varchar('slug', { length: 191 }).notNull(),
  icon: varchar('icon', { length: 128 }),
  order: int('order').default(0),
}, (t)=>({ ux: uniqueIndex('ux_svc_slug').on(t.slug) }));
export const serviceTranslations = mysqlTable('service_translations', {
  id: serial('id').primaryKey(),
  serviceId: varchar('service_id', { length: 36 }).notNull(),
  locale: varchar('locale', { length: 8 }).notNull(),
  title: varchar('title', { length: 191 }).notNull(),
  body: text('body'),
  faqJson: text('faq_json'), // JSON string
}, (t)=>({ ux: uniqueIndex('ux_svc_tr').on(t.serviceId, t.locale) }));

// AD SOLUTIONS + translations
export const adSolutions = mysqlTable('ad_solutions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  slug: varchar('slug', { length: 191 }).notNull(),
  icon: varchar('icon', { length: 128 }),
  order: int('order').default(0),
}, (t)=>({ ux: uniqueIndex('ux_ad_slug').on(t.slug) }));
export const adSolutionTranslations = mysqlTable('ad_solution_translations', {
  id: serial('id').primaryKey(),
  adSolutionId: varchar('ad_solution_id', { length: 36 }).notNull(),
  locale: varchar('locale', { length: 8 }).notNull(),
  title: varchar('title', { length: 191 }).notNull(),
  body: text('body'),
}, (t)=>({ ux: uniqueIndex('ux_ad_tr').on(t.adSolutionId, t.locale) }));

// CONTACT MESSAGES
export const contactMessages = mysqlTable('contact_messages', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 191 }).notNull(),
  email: varchar('email', { length: 191 }).notNull(),
  message: text('message').notNull(),
  locale: varchar('locale', { length: 8 }).notNull(),
  ip: varchar('ip', { length: 64 }),
  userAgent: varchar('user_agent', { length: 255 }),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  handledAt: datetime('handled_at'),
});
```

> Not: FK’ler (MariaDB) için `references()` tanımları eklenebilir; çoğu JOIN sorgusu ID üzerinden yapılır.

---

## 3) HTTP Sunucusu ve Plugin’ler

**`src/http/server.ts`**
```ts
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import { ENV } from '@/core/env';
import { authRoutes } from '@/modules/auth/routes';
import { publicRoutes } from '@/http/routes/public';
import { adminRoutes } from '@/http/routes/admin';

export async function buildServer() {
  const app = Fastify({ logger: true });

  await app.register(helmet);
  await app.register(cors, { origin: ENV.CORS_ORIGIN, credentials: true });
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });
  await app.register(jwt, { secret: ENV.JWT.SECRET });

  app.decorate('auth', async (req: any, _rep: any) => { await req.jwtVerify(); });

  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(publicRoutes);
  await app.register(adminRoutes, { prefix: '/admin' });

  return app;
}
declare module 'fastify' { interface FastifyInstance { auth: any } }
```

**i18n util – `src/http/utils/i18n.ts`**
```ts
export function resolveLocale(h?: string): string {
  const s = (h || '').split(',')[0]?.split('-')[0];
  return s && ['tr','en','de'].includes(s) ? s : 'tr';
}
```

**Revalidate util – `src/http/utils/revalidate.ts`**
```ts
import { ENV } from '@/core/env';
export async function revalidateTags(tags: string[]) {
  try {
    await fetch(ENV.REVALIDATE.URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': ENV.REVALIDATE.SECRET }, body: JSON.stringify({ tags }) });
  } catch { /* log */ }
}
```

---

## 4) Auth Modülü

**`src/modules/auth/routes.ts`**
```ts
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { db } from '@/core/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import argon2 from 'argon2';

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post('/login', async (req, rep) => {
    const body = z.object({ email: z.string().email(), password: z.string().min(6) }).parse(req.body);
    const [u] = await db.select().from(users).where(eq(users.email, body.email));
    if (!u || !(await argon2.verify(u.passwordHash, body.password))) return rep.code(401).send({ message: 'Unauthorized' });
    const token = app.jwt.sign({ sub: String(u.id), role: u.role }, { expiresIn: process.env.JWT_EXPIRES || '8h' });
    return { token, user: { id: u.id, email: u.email, role: u.role } };
  });
};
```

---

## 5) Public Routes

**`src/http/routes/public.ts`**
```ts
import { FastifyPluginAsync } from 'fastify';
import { db } from '@/core/db';
import { references, projects, projectTranslations, services, serviceTranslations, adSolutions, adSolutionTranslations, siteSettings, contactMessages, categories, categoryTranslations, tags, tagTranslations, projectCategories, projectTags } from '@/db/schema';
import { and, eq, like, sql, inArray, desc } from 'drizzle-orm';
import { z } from 'zod';
import { resolveLocale } from '@/http/utils/i18n';

export const publicRoutes: FastifyPluginAsync = async (app) => {
  // Site settings → tek payload (contact_info, socials, businessHours)
  app.get('/site-settings', async (req) => {
    const rows = await db.select().from(siteSettings);
    const obj: Record<string, any> = {};
    for (const r of rows) obj[r.key] = JSON.parse(r.valueJson);
    return obj; // { contact_info: {...}, socials: {...}, businessHours: [...] }
  });

  // References (list)
  app.get('/references', async () => {
    return db.select().from(references).orderBy(references.order);
  });

  // Projects (paged + filters)
  app.get('/projects', async (req) => {
    const q = z.object({ q: z.string().optional(), page: z.coerce.number().default(1), pageSize: z.coerce.number().default(12), priceMin: z.coerce.number().optional(), priceMax: z.coerce.number().optional(), category: z.string().optional(), tag: z.string().optional() }).parse((req as any).query);
    const locale = resolveLocale(req.headers['accept-language'] as string);

    const where: any[] = [];
    if (q.q) where.push(like(projectTranslations.title, `%${q.q}%`));
    if (q.priceMin != null) where.push(sql`${projects.priceFrom} >= ${q.priceMin}`);
    if (q.priceMax != null) where.push(sql`${projects.priceFrom} <= ${q.priceMax}`);

    // kategori/tag filtreleri (slug → id listesi)
    let projectIdsByCat: string[] | undefined, projectIdsByTag: string[] | undefined;
    if (q.category) {
      const [c] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, q.category));
      if (c) { const rows = await db.select({ pid: projectCategories.projectId }).from(projectCategories).where(eq(projectCategories.categoryId, c.id)); projectIdsByCat = rows.map(r=>r.pid); }
    }
    if (q.tag) {
      const [t] = await db.select({ id: tags.id }).from(tags).where(eq(tags.slug, q.tag));
      if (t) { const rows = await db.select({ pid: projectTags.projectId }).from(projectTags).where(eq(projectTags.tagId, t.id)); projectIdsByTag = rows.map(r=>r.pid); }
    }
    if (projectIdsByCat) where.push(inArray(projects.id, projectIdsByCat));
    if (projectIdsByTag) where.push(inArray(projects.id, projectIdsByTag));

    // toplam
    const totalRows = await db.execute(sql`SELECT COUNT(*) as c FROM projects p JOIN project_translations pt ON pt.project_id=p.id AND pt.locale=${locale} ${where.length? sql`WHERE ${sql.join(where, sql` AND `)}`: sql``}`);
    const total = Number((totalRows as any)[0].c || 0);

    const offset = (q.page - 1) * q.pageSize;
    const items = await db.execute(sql`
      SELECT p.slug, p.cover_url, p.price_from, pt.title
      FROM projects p
      JOIN project_translations pt ON pt.project_id=p.id AND pt.locale=${locale}
      ${where.length? sql`WHERE ${sql.join(where, sql` AND `)}`: sql``}
      ORDER BY p.created_at DESC
      LIMIT ${q.pageSize} OFFSET ${offset}
    `);

    return { items, total, page: q.page, pageSize: q.pageSize };
  });

  // Project detail by slug
  app.get('/projects/:slug', async (req, rep) => {
    const { slug } = (req.params as any);
    const locale = resolveLocale(req.headers['accept-language'] as string);
    const rows = await db.execute(sql`
      SELECT p.id, p.slug, p.cover_url, p.price_from, p.video_url, pt.title, pt.summary, pt.body
      FROM projects p JOIN project_translations pt ON pt.project_id=p.id AND pt.locale=${locale}
      WHERE p.slug=${slug} LIMIT 1`);
    if (!Array.isArray(rows) || !rows[0]) return rep.code(404).send({ message: 'Not found' });
    return rows[0];
  });

  // Services list/detail
  app.get('/services', async (req) => {
    const locale = resolveLocale(req.headers['accept-language'] as string);
    const rows = await db.execute(sql`SELECT s.slug, st.title, st.body FROM services s JOIN service_translations st ON st.service_id=s.id AND st.locale=${locale} ORDER BY s.order ASC`);
    return rows;
  });
  app.get('/services/:slug', async (req, rep) => {
    const { slug } = (req.params as any); const locale = resolveLocale(req.headers['accept-language'] as string);
    const rows = await db.execute(sql`SELECT st.title, st.body, st.faq_json FROM services s JOIN service_translations st ON st.service_id=s.id AND st.locale=${locale} WHERE s.slug=${slug} LIMIT 1`);
    if (!Array.isArray(rows) || !rows[0]) return rep.code(404).send({ message: 'Not found' });
    const r = rows[0] as any; if (r.faq_json) { try { r.faq_json = JSON.parse(r.faq_json); } catch {} }
    return r;
  });

  // Ad solutions list/detail
  app.get('/ad-solutions', async (req) => {
    const locale = resolveLocale(req.headers['accept-language'] as string);
    const rows = await db.execute(sql`SELECT a.slug, at.title, at.body FROM ad_solutions a JOIN ad_solution_translations at ON at.ad_solution_id=a.id AND at.locale=${locale} ORDER BY a.order ASC`);
    return rows;
  });
  app.get('/ad-solutions/:slug', async (req, rep) => {
    const { slug } = (req.params as any); const locale = resolveLocale(req.headers['accept-language'] as string);
    const rows = await db.execute(sql`SELECT at.title, at.body FROM ad_solutions a JOIN ad_solution_translations at ON at.ad_solution_id=a.id AND at.locale=${locale} WHERE a.slug=${slug} LIMIT 1`);
    if (!Array.isArray(rows) || !rows[0]) return rep.code(404).send({ message: 'Not found' });
    return rows[0];
  });

  // Categories/Tags (filters)
  app.get('/projects/categories', async (req) => {
    const locale = resolveLocale(req.headers['accept-language'] as string);
    const rows = await db.execute(sql`SELECT c.slug, ct.title FROM categories c JOIN category_translations ct ON ct.category_id=c.id AND ct.locale=${locale} ORDER BY ct.title ASC`);
    return rows;
  });
  app.get('/projects/tags', async (req) => {
    const locale = resolveLocale(req.headers['accept-language'] as string);
    const rows = await db.execute(sql`SELECT t.slug, tt.title FROM tags t JOIN tag_translations tt ON tt.tag_id=t.id AND tt.locale=${locale} ORDER BY tt.title ASC`);
    return rows;
  });

  // Contact (rate-limit özel)
  app.post('/contact', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (req) => {
    const body = z.object({ name: z.string().min(2), email: z.string().email(), message: z.string().min(10), consent: z.boolean().optional() }).parse(req.body);
    const locale = resolveLocale(req.headers['accept-language'] as string);
    const ip = (req.headers['x-forwarded-for'] as string) || (req.socket as any).remoteAddress;
    const ua = req.headers['user-agent'] as string;
    await db.insert(contactMessages).values({ id: crypto.randomUUID(), name: body.name, email: body.email, message: body.message, locale, ip, userAgent: ua });
    return { ok: true };
  });
};
```

---

## 6) Admin Routes (JWT zorunlu)

**`src/http/routes/admin.ts`**
```ts
import { FastifyPluginAsync } from 'fastify';
import { db } from '@/core/db';
import { references, projects, projectTranslations, services, serviceTranslations, adSolutions, adSolutionTranslations, siteSettings } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import { revalidateTags } from '@/http/utils/revalidate';

export const adminRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', app.auth);

  // Site settings GET/PUT
  app.get('/site-settings', async () => {
    const rows = await db.select().from(siteSettings);
    const obj: any = {}; for (const r of rows) obj[r.key] = JSON.parse(r.valueJson);
    return obj;
  });
  app.put('/site-settings', async (req) => {
    const schema = z.object({ contact_info: z.any().optional(), socials: z.any().optional(), businessHours: z.any().optional() });
    const body = schema.parse(req.body);
    const entries = Object.entries(body) as [string, unknown][];
    for (const [k, v] of entries) {
      await db.insert(siteSettings).values({ key: k, valueJson: JSON.stringify(v) }).onDuplicateKeyUpdate({ set: { valueJson: JSON.stringify(v) } });
    }
    revalidateTags(['site_settings']);
    return { ok: true };
  });

  // References CRUD
  app.get('/references', async () => db.select().from(references).orderBy(references.order));
  app.post('/references', async (req) => {
    const b = z.object({ name: z.string(), logo_url: z.string().url(), url: z.string().url().optional(), order: z.number().int().default(0) }).parse(req.body);
    await db.insert(references).values({ id: crypto.randomUUID(), name: b.name, logoUrl: b.logo_url, url: b.url, order: b.order });
    revalidateTags(['references']);
    return { ok: true };
  });
  app.put('/references/:id', async (req) => {
    const { id } = (req.params as any); const b = z.object({ name: z.string().optional(), logo_url: z.string().url().optional(), url: z.string().url().optional(), order: z.number().int().optional() }).parse(req.body);
    await db.update(references).set({ ...(b.name? { name: b.name }: {}), ...(b.logo_url? { logoUrl: b.logo_url }: {}), ...(b.url? { url: b.url }: {}), ...(b.order!=null? { order: b.order }: {}) }).where(eq(references.id, id));
    revalidateTags(['references']);
    return { ok: true };
  });
  app.delete('/references/:id', async (req) => { const { id } = (req.params as any); await db.delete(references).where(eq(references.id, id)); revalidateTags(['references']); return { ok: true }; });

  // Projects (temel; translations yönetimi MVP2)
  app.get('/projects', async (req) => { return { items: await db.select().from(projects).orderBy(desc(projects.createdAt)), total: (await db.execute({ sql: 'SELECT COUNT(*) as c FROM projects', args: [] }) as any)[0].c }; });
  app.post('/projects', async (req) => {
    const b = z.object({ slug: z.string(), title: z.string(), cover_url: z.string().url().optional(), price_from: z.number().int().optional(), status: z.string().optional() }).parse(req.body);
    const id = crypto.randomUUID();
    await db.insert(projects).values({ id, slug: b.slug, coverUrl: b.cover_url, priceFrom: b.price_from, status: b.status || 'active' });
    await db.insert(projectTranslations).values({ projectId: id, locale: 'tr', title: b.title });
    revalidateTags(['projects']);
    return { id };
  });
  app.put('/projects/:id', async (req) => {
    const { id } = (req.params as any);
    const b = z.object({ slug: z.string().optional(), title: z.string().optional(), cover_url: z.string().url().optional(), price_from: z.number().int().optional(), status: z.string().optional() }).parse(req.body);
    if (b.slug || b.cover_url || b.price_from || b.status) {
      await db.update(projects).set({ ...(b.slug? { slug: b.slug }: {}), ...(b.cover_url? { coverUrl: b.cover_url }: {}), ...(b.price_from!=null? { priceFrom: b.price_from }: {}), ...(b.status? { status: b.status }: {}) }).where(eq(projects.id, id));
    }
    if (b.title) {
      await db.insert(projectTranslations).values({ projectId: id, locale: 'tr', title: b.title }).onDuplicateKeyUpdate({ set: { title: b.title } });
    }
    revalidateTags(['projects']);
    return { ok: true };
  });
  app.delete('/projects/:id', async (req) => { const { id } = (req.params as any); await db.delete(projects).where(eq(projects.id, id)); revalidateTags(['projects']); return { ok: true }; });
};
```

---

## 7) Seed Script (admin kullanıcı + örnek içerik)

**`src/scripts/seed.ts`**
```ts
import { db } from '@/core/db';
import { users, siteSettings, references as refs, projects, projectTranslations } from '@/db/schema';
import argon2 from 'argon2';

async function main(){
  const adminPass = await argon2.hash('admin123');
  await db.insert(users).values({ email: 'admin@toronto.dev', passwordHash: adminPass, role: 'admin' }).onDuplicateKeyUpdate({ set: { passwordHash: adminPass } });

  const contact = { phones: ['+49 000 0000'], email: 'info@toronto.dev', address: 'Berlin, DE', whatsappNumber: '4900000000' };
  const socials = { instagram: '', facebook: '', youtube: '', linkedin: '', x: '' };
  const hours = [{ days: 'Hafta içi', open: '09:00', close: '18:00' }];
  await db.insert(siteSettings).values({ key: 'contact_info', valueJson: JSON.stringify(contact) }).onDuplicateKeyUpdate({ set: { valueJson: JSON.stringify(contact) } });
  await db.insert(siteSettings).values({ key: 'socials', valueJson: JSON.stringify(socials) }).onDuplicateKeyUpdate({ set: { valueJson: JSON.stringify(socials) } });
  await db.insert(siteSettings).values({ key: 'businessHours', valueJson: JSON.stringify(hours) }).onDuplicateKeyUpdate({ set: { valueJson: JSON.stringify(hours) } });

  const pid = crypto.randomUUID();
  await db.insert(projects).values({ id: pid, slug: 'ornek-proje', coverUrl: '', status: 'active' });
  await db.insert(projectTranslations).values({ projectId: pid, locale: 'tr', title: 'Örnek Proje', summary: 'Kısa açıklama' });

  console.log('Seed ok');
}
main().then(()=>process.exit(0)).catch((e)=>{ console.error(e); process.exit(1); });
```

---

## 8) OpenAPI (özet)

**`src/http/openapi.yaml`** (kısa şema – genişletilebilir)
```yaml
openapi: 3.0.3
info: { title: Toronto API, version: 0.1.0 }
servers: [{ url: http://localhost:8081 }]
paths:
  /site-settings: { get: { summary: Get settings } }
  /projects: { get: { summary: List projects } }
  /projects/{slug}: { get: { summary: Project detail, parameters: [{ name: slug, in: path, required: true }] } }
  /services: { get: { summary: List services } }
  /services/{slug}: { get: { summary: Service detail } }
  /ad-solutions: { get: { summary: List ad solutions } }
  /ad-solutions/{slug}: { get: { summary: Ad solution detail } }
  /references: { get: { summary: References } }
  /contact: { post: { summary: Send message } }
  /auth/login: { post: { summary: Admin login } }
  /admin/site-settings: { get: { }, put: { } }
  /admin/references: { get: { }, post: { } }
  /admin/references/{id}: { put: { }, delete: { } }
  /admin/projects: { get: { }, post: { } }
  /admin/projects/{id}: { put: { }, delete: { } }
```

---

## 9) Çalıştırma

```bash
# MariaDB hazır (docker-compose örneği istersen Part 7B’de ekleyebilirim)
cp .env.example .env
bun run db:push      # şemayı oluştur
bun run seed         # admin + örnek veri
bun run dev          # http://localhost:8081
```

**Hızlı testler**
```bash
curl -s http://localhost:8081/site-settings | jq
curl -s 'http://localhost:8081/projects?page=1&pageSize=12' | jq
curl -s http://localhost:8081/projects/ornek-proje | jq
```

---

## 10) Notlar & Sonraki Adımlar

- **Translations CRUD** (admin) ve çok dilli içerik yönetimi Part 8’de açalım (tab’li formlar).
- **Media list** endpoint’i (DB veya Cloudinary search) ve **S3 alternatifi** eklenecek.
- **FK & index** iyileştirmeleri, audit (created_by/updated_by), soft‑delete alanları eklenebilir.
- **Security**: /auth/me, refresh token, password reset (email) opsiyonel.
- **Monitoring**: pino-pretty dev, prod için structured logs + health check `/health`.

