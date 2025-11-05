# F1 – Part 4: References Carousel (Embla), Projects SSR Filter/Pagination, Dinamik Navbar/Footer (site-settings), SEO Hreflang & Sitemap

Bu parça ile:
- **Embla** ile performanslı referans carousel’i
- **Projects** sayfasında **SSR** arama/filtre + sayfalama (search params)
- **Navbar/Footer**’ı **site-settings** ile dinamikleştirme
- SEO için **hreflang alternates** ve **sitemap** genişletmesi

a geliyor. Public sayfalar **Server Components + SSG/ISR**, dinamik arama sayfaları **SSR**.

---

## 0) Bağımlılık

```bash

```

---

## 1) Referans Carousel – Embla (Client, SSR fallback korunur)

**`src/features/references/LogoCarousel.tsx`** (client – Embla)
```tsx

```

> **Not:** Server tarafındaki `ReferencesStrip` (Part 2) değişmiyor; Embla bileşeni `ssr:false` dynamic import ile yüklenmeye devam ediyor.

---

## 2) Projects – SSR Arama/Filtre ve Sayfalama

### 2.1 API yardımcıları (paged)

**`src/lib/api/public.ts`** (eklemeler)
```ts

```

### 2.2 SSR sayfa (search params)

**`src/app/[locale]/projects/page.tsx`** (güncelle)
```tsx

```

> Form **GET** ile çalıştığı için ekstra client JS gerekmez → SEO ve performans kazanımı.

---

## 3) Navbar/Footer – Dinamik site-settings

### 3.1 Navbar’ı ayarlardan besle

**`src/shared/ui/layout/Navbar.tsx`** (güncelle – props ile contact)
```tsx

```

**`src/app/[locale]/layout.tsx`** (güncelle – settings’ten geçir)
```tsx

// ... diğer importlar


```

### 3.2 Footer’ı ayarlardan besle

**`src/shared/ui/layout/Footer.tsx`** (güncelle – server’a gerek yok, props yeterli)
```tsx

```

---

## 4) Hreflang Alternates Yardımcısı ve Metadata’larda Kullanımı

**`src/lib/seo/alternates.ts`**
```ts

```

**Örnek kullanım – Home** `src/app/[locale]/page.tsx` (generateMetadata)
```tsx



```

**Projects** `generateMetadata` içinde de aynı şekilde: `alternates: { languages: languagesMap('/projects') }` ekleyin.

---

## 5) Genişletilmiş Sitemap: Statik + Proje Slug’ları

**`src/app/sitemap.ts`** (güncelle)
```ts

```

---

## 6) Notlar – Performans & SEO İncelikleri

- **Arama/filtre SSR**: `dynamic = 'force-dynamic'` + `cache: 'no-store'` ile her sorgu anlık ve indekslenebilir.
- **SSG/ISR**: Detay/landing sayfaları statik. Admin güncellemesinde (Part 2’deki webhook) `revalidateTag('projects')` çağrısı ile yenileyin.
- **Embla**: Carousel client’ta yüklenir; SEO için server şerit görünümü zaten var.
- **Hreflang**: `languagesMap` helper ile tüm sayfalarda `alternates.languages` doldurulabilir.
- **Sitemap**: Dinamik proje URL’leri eklenir; `lastModified` arama motorlarına taze içerik sinyali verir.

---

## 7) Sonraki Parça (Part 5)

- **Navbar/Footer** içeriklerini (sosyal linkler, çalışma saatleri) genişletme
- **References** admin CRUD (CSR + RTK Query) ve revalidate akışı
- **Projects** sayfasında kategori/etiket filtreleri ve URL şeması
- **Ad Solutions** ve **Services** için JSON‑LD (FAQ şeması) ve detay sayfaları

