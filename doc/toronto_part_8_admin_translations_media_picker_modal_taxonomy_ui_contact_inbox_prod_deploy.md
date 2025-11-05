# Part 8 – Admin Translations, Media Picker Modal, Projects Taxonomy UI, Contact Inbox, Prod Deploy Blueprint

Bu parçada **admin UI**’yi tamamlıyoruz ve prod dağıtım şablonunu ekliyoruz:

- **Translations tab** (Projects/Services/Ad Solutions) – RTK Query ile i18n upsert
- **Media Picker Modal** – Cloudinary Admin API listesi, formlara entegre
- **Projects Taxonomy UI** – kategori/etiket atama (admin join endpoint’leri)
- **Contact Inbox** – mesajları listele/işaretle
- **Prod deploy** – PM2, Nginx, SSL, DB yedek/geri yükleme

> Admin tüm sayfalar **CSR**. Public kısım **RSC + SSG/ISR/SSR**.

---

## 0) Ön Koşullar & Notlar

- FE admin proxy (Part 6): **`/api/_admin/**`** → token gizli. Admin RTK base URL’in bu olduğundan emin olun.
- `SUPPORTED_LOCALES = ['tr','en','de']` varsayıldı (FE Part 1/2).
- Tasarım: styled-components. Inline stil **yok**.

---

## 1) RTK – i18n Admin Endpoints (FE)

**`src/integrations/admin/i18n.endpoints.ts`**
```ts

```

---

## 2) Admin UI – Translations Tab (Projects örneği)

**`src/shared/admin/Tabs.tsx`**
```tsx

```

**`src/app/(admin)/admin/projects/[id]/page.tsx`**
```tsx

```

> Aynı pattern’de **Services** ve **Ad Solutions** detay sayfalarına `Translations` sekmesi ekleyin (i18n endpoints’i kullanarak).

---

## 3) Media Picker Modal (FE)

**`src/shared/admin/media/MediaPickerModal.tsx`**
```tsx

```

> Admin Media listesi Part 7B’deki **`/admin/media`** endpoint’inden gelir.

---

## 4) Projects – Kategori/Etiket Atama (FE + BE)

### 4.1 FE RTK – Taxonomy endpoints

**`src/integrations/admin/taxonomy.endpoints.ts`**
```ts

```

### 4.2 FE UI – ProjectEdit’e Taxonomy sekmesi ekle

**`src/app/(admin)/admin/projects/[id]/page.tsx`** (ilgili parçayı ekleyin)
```tsx
// ... mevcut importlar


// component içinde
const { data: catList } = useListCategoriesAdminQuery();
const { data: tagList } = useListTagsAdminQuery();
const { data: tax } = useGetProjectTaxonomyQuery({ id });
const [saveTax] = useSetProjectTaxonomyMutation();

const [selCats, setSelCats] = useState<string[]>(tax?.categories || []);
const [selTags, setSelTags] = useState<string[]>(tax?.tags || []);
useEffect(()=>{ if (tax) { setSelCats(tax.categories); setSelTags(tax.tags); }},[tax]);

// UI (sekme altında grid)
<h3>Taxonomy</h3>
<Grid>
  <div>
    <strong>Kategoriler</strong>
    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
      {(catList||[]).map(c => (
        <label key={c.id} style={{ display:'inline-flex', gap:6 }}>
          <input type="checkbox" checked={selCats.includes(c.id)} onChange={(e)=> setSelCats(v => e.target.checked ? [...v, c.id] : v.filter(x=>x!==c.id)) } />
          {c.title}
        </label>
      ))}
    </div>
  </div>
  <div>
    <strong>Etiketler</strong>
    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
      {(tagList||[]).map(t => (
        <label key={t.id} style={{ display:'inline-flex', gap:6 }}>
          <input type="checkbox" checked={selTags.includes(t.id)} onChange={(e)=> setSelTags(v => e.target.checked ? [...v, t.id] : v.filter(x=>x!==t.id)) } />
          {t.title}
        </label>
      ))}
    </div>
  </div>
</Grid>
<Button onClick={async()=>{ await saveTax({ id, categories: selCats, tags: selTags }).unwrap(); toast.success('Taxonomy güncellendi'); }}>Kaydet</Button>
```

### 4.3 BE – Admin taxonomy routes

**`BE: src/http/routes/admin.taxonomy.ts`**
```ts
import { FastifyPluginAsync } from 'fastify';
import { db } from '@/core/db';
import { categories, categoryTranslations, tags, tagTranslations, projectCategories, projectTags } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

export const adminTaxonomyRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', app.auth);

  app.get('/categories', async () => {
    const rows = await db.execute({ sql: `SELECT c.id, c.slug, ct.title FROM categories c JOIN category_translations ct ON ct.category_id=c.id AND ct.locale='tr' ORDER BY ct.title ASC`, args: [] });
    return rows as any[];
  });
  app.get('/tags', async () => {
    const rows = await db.execute({ sql: `SELECT t.id, t.slug, tt.title FROM tags t JOIN tag_translations tt ON tt.tag_id=t.id AND tt.locale='tr' ORDER BY tt.title ASC`, args: [] });
    return rows as any[];
  });

  app.get('/projects/:id/taxonomy', async (req) => {
    const { id } = (req.params as any);
    const cats = await db.select({ id: projectCategories.categoryId }).from(projectCategories).where(eq(projectCategories.projectId, id));
    const tagsR = await db.select({ id: projectTags.tagId }).from(projectTags).where(eq(projectTags.projectId, id));
    return { categories: cats.map(c=>c.id), tags: tagsR.map(t=>t.id) };
  });

  app.put('/projects/:id/taxonomy', async (req) => {
    const { id } = (req.params as any);
    const body = z.object({ categories: z.array(z.string()).default([]), tags: z.array(z.string()).default([]) }).parse(req.body);

    // reset ve insert (basit yaklaşım)
    await db.execute({ sql: 'DELETE FROM project_categories WHERE project_id=?', args: [id] });
    await db.execute({ sql: 'DELETE FROM project_tags WHERE project_id=?', args: [id] });

    if (body.categories.length) {
      const values = body.categories.map(cid => `('${id}','${cid}')`).join(',');
      await db.execute({ sql: `INSERT INTO project_categories (project_id, category_id) VALUES ${values}`, args: [] });
    }
    if (body.tags.length) {
      const values = body.tags.map(tid => `('${id}','${tid}')`).join(',');
      await db.execute({ sql: `INSERT INTO project_tags (project_id, tag_id) VALUES ${values}`, args: [] });
    }

    return { ok: true };
  });
};
```

**`BE: src/http/server.ts`**
```ts
import { adminTaxonomyRoutes } from '@/http/routes/admin.taxonomy';
await app.register(adminTaxonomyRoutes, { prefix: '/admin' });
```

---

## 5) Contact Inbox (FE + BE)

### 5.1 BE – Admin contact routes

**`BE: src/http/routes/admin.contact.ts`**
```ts
import { FastifyPluginAsync } from 'fastify';
import { db } from '@/core/db';
import { contactMessages } from '@/db/schema';
import { sql, eq } from 'drizzle-orm';
import { z } from 'zod';

export const adminContactRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', app.auth);

  app.get('/contact-messages', async (req) => {
    const q = (req as any).query || {}; const page = Number(q.page||1), pageSize = Number(q.pageSize||20);
    const off = (page-1)*pageSize;
    const total = await db.execute(sql`SELECT COUNT(*) as c FROM contact_messages`);
    const items = await db.execute(sql`SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${off}`);
    return { items, total: Number((total as any)[0].c||0), page, pageSize };
  });

  app.post('/contact-messages/:id/handle', async (req) => {
    const { id } = (req.params as any);
    await db.update(contactMessages).set({ handledAt: new Date() }).where(eq(contactMessages.id, id));
    return { ok: true };
  });
};
```

**`BE: src/http/server.ts`**
```ts
import { adminContactRoutes } from '@/http/routes/admin.contact';
await app.register(adminContactRoutes, { prefix: '/admin' });
```

### 5.2 FE RTK – Contact inbox endpoints

**`src/integrations/admin/contact.endpoints.ts`**
```ts

```

### 5.3 FE Page – `src/app/(admin)/admin/contact-inbox/page.tsx`
```tsx

```

---

## 6) Prod Deploy Blueprint (PM2 + Nginx + SSL + Backup)

### 6.1 PM2 – FE & API (ecosystem)

**`ecosystem.config.cjs`** (monorepo değilse ayrı klasörlerde benzer)
```js

```

**Komutlar**
```bash
# FE
bun install && bun run build
pm2 start ecosystem.config.cjs --only toronto-fe
# API
bun install && bun run build
pm2 start ecosystem.config.cjs --only toronto-api
pm2 save
```

### 6.2 Nginx – Reverse Proxy (FE + API)

**`/etc/nginx/sites-available/toronto.conf`**
```nginx
server {
  listen 80;
  server_name toronto.example.com;
  location /.well-known/acme-challenge/ { root /var/www/letsencrypt; }
  location / { return 301 https://$host$request_uri; }
}

server {
  listen 443 ssl http2;
  server_name toronto.example.com;
  ssl_certificate     /etc/letsencrypt/live/toronto.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/toronto.example.com/privkey.pem;

  # FE (Next)
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 300;
  }

  # API
  location /api/ {
    proxy_pass http://127.0.0.1:8081/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

**SSL alma (örnek)**
```bash
sudo certbot certonly --webroot -w /var/www/letsencrypt -d toronto.example.com
sudo ln -s /etc/nginx/sites-available/toronto.conf /etc/nginx/sites-enabled/toronto.conf
sudo nginx -t && sudo systemctl reload nginx
```

> İsteğe göre **Brotli/Gzip**, cache headers ve `security_headers` ekleyin (CSP, HSTS dikkatli).

### 6.3 DB Backup/Restore (MariaDB)

**Yedekleme**
```bash
# günlük yedek (saklama: 7 gün)
mkdir -p /var/backups/toronto
mysqldump -u$DB_USER -p$DB_PASS -h$DB_HOST $DB_NAME | gzip > /var/backups/toronto/$(date +%F).sql.gz
find /var/backups/toronto -type f -mtime +7 -delete
```

**Geri Yükleme**
```bash
gunzip -c /var/backups/toronto/2025-10-31.sql.gz | mysql -u$DB_USER -p$DB_PASS -h$DB_HOST $DB_NAME
```

**Cron**
```bash
crontab -e
0 3 * * * DB_USER=toronto DB_PASS=toronto DB_HOST=127.0.0.1 DB_NAME=toronto /bin/bash /usr/local/bin/toronto-db-backup.sh
```

---

## 7) Kabul Kriterleri (Part 8)

- Project edit ekranında **Media Picker** ile kapak seçilip kaydedilir.
- **Translations** sekmesinde TR/EN/DE upsert çalışır; public sayfalarda anında görünür (revalidate ile).
- **Taxonomy** sekmesinden kategori/etiket atanır; Projects list filtresiyle uyumludur.
- **Contact Inbox** mesajları listeler; “İşaretle” ile handledAt set edilir.
- PM2/Nginx/SSL kurulumu sonrası FE + API tek domainde servis edilir; yedekleme cron’u çalışır.

---

## 8) Sonraki Parça (Part 9)

- Admin: Services & Ad Solutions için **zengin editör** (Tiptap/Quill), FAQ builder
- Public: **lazy i18n image maps** ve **video CDN** iyileştirmeleri
- Observability: pino transport + loki/grafana veya logrotate
- QA: Playwright geniş senaryolar + Lighthouse threshold ayarlarının CI’da sabitlenmesi

