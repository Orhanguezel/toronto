import { SUPPORTED_LOCALES } from '@/lib/i18n/locales';
import { getProjectSlugs } from '@/lib/api/public';

export default function sitemap(){
  const base = process.env.NEXT_PUBLIC_SITE_URL!;
  return [
    { url: `${base}/sitemap-static.xml`, lastModified: new Date() },
    { url: `${base}/sitemap-blog-tr.xml` },
    { url: `${base}/sitemap-blog-en.xml` },
    { url: `${base}/sitemap-blog-de.xml` },
    { url: `${base}/sitemap-projects-tr.xml` },
    { url: `${base}/sitemap-projects-en.xml` },
    { url: `${base}/sitemap-projects-de.xml` },
  ];
}