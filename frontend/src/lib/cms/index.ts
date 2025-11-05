// src/lib/cms/index.ts
export async function fetchCMS(
  type: "project",
  slug: string,
  locale: string,
  init?: RequestInit & { next?: { revalidate?: number; tags?: string[] } }
) {
  // TODO: Contentful/Strapi entegrasyonu
  // Şimdilik null dön (fallback API devreye girer)
  return null as any;
}
