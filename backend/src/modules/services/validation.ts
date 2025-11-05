import { z } from "zod";

/* ------- shared ------- */
export const boolLike = z.union([
  z.boolean(),
  z.literal(0), z.literal(1),
  z.literal("0"), z.literal("1"),
  z.literal("true"), z.literal("false"),
]);

/* ------- enums ------- */
export const ServiceTypeEnum = z.enum(["gardening", "soil", "other"]);

/* ------- list (public/admin) ------- */
export const serviceListQuerySchema = z.object({
  order: z.string().optional(),
  sort: z.enum(["created_at", "updated_at", "display_order"]).optional(),
  orderDir: z.enum(["asc", "desc"]).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),

  // filters
  q: z.string().optional(),
  type: ServiceTypeEnum.optional(),
  category: z.string().optional(),
  featured: boolLike.optional(),
  is_active: boolLike.optional(),
});
export type ServiceListQuery = z.infer<typeof serviceListQuerySchema>;

/* ------- upsert / patch (service) ------- */
/** Non-i18n alanlar + i18n alanlar birlikte gönderilebilir. */
export const upsertServiceBodySchema = z.object({
  /* i18n alanları */
  name: z.string().min(1).max(255).optional(),
  slug: z
    .string()
    .min(1).max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug sadece küçük harf, rakam ve tire içermelidir")
    .optional(),
  description: z.string().optional(),
  material: z.string().max(255).optional(),
  price: z.string().max(128).optional(),
  includes: z.string().max(255).optional(),
  warranty: z.string().max(128).optional(),
  image_alt: z.string().max(255).optional(),

  /** Locale hedefi (yoksa header’daki req.locale kullanılır) */
  locale: z.string().max(10).nullable().optional(),

  /* non-i18n alanlar */
  type: ServiceTypeEnum.optional().default("other"),
  category: z.string().min(1).max(64).optional().default("general"),
  featured: boolLike.optional().default(false),
  is_active: boolLike.optional().default(true),
  display_order: z.coerce.number().int().min(0).optional().default(1),

  // ana görsel (legacy + storage)
  featured_image: z.string().url().max(500).nullable().optional(),
  image_url: z.string().url().max(500).nullable().optional(),
  image_asset_id: z.string().length(36).nullable().optional(),

  // Gardening
  area: z.string().max(64).nullable().optional(),
  duration: z.string().max(64).nullable().optional(),
  maintenance: z.string().max(64).nullable().optional(),
  season: z.string().max(64).nullable().optional(),

  // Soil
  soil_type: z.string().max(128).nullable().optional(),
  thickness: z.string().max(64).nullable().optional(),
  equipment: z.string().max(128).nullable().optional(),
});
export type UpsertServiceBody = z.infer<typeof upsertServiceBodySchema>;

export const patchServiceBodySchema = upsertServiceBodySchema.partial();
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
  locale: z.string().max(10).nullable().optional(),
});

/** UPSERT: en az bir görsel referansı şart */
export const upsertServiceImageBodySchema = upsertServiceImageBodyBase.superRefine((b, ctx) => {
  if (!b.image_asset_id && !b.image_url) {
    ctx.addIssue({
      code: "custom",
      message: "image_asset_id_or_url_required",
      path: ["image_asset_id"],
    });
  }
});
export type UpsertServiceImageBody = z.infer<typeof upsertServiceImageBodySchema>;

/** PATCH: kısmi güncelleme, görsel zorunluluğu yok */
export const patchServiceImageBodySchema = upsertServiceImageBodyBase.partial();
export type PatchServiceImageBody = z.infer<typeof patchServiceImageBodySchema>;
