# F1 – Part 3: UI Atom/Molecule Set, Contact Form (Zod+RHF), Services & Ad Solutions (SSG), Project JSON‑LD

Bu parçada **tasarım uyumlu UI seti**, **iletişim formu (spam korumalı)**, **Services/Ad Solutions sayfaları** ve **Project JSON‑LD** eklenir. Public kısım **Server Components + SSG/ISR**, formlar ve carousel gibi etkileşimli modüller **Client**.

> Ek bağımlılıklar:
>
```bash
bun add react-hook-form @hookform/resolvers
```

---

## 1) UI Atom/Molecule Set (styled-components)

**`src/shared/ui/typography.tsx`**
```tsx

```

**`src/shared/ui/buttons/Button.tsx`**
```tsx

```

**`src/shared/ui/sections/Section.tsx`**
```tsx
```

**`src/shared/ui/grid/Grid.tsx`**
```tsx

```

---

## 2) Tema: Light/Dark Toggle

**`src/styles/ThemeModeProvider.tsx`**
```tsx

```

**`src/shared/ui/layout/ThemeToggle.tsx`**
```tsx

```

**`src/app/[locale]/layout.tsx`** (güncelle)
```tsx
// ...


```

**`src/shared/ui/feedback/Toasts.tsx`**
```tsx

```

Navbar’a toggle eklemek istersen:
```tsx
// Navbar.tsx
// ...

// ... inside Row

```

---

## 3) Contact Form (Client) + API Proxy (Server)

**`src/features/contact/ContactForm.tsx`** (client)
```tsx

```

**Server proxy:** `src/app/api/contact/route.ts` (Node runtime)
```ts

```

**Contact sayfasını güncelle:** `src/app/[locale]/contact/page.tsx`
```tsx

```

> İleri seviye: API route’una hCaptcha/reCAPTCHA doğrulaması eklenebilir (sunucu tarafında `secret` ile). Rate-limit için edge middleware veya upstream (Fastify) tavsiye edilir.

---

## 4) Services & Ad Solutions (SSG – Server Components)

**API yardımcıları:** `src/lib/api/public.ts` (eklemeler)
```ts

```

**Services sayfası:** `src/app/[locale]/services/page.tsx`
```tsx

```

**Ad Solutions sayfası:** `src/app/[locale]/ad-solutions/page.tsx`
```tsx

```

---

## 5) Project JSON‑LD (SEO)

**`src/shared/seo/JsonLd.tsx`** (server)
```tsx

```

**Project detail sayfasını güncelle:** `src/app/[locale]/projects/[slug]/page.tsx`
```tsx
// ... mevcut importlar


export default async function ProjectDetailPage({ params }: { params: { locale: string; slug: string } }) {
  

  return (
    <Container>
      {/* ... mevcut içerik */}
      <JsonLd data={jsonLd} />
    </Container>
  );
}
```

---

## 6) Performans Notları (uygulandı/uygulanacak)

- **SSG/ISR** tüm public sayfalarda, metadata server’da üretiliyor.
- Görsellerde `next/image` ve uygun `sizes` kullanın (ör: hero: `(max-width: 768px) 100vw, 1200px`).
- **Video** poster + `preload="metadata"` (Part 2’de).
- **Toasts** client’ta lazy, light/dark tema kullanıcı tercihi localStorage’da.
- **Contact** server proxy: client sırlarını sızdırmaz, honeypot spam’ı azaltır (gerekirse hCaptcha eklenir).

---

## 7) Sonraki Parça (Part 4)

- **References** için gerçek carousel (keen-slider veya embla) + SSR fallback korunarak
- **Projects** listesinde SSR arama/filtre (search params) ve pagination
- **Navbar/Footer** içeriklerini `site-settings` ile dinamikleştirme
- **Sitemap/robots** genişletmeleri ve hreflang iyileştirmeleri

