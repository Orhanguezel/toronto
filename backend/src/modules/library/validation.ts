// src/modules/library/validation.ts
// =============================================================

import { z } from "zod";
import { LOCALES } from "@/core/i18n";

export const boolLike = z.union([
  z.boolean(),
  z.literal(0),
  z.literal(1),
  z.literal("0"),
  z.literal("1"),
  z.literal("true"),
  z.literal("false"),
]);

// Ortak locale enum
const LOCALE_ENUM = z.enum(LOCALES as unknown as [string, ...string[]]);

/* ============== LIST QUERY (public/admin) ============== */

export const libraryListQuerySchema = z.object({
  order: z.string().optional(),
  sort: z
    .enum([
      "created_at",
      "updated_at",
      "published_at",
      "display_order",
      "views",
      "download_count",
    ])
    .optional(),
  orderDir: z.enum(["asc", "desc"]).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),

  is_published: boolLike.optional(),
  is_active: boolLike.optional(),

  q: z.string().optional(),
  slug: z.string().optional(),
  select: z.string().optional(),

  // 🔗 Kategori / alt kategori filtreleri
  category_id: z.string().uuid().optional(),
  sub_category_id: z.string().uuid().optional(),

  // 🔗 Kategorinin module_key üzerinden filtre
  module_key: z.string().max(100).optional(),

  // Yazar filtresi
  author: z.string().max(255).optional(),

  // Yayın tarihi filtreleri
  published_before: z.string().datetime().optional(),
  published_after: z.string().datetime().optional(),

  // 🔗 Listeleme için locale override (admin tarafı)
  locale: LOCALE_ENUM.optional(),
});
export type LibraryListQuery = z.infer<typeof libraryListQuerySchema>;

/** PUBLIC list query – is_published/is_active dışarıdan alınmıyor */
export const publicLibraryListQuerySchema =
  libraryListQuerySchema.omit({
    is_published: true,
    is_active: true,
  });

export type PublicLibraryListQuery = z.infer<
  typeof publicLibraryListQuerySchema
>;

/* ============== PARENT (library) ============== */

export const upsertLibraryParentBodySchema = z.object({
  is_published: boolLike.optional().default(false),
  is_active: boolLike.optional().default(true),
  display_order: z.coerce.number().int().min(0).optional(),

  // library.tags_json
  tags: z.array(z.string().max(100)).max(100).optional(),

  // 🔗 Kategori bağları
  category_id: z.string().uuid().nullable().optional(),
  sub_category_id: z.string().uuid().nullable().optional(),

  author: z.string().max(255).nullable().optional(),

  published_at: z
    .string()
    .datetime()
    .nullable()
    .optional(),
});
export type UpsertLibraryParentBody = z.infer<
  typeof upsertLibraryParentBodySchema
>;

export const patchLibraryParentBodySchema =
  upsertLibraryParentBodySchema.partial();
export type PatchLibraryParentBody = z.infer<
  typeof patchLibraryParentBodySchema
>;

/* ============== I18N (library_i18n) ============== */

// LOCALE_ENUM yukarıda tanımlı

// 🧩 Önemli: i18n alanları opsiyonel.
// İstersen hiç title/slug/content göndermezsin => sadece parent kayıt oluşur.
export const upsertLibraryI18nBodySchema = z.object({
  locale: LOCALE_ENUM.optional(),

  title: z
    .string()
    .min(1)
    .max(255)
    .trim()
    .optional(),

  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "slug sadece küçük harf, rakam ve tire içermelidir",
    )
    .trim()
    .optional(),

  summary: z.string().max(4000).nullable().optional(),

  // zengin içerik (JSON-string {"html": ...} olarak saklanacak) – opsiyonel
  content: z.string().min(1).optional(),

  meta_title: z.string().max(255).nullable().optional(),
  meta_description: z.string().max(500).nullable().optional(),

  /** create: aynı içeriği tüm dillere kopyala? (default: true) */
  replicate_all_locales: z.coerce.boolean().default(true).optional(),
});
export type UpsertLibraryI18nBody = z.infer<
  typeof upsertLibraryI18nBodySchema
>;

export const patchLibraryI18nBodySchema = z.object({
  locale: LOCALE_ENUM.optional(),
  title: z.string().min(1).max(255).trim().optional(),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "slug sadece küçük harf, rakam ve tire içermelidir",
    )
    .trim()
    .optional(),
  summary: z.string().max(4000).nullable().optional(),
  content: z.string().min(1).optional(),
  meta_title: z.string().max(255).nullable().optional(),
  meta_description: z.string().max(500).nullable().optional(),

  /** patch: tüm dillere uygula? (default: false) */
  apply_all_locales: z.coerce.boolean().default(false).optional(),
});
export type PatchLibraryI18nBody = z.infer<
  typeof patchLibraryI18nBodySchema
>;

/* ============== COMBINED (kolay kullanım) ============== */

export const upsertLibraryBodySchema =
  upsertLibraryParentBodySchema.merge(upsertLibraryI18nBodySchema);
export type UpsertLibraryBody = z.infer<typeof upsertLibraryBodySchema>;

export const patchLibraryBodySchema =
  patchLibraryParentBodySchema.merge(patchLibraryI18nBodySchema);
export type PatchLibraryBody = z.infer<typeof patchLibraryBodySchema>;

/* ============== GALLERY: IMAGES PARENT (library_images) ============== */

export const upsertLibraryImageParentBodySchema = z.object({
  asset_id: z.string().length(36),
  image_url: z.string().url().nullable().optional(),
  thumb_url: z.string().url().nullable().optional(),
  webp_url: z.string().url().nullable().optional(),
  display_order: z.coerce.number().int().min(0).optional(),
  is_active: boolLike.optional().default(true),
});
export type UpsertLibraryImageParentBody = z.infer<
  typeof upsertLibraryImageParentBodySchema
>;

export const patchLibraryImageParentBodySchema =
  upsertLibraryImageParentBodySchema.partial();
export type PatchLibraryImageParentBody = z.infer<
  typeof patchLibraryImageParentBodySchema
>;

/* ============== GALLERY: IMAGES I18N ============== */

export const upsertLibraryImageI18nBodySchema = z.object({
  locale: LOCALE_ENUM.optional(),
  alt: z.string().max(255).nullable().optional(),
  caption: z.string().max(1000).nullable().optional(),

  replicate_all_locales: z.coerce.boolean().default(true).optional(),
});
export type UpsertLibraryImageI18nBody = z.infer<
  typeof upsertLibraryImageI18nBodySchema
>;

export const patchLibraryImageI18nBodySchema = z.object({
  locale: LOCALE_ENUM.optional(),
  alt: z.string().max(255).nullable().optional(),
  caption: z.string().max(1000).nullable().optional(),

  apply_all_locales: z.coerce.boolean().default(false).optional(),
});
export type PatchLibraryImageI18nBody = z.infer<
  typeof patchLibraryImageI18nBodySchema
>;

/* ============== GALLERY: IMAGES COMBINED ============== */

export const upsertLibraryImageBodySchema =
  upsertLibraryImageParentBodySchema.merge(
    upsertLibraryImageI18nBodySchema,
  );
export type UpsertLibraryImageBody = z.infer<
  typeof upsertLibraryImageBodySchema
>;

export const patchLibraryImageBodySchema =
  patchLibraryImageParentBodySchema.merge(
    patchLibraryImageI18nBodySchema,
  );
export type PatchLibraryImageBody = z.infer<
  typeof patchLibraryImageBodySchema
>;

/* ============== FILES: PARENT (library_files) ============== */

export const upsertLibraryFileParentBodySchema = z.object({
  asset_id: z.string().length(36),
  file_url: z.string().url().nullable().optional(),
  name: z.string().min(1).max(255),
  size_bytes: z.coerce.number().int().min(0).nullable().optional(),
  mime_type: z.string().max(255).nullable().optional(),

  // library_files.tags_json
  tags: z.array(z.string().max(100)).max(100).optional(),

  display_order: z.coerce.number().int().min(0).optional(),
  is_active: boolLike.optional().default(true),
});
export type UpsertLibraryFileParentBody = z.infer<
  typeof upsertLibraryFileParentBodySchema
>;

export const patchLibraryFileParentBodySchema =
  upsertLibraryFileParentBodySchema
    .omit({ name: true }) // name opsiyonel olsun
    .extend({
      name: z.string().min(1).max(255).optional(),
      // patch’te null ile temizleme desteği
      tags: z.array(z.string().max(100)).max(100).nullable().optional(),
    });
export type PatchLibraryFileParentBody = z.infer<
  typeof patchLibraryFileParentBodySchema
>;
