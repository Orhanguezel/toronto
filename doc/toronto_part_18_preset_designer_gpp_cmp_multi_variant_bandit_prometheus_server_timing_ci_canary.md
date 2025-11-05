# Part 18 – Preset Designer, GPP CMP, Multi‑Variant Bandit (Credible Intervals), Server‑Timing → Prometheus, CI Canary Automation & Semi‑Auto DB Failover

Bu parça ile Media Pro’yu preset tasarımcısı ile tamamlıyor, CMP tarafında **GPP** (Global Privacy Platform) sinyallerini işliyor, A/B sistemini **çok varyant + Bayesian credible interval** raporlarına yükseltiyor; `Server‑Timing` ölçümlerini **Prometheus**’a aktarıyor ve **CI canary** otomasyonunu ekliyoruz. Ayrıca yarı otomatik DB failover script’leri eklenir.

> FE: Next 15 (RSC + SSR/SSG/ISR), styled‑components. BE: Fastify + TS + Drizzle + MariaDB. Media: Cloudinary. Observability: Prometheus/Grafana. Queue: BullMQ.

---

## 0) Media Preset Designer – Görsel Odaklı Tasarım

### 0.1 UI – Designer Sayfası
**`FE: src/app/(admin)/admin/media/presets/designer/page.tsx`** (özet)
```tsx

```

### 0.2 Çok Ekran Önizleme Matrisi
**`FE: src/shared/admin/media/PresetPreviewMatrix.tsx`**
```tsx

```
> Breakpoint seti: `xs 360×240`, `sm 600×400`, `md 960×540`, `lg 1600×700`.

### 0.3 Kabul
- Preset create/update gerçekleşir; preview matrisi doğru oranlarla render olur.
- Designer, `gravity=custom` seçili ise Part 14’teki **custom coordinates** ile uyumlu çalışır; değilse `auto/face/subject` fallback.

---

## 1) CMP – GPP (Global Privacy Platform) Adaptörü

### 1.1 GPP Yardımcıları
**`FE: src/shared/privacy/gpp.ts`**
```ts

```
**Kullanım**: GPP varsa öncelikle onu; EU bölgesinde **TCF** ile, US/CA’da **GPP** ile gating.

### 1.2 Banner / Region Aware
- CMP sağlayıcı ayarından **region rules**; UI metinleri Part 7 site settings’ten çekilir.

### 1.3 Kabul
- EU’da TCF → `__tcfapi` ile, US/CA’da GPP → `__gpp` ile gating; rıza yoksa script’ler yüklenmez.

---

## 2) A/B Çok Varyant + Bayesian Credible Interval Raporu

### 2.1 Stats API – Monte Carlo Yaklaşımı
**`BE: src/http/routes/admin.experiments.report.ts`**
```ts
import { FastifyPluginAsync } from 'fastify';
import { db } from '@/core/db';
import { expStats } from '@/db/schema.experiments.stats';

function sampleBeta(a:number,b:number){
  // hızlı approx: Box–Muller ile Gamma ~ k=shape
  const gamma = (k:number)=>{ let x=0; for(let i=0;i<k;i++) x+=-Math.log(Math.random()); return x; };
  const A = gamma(a), B = gamma(b); return A/(A+B);
}

function ciBeta(a:number,b:number, iters=5000){
  const arr = new Array(iters).fill(0).map(()=> sampleBeta(a,b)).sort((x,y)=>x-y);
  const lo = arr[Math.floor(iters*0.025)], hi = arr[Math.floor(iters*0.975)];
  return { lo, hi };
}

export const expReportRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', app.auth);
  app.get('/experiments/:id/report', async (req)=>{
    const { id } = (req.params as any);
    const st = (await db.select().from(expStats).where((r:any)=> r.expId.eq(id)))[0];
    if (!st) return { variants: [] };
    const vars = [
      { key:'A', trials: st.trialsA, success: st.successA },
      { key:'B', trials: st.trialsB, success: st.successB },
      // genişletilebilir: C,D...
    ];
    const post = vars.map(v=> ({ key:v.key, a:v.success+1, b:(v.trials-v.success)+1 }));
    const ci = Object.fromEntries(post.map(p=> [p.key, ciBeta(p.a,p.b)]));
    // P(win) ~ Monte Carlo
    const N=3000; let winCount:Record<string,number> = Object.fromEntries(post.map(p=>[p.key,0]));
    for(let i=0;i<N;i++){
      const draws = post.map(p=> ({ key:p.key, val: sampleBeta(p.a,p.b) }));
      const best = draws.reduce((m,d)=> d.val>m.val? d:m, draws[0]);
      winCount[best.key]++;
    }
    const pwin = Object.fromEntries(Object.entries(winCount).map(([k,v])=> [k, v/N]));
    return { variants: vars, credibleIntervals: ci, probWin: pwin };
  });
};
```

### 2.2 FE – Rapor Sayfası
- `/admin/experiments/:id/report` → tablo: trials, success, **CI 95%**, **P(win)**; durdurma önerisi: bir varyantın CI’si diğerini geçiyorsa ve `P(win) > 0.95`.

### 2.3 Kabul
- 2+ varyantta rapor üretilir; CI ve P(win) görünür; trafik ağırlıkları Part 17 bandit worker tarafından güncellenmeye devam eder.

---

## 3) Server‑Timing → Prometheus Exporter

### 3.1 Metric Haritalama
**`BE: src/observability/serverTiming.metrics.ts`**
```ts
import client from 'prom-client';
export const httpTiming = new client.Histogram({
  name: 'http_server_timing_ms', help:'Server‑Timing durations',
  labelNames: ['route','name'], buckets:[5,10,20,50,100,200,400,800,1500,3000,6000]
});
```
**`BE: src/http/plugins/serverTimingExport.ts`**
```ts
import { FastifyPluginAsync } from 'fastify';
import { httpTiming } from '@/observability/serverTiming.metrics';
export const serverTimingExport: FastifyPluginAsync = async (app) => {
  app.addHook('onResponse', (req:any, rep:any, done)=>{
    const header = String(rep.getHeader('Server-Timing')||'');
    const route = req.routerPath||req.url||'unknown';
    header.split(',').map(s=>s.trim()).filter(Boolean).forEach(seg=>{
      const [name, dur] = seg.split(';dur=');
      const ms = Number(dur); if (Number.isFinite(ms)) httpTiming.labels({ route, name }).observe(ms);
    });
    done();
  });
};
```
**`server.ts`**: `await app.register(serverTimingExport);`

### 3.2 `/metrics` Entegrasyonu
- Prometheus `register.metrics()` (eğer eklenmemişse) – mevcut Part 12 altyapısı ile aynı endpoint.

### 3.3 Grafana Örnek Sorgu
- `histogram_quantile(0.9, sum(rate(http_server_timing_ms_bucket[5m])) by (le, route, name))`

### 3.4 Kabul
- Server‑Timing header’ındaki segmentler Prometheus histogramına düşer; Grafana’da p90/p99 grafikleri çizilir.

---

## 4) CI Canary Automation – GitHub Actions Örneği

### 4.1 Workflow İskeleti
**`.github/workflows/deploy.yml`** (özet)
```yaml
name: Deploy
on: { push: { branches: [ main ] } }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install && bun run build
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with: { name: fe, path: .next }
  deploy-green:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with: { name: fe, path: .next }
      - name: Rsync to server (green)
        run: rsync -az .next user@srv:/var/www/toronto-fe-green/.next
      - name: Reload PM2 green
        run: ssh user@srv 'pm2 reload toronto-fe-green'
  canary-5:
    needs: deploy-green
    runs-on: ubuntu-latest
    steps:
      - name: Set Nginx map cookie → 5%
        run: ssh user@srv 'sudo bash /opt/toronto/scripts/set-canary.sh 5'
  check-health:
    needs: canary-5
    runs-on: ubuntu-latest
    steps:
      - name: Smoke tests
        run: ssh user@srv '/opt/toronto/scripts/smoke.sh'
  ramp-50:
    if: success()
    needs: check-health
    runs-on: ubuntu-latest
    steps:
      - name: Set canary 50%
        run: ssh user@srv 'sudo bash /opt/toronto/scripts/set-canary.sh 50'
  finalize-swap:
    if: success()
    needs: ramp-50
    runs-on: ubuntu-latest
    steps:
      - name: Swap green→default
        run: ssh user@srv 'sudo bash /opt/toronto/scripts/swap-blue-green.sh'
```

### 4.2 Sunucu Script’leri
**`/opt/toronto/scripts/set-canary.sh`**
```bash
#!/usr/bin/env bash
set -e
PCT=${1:-5}
sudo sed -i "s/set\$canary_pct .*/set\$canary_pct ${PCT};/" /etc/nginx/snippets/toronto-canary.conf
sudo nginx -s reload
```
**`/opt/toronto/scripts/swap-blue-green.sh`**
```bash
#!/usr/bin/env bash
set -e
# default upstream'u green yap, canary kapat
sudo sed -i 's/default toronto_blue;/default toronto_green;/' /etc/nginx/sites-enabled/toronto.conf
sudo sed -i 's/set\$canary_pct .*/set\$canary_pct 0;/' /etc/nginx/snippets/toronto-canary.conf
sudo nginx -s reload
```
**`/opt/toronto/scripts/smoke.sh`**: `/health`, ana sayfa, sitemap istekleri; 5xx yoksa OK.

### 4.3 Kabul
- CI pipeline green’e deploy → %5 canary → smoke → %50 → swap başarılı; başarısızlıkta pipeline durur, blue aktif kalır.

---

## 5) Semi‑Auto DB Failover – Script’ler

### 5.1 Önkoşul
- Master (M) ve Replica (R) var; `read_only=ON` R’de açık.

### 5.2 Failover Script
**`/opt/toronto/db/failover.sh`**
```bash
#!/usr/bin/env bash
set -euo pipefail
DBU=toronto DBP=*** MHOST=10.0.0.10 RHOST=10.0.0.11
# 1) Replica'yı promote et
mysql -h $RHOST -u$DBU -p$DBP -e "STOP SLAVE; RESET SLAVE ALL; SET GLOBAL read_only=0; SET GLOBAL super_read_only=0;"
# 2) App env switch
sed -i 's/DB_HOST=.*/DB_HOST=10.0.0.11/' /var/www/toronto-api/.env && pm2 reload toronto-api
# 3) Not: Eski master onarımına geç
```

### 5.3 Geri Dönüş
- Eski master onarıldıktan sonra re‑replication kurulumu; planlı bakım penceresinde switchover.

### 5.4 Kabul
- Failover script’i çalışınca API birkaç saniye içinde yeni host’a bağlanır; smoke testler geçer.

---

## 6) Kabul Kriterleri (Part 18)
- Preset Designer: preset CRUD, çok ekran önizleme ve Cloudinary dönüşümleri ile entegre.
- CMP: GPP sinyali (varsa) bölge bazlı gating’e dahil; EU için TCF, US/CA için GPP akışı doğrulanır.
- A/B raporu: çok varyant için 95% credible interval ve **P(win)** hesaplanır; durdurma önerisi ekranda.
- Server‑Timing → Prometheus: histogram metrikleri oluşur; Grafana p90 sorguları çalışır.
- CI canary otomasyonu: %5 → %50 → swap akışı skriptlerle yönetilir; başarısızlıkta otomatik durur.
- DB semi‑auto failover: promote → env switch → smoke testi başarıyla tamamlanır.

---

## 7) Sonraki Parça (Part 19)
- **Design System Dokümantasyonu** (Storybook/DocSite, token → component referansı)
- **Content Staging + Preview** (draft preview tokens, Review app’leri)
- **Edge Cache & Early Hints** iyileştirmeleri, HTML streaming tuning
- **Security Hardening**: rate‑limit, IP allowlists, CSP/Trusted Types, dep scanning
- **DX**: Teknik borç listesi + otomatik lint/fix/dep‑update iş akışları

