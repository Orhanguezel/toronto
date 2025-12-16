// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { getServerI18nContext } from "@/i18n/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const now = new Date();

  const { activeLocales } = await getServerI18nContext();

  // Bu endpoint bir “index” gibi çalışsın: diğer sitemap xml route’larına link verelim.
  // Senin mevcut route’ların:
  // - /sitemap-static.xml
  // - /sitemap-blog.xml (veya /sitemap-blog-tr.xml gibi eski yaklaşım)
  // - /sitemap-projects-<locale>.xml (örnek)
  //
  // Öneri: blog için tek route'u zaten locale param ile dinamik yaptın:
  //   /sitemap-blog.xml  (içinde LOCALES dinamik dönüyor)
  // O yüzden burada tek tane blog sitemap yeterli.
  //
  // Projects için de aynı patterni öneririm: tek route /sitemap-projects.xml
  // ama sende şimdilik locale bazlı dosyalar varsa, activeLocales ile üret.

  const entries: MetadataRoute.Sitemap = [];

  // Statik sitemap (içeride locale loop yapıyor)
  entries.push({ url: `${base}/sitemap-static.xml`, lastModified: now });

  // Blog sitemap (tek dosya; içeride locale loop)
  entries.push({ url: `${base}/sitemap-blog.xml`, lastModified: now });

  // Projects sitemap – iki seçenek:
  // A) Eğer tek dosya yaparsan: entries.push({ url: `${base}/sitemap-projects.xml` })
  // B) Eğer locale dosyaları varsa: activeLocales.map(...)
  activeLocales.forEach((l) => {
    entries.push({ url: `${base}/sitemap-projects-${l}.xml`, lastModified: now });
  });

  return entries;
}
