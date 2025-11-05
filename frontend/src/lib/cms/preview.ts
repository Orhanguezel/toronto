// src/lib/cms/preview.ts
type Args = { type: string; slug: string; locale: string };

/**
 * Preview taslağını sağlayıcıdan çeker.
 * Not: Şimdilik stub; Contentful/Strapi gibi servisleri ileride bağlarız.
 */
export async function fetchDraftFromProvider({ type, slug, locale }: Args) {
  // TODO: provider=contentful/strapi'ye göre dallandır
  // Build için güvenli, minimal mock:
  return {
    type,
    slug,
    locale,
    draft: true,
    title: `[PREVIEW] ${type}/${slug}`,
    body: `Preview content for ${slug} (${locale})`,
    updated_at: new Date().toISOString(),
  };
}
