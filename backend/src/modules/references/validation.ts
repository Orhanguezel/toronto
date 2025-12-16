// =============================================================
// FILE: src/modules/references/validation.ts
// =============================================================
import { z } from "zod";

export const boolLike = z.union([
  z.boolean(),
  z.literal(0),
  z.literal(1),
  z.literal("0"),
  z.literal("1"),
  z.literal("true"),
  z.literal("false"),
]);

/** Lokal locale listesi (şimdilik tr + en, genişletilebilir) */
export const LOCALES = ["tr", "en"] as const;

/** Locale tipi (buradan export ediyoruz) */
export type Locale = (typeof LOCALES)[number];

/** Locale enum (i18n) */
const LOCALE_ENUM = z.enum(LOCALES);

/** LIST query (public/admin ortak temel) */
export const referencesListQuerySchema = z.object({
  order: z.string().optional(),
  sort: z
    .enum(["created_at", "updated_at", "display_order"])
    .optional(),
  orderDir: z.enum(["asc", "desc"]).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  is_published: boolLike.optional(),
  is_featured: boolLike.optional(),
  q: z.string().optional(),
  slug: z.string().optional(),
  select: z.string().optional(),

  // 🔗 Kategori / alt kategori filtreleri
  category_id: z.string().uuid().optional(),
  sub_category_id: z.string().uuid().optional(),

  // 🔗 Module bazlı filtre (kategori üzerinden: categories.module_key)
  module_key: z.string().optional(),

  // 🔗 Website var/yok
  has_website: boolLike.optional(),

  // 🔗 Listeleme için locale override
  locale: LOCALE_ENUM.optional(),
});

export type ReferencesListQuery = z.infer<
  typeof referencesListQuerySchema
>;

/** PUBLIC list query – is_published zorunlu true olacak, burada param almıyoruz */
export const publicReferencesListQuerySchema =
  referencesListQuerySchema.omit({
    is_published: true,
  });

export type PublicReferencesListQuery = z.infer<
  typeof publicReferencesListQuerySchema
>;

/** Parent (dil-bağımsız) create/update */
export const upsertReferenceParentBodySchema = z.object({
  is_published: boolLike.optional().default(false),
  is_featured: boolLike.optional().default(false),
  display_order: z.coerce.number().int().min(0).optional(),

  featured_image: z.string().url().nullable().optional(),
  featured_image_asset_id: z.string().length(36).nullable().optional(),

  website_url: z.string().max(500).url().nullable().optional(),

  // 🔗 Kategori bağları
  category_id: z.string().uuid().nullable().optional(),
  sub_category_id: z.string().uuid().nullable().optional(),
});

export type UpsertReferenceParentBody = z.infer<
  typeof upsertReferenceParentBodySchema
>;

export const patchReferenceParentBodySchema =
  upsertReferenceParentBodySchema.partial();

export type PatchReferenceParentBody = z.infer<
  typeof patchReferenceParentBodySchema
>;

/** i18n create/update (title/slug/summary/content/meta/alt) */
export const upsertReferenceI18nBodySchema = z.object({
  locale: LOCALE_ENUM.optional(),
  title: z.string().min(1).max(255).trim(),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "slug sadece küçük harf, rakam ve tire içermelidir",
    )
    .trim(),
  /** Özet: LONGTEXT ama biz metinsel (plain) kullanıyoruz */
  summary: z.string().nullable().optional(),
  /** İçerik: HTML veya {"html":"..."} JSON string (packContent ile sarılıyor) */
  content: z.string().min(1),

  featured_image_alt: z.string().max(255).nullable().optional(),
  meta_title: z.string().max(255).nullable().optional(),
  meta_description: z.string().max(500).nullable().optional(),
});

export type UpsertReferenceI18nBody = z.infer<
  typeof upsertReferenceI18nBodySchema
>;

export const patchReferenceI18nBodySchema = z.object({
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
  summary: z.string().nullable().optional(),
  content: z.string().min(1).optional(),
  featured_image_alt: z.string().max(255).nullable().optional(),
  meta_title: z.string().max(255).nullable().optional(),
  meta_description: z.string().max(500).nullable().optional(),
});

export type PatchReferenceI18nBody = z.infer<
  typeof patchReferenceI18nBodySchema
>;

/** Geriye dönük: tek body (parent + i18n birlikte) */
export const upsertReferenceBodySchema =
  upsertReferenceI18nBodySchema.extend({
    is_published: boolLike.optional().default(false),
    is_featured: boolLike.optional().default(false),
    display_order: z.coerce.number().int().min(0).optional(),

    featured_image: z.string().url().nullable().optional(),
    featured_image_asset_id: z.string().length(36).nullable().optional(),

    category_id: z.string().uuid().nullable().optional(),
    sub_category_id: z.string().uuid().nullable().optional(),
    website_url: z.string().max(500).url().nullable().optional(),
  });

export type UpsertReferenceBody = z.infer<
  typeof upsertReferenceBodySchema
>;

export const patchReferenceBodySchema =
  patchReferenceI18nBodySchema.extend({
    is_published: boolLike.optional(),
    is_featured: boolLike.optional(),
    display_order: z.coerce.number().int().min(0).optional(),

    featured_image: z.string().url().nullable().optional(),
    featured_image_asset_id: z.string().length(36).nullable().optional(),

    category_id: z.string().uuid().nullable().optional(),
    sub_category_id: z.string().uuid().nullable().optional(),
    website_url: z.string().max(500).url().nullable().optional(),
  });

export type PatchReferenceBody = z.infer<
  typeof patchReferenceBodySchema
>;

/** BY-SLUG params */
export const referenceBySlugParamsSchema = z.object({
  slug: z.string().min(1),
});

/** BY-SLUG query (sadece locale override) */
export const referenceBySlugQuerySchema = z.object({
  locale: LOCALE_ENUM.optional(),
});

export type ReferenceBySlugParams = z.infer<
  typeof referenceBySlugParamsSchema
>;
export type ReferenceBySlugQuery = z.infer<
  typeof referenceBySlugQuerySchema
>;
