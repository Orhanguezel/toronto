// =============================================================
// FILE: src/integrations/rtk/types/services.types.ts
// Ensotek – Services (Hizmetler) RTK Tipleri
// Backend: src/modules/services/*
// =============================================================

/**
 * Backend'deki boolLike tipiyle uyumlu (query & payload için)
 *  - Hem normal boolean hem de 0/1 ve string varyantlarını kapsıyoruz.
 */
export type BoolLike = boolean | 0 | 1 | "0" | "1" | "true" | "false";

/**
 * Backend ServiceTypeEnum ile uyumlu.
 * Seed'de kullanılan tipler:
 *  - maintenance_repair
 *  - modernization
 *  - spare_parts_components
 *  - applications_references
 *  - engineering_support
 *  - production
 *  - other
 */
export type ServiceType =
  | "maintenance_repair"
  | "modernization"
  | "spare_parts_components"
  | "applications_references"
  | "engineering_support"
  | "production"
  | "other";

/** Sıralama alanları (serviceListQuerySchema.sort ile uyumlu) */
export type ServiceSortField = "created_at" | "updated_at" | "display_order";
export type SortDirection = "asc" | "desc";

/* ------------------------------------------------------------------
 * LIST QUERY PARAMS (public + admin)
 * Backend: serviceListQuerySchema (validation.ts)
 * ------------------------------------------------------------------ */

export interface ServiceListQueryParams {
  /** Ör: "created_at.desc" – backend parseOrder ile çözüyor */
  order?: string;
  sort?: ServiceSortField;
  orderDir?: SortDirection;
  limit?: number;
  offset?: number;
  q?: string;
  type?: ServiceType;

  category_id?: string;
  sub_category_id?: string;

  featured?: BoolLike;
  is_active?: BoolLike;
  locale?: string;
  default_locale?: string;
}

/** Admin endpoint için query (is_active serbest) */
export type ServiceListAdminQueryParams = ServiceListQueryParams;

/** Public endpoint için query (is_active backend’de sabit 1) */
export type ServiceListPublicQueryParams = Omit<
  ServiceListQueryParams,
  "is_active"
>;

/* ------------------------------------------------------------------
 * API DTO – Service (backend repository ServiceMerged ile uyumlu)
 * ------------------------------------------------------------------ */

/**
 * Backend ServiceMerged (repository.ts) şekline uygun raw API tipi.
 *  - Admin list/get + admin slug + public get slug/id hepsi bu formda
 *    dönüyor. Public list ek olarak featured_image_url alanı da ekliyor.
 */
// ... üst kısım aynı

export interface ApiServiceBase {
  id: string;
  type: ServiceType | string;

  category_id: string | null;
  sub_category_id: string | null;

  featured: 0 | 1; // DB tinyint
  is_active: 0 | 1; // DB tinyint
  display_order: number;

  // İsteğe bağlı: backend join ile gelen kategori adı
  category_name?: string | null;

  // ana görsel alanları (legacy + storage)
  featured_image: string | null;
  image_url: string | null;
  image_asset_id: string | null;

  // tip spesifik (non-i18n) alanlar
  area: string | null;
  duration: string | null;
  maintenance: string | null;
  season: string | null;
  soil_type: string | null;
  thickness: string | null;
  equipment: string | null;

  created_at: string; // JSON'da string bekliyoruz
  updated_at: string;

  // i18n coalesced
  slug: string | null;
  name: string | null;
  description: string | null;
  material: string | null;
  price: string | null;
  includes: string | null;
  warranty: string | null;
  image_alt: string | null;

  // SEO + tags
  tags: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;

  locale_resolved: string | null;
}


/** Admin tarafında list/get için cevap tipi */
export type ApiServiceAdmin = ApiServiceBase;

/**
 * Public list/get/slug için cevap tipi
 *  - controller.ts’te imgUrl ile eklenen featured_image_url alanı da var
 */
export interface ApiServicePublic extends ApiServiceBase {
  featured_image_url: string | null;
}

/**
 * FE tarafında normalize edilmiş DTO
 *  - featured/is_active boolean
 *  - public’ten gelen featured_image_url opsiyonel alan olarak tutuluyor
 */
export interface ServiceDto {
  id: string;
  type: ServiceType | string;

  category_id: string | null;
  sub_category_id: string | null;

  featured: boolean;
  is_active: boolean;
  display_order: number;

  // join'den gelen kategori adı (public için daha okunur)
  category_name?: string | null;

  featured_image: string | null;
  image_url: string | null;
  image_asset_id: string | null;

  /**
   * Public endpoint’lerden gelen hesaplanmış URL.
   * Admin endpoint’lerde olmayabilir, o yüzden opsiyonel.
   */
  featured_image_url?: string | null;

  // tip spesifik non-i18n alanlar
  area: string | null;
  duration: string | null;
  maintenance: string | null;
  season: string | null;
  soil_type: string | null;
  thickness: string | null;
  equipment: string | null;

  created_at: string;
  updated_at: string;

  // i18n
  slug: string | null;
  name: string | null;
  description: string | null;
  material: string | null;
  price: string | null;
  includes: string | null;
  warranty: string | null;
  image_alt: string | null;

  // SEO + tags
  tags: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;

  locale_resolved: string | null;
}

/**
 * Liste endpoint'leri için ortak result tipi:
 *  - items: normalize ServiceDto[]
 *  - total: x-total-count header'ından veya items.length
 */
export interface ServiceListResult {
  items: ServiceDto[];
  total: number;
}

/* ------------------------------------------------------------------
 * API DTO – Service Images (backend ServiceImageMerged ile uyumlu)
 * ------------------------------------------------------------------ */

export interface ApiServiceImage {
  id: string;
  service_id: string;
  image_asset_id: string | null;
  image_url: string | null;
  is_active: 0 | 1;
  display_order: number;
  created_at: string;
  updated_at: string;

  title: string | null;
  alt: string | null;
  caption: string | null;
  locale_resolved: string | null;
}

/** FE normalize edilmiş image DTO (is_active boolean) */
export interface ServiceImageDto {
  id: string;
  service_id: string;
  image_asset_id: string | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;

  title: string | null;
  alt: string | null;
  caption: string | null;
  locale_resolved: string | null;
}

/* ------------------------------------------------------------------
 * PAYLOAD – CREATE / UPDATE (service)
 * Backend: UpsertServiceBody, PatchServiceBody (validation.ts)
 * ------------------------------------------------------------------ */

/**
 * POST /admin/services
 *  - upsertServiceBodySchema ile uyumlu create payload
 */
export interface ServiceCreatePayload {
  // parent (non-i18n)
  type?: ServiceType;

  category_id?: string | null;
  sub_category_id?: string | null;

  featured?: BoolLike;
  is_active?: BoolLike;
  display_order?: number;

  featured_image?: string | null;
  image_url?: string | null;
  image_asset_id?: string | null;

  // tip spesifik alanlar
  area?: string | null;
  duration?: string | null;
  maintenance?: string | null;
  season?: string | null;
  soil_type?: string | null;
  thickness?: string | null;
  equipment?: string | null;

  // i18n
  locale?: string;
  name?: string;
  slug?: string;
  description?: string;
  material?: string;
  price?: string;
  includes?: string;
  warranty?: string;
  image_alt?: string;

  // SEO + tags
  tags?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;

  /**
   * create: aynı içeriği tüm dillere kopyala? (default: true)
   * backend: replicate_all_locales
   */
  replicate_all_locales?: boolean;
}

/**
 * PATCH /admin/services/:id
 *  - patchServiceBodySchema ile uyumlu patch payload
 */
export interface ServiceUpdatePayload {
  // parent (non-i18n)
  type?: ServiceType;

  category_id?: string | null;
  sub_category_id?: string | null;

  featured?: BoolLike;
  is_active?: BoolLike;
  display_order?: number;

  featured_image?: string | null;
  image_url?: string | null;
  image_asset_id?: string | null;

  // tip spesifik alanlar
  area?: string | null;
  duration?: string | null;
  maintenance?: string | null;
  season?: string | null;
  soil_type?: string | null;
  thickness?: string | null;
  equipment?: string | null;

  // i18n
  locale?: string;
  name?: string;
  slug?: string;
  description?: string;
  material?: string;
  price?: string;
  includes?: string;
  warranty?: string;
  image_alt?: string;

  // SEO + tags
  tags?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;

  /**
   * patch: tüm dillere uygula? (default: false)
   * backend: apply_all_locales
   */
  apply_all_locales?: boolean;
}

/* ------------------------------------------------------------------
 * PAYLOAD – CREATE / UPDATE (service images – gallery)
 * Backend: UpsertServiceImageBody, PatchServiceImageBody
 * ------------------------------------------------------------------ */

/**
 * POST /admin/services/:id/images
 *  - upsertServiceImageBodySchema ile uyumlu
 */
export interface ServiceImageCreatePayload {
  // storage referansları
  image_asset_id?: string | null;
  image_url?: string | null;

  is_active?: BoolLike;
  display_order?: number;

  // i18n alanları
  title?: string | null;
  alt?: string | null;
  caption?: string | null;
  locale?: string;

  /** create: tüm dillere kopyala? (default: true) */
  replicate_all_locales?: boolean;
}

/**
 * PATCH /admin/services/:id/images/:imageId
 *  - patchServiceImageBodySchema ile uyumlu
 */
export interface ServiceImageUpdatePayload {
  image_asset_id?: string | null;
  image_url?: string | null;
  is_active?: BoolLike;
  display_order?: number;

  title?: string | null;
  alt?: string | null;
  caption?: string | null;
  locale?: string;

  /** patch: tüm dillere uygula? (default: false) */
  apply_all_locales?: boolean;
}


