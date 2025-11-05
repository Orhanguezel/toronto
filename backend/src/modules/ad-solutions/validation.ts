import { z } from "zod";

/* ---------------- shared ---------------- */
export const boolLike = z.union([
  z.boolean(),
  z.literal(0), z.literal(1),
  z.literal("0"), z.literal("1"),
  z.literal("true"), z.literal("false"),
]);

/* ---------------- list (public/admin) ---------------- */
export const adSolutionListQuerySchema = z.object({
  order: z.string().optional(),
  sort: z.enum(["created_at", "updated_at", "display_order"]).optional(),
  orderDir: z.enum(["asc", "desc"]).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),

  // filters
  q: z.string().optional(),
  category: z.string().optional(),
  featured: boolLike.optional(),
  is_active: boolLike.optional(),
});
export type AdSolutionListQuery = z.infer<typeof adSolutionListQuerySchema>;

/* ---------------- upsert / patch (entity) ---------------- */
/** Non-i18n alanlar + i18n alanlar birlikte gönderilebilir. */
export const upsertAdSolutionBodySchema = z.object({
  /* i18n alanları */
  name: z.string().min(1).max(255).optional(),
  slug: z
    .string()
    .min(1).max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug sadece küçük harf, rakam ve tire içermelidir")
    .optional(),
  summary: z.string().optional(),
  content: z.string().optional(), // düz HTML veya JSON-string (UI tarafı karar verir)
  image_alt: z.string().max(255).optional(),
  meta_title: z.string().max(255).optional(),
  meta_description: z.string().max(500).optional(),
  /** Locale hedefi (yoksa header’daki req.locale kullanılır) */
  locale: z.string().max(10).nullable().optional(),

  /* non-i18n alanlar */
  category: z.string().min(1).max(64).optional().default("general"),
  featured: boolLike.optional().default(false),
  is_active: boolLike.optional().default(true),
  display_order: z.coerce.number().int().min(0).optional().default(0),

  // ana görsel (legacy + storage)
  featured_image: z.string().url().max(500).nullable().optional(),
  image_url: z.string().url().max(500).nullable().optional(),
  image_asset_id: z.string().length(36).nullable().optional(),
});
export type UpsertAdSolutionBody = z.infer<typeof upsertAdSolutionBodySchema>;

export const patchAdSolutionBodySchema = upsertAdSolutionBodySchema.partial();
export type PatchAdSolutionBody = z.infer<typeof patchAdSolutionBodySchema>;

/* ---------------- images (gallery) ---------------- */
const upsertAdSolutionImageBodyBase = z.object({
  // storage bağı → en az biri UPSERT’te zorunlu
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

/** UPSERT: görüntü referanslarından en az biri gerekli */
export const upsertAdSolutionImageBodySchema = upsertAdSolutionImageBodyBase.superRefine((b, ctx) => {
  if (!b.image_asset_id && !b.image_url) {
    ctx.addIssue({
      code: "custom",
      message: "image_asset_id_or_url_required",
      path: ["image_asset_id"],
    });
  }
});
export type UpsertAdSolutionImageBody = z.infer<typeof upsertAdSolutionImageBodySchema>;

/** PATCH: kısmi — görsel zorunluluğu yok */
export const patchAdSolutionImageBodySchema = upsertAdSolutionImageBodyBase.partial();
export type PatchAdSolutionImageBody = z.infer<typeof patchAdSolutionImageBodySchema>;
