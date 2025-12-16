// =============================================================
// FILE: src/integrations/types/subcategory.types.ts
// Ensotek – SubCategory tipleri + normalizasyon helpers
// =============================================================

export type SubCategoryId = string;
export type CategoryId = string;

export type RawBool = boolean | 0 | 1 | "0" | "1" | "true" | "false" | null | undefined;

/**
 * API'den dönen ham sub-category satırı (DB row'a yakın)
 */
export interface ApiSubCategory {
  id: SubCategoryId;
  category_id: CategoryId;
  locale: string;
  name: string;
  slug: string;

  description: string | null;
  image_url: string | null;
  storage_asset_id: string | null;
  alt: string | null;
  icon: string | null;

  is_active: RawBool;
  is_featured: RawBool;
  display_order: number | null;

  created_at: string;
  updated_at: string;
}

/**
 * FE'de kullanacağımız normalize edilmiş DTO
 */
export interface SubCategoryDto {
  id: SubCategoryId;
  category_id: CategoryId;
  locale: string;
  name: string;
  slug: string;

  description: string | null;
  image_url: string | null;
  storage_asset_id: string | null;
  alt: string | null;
  icon: string | null;

  is_active: boolean;
  is_featured: boolean;
  display_order: number;

  created_at: string;
  updated_at: string;
}

/* ------------------------------------------------------------- */
/*  Yardımcı dönüştürücüler                                      */
/* ------------------------------------------------------------- */

const asStr = (v: unknown): string =>
  typeof v === "string" ? v : v == null ? "" : String(v);

const asNullableStr = (v: unknown): string | null => {
  if (v === null || v === undefined) return null;
  const s = String(v);
  return s.length ? s : null;
};

const asBool = (v: RawBool): boolean => {
  if (v === true) return true;
  if (v === false) return false;
  if (v === 1 || v === "1" || v === "true") return true;
  if (v === 0 || v === "0" || v === "false") return false;
  return false;
};

const asNum = (v: unknown, def = 0): number => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

/* ------------------------------------------------------------- */
/*  Normalizasyon                                                 */
/* ------------------------------------------------------------- */

export const normalizeSubCategory = (row: ApiSubCategory): SubCategoryDto => {
  return {
    id: asStr(row.id),
    category_id: asStr(row.category_id),
    locale: asStr(row.locale || "tr").toLowerCase(),
    name: asStr(row.name),
    slug: asStr(row.slug),

    description: asNullableStr(row.description),
    image_url: asNullableStr(row.image_url),
    storage_asset_id: asNullableStr(row.storage_asset_id),
    alt: asNullableStr(row.alt),
    icon: asNullableStr(row.icon),

    is_active: asBool(row.is_active),
    is_featured: asBool(row.is_featured),
    display_order: asNum(row.display_order, 0),

    created_at: asStr(row.created_at),
    updated_at: asStr(row.updated_at),
  };
};

/* ------------------------------------------------------------- */
/*  Query param tipleri                                           */
/* ------------------------------------------------------------- */

/**
 * PUBLIC listeleme query paramları (GET /sub-categories)
 */
export interface SubCategoryListQueryParams {
  q?: string;
  category_id?: string | null;
  locale?: string;
  is_active?: boolean | number | string;
  is_featured?: boolean | number | string;
  limit?: number;
  offset?: number;
  sort?: "display_order" | "name" | "created_at" | "updated_at";
  order?: "asc" | "desc";
}

/**
 * PUBLIC slug ile getirme (GET /sub-categories/by-slug/:slug)
 */
export interface SubCategorySlugQuery {
  slug: string;
  category_id?: string;
  locale?: string;
}

/**
 * ADMIN listeleme query paramları (GET /admin/sub-categories/list)
 */
export interface SubCategoryAdminListQueryParams {
  q?: string;
  category_id?: string;
  locale?: string;
  is_active?: boolean | string;
  is_featured?: boolean | string;
  limit?: number;
  offset?: number;
  sort?: "display_order" | "name" | "created_at" | "updated_at";
  order?: "asc" | "desc";
}

/**
 * ADMIN create payload
 * (backend SubCategoryCreateInput ile uyumlu)
 */
export interface SubCategoryCreatePayload {
  category_id: string;
  locale?: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  alt?: string;
  icon?: string;
  is_active?: boolean;
  is_featured?: boolean;
  display_order?: number;
}

/**
 * ADMIN update payload (PATCH/PUT)
 */
export interface SubCategoryUpdatePayload {
  category_id?: string;
  locale?: string;
  name?: string;
  slug?: string;
  description?: string | null;
  image_url?: string | null;
  alt?: string | null;
  icon?: string | null;
  is_active?: boolean;
  is_featured?: boolean;
  display_order?: number;
}

/**
 * ADMIN reorder payload
 */
export interface SubCategoryReorderItem {
  id: string;
  display_order: number;
}

/**
 * ADMIN image set payload
 */
export interface SubCategorySetImagePayload {
  id: string;
  asset_id?: string | null;
  alt?: string | null;
}
