// =============================================================
// FILE: src/integrations/types/references.types.ts
// Ensotek – References (Referanslar) tipleri
// Backend: src/modules/references/*
// =============================================================

export type BoolLike =
  | boolean
  | 0
  | 1
  | "0"
  | "1"
  | "true"
  | "false";

/* -------------------------------------------------------------
 * LIST QUERY (public + admin ortak)
 * backend: ReferenceListQuery + ListParams
 * ----------------------------------------------------------- */

export type ReferenceListQueryParams = {
  // shared order param (örn: "created_at.asc")
  order?: string;

  // sort + orderDir: shared util
  sort?: "created_at" | "updated_at" | "display_order";
  orderDir?: "asc" | "desc";

  limit?: number;
  offset?: number;

  is_published?: BoolLike; // admin kullanıyor, public ignore
  is_featured?: BoolLike;

  q?: string;
  slug?: string;
  select?: string;

  category_id?: string;
  sub_category_id?: string;

  /** categories.module_key üzerinden filtre (ör: 'references') */
  module_key?: string;

  /** website_url var/yok filtresi */
  has_website?: BoolLike;

  /** locale-aware list için opsiyonel locale paramı */
  locale?: string;
};

/* -------------------------------------------------------------
 * ReferenceView (public + admin aynı yapı)
 * backend: ReferenceMerged (repository.ts)
 * ----------------------------------------------------------- */

export interface ReferenceAssetInfo {
  bucket: string;
  path: string;
  url: string | null;
  width: number | null;
  height: number | null;
  mime: string | null;
}

export interface ReferenceDto {
  id: string;
  is_published: 0 | 1;
  is_featured: 0 | 1;
  display_order: number;

  featured_image: string | null;
  featured_image_asset_id: string | null;
  website_url: string | null;

  created_at: string | Date;
  updated_at: string | Date;

  category_id: string | null;
  sub_category_id: string | null;

  title: string | null;
  slug: string | null;
  summary: string | null;
  content: string | null;
  featured_image_alt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  locale_resolved: string | null;

  // resolved url (doğrudan image veya storage URL)
  featured_image_url_resolved: string | null;

  // storage asset (varsa)
  featured_asset?: ReferenceAssetInfo | null;
}

/* -------------------------------------------------------------
 * CREATE / UPDATE gövdesi (admin)
 * backend: UpsertReferenceBody / PatchReferenceBody
 * ----------------------------------------------------------- */

export interface ReferenceUpsertPayload {
  // parent
  is_published?: BoolLike;
  is_featured?: BoolLike;
  display_order?: number;

  featured_image?: string | null;
  featured_image_asset_id?: string | null;
  website_url?: string | null;

  category_id?: string | null;
  sub_category_id?: string | null;

  // i18n
  locale?: string;

  title?: string;
  slug?: string;
  summary?: string | null;
  content?: string; // HTML veya JSON-string

  featured_image_alt?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;

  // create: tüm dillere kopyala?
  replicate_all_locales?: boolean;

  // update: tüm dillere uygula?
  apply_all_locales?: boolean;
}

/* -------------------------------------------------------------
 * GALLERY tipleri
 * backend: ReferenceImageMerged / UpsertReferenceImageBody / PatchReferenceImageBody
 * ----------------------------------------------------------- */

export interface ReferenceImageAssetInfo {
  bucket: string;
  path: string;
  url: string | null;
  width: number | null;
  height: number | null;
  mime: string | null;
}

export interface ReferenceImageDto {
  id: string;
  reference_id: string;
  asset_id: string;
  image_url: string | null;
  display_order: number;
  is_active: 0 | 1;
  created_at: string | Date;
  updated_at: string | Date;

  alt: string | null;
  caption: string | null;
  locale_resolved: string | null;

  image_url_resolved: string | null;
  asset?: ReferenceImageAssetInfo | null;
}

export interface ReferenceImageUpsertPayload {
  // parent
  asset_id?: string; // create'de zorunlu, update'de opsiyonel
  image_url?: string | null;
  display_order?: number;
  is_active?: BoolLike;

  // i18n
  locale?: string;
  alt?: string | null;
  caption?: string | null;

  replicate_all_locales?: boolean; // create
  apply_all_locales?: boolean; // update
}

/* -------------------------------------------------------------
 * LIST response tipi (x-total-count header ile)
 * ----------------------------------------------------------- */

export interface ReferenceListResponse {
  items: ReferenceDto[];
  total: number;
}
