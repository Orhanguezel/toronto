// =============================================================
// FILE: src/integrations/types/faqs.types.ts
// Backend faqs modülü ile bire bir uyumlu tipler
// =============================================================

export type Bool01 = 0 | 1;
export type BoolLike = boolean | 0 | 1 | "0" | "1" | "true" | "false";

export type FaqSortable = "created_at" | "updated_at" | "display_order";

/**
 * Backend'in döndürdüğü birleşik model (FaqMerged)
 * repository.ts -> FaqMerged
 */
export interface FaqDto {
  id: string;
  is_active: Bool01;
  display_order: number;
  created_at: string | Date;
  updated_at: string | Date;

  // Kategori ID'leri (dil bağımsız – faqs.category_id / sub_category_id)
  category_id: string | null;
  sub_category_id: string | null;

  // Localize alanlar (coalesced: req.locale > defaultLocale)
  question: string | null;
  answer: string | null;
  slug: string | null;

  /** Hangi locale’den geldiğini gösteren alan (i18nReq vs i18nDef) */
  locale_resolved: string | null;
}

/**
 * UI tarafında kullanmak için normalize edilmiş model
 */
export interface Faq {
  id: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;

  category_id: string | null;
  sub_category_id: string | null;

  question: string;
  answer: string;
  slug: string;
  locale_resolved: string | null;
}

export const normalizeFaq = (dto: FaqDto): Faq => ({
  id: dto.id,
  is_active: dto.is_active === 1,
  display_order: dto.display_order ?? 0,

  created_at:
    typeof dto.created_at === "string"
      ? dto.created_at
      : dto.created_at?.toISOString?.() ?? "",
  updated_at:
    typeof dto.updated_at === "string"
      ? dto.updated_at
      : dto.updated_at?.toISOString?.() ?? "",

  category_id: dto.category_id ?? null,
  sub_category_id: dto.sub_category_id ?? null,

  question: dto.question ?? "",
  answer: dto.answer ?? "",
  slug: dto.slug ?? "",
  locale_resolved: dto.locale_resolved ?? null,
});

/**
 * LIST query params – backend'deki FaqListQuery ile uyumlu
 * (validation.ts -> faqListQuerySchema)
 */
export interface FaqListQueryParams {
  // Sıralama
  order?: string; // "created_at.asc" gibi
  sort?: FaqSortable;
  orderDir?: "asc" | "desc";

  // Paging
  limit?: number;
  offset?: number;

  // Filtreler
  is_active?: BoolLike;
  q?: string;
  slug?: string;

  // Kategori filtreleri (ID bazlı – backend'deki ListParams ile uyumlu)
  category_id?: string;
  sub_category_id?: string;

  // İleride SELECT kolon opt. kullanmak istersen
  select?: string;

  // 🔥 Locale destekli public liste için
  locale?: string;
}

/* =============================================================
 * Create / Update payload tipleri – backend validation ile uyumlu
 * (create: question/answer/slug zorunlu, diğerleri opsiyonel)
 * ============================================================= */

interface FaqBasePayload {
  is_active?: BoolLike;
  display_order?: number;
  category_id?: string;
  sub_category_id?: string;
}

/**
 * POST /admin/faqs
 * Formdaki create payload ile bire bir uyumlu
 */
export interface FaqCreatePayload extends FaqBasePayload {
  question: string;
  answer: string;
  slug: string;
  locale?: string;
}

/**
 * PATCH /admin/faqs/:id
 * Tüm alanlar opsiyonel; patch mantığı
 */
export interface FaqUpdatePayload extends FaqBasePayload {
  question?: string;
  answer?: string;
  slug?: string;
  locale?: string;
}
