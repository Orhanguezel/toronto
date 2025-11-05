# F1 – Part 2: Server/Client Ayrımı & Render Stratejileri (SSR/SSG/CSR)

Bu parçada **maksimum SEO + performans** için rotalara özel render stratejisi, veri çekme yardımcıları ve temel bloklar (Hero, VideoSection, LogoCarousel) geliyor. Varsayılan yaklaşım: **Public sayfalar = Server Components + SSG/ISR**, **Admin = CSR + RTK Query**.

---

## 0) Strateji Matrisi

| Bölüm | Varsayılan | Not |
|---|---|---|
| Home, Services, Ad Solutions, References | **SSG/ISR** (server) | `revalidate: 300`, SEO metadata server tarafında üretilir |
| Projects list/detail | **SSG + ISR** | Filtre azsa SSG, yoğun dinamik filtre gerekiyorsa SSR (search param’lı route segment) |
| Contact | **SSG** + client form | Sayfa SSG, form submit client fetch + rate‑limit |
| Navbar/Footer | Server | Locale ve ayarlar server’dan gelir |
| LogoCarousel | Client (lazy) | SSR fallback list ile SEO güvence |
| Admin tüm modüller | **CSR** + RTK Query | SEO önemsiz, etkileşim önemli |

> Kural: Public içerik için **RTK Query kullanmıyoruz**. Sunucu bileşenleri `fetch()` ile API’dan veri çeker, statik üretir. Admin tarafında RTK Query.

---

## 1) next.config.mjs (güncelleme)

```ts

```

---

## 2) Font & Head (Lighthouse için)

**`src/fonts/index.ts`**
```ts

```

**`src/app/[locale]/layout.tsx`** (ekler)
```tsx
// ... diğer importlar




export default function LocaleLayout({ params, children }: { params: { locale: string }, children: React.ReactNode }) {
  return (
    
        {/* ... */}
      </body>
    </html>
  );
}
```

`public/` klasörüne font dosyasını eklemeyi unutma veya repo içine `src/fonts/` koy.

---

## 3) Server Tarafı Veri Yardımcıları (SSG/ISR)

**`src/lib/api/public.ts`**
```ts

```

> Bu yardımcılar **server components** içinde kullanılacak. Varsayılan `revalidate` ile ISR etkin.

---

## 4) Home: Server Component + SSG

**`src/app/[locale]/page.tsx`** (güncel)
```tsx

```

---

## 5) Projects: List (SSG/ISR) & Detail (SSG/ISR)

**`src/app/[locale]/projects/page.tsx`**
```tsx
import Image from 'next/image';
import Container from '@/shared/ui/common/Container';
import Link from 'next/link';
import { getProjects } from '@/lib/api/public';

export const revalidate = 300;

export default async function ProjectsPage({ params }: { params: { locale: string } }) {
  const items = await getProjects(params.locale);
  return (
    <Container>
      <h1>Satılık Projeler</h1>
      <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
        {items.map(p => (
          <li key={p.slug}>
            <Link href={`/${params.locale}/projects/${p.slug}`}>
              {p.cover_url && (
                <Image src={p.cover_url} alt={p.title} width={640} height={400} style={{ width: '100%', height: 'auto' }} />
              )}
              <h3>{p.title}</h3>
              {p.price_from ? <p>Başlangıç: {p.price_from.toLocaleString()} ₺</p> : null}
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
```

**`src/app/[locale]/projects/[slug]/page.tsx`**
```tsx

```

> Not: Çok büyük proje sayılarında `generateStaticParams` sadece popülerleri statik üretir; diğerleri **on-demand** ISR ile üretilir.

---

## 6) References: SSR + Carousel (Client lazy)

**Server görünüm şeridi** – SEO için logolar SSR olarak çıktılanır.

**`src/features/references/ReferencesStrip.tsx`** (server)
```tsx

```

**`src/features/references/LogoCarousel.tsx`** (client)
```tsx

```

---

## 7) Home Blokları: Hero & VideoSection (server)

**`src/features/home/Hero.tsx`** (server)
```tsx

```

**`src/features/home/VideoSection.tsx`** (server)
```tsx

```

---

## 8) Revalidate Akışı (Admin tetikli)

Admin güncellemesinden sonra FE cache bozulmalı. Basit yaklaşım: backend’den bir webhook ile Next route’u çağır.

**`src/app/api/revalidate/route.ts`**
```ts

```

Backend bir kaydı güncellediğinde uygun etiketleri yollar: `{"tags":["projects"]}`.

---

## 9) CSR Alanları (Admin) İçin RTK Query

Admin tarafında listeler/formlar tamamen **CSR**. Örnek endpoint yerleşimi (ilerleyen parçalarda detay CRUD eklenecek):

**`src/integrations/endpoints/projects.admin.ts`**
```ts

```

> Public sayfalarda **kullanma**; Admin’de hız ve etkileşim için ideal.

---

## 10) Notlar – Performans & SEO İncelikleri

- Görsellere `sizes` ekleyin (Figma’dan container genişlikleriyle).
- Carousel’i `dynamic` + `ssr:false` yüklüyoruz; SEO için server’da statik logo listesi zaten var.
- `generateMetadata` ile **OG tag’leri** dinamik; projelerde `openGraph.images` set ediliyor.
- **Critical UI** server component; client işaretini minimum kullan.
- Büyük listelerde **segment caching**: `fetch()` çağrılarında uygun `tags` ve `revalidate` süreleri.
- Video’da `preload="metadata"` + `poster` (LCP koruması).

---

## 11) Sonraki Parça (Part 3)

- UI atom/molekül seti: Typography, Button, Section, Grid + dark/light toggle
- Contact form (Zod + RHF), spam koruma (hCaptcha/reCAPTCHA kancası)
- Services / Ad Solutions içerik section’ları (SSG)
- Project filtreleme (SSR stratejisi) ve detay sayfasında JSON‑LD

