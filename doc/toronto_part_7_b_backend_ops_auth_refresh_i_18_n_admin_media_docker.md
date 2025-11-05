# Part 7B – Backend Ops: Docker, Auth Refresh, i18n Admin CRUD, Media List, Migrations & FE bridge

Bu parça, Part 7’nin üzerine operasyonel güçlendirmeleri ve i18n CRUD’u ekler:
- **Docker Compose** (MariaDB + Adminer)
- **Auth yenileme** (refresh token + rotation) ve **/auth/me**
- **i18n translations** için admin CRUD endpoint’leri
- **Media list/search** (Cloudinary Admin API + S3 alternatifi)
- **FK’li migrations**, index iyileştirmeleri
- FE (Next) köprü: **/api/admin/login/refresh** güncellemeleri
- Sağlık denetimi & logging notları

> Not: Aşağıdaki kodlar, Part 7 dizin yapısını baz alır.

---

## 0) Docker Compose (MariaDB + Adminer)

**`docker-compose.yml`** (backend kökünde)
```yaml
version: '3.8'
services:
  db:
    image: mariadb:11
    container_name: toronto_db
    environment:
      - MARIADB_ROOT_PASSWORD=${DB_PASS}
      - MARIADB_DATABASE=${DB_NAME}
      - MARIADB_USER=${DB_USER}
      - MARIADB_PASSWORD=${DB_PASS}
    ports: ["3306:3306"]
    volumes:
      - dbdata:/var/lib/mysql
    command: [
      "--character-set-server=utf8mb4",
      "--collation-server=utf8mb4_0900_ai_ci",
      "--innodb_buffer_pool_size=256M",
      "--innodb_log_file_size=256M"
    ]

  adminer:
    image: adminer
    restart: unless-stopped
    ports: ["8088:8080"]
    depends_on: [db]

volumes:
  dbdata:
```

```
# .env örneği (backend)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=toronto
DB_PASS=toronto
DB_NAME=toronto
```

Çalıştırma:
```bash
docker compose up -d
bun run db:push
bun run seed
```

---

## 1) Auth Genişletme – /auth/me, Refresh Token, Rotation

### 1.1 DB tablo: refresh_tokens

**`src/db/schema.auth.ts`**
```ts
import { mysqlTable, serial, int, varchar, datetime } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const refreshTokens = mysqlTable('refresh_tokens', {
  id: serial('id').primaryKey(),
  userId: int('user_id').notNull(),
  tokenHash: varchar('token_hash', { length: 191 }).notNull(),
  userAgent: varchar('user_agent', { length: 255 }),
  ip: varchar('ip', { length: 64 }),
  expiresAt: datetime('expires_at').notNull(),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});
```

> `src/db/schema.ts` içinde export re‑export: `export * from './schema.auth';`

### 1.2 Yardımcılar

**`src/modules/auth/utils.ts`**
```ts
import crypto from 'node:crypto';
export function genToken(len = 64) { return crypto.randomBytes(len).toString('hex'); }
export function sha256(s: string) { return crypto.createHash('sha256').update(s).digest('hex'); }
```

### 1.3 /auth/me, /auth/refresh, /auth/logout

**`src/modules/auth/routes.ts`** (eklemeler)
```ts
import { and, eq } from 'drizzle-orm';
import { refreshTokens, users } from '@/db/schema';
import { genToken, sha256 } from './utils';

export const authRoutes: FastifyPluginAsync = async (app) => {
  // ... mevcut /login

  app.get('/me', { onRequest: [app.auth] }, async (req) => {
    const token = (req.user as any);
    const [u] = await db.select().from(users).where(eq(users.id, Number(token.sub)));
    return { id: u.id, email: u.email, role: u.role };
  });

  app.post('/refresh', async (req, rep) => {
    const b = z.object({ refreshToken: z.string().min(10) }).parse(req.body);
    const h = sha256(b.refreshToken);
    const now = new Date();
    const [rt] = await db.select().from(refreshTokens).where(and(eq(refreshTokens.tokenHash, h)));
    if (!rt || new Date(rt.expiresAt) < now) return rep.code(401).send({ message: 'Invalid refresh' });

    // Token rotation: eskiyi sil, yenisini ver
    await db.delete(refreshTokens).where(eq(refreshTokens.tokenHash, h));

    const [u] = await db.select().from(users).where(eq(users.id, rt.userId));
    const access = app.jwt.sign({ sub: String(u.id), role: u.role }, { expiresIn: process.env.JWT_EXPIRES || '8h' });
    const newRefresh = genToken(48);
    await db.insert(refreshTokens).values({
      userId: u.id,
      tokenHash: sha256(newRefresh),
      userAgent: (req.headers['user-agent'] as string) || '',
      ip: (req.headers['x-forwarded-for'] as string) || (req.socket as any).remoteAddress,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 gün
    });
    return { accessToken: access, refreshToken: newRefresh };
  });

  app.post('/logout', async (req) => {
    const b = z.object({ refreshToken: z.string().optional() }).parse(req.body || {});
    if (b.refreshToken) { await db.delete(refreshTokens).where(eq(refreshTokens.tokenHash, sha256(b.refreshToken))); }
    return { ok: true };
  });
};
```

> Güvenlik: refresh token’lar **hash’lenmiş** saklanır, her yenilemede **rotasyon** yapılır.

---

## 2) i18n Translations – Admin CRUD

### 2.1 Routes

**`src/http/routes/admin.i18n.ts`**
```ts
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { db } from '@/core/db';
import { eq } from 'drizzle-orm';
import { projectTranslations, serviceTranslations, adSolutionTranslations } from '@/db/schema';

export const adminI18nRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', app.auth);

  // Projects translations
  app.get('/projects/:id/translations', async (req) => {
    const { id } = (req.params as any); return db.select().from(projectTranslations).where(eq(projectTranslations.projectId, id));
  });
  app.put('/projects/:id/translations/:locale', async (req) => {
    const { id, locale } = (req.params as any);
    const body = z.object({ title: z.string().min(1), summary: z.string().optional(), body: z.string().optional(), metaTitle: z.string().optional(), metaDesc: z.string().optional() }).parse(req.body);
    await db.insert(projectTranslations)
      .values({ projectId: id, locale, title: body.title, summary: body.summary, body: body.body, metaTitle: body.metaTitle, metaDesc: body.metaDesc })
      .onDuplicateKeyUpdate({ set: { title: body.title, summary: body.summary, body: body.body, metaTitle: body.metaTitle, metaDesc: body.metaDesc } });
    return { ok: true };
  });

  // Services translations
  app.get('/services/:id/translations', async (req) => {
    const { id } = (req.params as any); return db.select().from(serviceTranslations).where(eq(serviceTranslations.serviceId, id));
  });
  app.put('/services/:id/translations/:locale', async (req) => {
    const { id, locale } = (req.params as any);
    const body = z.object({ title: z.string().min(1), body: z.string().optional(), faq_json: z.any().optional() }).parse(req.body);
    await db.insert(serviceTranslations)
      .values({ serviceId: id, locale, title: body.title, body: body.body, faqJson: body.faq_json ? JSON.stringify(body.faq_json) : null as any })
      .onDuplicateKeyUpdate({ set: { title: body.title, body: body.body, faqJson: body.faq_json ? JSON.stringify(body.faq_json) : null as any } });
    return { ok: true };
  });

  // Ad solutions translations
  app.get('/ad-solutions/:id/translations', async (req) => {
    const { id } = (req.params as any); return db.select().from(adSolutionTranslations).where(eq(adSolutionTranslations.adSolutionId, id));
  });
  app.put('/ad-solutions/:id/translations/:locale', async (req) => {
    const { id, locale } = (req.params as any);
    const body = z.object({ title: z.string().min(1), body: z.string().optional() }).parse(req.body);
    await db.insert(adSolutionTranslations)
      .values({ adSolutionId: id, locale, title: body.title, body: body.body })
      .onDuplicateKeyUpdate({ set: { title: body.title, body: body.body } });
    return { ok: true };
  });
};
```

**`src/http/server.ts`** (kayıt)
```ts
import { adminI18nRoutes } from '@/http/routes/admin.i18n';
// ...
await app.register(adminI18nRoutes, { prefix: '/admin' });
```

> FE Part 6/7’de admin formlarına **“Çeviriler”** sekmesi eklerken bu endpoint’leri kullanacağız.

---

## 3) Media List/Search – Cloudinary Admin API & S3 Alternatifi

### 3.1 Env
```
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx
CLOUDINARY_UPLOAD_FOLDER=toronto

# S3 opsiyonel
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=eu-central-1
AWS_S3_BUCKET=toronto-media
```

### 3.2 Routes – Cloudinary

**`src/http/routes/admin.media.ts`**
```ts
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

export const adminMediaRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', app.auth);

  app.get('/media', async (req) => {
    const q = z.object({ prefix: z.string().optional(), max: z.coerce.number().default(50) }).parse((req as any).query);
    const ts = Math.floor(Date.now()/1000);
    const toSign = `max_results=${q.max}${q.prefix? `&prefix=${q.prefix}`:''}${process.env.CLOUDINARY_API_SECRET}`;
    const sig = (await import('node:crypto')).createHash('sha1').update(toSign).digest('hex');
    const url = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/resources/image${q.prefix? `?prefix=${encodeURIComponent(q.prefix)}`:'?'}&max_results=${q.max}&signature=${sig}&api_key=${process.env.CLOUDINARY_API_KEY}&timestamp=${ts}`;
    const res = await fetch(url, { method: 'GET' });
    const json = await res.json();
    return json.resources?.map((r: any)=>({ url: r.secure_url, public_id: r.public_id, bytes: r.bytes, format: r.format, width: r.width, height: r.height })) || [];
  });
};
```

> Cloudinary Admin API istekleri **server‑to‑server** yapılır; güvenlidir.

### 3.3 Routes – S3 alternatif

**`src/http/routes/admin.media.s3.ts`** (opsiyonel)
```ts
import { FastifyPluginAsync } from 'fastify';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

export const adminMediaS3Routes: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', app.auth);
  const s3 = new S3Client({ region: process.env.AWS_REGION });

  app.get('/media/s3', async (req) => {
    const Bucket = process.env.AWS_S3_BUCKET!;
    const out = await s3.send(new ListObjectsV2Command({ Bucket, MaxKeys: 100 }));
    return (out.Contents || []).map((o) => ({ key: o.Key, size: o.Size }));
  });
};
```

**`src/http/server.ts`**
```ts
import { adminMediaRoutes } from '@/http/routes/admin.media';
// import { adminMediaS3Routes } from '@/http/routes/admin.media.s3';
await app.register(adminMediaRoutes, { prefix: '/admin' });
// await app.register(adminMediaS3Routes, { prefix: '/admin' });
```

---

## 4) Migrations & FK’ler

### 4.1 Drizzle FK örnekleri (schema update)

**`src/db/schema.ts`** (örnek FK; MySQL/MariaDB destekli)
```ts
import { foreignKey } from 'drizzle-orm/mysql-core';

export const projectTranslations = mysqlTable('project_translations', {
  // ... alanlar
}, (t) => ({
  ux: uniqueIndex('ux_proj_tr').on(t.projectId, t.locale),
  fk: foreignKey({ columns: [t.projectId], foreignColumns: [projects.id], name: 'fk_proj_tr_project' }).onDelete('cascade'),
}));
```

**Komutlar**
```bash
bun run db:generate  # ./drizzle/* sql migrationları üretir
# gözden geçir → prod’da manuel apply veya push
bun run db:push
```

> İndeksler: `slug` alanlarında **unique index**, join alanlarında composite index ekleyin.

---

## 5) Sağlık Denetimi & Logging

**`src/http/routes/health.ts`**
```ts
import { FastifyPluginAsync } from 'fastify';
export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async () => ({ ok: true, ts: Date.now() }));
};
```

**`src/http/server.ts`**
```ts
import { healthRoutes } from '@/http/routes/health';
await app.register(healthRoutes);
```

> Prod’da `logger: { level: 'info' }` + HTTP access log yeterli. 5xx’lerde stack loglanır.

---

## 6) FE Bridge – Next API: login/refresh/logout

Part 6’daki Next **/api/admin/login** route’unu refresh ile güncelliyoruz ve **/api/admin/refresh** ekliyoruz.

**`FE:/src/app/api/admin/login/route.ts`** (güncelle)
```ts
import { cookies } from 'next/headers';
import { ADMIN_TOKEN_COOKIE } from '@/lib/auth/cookies';

export async function POST(req: Request) {
  const body = await req.json();
  const res = await fetch(`${process.env.API_BASE_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) return new Response('Unauthorized', { status: 401 });
  const data = await res.json(); // { token, user } veya { accessToken, refreshToken }

  const access = data.accessToken || data.token;
  const refresh = data.refreshToken; // backend login'i buna geçirdiysek

  cookies().set(ADMIN_TOKEN_COOKIE, access, { httpOnly: true, secure: true, sameSite: 'lax', path: '/admin', maxAge: 60 * 60 * 8 });
  if (refresh) cookies().set('ADMIN_REFRESH', refresh, { httpOnly: true, secure: true, sameSite: 'lax', path: '/admin', maxAge: 60 * 60 * 24 * 7 });
  return Response.json({ ok: true, user: data.user });
}
```

**`FE:/src/app/api/admin/refresh/route.ts`** (yeni)
```ts
import { cookies } from 'next/headers';
import { ADMIN_TOKEN_COOKIE } from '@/lib/auth/cookies';

export async function POST() {
  const r = cookies().get('ADMIN_REFRESH')?.value;
  if (!r) return new Response('Missing', { status: 401 });
  const res = await fetch(`${process.env.API_BASE_URL}/auth/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: r }) });
  if (!res.ok) return new Response('Unauthorized', { status: 401 });
  const data = await res.json(); // { accessToken, refreshToken }
  cookies().set(ADMIN_TOKEN_COOKIE, data.accessToken, { httpOnly: true, secure: true, sameSite: 'lax', path: '/admin', maxAge: 60 * 60 * 8 });
  cookies().set('ADMIN_REFRESH', data.refreshToken, { httpOnly: true, secure: true, sameSite: 'lax', path: '/admin', maxAge: 60 * 60 * 24 * 7 });
  return Response.json({ ok: true });
}
```

**`FE:/src/app/api/admin/logout/route.ts`** (güncelle)
```ts
import { cookies } from 'next/headers';

export async function POST() {
  const r = cookies().get('ADMIN_REFRESH')?.value;
  if (r) { await fetch(`${process.env.API_BASE_URL}/auth/logout`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: r }) }); }
  cookies().delete('ADMIN_REFRESH');
  cookies().delete('ADMIN_TOKEN');
  return new Response(null, { status: 204 });
}
```

> **Admin proxy** (Part 6: `/api/_admin/**`) değişmez; access token cookie’sinden Authorization eklemeye devam eder.

---

## 7) Hızlı Kontrol Komutları

```bash
# login → access + refresh al
curl -s localhost:8081/auth/login -H 'content-type: application/json' -d '{"email":"admin@toronto.dev","password":"admin123"}' | jq

# me (Authorization: Bearer <access>)
export TOK=...; curl -s localhost:8081/auth/me -H "authorization: bearer $TOK" | jq

# refresh
curl -s localhost:8081/auth/refresh -H 'content-type: application/json' -d '{"refreshToken":"..."}' | jq

# translations
curl -s localhost:8081/admin/projects/<id>/translations -H "authorization: bearer $TOK" | jq
```

---

## 8) Kabul Kriterleri (7B)

- Docker ile MariaDB + Adminer ayağa kalkar, Drizzle push & seed çalışır.
- /auth/me erişilebilir; refresh flow çalışır ve **rotasyon** yapar.
- Admin i18n endpoint’leri (projects/services/ad‑solutions) kayıt günceller, duplicate’te upsert eder.
- /admin/media Cloudinary list döndürür (opsiyonel S3 list).
- FE Next API login/refresh/logout rotaları **refresh cookie** ile güncellendi.
- FK ve index’ler eklendi; `ON DELETE CASCADE` ile çeviri kayıtları proje silinince temizlenir.

---

## 9) Sonraki Parça (Part 8)

- Admin UI: **Translations tab** (TR/EN/DE), **Media picker modal** entegrasyonu
- Projects admin’de kategori/etiket atama UI + backend join route’ları
- Contact Inbox (liste/işaretle) ve e‑posta webhook’u
- Prod deploy blueprint: PM2/Nginx, SSL, env matrisi, backup & restore komutları

