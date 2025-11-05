# Part 24 – Admin SSO (OIDC/SAML) + MFA, Tenant Billing & Limits/Overage, Plugin Marketplace (Dinamik Bloklar), Offline/Edge (Service Worker + Form Queue), Compliance (ISO/SOC)

Bu parça; yönetim panelinde **kurumsal SSO + MFA**, **tenant bazlı plan/limit/overage** faturalama, **plugin marketplace** ile modüler sayfa blokları, **offline/edge** dayanıklılığı ve **güvenlik‑uyum** checklist’ini ekleyerek projeyi üretim olgunluğuna taşır.

> FE: Next.js 15 (RSC/SSR/SSG/ISR), styled‑components (tema: `ensotekTheme`).  
> BE: Fastify + TS + Drizzle + MariaDB.  
> Auth: OIDC (openid-client), SAML (passport‑saml, opsiyonel), TOTP/WebAuthn MFA.  
> Billing: plan + usage + overage; sağlayıcı: Stripe (opsiyonel)

---

## 0) Admin SSO (OIDC/SAML) + MFA

### 0.1 Veri Modeli
**`BE: src/db/schema.auth.ts`**
```ts
import { mysqlTable, varchar, int, datetime, json, tinyint } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  email: varchar('email', { length: 191 }).notNull(),
  name: varchar('name', { length: 191 }),
  isActive: tinyint('is_active').notNull().default(1),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const userIdentities = mysqlTable('user_identities', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  provider: varchar('provider', { length: 32 }).notNull(), // oidc|saml|local
  subject: varchar('subject', { length: 191 }).notNull(),
  tenant: varchar('tenant', { length: 32 }).default('default'),
  meta: json('meta')
});

export const roles = mysqlTable('roles', {
  id: int('id').primaryKey().autoincrement(),
  key: varchar('key', { length: 32 }).notNull(), // admin|editor|author|viewer
  description: varchar('description', { length: 191 })
});

export const userRoles = mysqlTable('user_roles', {
  userId: varchar('user_id', { length: 36 }).notNull(),
  tenant: varchar('tenant', { length: 32 }).notNull(),
  roleKey: varchar('role_key', { length: 32 }).notNull()
});

export const mfa = mysqlTable('mfa', {
  userId: varchar('user_id', { length: 36 }).primaryKey(),
  totpSecret: varchar('totp_secret', { length: 128 }),
  webauthn: json('webauthn'), // { credentials: [{id,pubKey,signCount}] }
  recoveryCodes: json('recovery_codes'), // [10 adet tek kullanımlık]
  enabled: tinyint('enabled').notNull().default(0)
});
```

### 0.2 OIDC Akışı (Google/Okta/Azure AD)
**`BE: src/http/routes/auth.oidc.ts`**
```ts
import { FastifyPluginAsync } from 'fastify';
import { Issuer, generators } from 'openid-client';
import { db } from '@/core/db';
import { users, userIdentities } from '@/db/schema.auth';

export const oidcRoutes: FastifyPluginAsync = async (app) => {
  const issuer = await Issuer.discover(process.env.OIDC_ISSUER!);
  const client = new issuer.Client({
    client_id: process.env.OIDC_CLIENT_ID!,
    client_secret: process.env.OIDC_CLIENT_SECRET!,
    redirect_uris: [process.env.OIDC_REDIRECT_URI!],
    response_types: ['code']
  });

  app.get('/auth/oidc', async (req, rep) => {
    const state = generators.state(); const nonce = generators.nonce();
    rep.setCookie('oidc_state', state, { httpOnly:true, sameSite:'lax', secure:true });
    rep.setCookie('oidc_nonce', nonce, { httpOnly:true, sameSite:'lax', secure:true });
    const url = client.authorizationUrl({ scope:'openid email profile', state, nonce });
    return rep.redirect(url);
  });

  app.get('/auth/oidc/cb', async (req, rep) => {
    const params = client.callbackParams(req.raw.url as any);
    const t = await client.callback(process.env.OIDC_REDIRECT_URI!, params, { state: req.cookies.oidc_state, nonce: req.cookies.oidc_nonce });
    const email = t.claims().email as string; const sub = t.claims().sub as string; const name = t.claims().name as string;
    // upsert user
    const uid = crypto.randomUUID();
    await db.execute(`INSERT INTO users (id,email,name) VALUES (?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name)`, [uid,email,name]);
    await db.execute(`INSERT INTO user_identities (id,user_id,provider,subject) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE subject=VALUES(subject)`, [crypto.randomUUID(), uid, 'oidc', sub]);
    // session oluştur
    const sid = await app.sessions.create({ userId: uid });
    return rep.setCookie('sid', sid, { httpOnly:true, sameSite:'lax', secure:true }).redirect('/admin');
  });
};
```
> **Not**: Tenant eşlemesi için `email domain → tenant` kuralı veya IdP `groups` claim’i.

### 0.3 SAML 2.0 (opsiyonel)
- `passport-saml` ile `/auth/saml` ve `/auth/saml/cb`; IdP Metadata XML → EntityID/ACS URL.

### 0.4 MFA (TOTP + WebAuthn)
- **TOTP**: `otplib` ile secret üret, QR (otpauth URI).  
- **WebAuthn**: `@simplewebauthn/server` + BE challenge → FE `navigator.credentials.create()/get()`.

**TOTP Doğrulama (özet)**
```ts
import { authenticator } from 'otplib';
const isValid = authenticator.verify({ token, secret: row.totpSecret });
```
**Guard**: Admin oturumunda `mfa.enabled == 1` ise MFA tamamlanana kadar kısıtlı erişim.

### 0.5 Kabul
- OIDC login başarılı, tenant/rol ataması yapılır.
- MFA (TOTP/WebAuthn) etkinleştirilebilir, recovery kodları üretir.
- SAML entegrasyonu IdP ile testten geçer (opsiyonel).

---

## 1) Tenant Billing, Plan & Limit/Overage

### 1.1 Şema
**`BE: src/db/schema.billing.ts`**
```ts
import { mysqlTable, varchar, int, decimal, datetime, tinyint, json } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const plans = mysqlTable('plans', {
  key: varchar('key', { length: 32 }).primaryKey(), // free|pro|biz
  name: varchar('name', { length: 64 }).notNull(),
  monthly: decimal('monthly', { precision:10, scale:2 }).notNull(),
  yearly: decimal('yearly', { precision:10, scale:2 }).notNull(),
  features: json('features') // { pages:100, seats:3, searchQpm:60, mediaGB:10, overage:{ search:$0.002/req, media:$0.1/GB } }
});

export const subscriptions = mysqlTable('subscriptions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tenant: varchar('tenant', { length: 32 }).notNull(),
  planKey: varchar('plan_key', { length: 32 }).notNull(),
  periodStart: datetime('period_start').notNull(),
  periodEnd: datetime('period_end').notNull(),
  status: varchar('status', { length: 16 }).notNull().default('active'), // active|past_due|canceled
  provider: varchar('provider', { length: 16 }).default('stripe'),
  providerRef: varchar('provider_ref', { length: 64 })
});

export const usageEvents = mysqlTable('usage_events', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tenant: varchar('tenant', { length: 32 }).notNull(),
  kind: varchar('kind', { length: 32 }).notNull(), // search|media_gb|page|seat
  qty: int('qty').notNull().default(1),
  at: datetime('at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const usageCounters = mysqlTable('usage_counters', {
  tenant: varchar('tenant', { length: 32 }).notNull(),
  period: varchar('period', { length: 16 }).notNull(), // 2025-10
  kind: varchar('kind', { length: 32 }).notNull(),
  qty: int('qty').notNull().default(0)
});
```

### 1.2 Toplama & Faturalama
- Worker (cron/queue): `usage_events → usage_counters` (per tenant/kind/period).  
- Plan limitleri aşıldığında: **throttle** (örn. search QPM) veya **overage** kaydı üret.

**Enforcement Middleware (BE)**
```ts
app.addHook('preHandler', async (req, rep) => {
  const tenant = req.headers['x-tenant'] as string || 'default';
  if (req.url.startsWith('/public/search')){
    const allow = await checkQPM(tenant); // Redis token bucket
    if (!allow) return rep.code(429).send({ error:'rate_limited' });
    await recordUsage(tenant, 'search', 1);
  }
});
```

### 1.3 Stripe (opsiyonel)
- Plan → Price eşleme; checkout → portal linkleri.  
- Webhook: `invoice.paid/failed`, `customer.subscription.updated` → `subscriptions` güncelle.

### 1.4 Admin UI
- `/admin/billing`: plan kartları, limit/usage bar’ları, fatura geçmişi.

### 1.5 Kabul
- Limitler doğru uygulanır; usage toplanır ve raporlanır.  
- Overage hesaplaması ve faturalama akışı (Stripe) çalışır (opsiyonel).

---

## 2) Plugin Marketplace – Dinamik Bloklar

### 2.1 Sözleşme & Kayıt
**`FE: src/plugins/types.ts`**
```ts
export type BlockProps = { locale:string; tenant:string; data:any };
export type BlockModule = { meta:{ key:string; name:string; version:string }; Render:(p:BlockProps)=>JSX.Element };
```
**`FE: src/plugins/registry.ts`**
```ts
export const REGISTRY = {
  hero: () => import('./hero').then(m=>m.default),
  featureGrid: () => import('./feature-grid').then(m=>m.default),
  contactForm: () => import('./contact-form').then(m=>m.default),
  videoEmbed: () => import('./video-embed').then(m=>m.default),
} as const;
```

### 2.2 Dinamik Yükleme (RSC uyumlu)
**`FE: src/shared/blocks/BlockRenderer.tsx`**
```tsx
// Server Component
import { REGISTRY } from '@/plugins/registry';

export default async function BlockRenderer({ blocks }:{ blocks: Array<{ key:string; data:any }> }){
  return (
    <>
      {await Promise.all(blocks.map(async (b, i) => {
        const mod = await REGISTRY[b.key]();
        const Comp = mod.Render; // çoğu blok RSC; client gerekirse "use client" içeride
        return <Comp key={i} locale={'tr'} tenant={'default'} data={b.data} />;
      }))}
    </>
  );
}
```

### 2.3 Güvenlik
- Sadece **repo içi** (denetlenmiş) plugin’ler; harici paket yok.  
- Blok `meta.version` pinli; kırıcı değişiklikler semver ile yönetilir.  
- Admin’de **sayfa düzenleyici** blok listesini sağlar; sürükle‑bırak + JSON şema.

### 2.4 Kabul
- Ana sayfa/sektör sayfaları bloklarla kurulup render edilir.  
- Blok ekleme/silme/sürüm yükseltme akışı çalışır.

---

## 3) Offline/Edge – Service Worker + Form Queue

### 3.1 Kayıt
**`FE: src/app/sw-register.tsx`**
```tsx
'use client';
import { useEffect } from 'react';
export default function SWRegister(){
  useEffect(()=>{ if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js'); },[]);
  return null;
}
```

### 3.2 Service Worker (temel)
**`public/sw.js`**
```js
const CACHE = 'toronto-v1';
self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/offline','/favicon.ico'])));
});
self.addEventListener('fetch', (e)=>{
  const { request } = e; if (request.method !== 'GET') return;
  e.respondWith(
    caches.match(request).then(r=> r || fetch(request).then(res=>{
      const copy = res.clone(); caches.open(CACHE).then(c=> c.put(request, copy)); return res;
    }).catch(()=> caches.match('/offline')))
  );
});
// Basit arka plan form kuyruğu (sync destekli tarayıcılar için)
const QUEUE = 'formQueue';
self.addEventListener('fetch', (e)=>{
  const { request } = e; if (request.method === 'POST' && request.url.includes('/api/contact')){
    e.respondWith((async()=>{
      try { return await fetch(request.clone()); }
      catch {
        const body = await request.clone().text();
        const db = await openDB(); const tx = db.transaction(QUEUE,'readwrite');
        tx.store.add({ url: request.url, body, ts: Date.now() });
        self.registration.sync?.register('flushForms');
        return new Response(JSON.stringify({ queued:true }), { status:202, headers:{'Content-Type':'application/json'} });
      }
    })());
  }
});
self.addEventListener('sync', (e)=>{ if (e.tag==='flushForms') e.waitUntil(flushQueue()); });
async function openDB(){ return await new Promise((res)=>{ const r = indexedDB.open('toronto-sw',1); r.onupgradeneeded = ()=> r.result.createObjectStore(QUEUE,{ keyPath:'ts' }); r.onsuccess = ()=> res(r.result); }); }
async function flushQueue(){ const db = await openDB(); const tx = db.transaction(QUEUE,'readwrite'); const all = await tx.store.getAll(); for (const it of all){ try{ await fetch(it.url,{ method:'POST', headers:{'Content-Type':'application/json'}, body: it.body }); tx.store.delete(it.ts); }catch{} } }
```

### 3.3 Offline Sayfası
- `/offline` RSC SSG: temel ileti/telefon + ofis adresi; hafif CSS.

### 3.4 Kabul
- Navigasyonlar cache’den çalışır; offline sayfası gösterilir.  
- İletişim formu offline iken **queued 202** döner; bağlantı gelince gönderim yapılır.

---

## 4) Compliance – ISO 27001 / SOC 2 Hazırlık (Özet Checklist)

### 4.1 Politikalar (docs/)
- **Bilgi Güvenliği Politikası** (docs/security/ISP.md)  
- **Erişim Kontrol Politikası** (RBAC, SSO, MFA)  
- **Yedekleme & Kurtarma Politikası** (RPO/RTO; Part 16)  
- **Günlükleme & İzleme** (Server‑Timing → Prometheus, RUM; Part 18/16)  
- **Olay Müdahale Planı** (docs/security/IRP.md)  
- **Tedarikçi Değerlendirmesi** (CMP, Stripe, CDN, IdP)  
- **Veri Sınıflandırma & Saklama** (PII maskeleme; Part 19 staging)

### 4.2 Teknik Kontroller
- **Şifreleme**: TLS 1.3, at‑rest (disk/LUKS, DB TDE opsiyonel), secrets → sops/age.  
- **Minimum Yetki**: prod erişimi **break‑glass** hesaplarla; bastion.  
- **Patch/Dependabot**: haftalık.  
- **Zafiyet Taraması**: CI’da Snyk/Trivy + container image.  
- **CSP/TT**: Part 19 helmet uygulandı; `unsafe-inline` kaldır.  
- **DLP**: loglarda PII yok; ID’ler hash.

### 4.3 Kanıt Toplama
- CI logları, deploy pipeline çıktıları, yedek raporları, erişim denetim kayıtları.  
- Yılda 1 **DR Drill** (Part 16) çıktıları.

### 4.4 Kabul
- Politika dokümanları repo’da; security kontrolleri aktif; kanıt artefaktları toplanır.

---

## 5) Kabul Kriterleri (Part 24)
- OIDC SSO çalışır; MFA etkinleştirilebilir; rol/tenant bağlamı doğru.  
- Plan/limit/usage toplanır; rate‑limit/overage politikaları işler; Admin Billing ekranı çalışır.  
- Plugin blokları dinamik yüklenir; sayfalar bloklarla kurulabilir.  
- SW kayıtlı; offline fallback ve form kuyruğu doğrulanır.  
- ISO/SOC checklist’i ve kanıt toplama süreci oluşturuldu.

---

## 6) Sonraki Parça (Part 25)
- **Kişiselleştirme**: tenant/dil/segment bazlı içerik varyasyonları (edge hints + cookies)  
- **Edge Fonksiyonları** (Vercel/CF Workers) ile coğrafi/lokasyonlu deney  
- **SLO/SLI**: hata bütçeleri, otomatize rollback  
- **Maliyet İzleme**: CDN/DB/Queue metriği → aylık bütçe alarmı  
- **Lokalizasyon QA**: otomatik görsel test + hreflang doğrulayıcı

