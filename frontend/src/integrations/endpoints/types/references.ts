// ======================
// References: Types
// ======================

export type BoolLike = boolean | 0 | 1 | "0" | "1" | "true" | "false";

export type ReferenceOrderCol = "created_at" | "updated_at" | "display_order";
export type OrderDir = "asc" | "desc";

export type ReferenceListQuery = {
  order?: string;                // "created_at.desc" gibi (backend de destekliyor)
  sort?: ReferenceOrderCol;      // alternatif
  orderDir?: OrderDir;           // alternatif
  limit?: number;
  offset?: number;

  is_published?: BoolLike;
  is_featured?: BoolLike;

  q?: string;
  slug?: string;
  select?: string;
};

export type ReferenceParentFields = {
  id: string;
  is_published: 0 | 1;
  is_featured: 0 | 1;
  display_order: number;

  featured_image: string | null;
  featured_image_asset_id: string | null;
  website_url: string | null;

  created_at: string;
  updated_at: string;
};

export type ReferenceI18nFields = {
  title: string | null;
  slug: string | null;
  summary: string | null;
  content: string | null; // JSON-string {"html": ...}
  featured_image_alt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  locale_resolved: string | null;
};

export type ReferenceFeaturedAsset = {
  bucket: string;
  path: string;
  url: string | null;
  width: number | null;
  height: number | null;
  mime: string | null;
} | null;

export type ReferenceView = ReferenceParentFields & ReferenceI18nFields & {
  featured_image_url_resolved: string | null;
  featured_asset: ReferenceFeaturedAsset;
};

export type ListResponse<T> = {
  items: T[];
  total: number;
};

/** Create/Update (admin) body tipleri (zod ile uyumlu) */
export type UpsertReferenceBody = Partial<{
  // parent
  is_published: BoolLike;
  is_featured: BoolLike;
  display_order: number;
  featured_image: string | null;
  featured_image_asset_id: string | null;
  website_url: string | null;

  // i18n
  locale: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string; // raw HTML ya da {"html":...} string (server pack ediyor)
  featured_image_alt: string | null;
  meta_title: string | null;
  meta_description: string | null;
}> & {
  // create için asgari alanlar: title, slug, content (controller öyle bekliyor)
  title: string;
  slug: string;
  content: string;
};

export type PatchReferenceBody = Partial<{
  // parent
  is_published: BoolLike;
  is_featured: BoolLike;
  display_order: number;
  featured_image: string | null;
  featured_image_asset_id: string | null;
  website_url: string | null;

  // i18n
  locale: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  featured_image_alt: string | null;
  meta_title: string | null;
  meta_description: string | null;
}>;

/* ------------ Gallery ------------ */

export type ReferenceImageListItem = {
  id: string;
  reference_id: string;
  asset_id: string;
  image_url: string | null;
  display_order: number;
  is_active: 0 | 1;
  created_at: string;
  updated_at: string;

  alt: string | null;
  caption: string | null;
  locale_resolved: string | null;

  image_url_resolved: string | null;
  asset: {
    bucket: string;
    path: string;
    url: string | null;
    width: number | null;
    height: number | null;
    mime: string | null;
  } | null;
};

export type UpsertReferenceImageBody = {
  // parent
  asset_id: string;
  image_url?: string | null;
  display_order?: number;
  is_active?: BoolLike;

  // i18n
  locale?: string;
  alt?: string | null;
  caption?: string | null;
};

export type PatchReferenceImageBody = Partial<{
  // parent
  asset_id: string;
  image_url: string | null;
  display_order: number;
  is_active: BoolLike;

  // i18n
  locale: string;
  alt: string | null;
  caption: string | null;
}>;
