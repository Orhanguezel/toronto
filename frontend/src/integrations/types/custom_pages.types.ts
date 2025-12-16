// =============================================================
// FILE: src/integrations/types/custom_pages.types.ts
// Ensotek – Custom Pages (Sayfalar) RTK Tipleri
// Backend: src/modules/customPages/*
// =============================================================

/**
 * Backend'deki boolLike ile uyumlu
 */
export type BoolLike =
  | boolean
  | 0
  | 1
  | "0"
  | "1"
  | "true"
  | "false";

/** Sıralama alanları */
export type CustomPageSortField = "created_at" | "updated_at";
export type SortDirection = "asc" | "desc";

/* ------------------------------------------------------------------
 * LIST QUERY PARAMS (public + admin)
 * Backend: customPageListQuerySchema
 * ------------------------------------------------------------------ */

export interface CustomPageListQueryParams {
  order?: string;
  sort?: CustomPageSortField;
  orderDir?: SortDirection;
  limit?: number;
  offset?: number;

  is_published?: BoolLike;
  q?: string;
  slug?: string;
  select?: string;

  category_id?: string;
  sub_category_id?: string;

  module_key?: string;

  /** Liste locale override */
  locale?: string;
}

export type CustomPageListAdminQueryParams = CustomPageListQueryParams;

/**
 * Public list – is_published backend’de zaten filtreleniyor ama
 * ayrı bir alias ile semantik ayrımı koruyoruz.
 */
export type CustomPageListPublicQueryParams = CustomPageListQueryParams;

/* ------------------------------------------------------------------
 * API DTO – Backend CustomPageMerged ile birebir
 * ------------------------------------------------------------------ */

export interface ApiCustomPage {
  id: string;
  is_published: 0 | 1;
  featured_image: string | null;
  featured_image_asset_id: string | null;
  created_at: string;
  updated_at: string;

  category_id: string | null;
  sub_category_id: string | null;

  /** categories join’inden gelen alanlar (opsiyonel) */
  category_name: string | null;
  category_slug: string | null;

  /** sub_categories join’inden gelen alanlar (opsiyonel) */
  sub_category_name: string | null;
  sub_category_slug: string | null;

  title: string | null;
  slug: string | null;

  /**
   * Backend: JSON-string {"html":"..."}
   * repo: CustomPageMerged.content
   */
  content: string | null;

  /** Kısa özet */
  summary: string | null;

  featured_image_alt: string | null;
  meta_title: string | null;
  meta_description: string | null;

  /** Virgülle ayrılmış tag listesi (örn: "ensotek,su sogutma kuleleri") */
  tags: string | null;

  locale_resolved: string | null;
}

/* ------------------------------------------------------------------
 * FE DTO – Normalize edilmiş CustomPage
 *  - is_published → boolean
 *  - content_raw: backend JSON-string
 *  - content_html / content: düz HTML
 *  - tags_raw: backend string
 *  - tags: string[]
 * ------------------------------------------------------------------ */

export interface CustomPageDto {
  id: string;
  is_published: boolean;
  featured_image: string | null;
  featured_image_asset_id: string | null;
  created_at: string;
  updated_at: string;

  category_id: string | null;
  sub_category_id: string | null;

  category_name: string | null;
  category_slug: string | null;
  sub_category_name: string | null;
  sub_category_slug: string | null;

  title: string | null;
  slug: string | null;

  /**
   * Backend’ten gelen JSON-string ("{\"html\":\"...\"}")
   */
  content_raw: string | null;

  /**
   * Parse edilmiş düz HTML – render ve form için kullanılacak
   */
  content_html: string;

  /**
   * Form komponentleri için kısa alias.
   * CustomPageForm bu alanı okuyor.
   */
  content: string;

  /** Liste kartları ve meta için kısa özet */
  summary: string | null;

  featured_image_alt: string | null;
  meta_title: string | null;
  meta_description: string | null;

  /** Backend’ten gelen virgüllü tag string’i */
  tags_raw: string | null;
  /** FE tarafında normalize edilmiş tag listesi */
  tags: string[];

  locale_resolved: string | null;
}

/* ------------------------------------------------------------------
 * Normalizer helper
 * ------------------------------------------------------------------ */

type ContentJson = {
  html?: string;
  // Diğer key'ler önemli değil, sadece html'i kullanıyoruz.
  [key: string]: unknown;
};

const unpackContent = (raw: string | null): string => {
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw) as ContentJson;
    if (typeof parsed.html === "string") {
      return parsed.html;
    }
    // html anahtarı yoksa, direkt string’i dön
    return raw;
  } catch {
    // düzgün JSON değilse olduğu gibi kullan
    return raw;
  }
};

const toBoolFrom01 = (v: 0 | 1): boolean => v === 1;

const parseTags = (raw: string | null): string[] => {
  if (!raw) return [];
  return raw
    .split(/[;,]/)
    .map((t) => t.trim())
    .filter((t, idx, arr) => t.length > 0 && arr.indexOf(t) === idx);
};

/**
 * API içinden ham content string'ini seç:
 * - Öncelik sırası: content → content_raw → content_html
 * - Tip güvenli kalsın diye any cast ile opsiyonel alanları da yokluyoruz
 */
const pickApiContentRaw = (api: ApiCustomPage): string | null => {
  const anyApi = api as any;
  return (
    api.content ??           // beklenen alan
    anyApi.content_raw ??    // backend farklı isimle göndermiş olabilir
    anyApi.content_html ??   // direkt html alanı
    null
  );
};

/**
 * API -> FE DTO dönüşümü
 */
export const normalizeCustomPage = (api: ApiCustomPage): CustomPageDto => {
  const rawContent = pickApiContentRaw(api);
  const html = unpackContent(rawContent);
  const tagsArray = parseTags(api.tags);

  return {
    id: api.id,
    is_published: toBoolFrom01(api.is_published),
    featured_image: api.featured_image ?? null,
    featured_image_asset_id: api.featured_image_asset_id ?? null,
    created_at: String(api.created_at),
    updated_at: String(api.updated_at),

    category_id: api.category_id ?? null,
    sub_category_id: api.sub_category_id ?? null,

    category_name: api.category_name ?? null,
    category_slug: api.category_slug ?? null,
    sub_category_name: api.sub_category_name ?? null,
    sub_category_slug: api.sub_category_slug ?? null,

    title: api.title ?? null,
    slug: api.slug ?? null,

    // 🔽 content tek merkezden yönetiliyor
    content_raw: rawContent,
    content_html: html,
    content: html,

    summary: api.summary ?? null,

    featured_image_alt: api.featured_image_alt ?? null,
    meta_title: api.meta_title ?? null,
    meta_description: api.meta_description ?? null,

    tags_raw: api.tags ?? null,
    tags: tagsArray,

    locale_resolved: api.locale_resolved ?? null,
  };
};

/**
 * Eski isimlendirme ile uyum için alias.
 * Endpoint’ler mapApiCustomPageToDto ismini kullanıyor.
 */
export const mapApiCustomPageToDto = normalizeCustomPage;

/* ------------------------------------------------------------------
 * PAYLOAD – CREATE / UPDATE
 * Backend: UpsertCustomPageBody, PatchCustomPageBody
 * ------------------------------------------------------------------ */

/** POST /admin/custom_pages */
export interface CustomPageCreatePayload {
  // i18n zorunlu alanlar
  locale?: string;
  title: string;
  slug: string;
  /** düz HTML – backend packContent ile {"html":"..."} yapar */
  content: string;

  /** Kısa özet */
  summary?: string | null;

  featured_image_alt?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;

  /** Virgülle ayrılmış tag listesi (örn: "ensotek,blog,yazi-1") */
  tags?: string | null;

  // parent alanları
  is_published?: BoolLike;
  featured_image?: string | null;
  featured_image_asset_id?: string | null;

  category_id?: string | null;
  sub_category_id?: string | null;
}

/** PATCH /admin/custom_pages/:id */
export interface CustomPageUpdatePayload {
  locale?: string;

  // parent
  is_published?: BoolLike;
  featured_image?: string | null;
  featured_image_asset_id?: string | null;
  category_id?: string | null;
  sub_category_id?: string | null;

  // i18n (hepsi opsiyonel)
  title?: string;
  slug?: string;
  content?: string;

  /** Kısa özet */
  summary?: string | null;

  featured_image_alt?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;

  /** Virgülle ayrılmış tag listesi (örn: "ensotek,blog,yazi-1") */
  tags?: string | null;
}
