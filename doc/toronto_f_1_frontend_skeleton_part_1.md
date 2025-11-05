# F1 – Frontend Skeleton (Next.js + TS + styled-components + RTK Query)

Aşağıda **tam çalışan iskelet** (çok dilli, styled-components SSR, RTK Query store, Navbar/Footer + boş sayfa rotaları, locale middleware).

> Paket yöneticisi: **Bun** (istersen pnpm’e çeviririz).

---

## 0) Repo Bootstrap (komutlar)

```bash
# 1) Projeyi oluştur
bunx create-next-app@latest toronto-web \
  --ts --eslint --app --src-dir --import-alias "@/*" --tailwind false

cd toronto-web

# 2) Gerekli bağımlılıklar
bun add styled-components @types/styled-components \
  @reduxjs/toolkit react-redux zod sonner framer-motion

# 3) (Ops.) Lint/format
bun add -D prettier eslint-config-prettier eslint-plugin-import
```

---

## 1) next.config.mjs

```ts

```

---

## 2) tsconfig.json (alias & strict)

```json

```

---

## 3) .env.example

```env

```

`.gitignore` içine `.env` eklemeyi unutma.

---

## 4) i18n Sabitleri

**`src/lib/i18n/locales.ts`**
```ts

```

---

## 5) Locale Middleware (otomatik yönlendirme)

**`middleware.ts`**
```ts

```

---

## 6) styled-components SSR Registry

**`src/lib/StyledComponentsRegistry.tsx`**
```tsx

```

---

## 7) Tema (design tokens)

**`src/styles/themes/torontoTheme.ts`**
```ts

```

**`src/styles/styled.d.ts`** (tip desteği)
```ts

```

---

## 8) UI – Basit Layout Bileşenleri

**`src/shared/ui/common/Container.tsx`**
```tsx

```

**`src/shared/ui/layout/Navbar.tsx`**
```tsx

```

**`src/shared/ui/layout/Footer.tsx`**
```tsx

```

**`src/shared/ui/navigation/LocaleSwitcher.tsx`**
```tsx

```

**`src/shared/ui/actions/WhatsAppButton.tsx`**
```tsx

```

---

## 9) App Router – Çok Dilli Rotalar

**`src/app/layout.tsx`** (root – html varsayılanları)
```tsx

```

**`src/app/[locale]/layout.tsx`**
```tsx

```

**`src/app/[locale]/page.tsx`** (Home placeholder)
```tsx

```

**Boş sayfa rotaları**

`src/app/[locale]/projects/page.tsx`
```tsx

```

`src/app/[locale]/services/page.tsx`
```tsx

```

`src/app/[locale]/ad-solutions/page.tsx`
```tsx

```

`src/app/[locale]/references/page.tsx`
```tsx

```

`src/app/[locale]/contact/page.tsx`
```tsx

```

---

## 10) RTK Query Store İskeleti

**`src/integrations/baseApi.ts`**
```ts

```

**`src/store/store.ts`**
```ts

```

**`src/store/StoreProvider.tsx`**
```tsx

```

---

## 11) SEO: sitemap & robots (placeholders)

**`src/app/sitemap.ts`**
```ts

```

**`src/app/robots.ts`**
```ts

```

---

## 12) Çalıştırma

```bash
bun dev
# http://localhost:3000 → otomatik /tr/… yönlendirir
```

Bu noktada:
- Çok dilli routing + locale switcher çalışır,
- SSR styled-components kurulu (FOUC yok),
- RTK Query store bağlı,
- Tüm public sayfalar için boş rotalar hazır,
- WhatsApp CTA mevcut.

**Bir sonraki adım (F2):** Home/Services/Ad Solutions section bloklarını (Hero, LogoCarousel, VideoSection, CTA) Figma token’larına göre oluşturalım.

