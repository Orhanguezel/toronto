# Part 19 – Design System DocSite/Storybook, Content Staging & Preview, Edge Cache & Early Hints, Security Hardening, DX Automation

Bu bölüm; tasarım-tabanlı geliştirme hızını, içerik yayın güvenini, performans ve güvenlik standartlarını ve geliştirici deneyimini prod seviyesine çıkarır.

- **Design System Dokümantasyonu**: Storybook 8 + MDX DocSite; token→bileşen eşlemeleri
- **Content Staging & Preview**: taslak içerik akışı, branch/PR bazlı review apps, güvenli preview token’ları
- **Edge Cache & Early Hints**: HTTP cache politikaları, 103 Early Hints/Preload, HTML streaming ayarları
- **Security Hardening**: rate‑limit, IP allowlists, CSP/Trusted Types, bağımlılık taraması, CSRF
- **DX Automation**: lint/fix, type‑check, dep‑update, PR quality gates

> FE: Next.js 15 (RSC + SSR/SSG/ISR), styled‑components. BE: Fastify + TS + Drizzle + MariaDB. Build: Bun. Proxy: Nginx.

---

## 0) Design System Dokümantasyonu (Storybook + DocSite)

### 0.1 Kurulum (Storybook 8, styled‑components)
```bash
bun add -d @storybook/nextjs @storybook/addon-essentials @storybook/addon-interactions @storybook/test @storybook/theming
bun dlx storybook init --type nextjs
```
**`.storybook/main.ts`**
```ts

```
**`.storybook/preview.ts`** (tema sağlayıcı)
```ts

```

### 0.2 Token → Bileşen referansı
- **Docs/MDX**: `src/app/(docs)/docs/design-tokens.mdx`, `src/app/(docs)/docs/components/button.mdx`
- MDX içinde canlı örnekler: `Canvas` ve `ArgsTable` kullanın; variant/state matrisleri (hover/disabled/size)

**`src/components/ui/Button/Button.stories.tsx`**
```tsx

```

### 0.3 DocSite (Next + MDX)
```bash
bun add @next/mdx
```
**`next.config.js`**
```js
const withMDX = require('@next/mdx')();
module.exports = withMDX({ pageExtensions: ['ts','tsx','mdx'] });
```
**Yapı**: `src/app/(docs)/docs/page.mdx` → genel giriş, `design-tokens.mdx`, `components/*.mdx`, `patterns/*.mdx`.

### 0.4 Kabul
- Storybook komponentleri tema ile açılır; MDX DocSite sayfaları SSG/ISR ile servis edilir.
- Token tabloları ve varyant matrisleri, Figma’daki komponent setiyle uyumlu.

---

## 1) Content Staging & Preview

### 1.1 Next Draft Mode + Preview Secret
**`FE: src/app/api/preview/route.ts`**
```ts

```
**Kullanım**: Admin’de “Önizleme” → `/api/preview?secret=...&redirect=/tr/projects/slug` linki oluşturur.

### 1.2 Branch/PR Review Apps
- **Subdomain şeması**: `<branch>.preview.toronto.dev`
- **Nginx**: wildcard server + root değişkeni branch’e göre; veya Docker/Traefik label’larıyla dinamik route.
- PM2 process adı: `toronto-fe-<branch>`; deploy script: `deploy-preview.sh <branch>` → build + rsync + pm2 start.

**`/etc/nginx/sites-enabled/toronto-preview.conf`** (özet)
```nginx
server {
  listen 443 ssl http2; server_name ~^(?<branch>[a-z0-9-]+)\.preview\.toronto\.dev$;
  location / { proxy_pass http://unix:/run/toronto-fe-$branch.sock; }
}
```

### 1.3 Staging verisi
- **DB snapshot** staging’e restore (masking): kişisel veriler maskele.
- **Search/CDN** staging anahtarı; staging domain’i robots.txt `Disallow: /`.

### 1.4 Kabul
- Admin “Önizleme” butonu taslakları gösterir (Draft Mode aktif).
- PR açıldığında otomatik review app deploy olur ve link PR’a düşer.

---

## 2) Edge Cache & Early Hints

### 2.1 HTTP Cache Policy
- Statik sayfalar: `Cache-Control: public, max-age=600, stale-while-revalidate=86400`
- JSON API: `private, max-age=0, s-maxage=60`
- Görseller: `public, max-age=31536000, immutable`

**`BE: src/http/plugins/cacheHeaders.ts`**
```ts
import { FastifyPluginAsync } from 'fastify';
export const cacheHeaders: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', (req, rep, done)=>{
    if (req.url.startsWith('/assets/')) rep.header('Cache-Control','public, max-age=31536000, immutable');
    done();
  });
};
```

### 2.2 Early Hints / Preload
- **Nginx/CF** ile 103 Early Hints: kritik hero görseli ve font preload link’lerini `Link:` header’ına yazın.
- **Priority Hints**: `<img fetchpriority="high">`, `<link rel="preload" as="image">` (Part 16’ya uyumlu).

### 2.3 HTML Streaming
- Next RSC streaming açık; **`suspense`** sınırlarını kritik olmayan bloklarda kullanın.

### 2.4 Kabul
- İlk byte sonrası içerik akışı başlar; hero görseli preload ile hızlı yüklenir; edge cache 10 dk.

---

## 3) Security Hardening

### 3.1 Rate‑Limit (Fastify)
```bash
bun add @fastify/rate-limit
```
**`BE: src/http/plugins/rateLimit.ts`**
```ts
import rate from '@fastify/rate-limit';
export default async function(app:any){
  await app.register(rate, { max: 200, timeWindow: '1 minute', allowList: ['127.0.0.1'], ban: 1 });
}
```

### 3.2 IP Allowlist (Admin)
```ts
app.addHook('onRequest', async (req, rep)=>{
  if (req.raw.url?.startsWith('/admin')){
    const ip = req.ip; // setTrustProxy(1)
    const ALLOW = (process.env.ADMIN_IPS||'').split(',').map(s=>s.trim());
    if (ALLOW[0] && !ALLOW.includes(ip)) return rep.code(403).send({ error:'forbidden' });
  }
});
```

### 3.3 CSP + Trusted Types
```bash
bun add @fastify/helmet
```
**`BE: src/http/plugins/helmet.ts`**
```ts
import helmet from '@fastify/helmet';
export default async function(app:any){
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'","'strict-dynamic'","'unsafe-inline'","https://www.googletagmanager.com"],
        styleSrc:  ["'self'","'unsafe-inline'"],
        imgSrc:    ["'self'","data:","https://res.cloudinary.com"],
        connectSrc:["'self'", "https://*.algolia.net", "https://*.algolianet.com"],
        frameAncestors:["'none'"],
        upgradeInsecureRequests: []
      }
    },
    crossOriginEmbedderPolicy: false
  });
  app.addHook('onSend', (req, rep, payload, done)=>{ rep.header('Require-Trusted-Types-For','script'); done(); });
}
```
> Üretimde `unsafe-inline`’ı **kaldırıp** nonce/sha256 kullanın. Next çıktılarında `_next` hostunu `scriptSrc`e ekleyin.

### 3.4 CSRF (cookie + header)
```bash
bun add @fastify/csrf-protection
```
```ts
import csrf from '@fastify/csrf-protection';
await app.register(csrf, { cookie: true });
```

### 3.5 Dep Tarama & Sabitleme
- **GitHub Advanced Security** veya **Snyk**: `bunx snyk test --severity-threshold=high`
- **Lockfile sabit**: `bun install --frozen-lockfile` CI’da zorunlu.

### 3.6 Secrets Yönetimi
- `.env` prod erişimi: sadece CI runner + server; **dotenv‑vault** veya sops/age ile şifreleme.

### 3.7 Kabul
- /admin IP allowlist ve rate‑limit aktif; CSP header’ları doğru; CSRF token’ları gereklidir; dep taraması CI’da çalışır.

---

## 4) DX Automation – PR Kalitesi ve Otomatik İşler

### 4.1 Quality Gates (GitHub Actions)
**`.github/workflows/ci.yml`**
```yaml
name: CI
on: [pull_request]
jobs:
  lint-type-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run lint && bun run typecheck && bun run test
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: microsoft/playwright-github-action@v1
      - run: bun install && bun run build && bun run test:e2e
```

### 4.2 Lint/Fix + Biome (opsiyonel hız)
```bash
bun add -D @biomejs/biome
```
**`biome.json`**: format + lints; **`bun run biome check --write`** PR’da otomatik.

### 4.3 Dependabot & Changesets
- **Dependabot**: `package.json` ve GitHub Actions güncellemeleri için.
- **Changesets**: semver release notları.

### 4.4 Danger.js (opsiyonel)
- PR açıklaması, test kapsamı ve değişen dosyalara göre uyarı kuralları.

### 4.5 Kabul
- PR açılınca lint/type/e2e koşar; kırmızıysa merge bloklanır; bağımlılık güncellemeleri otomatik PR olur; release notları üretilir.

---

## 5) Kabul Kriterleri (Part 19)
- Storybook + DocSite kurulu; token ve bileşen referansları eksiksiz.
- Preview/Draft Mode gizli token ile çalışır; PR açılınca review app linki oluşur.
- Edge cache / preload / streaming aktif; hero görseli hızlı yüklenir.
- Rate‑limit + allowlist + CSP/TT + CSRF canlıda çalışır.
- CI kalite kapıları ve otomatik güncellemeler aktiftir.

---

## 6) Sonraki Parça (Part 20)
- **Content Staging**: Editoryal onay akışları (roles → status transitions)
- **Search UX**: sıralama/signals (click‑through, language boost), query suggestions
- **Video Pipeline**: Cloudinary HLS + poster automation, adaptive bitrate testleri
- **Accessibility**: WCAG 2.2 checklist + axe e2e
- **Analytics**: iş hedefleri (lead funnel) için event şeması + dashboard

