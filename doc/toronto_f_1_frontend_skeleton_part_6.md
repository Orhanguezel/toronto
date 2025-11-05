# F1 – Part 6: Admin Auth (login/guard), Upload & Media Picker, Footer sosyal + Organization JSON‑LD, Inline‑style Refactor, E2E (Playwright) & Lighthouse CI

Bu bölümde **admin kimlik doğrulama**, **proxy korumalı RTK Query**, **Cloudinary imzalı upload + MediaInput**, **Footer sosyal & çalışma saatleri**, **Organization JSON‑LD**, **inline stil refactor** ve **E2E/Lighthouse** ekliyoruz.

> Yeni env’ler (.env.example):
```env
API_BASE_URL=http://localhost:8081
REVALIDATE_SECRET=changeme
NEXT_PUBLIC_REVALIDATE_SECRET=changeme
# Cloudinary
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx
CLOUDINARY_UPLOAD_FOLDER=toronto
```

---

## 1) Admin Auth – Login, Guard, Proxy

### 1.1 Server‑side cookie anahtarı

**`src/lib/auth/cookies.ts`**
```ts

```

### 1.2 Admin proxy (Next API → Backend /admin/**)

**`src/app/api/_admin/[...path]/route.ts`**
```ts

```

> Admin RTK Query, artık `baseUrl: '/api/_admin'` kullanmalı (Part 5’teki admin endpointlerini bu URL’e çevirin). Böylece **token client’a sızmaz**, proxy ekler.

### 1.3 Login/Logout API routes

**`src/app/api/admin/login/route.ts`**
```ts

```

**`src/app/api/admin/logout/route.ts`**
```ts

```

### 1.4 Guard’lı admin layout (server) + client UI

**`src/app/(admin)/admin/layout.tsx`** (server guard)
```tsx

```

**`src/app/(admin)/admin/login/page.tsx`** (client form)
```tsx

```

**Logout tuşu (client)**
```tsx
'use client';
import { Button } from '@/shared/ui/buttons/Button';
export function AdminLogout(){
  return <Button variant="ghost" onClick={async()=>{ await fetch('/api/admin/logout', { method:'POST' }); location.href='/admin/login'; }}>Çıkış</Button>;
}
```

> Rol kontrolü gerekirse `GET /auth/me` proxy ekleyip `AdminRoot` içinde user.role’a göre kontrol edebilirsiniz.

---

## 2) Upload – Cloudinary imzalı ve MediaInput

### 2.1 İmza endpoint’i

**`src/app/api/upload/cloudinary/sign/route.ts`**
```ts

```

### 2.2 MediaInput (client)

**`src/shared/admin/MediaInput.tsx`**
```tsx

```

> Bunu **References** ve **Projects** formlarında `logo_url` / `cover_url` alanlarında kullanın.

---

## 3) Footer Sosyal + Çalışma Saatleri & Organization JSON‑LD

### 3.1 Footer güncelle

**`src/shared/ui/layout/Footer.tsx`** (güncelle)
```tsx

```

**`src/app/[locale]/layout.tsx`** (settings’ten geçir + Organization JSON‑LD)
```tsx

// ...
export default async function LocaleLayout({ params, children }: { params: { locale: string }, children: React.ReactNode }) {
  
  return (
    <html lang={params.locale}>
      <body>
        <StyledComponentsRegistry>
          <ThemeModeProvider>
            <StoreProvider>
              <Navbar locale={params.locale} contact={{ phones: c.phones, email: c.email }} />
              {children}
              <Footer contact={{ phones: c.phones, email: c.email, address: c.address }} socials={socials as any} hours={settings.businessHours} />
              <JsonLd data={orgLd} />
              <Toasts />
            </StoreProvider>
          </ThemeModeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
```

---

## 4) Inline Stil Refactor – Örnekler

### 4.1 Hero

**`src/features/home/Hero.tsx`** (server)
```tsx

```

### 4.2 VideoSection

**`src/features/home/VideoSection.tsx`**
```tsx

```

> Diğer küçük inline stilleri (Projects list, ReferencesStrip vb.) aynı paternde düzenleyin.

---

## 5) E2E (Playwright) & Lighthouse CI

### 5.1 Kurulum

```bash
bun add -D @playwright/test
bunx playwright install
```

**`playwright.config.ts`**
```ts

```

**`tests/smoke.spec.ts`**
```ts

```

### 5.2 Lighthouse (opsiyonel, CI)

**`lighthouserc.js`**
```js

```

**GitHub Action (özet)** `.github/workflows/ci.yml`
```yaml

```

---

## 6) Kabul Kriterleri (Part 6)

- `/admin/login` → başarıyla login olur, **httpOnly** cookie set edilir; `/admin/*` guard ile korunur.
- Admin RTK Query istekleri **/api/_admin/** üzerinden gider; token client’a sızmaz.
- **MediaInput** ile görsel upload (Cloudinary) çalışır; URL alanlarına otomatik yazılır.
- Footer’da sosyal linkler ve çalışma saatleri görünür; **Organization JSON‑LD** layout’ta render edilir.
- Önceki inline stiller styled‑components’a taşınmıştır (örnekler uygulanmıştır).
- E2E smoke testleri çalışır; Lighthouse konfigürasyonu hazırdır.

---

## 7) Sonraki Parça (Part 7)

- Backend (Fastify + MariaDB): şema, auth, admin router’ları, public endpoints (projects/services/ad‑solutions/references/site‑settings/contact)
- Revalidate webhook (backend → Next) ve rate limit (contact)
- Çok dilli translation tabloları ve sorgular
- Dosya upload için backend imzalama (Cloudinary alternatif S3) ve media listesi endpoint’i

