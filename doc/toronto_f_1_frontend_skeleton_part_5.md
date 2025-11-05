# F1 – Part 5: Admin CRUD (RTK Query), Site Settings (sosyal + saat), Projects kategori/etiket filtreleri (SSR), Service/Ad JSON‑LD

Bu bölümde **admin tarafını** (CSR) devreye alıyoruz: References & Projects CRUD, **site settings** genişletmesi (sosyal linkler, çalışma saatleri), **Projects** için kategori/etiket filtreleri (SSR), **Service/Ad Solutions detay + JSON‑LD/FAQ**.  
> Not: Bu parçadan itibaren inline stil kullanımını **kaldırıyoruz**; tüm görseller ve düzenlemeler styled‑components ile. Mevcut inline’lar Part 6’da bütünüyle refactor edilecek.

---

## 0) Ortak: Revalidate Helper (Client çağrı)

**`src/lib/revalidate.ts`**
```ts

```

> `.env.example` güncelle: `NEXT_PUBLIC_REVALIDATE_SECRET=...` (Next API route ile eşleşmeli)

---

## 1) Admin Route Group ve Layout (CSR)

**Dizin:** `src/app/(admin)/admin/`

**`src/app/(admin)/admin/layout.tsx`**
```tsx

```

**`src/shared/admin/AdminLayout.tsx`**
```tsx

```

**`src/app/(admin)/admin/page.tsx`** (Dashboard placeholder)
```tsx

```

---

## 2) RTK Query – Admin Endpoints

**`src/integrations/admin/references.endpoints.ts`**
```ts

```

**`src/integrations/admin/projects.endpoints.ts`**
```ts

```

**`src/integrations/admin/siteSettings.endpoints.ts`**
```ts

```

---

## 3) Admin – References List & Form (CSR)

**`src/app/(admin)/admin/references/page.tsx`**
```tsx

```

> Dosya yükleme entegrasyonunu (Cloudinary/S3) Part 6’da ekleyeceğiz; şimdilik URL alanıyla ilerliyoruz.

---

## 4) Admin – Projects List & Form (CSR)

**`src/app/(admin)/admin/projects/page.tsx`**
```tsx

```

> Çok dillilik (translations) ve detay formu Part 6’da açılacak (modal + tabbed).

---

## 5) Site Settings (sosyal + saat) – Admin Form

**`src/app/(admin)/admin/site-settings/page.tsx`**
```tsx

```

> Public Navbar/Footer Part 4’te bu alanları zaten kullanıyor; sosyal linklerini footer’a Part 6’da ekleyeceğiz.

---

## 6) Projects – Kategori/Etiket Filtreleri (SSR)

**API helper eklemeleri:** `src/lib/api/public.ts`
```ts

```

**Projects SSR sayfasını güncelle:** `src/app/[locale]/projects/page.tsx`
```tsx
// ... mevcut importlar


export default async function ProjectsPage({ params, searchParams }: { params: { locale: string }, searchParams: Record<string, any> }) {
  const q = parse(searchParams);
  
  // ...
  return (
    // ...
    <form method="get" /* ... */>
      {/* ... önceki alanlar */}
      <select name="category">
        <option value="">Kategori (tümü)</option>
        {filters.cats.map(c => <option key={c.slug} value={c.slug} selected={searchParams.category === c.slug}>{c.title}</option>)}
      </select>
      <select name="tag">
        <option value="">Etiket (tümü)</option>
        {filters.tags.map(t => <option key={t.slug} value={t.slug} selected={searchParams.tag === t.slug}>{t.title}</option>)}
      </select>
      {/* ... */}
    </form>
    // ...
  );
}
```

> Backend, `/projects` endpoint’inde `category` ve `tag` query’lerini desteklemeli. (Part 7’de Fastify tarafını yazacağız.)

---

## 7) Services & Ad Solutions – Detay Sayfaları ve JSON‑LD/FAQ

**API helper:** `src/lib/api/public.ts` (eklemeler)
```ts

```

**Service detay:** `src/app/[locale]/services/[slug]/page.tsx`
```tsx

```

**Ad Solution detay:** `src/app/[locale]/ad-solutions/[slug]/page.tsx`
```tsx

```

---

## 8) Kabul Kriteri Eklentileri (Part 5)

- Admin panelinden **References** ve **Projects** ekleme/silme/güncelleme çalışır; işlemlerden sonra **revalidate** tetiklenir (tags: `references`, `projects`).
- Site Settings: sosyal linkler ve çalışma saatleri **public Navbar/Footer**’a veri sağlar (Footer entegrasyonu Part 6’da tamam).
- Projects: kategori/etiket filtreleri SSR form içinde; URL query ile çalışır.
- Services/Ad Solutions: detay sayfaları mevcut; Service için **FAQPage** JSON‑LD render edilir.

---

## 9) Sonraki Parça (Part 6)

- Admin **auth** (login/logout, guard) ve rol tabanlı görünürlük
- Dosya **upload** (Cloudinary/S3) ve media picker (admin formlarına ekleme)
- Public tarafında **inline stil refactor** → tüm stiller styled‑components
- Footer’a sosyal ikonlar + structured data (Organization)  
- E2E smoke (Playwright) + Lighthouse CI konfig (opsiyon)

