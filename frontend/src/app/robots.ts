// src/app/robots.ts
import { getServerI18nContext } from "@/i18n/server";

export default async function robots() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // app_locales DB’den gelsin (tek noktadan)
  const { activeLocales } = await getServerI18nContext();

  // Root sitemap index (Next sitemap.ts endpoint'i)
  // İstersen ayrıca static/blog/projects xml route'larını da listelemeye gerek yok;
  // sitemap index zaten onları gösterecek.
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${base}/sitemap.xml`,
    // İstersen locale bazlı sitemap'leri ayrıca eklemek için:
    // additionalSitemaps: activeLocales.map((l) => `${base}/sitemap-${l}.xml`),
  };
}
