# Part 10 – Design System (Figma→FE), Blog/News (SSG+i18n+RSS), Search & Compare, Cache/Invalidation Matrix

Bu parçada tasarımı **Figma → Frontend** akışına oturtuyor, **Blog/News** modülünü (SSG/ISR + i18n + RSS + sitemap) kuruyor, **Search** & **Projects Compare** sayfalarını ekliyor ve **cache/invalidation** stratejisini tamamlıyoruz.

> Tüm stiller **styled‑components**. **Inline stil yok**. RSC + SSR/SSG/ISR stratejileri Part 1‑9 ile uyumlu.

---

## 0) Design System – Theme Tokens & Figma Mapping

**Amaç:** Figma’daki renk/typography/spacing/z-index token’larını tek merkezden yönetmek, komponentlerde aynı dili kullanmak.

### 0.1 Theme dosyası
**`src/styles/themes/torontoTheme.ts`**
```ts

```

**Provider:** `src/app/providers/ThemeModeProvider.tsx` içinde `ThemeProvider` zaten kullanılıyor (Part 2/6). Gerekirse `GlobalStyle` ile body font/renk set edin.

### 0.2 Figma → Token eşleme rehberi
- **Renk stilleri** (Figma): `Primary/500 → theme.colors.primary`, `Primary/600 → .primaryAlt`, `Text/Muted → .muted`, `Surface/Default → .surface`.
- **Typography**: Figma heading ölçekleri `H1..H6` → `typography.size.h1..h6`. Satır aralığı Figma “Auto/120%” ise `leading.tight/snug/normal` ile eşleyin.
- **Spacing**: Figma 8px grid ise `spacing(2)`, 12px ise `spacing(3)` gibi.
- **Radii/Shadows**: Figma Corner Radius değerlerini `radii` map’ine oturtun (ör. 12px → md).

> Ekipte mutabakat için kısa bir **Figma Naming Guide** dokümanı oluşturup token isimlerini sabitleyin.

---

## 1) Blog/News Modülü (i18n + SSG/ISR + RSS + Sitemap)

### 1.1 Backend – DB Şeması (Drizzle)
**`BE: src/db/schema.blog.ts`**
```ts

```

> FK + `ON DELETE CASCADE` migration’ı ekleyebilirsiniz (Part 7B’yi referans alın).

### 1.2 Backend – Public & Admin Routes
**`BE: src/http/routes/public.blog.ts`**
```ts

```

**`BE: src/http/routes/admin.blog.ts`** (özet CRUD)
```ts

```

**`BE: src/http/server.ts`**
```ts


```

### 1.3 Frontend – Pages & SEO
**`FE: src/lib/api/public.ts`** (ek)
```ts
export async function getBlogPaged(locale: string, q: Record<string,any>){
  return fetchJSON<{ items:any[]; total:number; page:number; pageSize:number }>(`/blog`, { revalidate: 600, tags:['blog'], locale, query:q });
}
export async function getBlogBySlug(locale: string, slug: string){
  return fetchJSON<any>(`/blog/${slug}`, { revalidate: 1200, tags:['blog_item', `blog_item_${slug}`], locale });
}
```

**List:** `FE: src/app/[locale]/blog/page.tsx`
```tsx

```

**Detail:** `FE: src/app/[locale]/blog/[slug]/page.tsx`
```tsx

```

### 1.4 RSS Feed (locale‑bazlı)
**`FE: src/app/[locale]/blog/rss.xml/route.ts`**
```ts

```

### 1.5 Sitemap Entegrasyonu
Blog postlarını global sitemap’e ekleyin veya locale’e özel sitemap üretin. (Örn. `src/app/sitemap.ts` içinde backend’den son 100 postu çekip <loc> girdileri oluşturun.)

---

## 2) Search (SSR) & Projects Compare

### 2.1 Backend – Search endpoint
**`BE: src/http/routes/public.search.ts`**
```ts

```

**`BE: src/http/server.ts`**
```ts

```

### 2.2 Frontend – Search page
**`FE: src/lib/api/public.ts`**
```ts

```

**`FE: src/app/[locale]/search/page.tsx`** (RSC + client input)
```tsx

```

### 2.3 Projects Compare page
**`FE: src/app/[locale]/projects/compare/page.tsx`**
```tsx

```

> FE’de ek olarak küçük bir **ComparePicker** bileşeni yapıp Projects list’te kartların üstüne “Karşılaştır” checkbox’ı ekleyebilirsiniz; seçilen slug’ları query’ye yazıp sayfaya yönlendirin.

---

## 3) Cache / Invalidation Stratejisi

### 3.1 RSC fetch kuralları
- **Listeler**: `revalidate: 600` (10 dk) + `tags: ['projects']`, `['blog']`.
- **Detay**: `revalidate: 1200` (20 dk) + `tags: ['project_item', 'project_item_<slug>']`, `['blog_item', 'blog_item_<slug>']`.
- **Filters**: `tags: ['projects_filters']` (kategori/etiket listeleri).
- **Site settings**: `tags: ['site_settings']`.

### 3.2 Invalidation Matrix (admin işlemi → etkilenen tag’ler)
| Admin İşlemi | Revalidate Tag’leri |
|---|---|
| References create/update/delete | `['references']` |
| Site Settings update | `['site_settings']` |
| Project create/delete | `['projects']` |
| Project update (slug hariç) | `['projects', 'project_item', 'project_item_<slug>']` |
| Project update (slug değişti) | eski `project_item_<old>`, yeni `project_item_<new>`, ayrıca `['projects']` |
| Project taxonomy değişti | `['projects','projects_filters']` |
| Service/Ad update | `['services']` veya `['ad_solutions']` + ilgili item tag’i |
| Blog create/publish/unpublish | `['blog']` |
| Blog update (slug hariç) | `['blog','blog_item','blog_item_<slug>']` |
| Blog slug değişti | eski `blog_item_<old>`, yeni `blog_item_<new>`, ayrıca `['blog']` |

> BE tarafında her CRUD sonunda `revalidateTags([...])` çağrısı zaten mevcut (Part 7+). Buradaki özel `<slug>` tag’lerini de iletmeyi unutmayın.

### 3.3 Stale‑While‑Revalidate (SWR) notu
- Next RSC fetch’lerinde **ISR** zaten SWR benzeri davranır. Kritik veriler (contact inbox admin) **no‑store** ile çağrılmalı.

---

## 4) Kabul Kriterleri (Part 10)
- Theme token’ları (colors/spacing/typo/radii/z) tüm yeni UI’larda kullanılıyor; inline stil yok.
- Blog list/detay **TR/EN/DE** destekler, **ISR** ile yayınlanır; **RSS** çalışır; sitemap blog girdileri eklenir.
- Search sayfası hem Projects hem Blog’da arama yapar; SSR ile SEO dostu.
- Projects Compare sayfası query‑param ile seçilen projeleri tabloda karşılaştırır.
- Invalidation matrisi uygulanır; admin işlemlerinden sonra ilgili tag’ler revalidate edilir.

---

## 5) Sonraki Parça (Part 11)
- Design tokens → **Figma Tokens/Style Dictionary** otomasyonu
- Blog için **author pages** ve **related posts** (simhash/TF‑IDF) önerileri
- Projects’te **özellik matrisi** (schema’daki attribute’lar) ve karşılaştırma genişletmesi
- Admin UI’ye **role‑based** yetkilendirme ve **audit log**
- Email (contact → mail) ve webhook’lar (Slack/Discord)

