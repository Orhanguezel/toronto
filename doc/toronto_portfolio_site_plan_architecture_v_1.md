# Toronto Portfolio Site – Plan & Architecture v1

> Stack: **Next.js 15 (App Router)**, **TypeScript**, **RTK Query**, **styled-components**, **Fastify + MariaDB** (backend), multi‑language, admin panel. Primary goal: pixel‑accurate to Figma, high Lighthouse scores (Perf/SEO/Accessibility/Best Practices ≥ 95 on desktop), maintainable design system.

---

## 1) Scope & Success Criteria

**Pages (public):**
- Ana sayfa (Home)
- Satılık Projeler (Projects for Sale)
- Hizmetlerimiz (Services)
- Reklam Çözümleri (Ad Solutions)
- Referanslar (carousel)
- İletişim (Contact) + WhatsApp CTA (click‑to‑chat)
- Dil seçici (header + footer)
- Ortak bileşenler: Navbar, Footer, Cookie banner, Video block, SEO meta

**Admin (MVP):**
- Giriş / oturum (JWT + httpOnly cookie)
- Site Ayarları (telefon, e‑posta, adres, WhatsApp numarası, sosyal linkler)
- Sayfa içerikleri (Home sections, Services, Ad Solutions)
- Projeler modülü (liste/ekle/düzenle, kapak görsel, galeri, video)
- Referanslar modülü (logo + URL, sıralama)
- İletişim formları (inbox + export)
- Çeviriler (i18n metinleri – key/value veya per‑record localized fields)

**NFR (Non‑Functional):**
- SEO: canonical, hreflang, sitemap.xml, robots.txt, JSON‑LD
- Performans: LCP ≤ 2.0s (desktop), CLS ≤ 0.05, TBT ≤ 200ms
- Erişilebilirlik: Kontrast, focus ring, semantic landmarks
- Güvenlik: headers, rate limit (contact), CSRF‑safe forms, input validation
- DevX: modüler, tekrarlanabilir, test edilebilir, tip güvenli

---

## 2) High‑Level Architecture

```
apps/
  web/ (Next.js 15)
    src/
      app/[locale]/(public)/...
      app/(admin)/admin/...
      styles/themes/torontoTheme.ts (styled-components DefaultTheme)
      shared/ui/ (atoms, molecules, blocks)
      features/ (domain features: projects, services, references, settings)
      lib/ (i18n, SEO, utils)
      integrations/metahub/ (RTK + client facade)
  api/ (Fastify, TypeScript, MariaDB via Drizzle)
    src/
      modules/ (projects, services, references, settings, auth)
      db/ (schema, migrations)
      http/ (routes, controllers, validators)
      core/ (env, logger, security, errors)
```

**İletişim:** `web` → RTK Query → `api` (REST JSON). i18n için `Accept-Language` ve/veya `X-Locale` header.

**Dağıtım:** Vercel (web) + Hetzner/Contabo (api + DB) ya da tek VPS reverse proxy. CI: GitHub Actions (lint, type‑check, build, Lighthouse CI opsiyonel).

---

## 3) UI / Design System (styled-components)

- **Tema:** `src/styles/themes/torontoTheme.ts` (renkler, spacing, tipografi, radius, z‑index, shadows, breakpoints)
- **Kurallar:** Inline stil yok; sadece tema token’ları. Animasyonlar framer‑motion (opsiyonel).
- **UI Kit klasörleri:**
  - `shared/ui/common` → Container, Section, Grid, Typography, Button, Badge, Divider, Breadcrumbs, Callout
  - `shared/ui/forms` → Form, Field, Label, Input/Select/TextArea, Switch, Help/Error
  - `shared/ui/media` → ImageCard, ResponsiveVideo, ResponsiveFrame
  - `shared/ui/feedback` → Toast bridge (sonner), Skeletons, Modal, Drawer
  - `shared/ui/layout` → Navbar, Footer, CookieBanner
  - `shared/ui/motion` → fadeInUp, stagger, in‑view helpers
- **Blocks:** Hero, FeatureGrid, LogoCarousel (Referanslar), CTA, Stats, FAQ, VideoSection
- **Responsive grid:** Mobile‑first, container genişlikleri (sm/md/lg/xl/2xl), `prefers-reduced-motion` desteği

> **Not:** Figma tokenları → `torontoTheme.ts` içine göç eder; bileşenler sadece tema değişkenleri kullanır.

---

## 4) Routing & i18n (Next.js 15 App Router)

- Yol: `app/[locale]/(public)/page.tsx` vb.
- Desteklenen diller: `['tr', 'en', 'de']` (genişletilebilir)
- `middleware.ts`: Accept‑Language ile locale yönlendirme (ilk giriş), cookie `NEXT_LOCALE`
- `lib/i18n`: next‑intl veya custom minimal çözüm
  - UI sabit metinleri: locale JSON
  - İçerik: DB’de localized alanlar (örn. projects: title_tr, title_en, title_de) veya `project_translations` tablosu
- SEO: Hreflang `<link rel="alternate" hreflang="..." />`, canonical, `metadata` exporter, dynamic OpenGraph
- Sitemap/robots: `app/sitemap.ts`, `app/robots.ts`

---

## 5) Public Pages – İçerik Map & Section’lar

**Home**
- Hero (video veya poster + play)
- Services teaser
- Ad Solutions teaser
- Projects teaser (grid + filtre)
- References carousel (logo band)
- CTA (WhatsApp, telefon, e‑posta)

**Satılık Projeler**
- Liste + filtreler (kategori, fiyat aralığı, lokasyon vs – MVP sade)
- Kart: kapak, başlık, kısa açıklama, etiketler
- Detay sayfası: görsel galeri, video, özellikler, başvuru/iletişim CTA, schema.org `Product`/`Offer`

**Hizmetlerimiz**
- Hizmet kategorileri + detay sayfaları, FAQ

**Reklam Çözümleri**
- Paketler / örnekler / başarı hikâyeleri

**Referanslar**
- Carousel (auto + manuel), grid listesi, logo + link

**İletişim**
- Form (ad, e‑posta, mesaj, KVKK onayı)
- WhatsApp button (click‑to‑chat), telefon, adres, harita (static map img)

---

## 6) Admin Panel (Next.js içinde /admin route group)

- Auth: `/admin/login` → email+password → API `POST /auth/login` → httpOnly cookie
- Layout: sidebar + topbar; dark/light (opsiyonel)
- Modüller:
  1) Dashboard (özet kartlar)
  2) Site Ayarları: telefon, e‑posta, adres, WhatsApp, sosyal linkler, çalışma saatleri
  3) Projects: list/create/edit (multi‑lang alanlar), media yönetimi
  4) Services: list/create/edit (multi‑lang)
  5) Ad Solutions: list/create/edit (multi‑lang)
  6) References: logo + sıralama
  7) Contact Inbox: form submissions
  8) Translations (opsiyonel MVP2): key‑value çeviri

- Form validasyon: Zod + react‑hook‑form
- Medya: Cloudinary/S3 adapter (MVP’de lokal + server upload da olabilir)

---

## 7) Data Model (MariaDB, Drizzle)

**Tablolar (özet):**
- `users` (admin): id, email, password_hash, role, created_at
- `site_settings`: key, value_json, updated_at  
  (örn. `contact_info` JSON: phones[], email, address, whatsappNumber, socials{...})
- `projects`: id, slug, cover_url, price_from, status, video_url, created_at, updated_at
- `project_translations`: id, project_id, locale, title, summary, body, meta_title, meta_desc
- `services`: id, icon, order, created_at
- `service_translations`: id, service_id, locale, title, body, faq_json
- `ad_solutions`: id, icon, order
- `ad_solution_translations`: id, ad_solution_id, locale, title, body
- `references`: id, logo_url, name, url, order
- `contact_messages`: id, name, email, message, locale, ip, user_agent, created_at, handled_at

> **Neden translation tabloları?** Yeni dil eklemek kolay, null alan karmaşası yok, indeksleme temiz.

---

## 8) API Sözleşmesi (Fastify, REST)

**Headers:** `Accept-Language: tr|en|de` (veya `X-Locale`)

**Auth**
- `POST /auth/login` { email, password } → 200 { user } + httpOnly cookie (JWT)
- `POST /auth/logout` → 204

**Public**
- `GET /site-settings` → { contact_info, socials, ... }
- `GET /projects` (q?, page?, pageSize?) → { items, total }
- `GET /projects/:slug` → detay + translations
- `GET /services` / `GET /services/:slug`
- `GET /ad-solutions` / `GET /ad-solutions/:slug`
- `GET /references`
- `POST /contact` { name, email, message, consent } → 201

**Admin** (JWT required)
- `GET/PUT /admin/site-settings`
- `CRUD /admin/projects`
- `CRUD /admin/services`
- `CRUD /admin/ad-solutions`
- `CRUD /admin/references`
- `GET /admin/contact-messages` (pagination)

**Validasyon:** Zod veya Fastify‑TypeProvider zod; output şemaları tiplenir.

---

## 9) RTK Query Katmanı (FE)

- `src/integrations/metahub/baseApi.ts` → `fetchBaseQuery` (baseUrl, credentials, locale header, error handling)
- Endpoints:
  - `siteSettings.endpoints.ts`: getSettings, updateSettings (admin)
  - `projects.endpoints.ts`: list, bySlug (public), admin CRUD
  - `services.endpoints.ts`: list, bySlug, admin CRUD
  - `adSolutions.endpoints.ts`: list, bySlug, admin CRUD
  - `references.endpoints.ts`: list, admin CRUD
  - `contact.endpoints.ts`: sendMessage
  - `auth.endpoints.ts`: login, logout, me

> **Facade:** `integrations/metahub/client.ts` (basit wrapper) + hooks: `useLocaleHeader()`

---

## 10) SEO & Performans Stratejisi

- **Rota stratejisi:** Public sayfalar mümkün olduğunca **SSG/ISR** (revalidate: 60–300s). Admin tamamen **CSR**.
- **Meta:** Next `generateMetadata()` ile dinamik title/desc/og, `alternates: { languages }`
- **JSON‑LD:** Project/Service şemaları, Organization (logo, phone), BreadcrumbList
- **Görseller:** `next/image` (fill/priority), doğru `sizes`, AVIF/WebP, SVG logo
- **Font:** Local font, `display: swap`, `preload` yalnızca gerekli ağırlıklar
- **Video:** Poster + `preload="metadata"`, `loading="lazy"`, mümkünse CDN (Cloudinary)
- **Kritik CSS:** styled-components SSR + SWC transform (no FOUC)
- **Cache:** CDN/static caching, `stale-while-revalidate`
- **A11y:** semantic headings, alt’lar, label’lar, focus ring
- **Monitoring:** Web Vitals (Next/Analytics), Sentry (opsiyonel)

---

## 11) Güvenlik & Yasal

- Security headers (Next config + reverse proxy)
- Rate limit: `/contact` (IP başına limitleme)
- Input sanitization, validation
- reCAPTCHA (v3) veya hCaptcha seçenekli
- KVKK/GDPR: Çerez politikası, consent banner, `/privacy`, `/imprint`

---

## 12) İş Akışı (Fazlar)

**F0 – Hazırlık (0.5–1 gün)**
- Repo, issue templates, commitlint, Prettier, ESLint, TypeScript strict
- Husky + lint‑staged, CI (type‑check + build)

**F1 – FE İskelet (1–2 gün)**
- Next.js app init, styled‑components SSR, tema, UI kit (atoms/molecules/blocks)
- App Router i18n iskeleti, middleware, locale switcher
- Navbar/Footer/CookieBanner, boş sayfalar (routes)

**F2 – İçerik ve Section’lar (1–2 gün)**
- Home, Services, Ad Solutions section bileşenleri (mock data)
- References Carousel, VideoSection (poster + lazy)

**F3 – RTK Query Entegrasyon (1–2 gün)**
- baseApi, public endpoints (mock API veya canlı)
- Contact form submit + toast + validation

**F4 – Admin MVP (2–3 gün)**
- Auth (login/logout), Site Settings formları
- Projects/Services/Ad Solutions CRUD list+form
- References ve Contact inbox

**F5 – SEO/Perf Sertleştime (1 gün)**
- Metadata, hreflang, sitemap/robots, JSON‑LD
- Lighthouse iyileştirmeleri, resim boyutları, font optimizasyonu

**F6 – QA & Yayın (0.5–1 gün)**
- E2E smoke (Playwright minimum: nav, forms)
- Deploy (Vercel + API), DNS, uptime monitor

> Süreler Figma karmaşıklığına göre değişir; burada MVP hedeflenmiştir.

---

## 13) Kabul Kriterleri (Örnek)

- Tüm public sayfalar TR/EN/DE çalışır; dil geçişinde canonical/hreflang doğru
- Home LCP ≤ 2s (desktop, ilk boyalı içerik Hero+başlık)
- Contact formu: doğrulama, rate limit, admin inbox’a düşer, e‑posta bildirimi (opsiyon)
- Admin: Site Ayarları ve Projects CRUD eksiksiz; yetkisiz erişim engelli
- Lighthouse: Desktop ≥ 95 (Perf/SEO/Best/A11y)

---

## 14) Sonraki Adımlar (Bugün)

1) Bu planı onayla / eklemeler yap → özellikle içerik alanları ve filtre ihtiyaçları
2) Figma’dan token haritasını çıkar (renk, font, spacing) → `torontoTheme.ts`
3) Repo bootstrap ve **F1 – FE iskelet** başlat
4) Paralelde API şema taslağı (Drizzle) + `openapi.yaml` iskeleti

---

## 15) Notlar & Opsiyonlar

- WhatsApp: basit `wa.me/<number>` CTA + UTM parametreleri, ileride WhatsApp Business Cloud API.
- Medya yönetimi: MVP’de yerel upload, prod’da Cloudinary/S3 + signed URLs.
- Çoklu ortam: Blog/Case Studies modülü sonraki sprintte eklenebilir (SEO için güçlü).
- Çok kiracılılık gerekmiyor; ancak i18n mimarisi çok dilliye hazır.

