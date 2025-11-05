# Part 27 – Speculation 2.0 (Akış Simülasyonu), Lifecycle Messaging (E‑posta/WhatsApp), GPP Vendor List Yönetimi, Route‑Level Streaming & Skeletons, HLS Multi‑Origin Failover

Bu bölüm, kullanıcı akışlarını öğrenerek **Speculation Rules**’u dinamikleştirir, rızaya dayalı **yaşam döngüsü mesajlaşması** (e‑posta/WhatsApp) ekler, **GPP/TCF** vendor‑list yönetimini kural haline getirir, **route‑level streaming & skeleton** stratejisini netleştirir ve canlı video için **multi‑origin failover** uygular.

> FE: Next 15 (RSC/SSR/SSG/ISR), styled‑components (tema: `ensotekTheme`).  
> BE: Fastify + TS + Drizzle + MariaDB.  
> Data: ClickHouse/BQ (Part 21–22).  
> Media: Cloudinary/Mux/CF HLS.  
> Consent: TCF 2.2 + US GPP (Part 18 temelini genişletir).

---

## 0) Speculation 2.0 – Akış Simülasyonu ile Dinamik Kurallar

### 0.1 Amaç
- Gerçek dolaşım verisinden **en olası sonraki sayfalar**ı (flows) çıkarmak, segment/dil/cihaz bazlı **prerender/prefetch** kuralları üretmek.

### 0.2 ClickHouse – Akış Çıkarımı
**Flow matrisi (Markov benzeri) – son 7 gün**
```sql
WITH w AS (
  SELECT session_id, path, ts, locale, device
  FROM events
  WHERE name='page_view' AND ts > now() - INTERVAL 7 DAY
  ORDER BY session_id, ts
), p AS (
  SELECT
    concat(locale,'-',device) AS seg,
    path AS from,
    lead(path) OVER (PARTITION BY session_id ORDER BY ts) AS to
  FROM w
)
SELECT seg, from, to, count() c
FROM p WHERE to IS NOT NULL
GROUP BY seg, from, to
HAVING c >= 20
ORDER BY seg, from, c DESC
```
Sonuçlar `flows(seg, from, to, c, updated_at)` tablosuna yazılır (materialized view önerilir).

### 0.3 BE – Speculation JSON Üretimi
**`BE: src/http/routes/perf.speculation.ts`**
```ts
import { FastifyPluginAsync } from 'fastify';
import { db } from '@/core/db';
export const perfSpeculation: FastifyPluginAsync = async (app)=>{
  app.get('/perf/speculation', async (req)=>{
    const seg = String((req.query as any).seg||'en-d');
    const rows = await db.execute(`SELECT `+
      `from, groupArray(to ORDER BY c DESC LIMIT 6) tos `+
      `FROM flows WHERE seg=? GROUP BY from`, [seg]);
    const rules = [] as any[];
    for (const r of rows as any[]){
      const href = `${process.env.PUBLIC_ORIGIN}${r.from}`;
      const targets = (r.tos as string[]).map(t=> ({ source:'document', where:{ href_matches: `${process.env.PUBLIC_ORIGIN}${t}` }, eagerness:'moderate' }));
      rules.push({ from: href, targets });
    }
    return { rules };
  });
};
```

### 0.4 FE – RSC Enjeksiyonu
**`FE: src/shared/perf/SpeculationDynamic.tsx`**
```tsx

```
> **Not**: `save-data:on` ve düşük RTT’de devre dışı (Part 26’daki guard’lar geçerli).

### 0.5 Kabul
- Segment bazlı speculation JSON 5 dk’da bir güncellenir; **hero/CTA** geçişlerinde LCP/INP düşer.

---

## 1) Lifecycle Messaging – E‑posta / WhatsApp Tetikleri

### 1.1 Şema
**`BE: src/db/schema.lifecycle.ts`**
```ts
import { mysqlTable, varchar, json, datetime, tinyint } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
export const contacts = mysqlTable('contacts', {
  id: varchar('id', { length: 36 }).primaryKey(),
  email: varchar('email', { length: 191 }),
  phone: varchar('phone', { length: 32 }),
  locale: varchar('locale', { length: 8 }).default('tr'),
  consent: json('consent'), // { email:true, whatsapp:true }
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});
export const lcTemplates = mysqlTable('lc_templates', {
  key: varchar('key', { length: 64 }).primaryKey(), // project_view_nurture_1
  channel: varchar('channel', { length: 16 }).notNull(), // email|whatsapp
  subject: varchar('subject', { length: 191 }),
  body: json('body') // i18n: { tr:"...{{name}}...", de:"..." }
});
export const lcTriggers = mysqlTable('lc_triggers', {
  key: varchar('key', { length: 64 }).primaryKey(),
  when: json('when'), // { event:'project_view', count:3, withinDays:7 }
  action: json('action') // { template:'project_view_nurture_1', delayMin:30 }
});
export const lcQueue = mysqlTable('lc_queue', {
  id: varchar('id', { length: 36 }).primaryKey(),
  contactId: varchar('contact_id', { length: 36 }).notNull(),
  channel: varchar('channel', { length: 16 }).notNull(),
  payload: json('payload'), // { template, vars }
  notBefore: datetime('not_before').notNull().default(sql`CURRENT_TIMESTAMP`),
  status: varchar('status', { length: 16 }).default('pending')
});
```

### 1.2 Tetikleyici Mantığı
- Event store (Part 20 analytics) dinlenir. Kural: **“7 günde 3+ proje görüntüleyen, iletişim formu bırakmayan”** → 30 dk sonra nurture e‑postası.

**`BE: src/jobs/lifecycle.eval.ts`** (özet)
```ts
export async function evaluateTriggers(){
  // segment → eşleşen contacts
  // rules → uygun kişiler için lc_queue'ya push (duplicate guard)
}
```

### 1.3 Gönderim – Email & WhatsApp
**Email (Resend/SendGrid/Nodemailer)**
```ts
import nodemailer from 'nodemailer';
const tx = nodemailer.createTransport({ host:'smtp.example.com', port:587, auth:{ user:'u', pass:'p' } });
await tx.sendMail({ to: contact.email, from:'Toronto <noreply@toronto.com>', subject, html: renderTemplate(locale, vars) });
```
**WhatsApp Cloud API (örnek)**
```bash
curl -X POST https://graph.facebook.com/v20.0/WHATSAPP_ID/messages \
  -H 'Authorization: Bearer $WA_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"messaging_product":"whatsapp","to":"+491234...","type":"template","template":{"name":"nurture_1","language":{"code":"tr"}}}'
```
**Opt‑in / Opt‑out**
- Double opt‑in e‑postası (link → `/consent/confirm?token=...`).  
- `/unsubscribe` her kanalda zorunlu; DB `consent.whatsapp=false`/`consent.email=false`.

### 1.4 Admin UI
- `/admin/lifecycle`: trigger builder, template önizleme, hız limiti (günde max N mesaj), A/B varyantı.

### 1.5 Kabul
- Rızalı kullanıcılara gecikmeli nurture akışı gönderilir; opt‑out anında işler; log’lar adminde görünür.

---

## 2) GPP/TCF Vendor‑List Yönetimi

### 2.1 Şema
**`BE: src/db/schema.consent.ts`**
```ts
import { mysqlTable, varchar, json, datetime } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
export const vendors = mysqlTable('vendors', {
  id: varchar('id', { length: 64 }).primaryKey(), // gtag|hotjar|meta|linkedin
  purposes: json('purposes'), // { tcf:[1,7], gpp:['usp','euid'] }
  src: varchar('src', { length: 255 })
});
export const regionRules = mysqlTable('region_rules', {
  id: varchar('id', { length: 36 }).primaryKey(),
  region: varchar('region', { length: 8 }), // EU|US|TR|ROW
  required: json('required'), // zorunlu scriptler
  blocked: json('blocked')
});
```

### 2.2 Script Loader (CMP‑aware)
**`FE: src/shared/consent/ScriptGate.tsx`**
```tsx

```
**Kullanım**: CMP sonucu → `allow = hasConsent('analytics') && region!='EU'? true : ...` gibi kuralla.

### 2.3 Loglama
- `consent_logs(user, region, policy, vendors_loaded[])` ClickHouse’a.

### 2.4 Kabul
- Bölge & rıza olmadan vendor script yüklenmez; loglarda vendor/purpose izlenir.

---

## 3) Route‑Level Streaming & Skeletons

### 3.1 Sınırlandırma
- RSC segmentlerinde **Suspense sınırları**: navbar → hero → featured → list → footer.  
- Ağır bloklar (öneri, video, harita) kendi sınırında **skeleton** ile.

### 3.2 Kod
**`FE: src/app/[locale]/projects/page.tsx`**
```tsx


export default async function ProjectsPage(){
  return (
    <main>
      <Suspense fallback={<ProjectsSkeleton />}>
        {/* server component */}
        <ProjectsList />
      </Suspense>
     
       
      </Suspense>
    </main>
  );
}
```
**Skeleton rehberi**: temadan gelen **skeleton token**’ları (örn. `uiSiteSkeletons`) kullan; contrast 4.5:1; motion‑reduced modda animasyon yok.

### 3.3 Hatalar
- `error.tsx` + `not-found.tsx` segment bazlı; minimal JS ile.

### 3.4 Kabul
- Streaming ile LCP düşer; skeleton’lar tutarlı; hatalar izole.

---

## 4) HLS Multi‑Origin Failover

### 4.1 Nginx Origin Shield & Sağlık Kontrolü
**`/etc/nginx/conf.d/live.conf`**
```nginx
upstream hls_origin {
  zone hls 64k;
  server origin-a.internal:8080 max_fails=2 fail_timeout=10s;
  server origin-b.internal:8080 backup; # yalnız A düştüğünde
}
server {
  listen 443 ssl;
  server_name live.toronto.com;
  location /hls/ {
    proxy_pass http://hls_origin;
    proxy_read_timeout 30s;
    proxy_set_header Host $host;
    proxy_http_version 1.1;
  }
}
```
**Sağlık**: `ngx_http_healthcheck_module` veya harici checker job → **/health.m3u8**.

### 4.2 Manifest Yeniden‑Yazıcı (opsiyonel)
**`BE: src/live/manifest-rewrite.ts`**
```ts
export function rewriteM3U8(m3u8:string, base:string){
  return m3u8.replace(/^(?!#)(.*\.m3u8|.*\.(ts|m4s))/gm, (m)=> base + m);
}
```
Gateway’de 502/404 artınca base ikinci origin’e çevrilir (banner → “Yayın yedekleniyor”).

### 4.3 Player Fallback
- Part 21 `useHlsFallback` kullanımı; ek olarak **rebuffer ratio** > eşik → otomatik kaynak değişimi.

### 4.4 Encoder Failover
- **Primary** ve **standby** encoder; RTMP multi‑publish.  
- Webhook: `started/ended` olayları her iki encoder’dan gelir; BE **son canlı** statüyü yazar.

### 4.5 Kabul
- Origin A kapandığında 1–2 sn içinde B’ye geçiş; rebuffer düşer; loglarda failover olayı görülür.

---

## 5) Kabul Kriterleri (Part 27)
- Flow tabanlı speculation kuralları üretildi ve RSC’de enjekte edildi.  
- Lifecycle messaging rızalı kullanıcılara çalışıyor; opt‑out ve hız limiti mevcut.  
- GPP/TCF vendor‑list kuralları CMP ile uyumlu; vendor scriptleri yalnız izinle yükleniyor.  
- Route‑level streaming sınırları ve skeleton’lar tutarlı; hata sayfaları segment bazlı.  
- HLS multi‑origin failover anlık geçiş yapıyor; manifest rewrite/fallback doğrulandı.

---

## 6) Sonraki Parça (Part 28)
- **Speculation simülatörü**: kullanıcı akışını üreten mini Monte‑Carlo;  
- **Lifecycle**: WhatsApp two‑way (gelen mesaj webhook’ları + CRM notları)  
- **Consent**: per‑purpose TTL ve “fresh consent” stratejisi  
- **Streaming**: route‑level **progressive image streaming** (blurhash → AVIF → tam çözünürlük)  
- **Ops**: kural tabanlı otomatik **capacity scaling** (HPA + queue depth)

