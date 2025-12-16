// src/modules/services/validation.ts
// =============================================================

import { z } from "zod";
import { LOCALES } from "@/core/i18n";

/* ------- shared ------- */
export const boolLike = z.union([
  z.boolean(),
  z.literal(0),
  z.literal(1),
  z.literal("0"),
  z.literal("1"),
  z.literal("true"),
  z.literal("false"),
]);

/* ------- i18n helpers ------- */
const LOCALE_ENUM = z.enum(LOCALES as unknown as [string, ...string[]]);

/* ------- enums ------- */
/**
 * Ensotek service tipleri (seed ile uyumlu):
 *
 *  - maintenance_repair
 *  - modernization
 *  - spare_parts_components
 *  - applications_references
 *  - engineering_support
 *  - production
 *  - other
 */
const SERVICE_TYPES = [
  "maintenance_repair",
  "modernization",
  "spare_parts_components",
  "applications_references",
  "engineering_support",
  "production",
  "other",
] as const;

export const ServiceTypeEnum = z.enum(SERVICE_TYPES);

/* ------- list (public/admin) ------- */
export const serviceListQuerySchema = z.object({
  order: z.string().optional(),
  sort: z
    .enum(["created_at", "updated_at", "display_order"])
    .optional(),
  orderDir: z.enum(["asc", "desc"]).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),

  // filters
  q: z.string().optional(),
  type: ServiceTypeEnum.optional(),

  // category relations
  category_id: z.string().uuid().optional(),
  sub_category_id: z.string().uuid().optional(),

  featured: boolLike.optional(),
  is_active: boolLike.optional(),

  // 🔑 FE’den gelebilen i18n paramları
  locale: LOCALE_ENUM.optional(),
  default_locale: LOCALE_ENUM.optional(),
});
export type ServiceListQuery = z.infer<typeof serviceListQuerySchema>;

/* ------- parent (non-i18n) ------- */

export const upsertServiceParentBodySchema = z.object({
  type: ServiceTypeEnum.optional().default("other"),

  // kategori bağları (categories / sub_categories)
  category_id: z.string().uuid().nullable().optional(),
  sub_category_id: z.string().uuid().nullable().optional(),

  featured: boolLike.optional().default(false),
  is_active: boolLike.optional().default(true),
  display_order: z.coerce.number().int().min(0).optional().default(1),

  // ana görsel (legacy + storage)
  featured_image: z.string().url().max(500).nullable().optional(),
  image_url: z.string().url().max(500).nullable().optional(),
  image_asset_id: z.string().length(36).nullable().optional(),
});
export type UpsertServiceParentBody = z.infer<
  typeof upsertServiceParentBodySchema
>;

export const patchServiceParentBodySchema =
  upsertServiceParentBodySchema.partial();
export type PatchServiceParentBody = z.infer<
  typeof patchServiceParentBodySchema
>;

/* ------- i18n (service) ------- */

export const upsertServiceI18nBodySchema = z.object({
  /** Locale hedefi (yoksa header’daki req.locale kullanılır) */
  locale: LOCALE_ENUM.optional(),

  name: z.string().min(1).max(255).optional(),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "slug sadece küçük harf, rakam ve tire içermelidir",
    )
    .optional(),
  description: z.string().optional(),
  material: z.string().max(255).optional(),
  price: z.string().max(128).optional(),
  includes: z.string().max(255).optional(),
  warranty: z.string().max(128).optional(),
  image_alt: z.string().max(255).optional(),

  // tags + SEO meta
  tags: z.string().max(255).optional(),
  meta_title: z.string().max(255).optional(),
  meta_description: z.string().max(500).optional(),
  meta_keywords: z.string().max(255).optional(),

  /** create: aynı içeriği tüm dillere kopyala? (default: true) */
  replicate_all_locales: z.coerce.boolean().default(true).optional(),
});
export type UpsertServiceI18nBody = z.infer<
  typeof upsertServiceI18nBodySchema
>;

export const patchServiceI18nBodySchema = z.object({
  locale: LOCALE_ENUM.optional(),

  name: z.string().min(1).max(255).optional(),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "slug sadece küçük harf, rakam ve tire içermelidir",
    )
    .optional(),
  description: z.string().optional(),
  material: z.string().max(255).optional(),
  price: z.string().max(128).optional(),
  includes: z.string().max(255).optional(),
  warranty: z.string().max(128).optional(),
  image_alt: z.string().max(255).optional(),

  tags: z.string().max(255).optional(),
  meta_title: z.string().max(255).optional(),
  meta_description: z.string().max(500).optional(),
  meta_keywords: z.string().max(255).optional(),

  /** patch: tüm dillere uygula? (default: false) */
  apply_all_locales: z.coerce.boolean().default(false).optional(),
});
export type PatchServiceI18nBody = z.infer<
  typeof patchServiceI18nBodySchema
>;

/* ------- combined (service) ------- */

export const upsertServiceBodySchema =
  upsertServiceParentBodySchema.merge(upsertServiceI18nBodySchema);
export type UpsertServiceBody = z.infer<typeof upsertServiceBodySchema>;

export const patchServiceBodySchema =
  patchServiceParentBodySchema.merge(patchServiceI18nBodySchema);
export type PatchServiceBody = z.infer<typeof patchServiceBodySchema>;

/* ------- images (gallery) ------- */

/** Base obje → hem upsert hem patch için ortak */
const upsertServiceImageBodyBase = z.object({
  // storage bağ(ı) → en az birisi zorunlu (yalnızca UPSERT’te kontrol edeceğiz)
  image_asset_id: z.string().length(36).nullable().optional(),
  image_url: z.string().url().max(500).nullable().optional(),

  is_active: boolLike.optional().default(true),
  display_order: z.coerce.number().int().min(0).optional().default(0),

  // i18n alanları
  title: z.string().max(255).nullable().optional(),
  alt: z.string().max(255).nullable().optional(),
  caption: z.string().max(500).nullable().optional(),
  locale: LOCALE_ENUM.optional(),

  /** create: tüm dillere kopyala? */
  replicate_all_locales: z.coerce.boolean().default(true).optional(),

  /** patch: tüm dillere uygula? */
  apply_all_locales: z.coerce.boolean().default(false).optional(),
});

/** UPSERT: en az bir görsel referansı şart */
export const upsertServiceImageBodySchema =
  upsertServiceImageBodyBase.superRefine((b, ctx) => {
    if (!b.image_asset_id && !b.image_url) {
      ctx.addIssue({
        code: "custom",
        message: "image_asset_id_or_url_required",
        path: ["image_asset_id"],
      });
    }
  });
export type UpsertServiceImageBody = z.infer<
  typeof upsertServiceImageBodySchema
>;

/** PATCH: kısmi güncelleme, görsel zorunluluğu yok */
export const patchServiceImageBodySchema =
  upsertServiceImageBodyBase.partial();
export type PatchServiceImageBody = z.infer<
  typeof patchServiceImageBodySchema
>;
