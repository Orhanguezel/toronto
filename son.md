
# Toronto portfolyo sitesi – MVP zorunlular

## 1) Sayfalar + render stratejisi

* **/ (Ana sayfa)** – *SSG + ISR (300 sn)*
  Hero (video poster + tıklayınca oynar), kısa hizmet kartları (RSC), referanslar **karusel** (client), CTA → iletişim.
* **/projects (Satılık projeler)** – *SSR* (filtre/sort, arama).
* **/projects/[slug]** – *SSG + ISR (300 sn)* (galeri, özellikler, iletişim CTA).
* **/services** – *SSG* (hizmet detay grid).
* **/ads (Reklam çözümleri)** – *SSG*.
* **/contact (İletişim)** – *SSR* (form + telefon/e-posta dinamik).
* **Lang seçici** (TR/DE/EN): edge’te ilk girişte algıla, cookie’ye yaz, navbar’da “use client” ada.
* **WhatsApp girişi**: `wa.me/<NUMARA>?text=...` deep-link (numara admin’den yönetilir).
* **Navbar & Footer**: RSC, tek kaynaktan.

## 2) Teknoloji iskeleti (FE)

* **Next.js 15 + TypeScript + styled-components + RTK Query**
* Tema: tek **design-token** kaynağı (renk, tipografi, spacing). (Elinizdeki `ensotekTheme` şablonunu baz alalım.)
* **RTK slices**: `siteSettings`, `projects`, `services`, `references`.
* **Medya**: resimler AVIF/WebP, `<img>`/`next/image` alternatifi ile **intrinsic size** + lazy.

## 3) Admin (minimum)

* **Giriş** (local JWT) + role: `admin`, `editor`.
* **CRUD**: Projects, Services, References.
* **Site Settings**: telefon, e-posta, adres, WhatsApp numarası/mesajı, sosyal linkler, aktif diller.
* **Media upload**: Cloudinary (tek alan).
* **İletişim mesajları** listesi (okundu/yanıtlandı flag).

## 4) Backend (Fastify + MariaDB + TS)

**Tablolar (minimum):**

* `projects(id, slug, title, desc, price, locale, status, created_at, updated_at)`
* `project_media(id, project_id, url, alt, sort)`
* `services(id, slug, title, desc, locale, sort)`
* `references(id, name, logo_url, url, sort)`
* `site_settings(key, value_json)`  ← (telefon, e-posta, whatsapp, sosyal, locales)
* `contact_messages(id, name, email, phone, message, created_at, status)`
* `users(id, email, pass_hash, role)`

**API (public):**

* `GET /public/projects?locale&status&q&page`
* `GET /public/projects/:slug`
* `GET /public/services?locale`
* `GET /public/references`
* `GET /public/site-settings`

**API (admin, JWT):**

* `/admin/projects` (CRUD + upload imzası)
* `/admin/services` (CRUD)
* `/admin/references` (CRUD)
* `/admin/site-settings` (GET/PUT)

**Form & mail:**

* `POST /public/contact` → e-posta gönder + DB’ye yaz (rate-limit + hCaptcha opsiyonel).

## 5) SEO zorunluları

* Locale-bazlı **canonical** ve **hreflang** (TR/DE/EN).
* **sitemap.xml** + **robots.txt**
* OG/Twitter meta’ları; **Organization** ve **WebSite** JSON-LD, proje sayfasında **Product/Offer** JSON-LD.
* Temiz URL’ler (`/tr/projects/...`), 404/500 sayfaları.

## 6) Performans & A11y hedefleri

* Lighthouse: **Performance ≥ 95**, **SEO ≥ 100**, **Best Practices ≥ 95**, **A11y ≥ 95**
* **LCP < 2.5s**, **INP p75 < 200ms**, **CLS < 0.1**
* Font `display:swap`, kritik CSS inline (styled-components SSR), route-level code-split.
* Renk/kontrast ≥ 4.5:1, klavye erişilebilirliği, reduced-motion desteği (animasyonlar kapatılabilir).

## 7) Güvenlik & gizlilik (MVP)

* Fastify **helmet**, CORS kontrollü.
* DTO **zod** validasyonu; rate-limit: iletişim formu ve login.
* Çerezler `SameSite=Lax`, prod’da `Secure`.
* **Consent banner** (sade): Analytics yalnız onay ile yüklenir.

## 8) DevOps/Dağıtım

* **.env.example** (FE/BE ayrık), Drizzle migrasyon komutları.
* Nginx reverse-proxy + Let’s Encrypt, **PM2** ya da Docker Compose.
* CI: `lint → typecheck → test → build` + migrasyon + deploy.

---

## “Yapılacaklar” kısa plan (10 adım)

1. Repo + monorepo/ikili repo kararı, temel dizin ağacı.
2. Tema + global stil, Navbar/Footer (RSC), layout/i18n yönlendirme.
3. Public sayfaların **iskeleti** (SSG/SSR mapping ile).
4. RTK Query client + mock JSON server (geçici).
5. Fastify + Drizzle + MariaDB şema & migrasyon.
6. Public GET API’leri; FE entegrasyon.
7. Admin giriş + Projects/Services/References CRUD.
8. Site Settings ekranı; WhatsApp/linkler/dil listesi.
9. İletişim formu + mail; SEO meta + sitemap/hreflang.
10. Performans/A11y iyileştirmeleri + prod deploy.

---

## Şu an **kapsam dışı** (ileride ekleriz)

A/B testleri, hibrit semantik arama, multi-CDN, advanced analytics, SSO/MFA, billing, ETL/dbt, edge speculation, live yayın araçları vs. (hep ekleyebiliriz; MVP’ye koymuyoruz).

İstersen bu listeyi **canvas’a tek bir “MVP Roadmap” dökümanı** olarak çıkarayım ve ardından 1. adımın (repo/dizin yapısı + temel dosyalar) kod iskeletini ekleyeyim.
