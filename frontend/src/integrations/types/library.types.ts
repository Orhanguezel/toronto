// =============================================================
// FILE: src/integrations/types/library.types.ts
// Ensotek – Library tipleri (DB/DTO + payloadlar)
// =============================================================

/**
 * Backend'deki boolLike ile uyumlu tip
 */
export type BoolLike =
  | boolean
  | 0
  | 1
  | "0"
  | "1"
  | "true"
  | "false";

/**
 * Backend'deki LibraryView ile bire bir DTO
 * (listLibraries / getLibrary* controller çıktısı)
 */
export interface LibraryDto {
  id: string;

  is_published: 0 | 1;
  is_active: 0 | 1;
  display_order: number;

  /**
   * Backend'deki LibraryView.tags
   * - library.tags_json kolonundan çözümlenmiş dizi
   * - Çok dilli yapı ({"tr":[...],"en":[...]}) backend içinde
   *   locale-aware şekilde string[]'e indirgeniyor.
   * - FE tarafında her zaman string[] veya null gelir.
   */
  tags: string[] | null;

  // 🔗 Kategori bilgiler
  category_id: string | null;
  /** category_i18n üzerinden coalesced isim */
  category_name: string | null;
  /** category_i18n üzerinden coalesced slug */
  category_slug: string | null;

  // 🔗 Alt kategori bilgiler
  sub_category_id: string | null;
  /** sub_category_i18n üzerinden coalesced isim */
  sub_category_name: string | null;
  /** sub_category_i18n üzerinden coalesced slug */
  sub_category_slug: string | null;

  author: string | null;
  /** Tüm sayfa görüntüleme / dosya indirmeleri vs. üzerinden artan sayaç */
  views: number;
  download_count: number;

  /** ISO string – backend string’e çevirip gönderiyor */
  published_at: string | null;

  created_at: string | Date;
  updated_at: string | Date;

  // i18n alanları (library_i18n join)
  title: string | null;
  slug: string | null;
  summary: string | null;

  /** packContent(JSON-string) – şimdilik string olarak kullanıyoruz */
  content: string | null;

  meta_title: string | null;
  meta_description: string | null;

  /** hangi locale’den resolve edildi (req vs default) */
  locale_resolved: string | null;
}

/**
 * LIST query parametreleri
 * (libraryListQuerySchema + public ListQuery ile uyumlu)
 */
export interface LibraryListQueryParams {
  /** "created_at.asc" gibi birleşik order paramı (opsiyonel) */
  order?: string;
  sort?:
  | "created_at"
  | "updated_at"
  | "published_at"
  | "display_order"
  | "views"
  | "download_count";
  orderDir?: "asc" | "desc";

  limit?: number;
  offset?: number;

  is_published?: BoolLike;
  is_active?: BoolLike;

  q?: string;
  slug?: string;
  select?: string;

  // 🔗 Kategori filtreleri
  category_id?: string;
  sub_category_id?: string;

  // 🔗 Module filtresi: categories.module_key üzerinden
  module_key?: string;

  author?: string;

  locale?: string;

  published_before?: string; // ISO datetime
  published_after?: string; // ISO datetime
}

/**
 * Public list için de aynı query tipini kullanıyoruz.
 */
export type LibraryPublicListQueryParams = LibraryListQueryParams;

/* ============== CREATE / UPDATE payload (library) ============== */

/**
 * Create payload – upsertLibraryBodySchema ile uyumlu
 * (parent + i18n birleşik)
 */
export interface LibraryCreatePayload {
  // parent
  is_published?: BoolLike; // default false
  is_active?: BoolLike; // default true
  display_order?: number;

  /**
   * tags_json kolonuna yazılacak etiketler
   * - Düz string[] gönderirsen backend bunları JSON-string'e çevirir.
   * - Çok dilli seed'te {tr:[...],en:[...]} yapısı da destekleniyor,
   *   ama o durumda DB'ye direkt SQL ile yazıyorsun.
   */
  tags?: string[];

  category_id?: string | null;
  sub_category_id?: string | null;

  author?: string | null;

  /** ISO datetime string veya null */
  published_at?: string | null;

  // i18n
  locale?: string;

  title?: string;
  slug?: string;

  summary?: string | null;

  /** HTML metin veya {"html": "..."} gibi JSON-string */
  content?: string;

  meta_title?: string | null;
  meta_description?: string | null;

  /** create: tüm dillere kopyala? (default: true) */
  replicate_all_locales?: boolean;
}

/**
 * Update payload – patchLibraryBodySchema ile uyumlu
 * (partial + apply_all_locales)
 */
export interface LibraryUpdatePayload {
  // parent (hepsi opsiyonel)
  is_published?: BoolLike;
  is_active?: BoolLike;
  display_order?: number;

  /** null verilirse tags_json = NULL yapılır */
  tags?: string[] | null;

  category_id?: string | null;
  sub_category_id?: string | null;

  author?: string | null;

  published_at?: string | null;

  // i18n (hepsi opsiyonel)
  locale?: string;

  title?: string;
  slug?: string;

  summary?: string | null;
  content?: string;
  meta_title?: string | null;
  meta_description?: string | null;

  /** patch: tüm dillere uygula? (default: false) */
  apply_all_locales?: boolean;
}

/* ============== IMAGES DTO + payload ============== */

/**
 * Backend'deki LibraryImageView ile bire bir DTO
 * - Her tür görsel için kullanılabilir (kapak, galeri vs.)
 */
export interface LibraryImageDto {
  id: string;
  library_id: string;
  asset_id: string;

  /** resolved url (image_url veya storage publicUrl) */
  url: string | null;
  /** thumb_url veya url */
  thumbnail: string | null;
  /** webp_url veya null */
  webp: string | null;

  /** library_images_i18n.alt */
  alt: string | null;
  /** library_images_i18n.caption */
  caption: string | null;

  display_order: number;
  is_active: 0 | 1;

  created_at: string | Date;
  updated_at: string | Date;

  asset?:
  | {
    bucket: string;
    path: string;
    url: string | null;
    width: number | null;
    height: number | null;
    mime: string | null;
  }
  | null;
}

/**
 * Create payload – upsertLibraryImageBodySchema ile uyumlu
 * (parent + i18n)
 */
export interface LibraryImageCreatePayload {
  asset_id: string;

  image_url?: string | null;
  thumb_url?: string | null;
  webp_url?: string | null;
  display_order?: number;
  is_active?: BoolLike;

  locale?: string;
  alt?: string | null;
  caption?: string | null;

  /** create: tüm dillere kopyala? (default: true) */
  replicate_all_locales?: boolean;
}

/**
 * Update payload – patchLibraryImageBodySchema ile uyumlu
 */
export interface LibraryImageUpdatePayload {
  asset_id?: string;
  image_url?: string | null;
  thumb_url?: string | null;
  webp_url?: string | null;
  display_order?: number;
  is_active?: BoolLike;

  locale?: string;
  alt?: string | null;
  caption?: string | null;

  /** patch: tüm dillere uygula? (default: false) */
  apply_all_locales?: boolean;
}

/* ============== FILES DTO + payload ============== */

/**
 * Backend'deki LibraryFileView ile bire bir DTO
 *
 * Burada PDF, Word, Excel, ZIP vs. her tür dosya için:
 *  - url: storage public URL veya file_url
 *  - mime_type: "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document" vb.
 *  - name: kullanıcıya gösterilecek dosya adı
 */
export interface LibraryFileDto {
  id: string;
  library_id: string;
  asset_id: string;

  /** resolved url (file_url veya storage publicUrl) – indirilebilir link */
  url: string | null;

  /** library_files.name – kullanıcıya gösterilen isim (örn: "Katalog 2025.pdf") */
  name: string;

  size_bytes: number | null;
  mime_type: string | null;

  /**
   * Backend'deki LibraryFileView.tags
   * - library_files.tags_json kolonundan çözümlenmiş dizi
   * - Şu an için locale bağımsız, düz string[] veya null.
   */
  tags: string[] | null;

  display_order: number;
  is_active: 0 | 1;

  created_at: string | Date;
  updated_at: string | Date;

  asset?:
  | {
    bucket: string;
    path: string;
    url: string | null;
    mime: string | null;
  }
  | null;
}

/**
 * Create payload – upsertLibraryFileParentBodySchema ile uyumlu
 * (dosya tarafında i18n yok, sadece parent)
 *
 * asset_id: storage modülünden gelen id
 * file_url: istersen override için manuel URL (çoğunlukla null bırakılabilir)
 */
export interface LibraryFileCreatePayload {
  asset_id: string;
  file_url?: string | null;
  name: string;
  size_bytes?: number | null;
  mime_type?: string | null;

  /** tags_json'a yazılacak etiketler (locale bağımsız) */
  tags?: string[];

  display_order?: number;
  is_active?: BoolLike;
}

/**
 * Update payload – patchLibraryFileParentBodySchema ile uyumlu
 */
export interface LibraryFileUpdatePayload {
  asset_id?: string;
  file_url?: string | null;
  name?: string;
  size_bytes?: number | null;
  mime_type?: string | null;

  /** null → tags_json = NULL, [] → "[]" */
  tags?: string[] | null;

  display_order?: number;
  is_active?: BoolLike;
}
