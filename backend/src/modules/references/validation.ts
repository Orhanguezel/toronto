import { z } from "zod";
import { LOCALES } from "@/core/i18n";

export const boolLike = z.union([
  z.boolean(),
  z.literal(0), z.literal(1),
  z.literal("0"), z.literal("1"),
  z.literal("true"), z.literal("false"),
]);

/* ============== LIST QUERY (public/admin) ============== */
export const referenceListQuerySchema = z.object({
  order: z.string().optional(),
  sort: z.enum(["created_at", "updated_at", "display_order"]).optional(),
  orderDir: z.enum(["asc", "desc"]).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),

  is_published: boolLike.optional(),
  is_featured: boolLike.optional(),

  q: z.string().optional(),
  slug: z.string().optional(),
  select: z.string().optional(),
});
export type ReferenceListQuery = z.infer<typeof referenceListQuerySchema>;

/* ============== PARENT (references) ============== */
export const upsertReferenceParentBodySchema = z.object({
  is_published: boolLike.optional().default(false),
  is_featured: boolLike.optional().default(false),
  display_order: z.coerce.number().int().min(0).optional(),

  featured_image: z.string().url().nullable().optional(),
  featured_image_asset_id: z.string().length(36).nullable().optional(),
  website_url: z.string().url().nullable().optional(),
});
export type UpsertReferenceParentBody = z.infer<typeof upsertReferenceParentBodySchema>;

export const patchReferenceParentBodySchema = upsertReferenceParentBodySchema.partial();
export type PatchReferenceParentBody = z.infer<typeof patchReferenceParentBodySchema>;

/* ============== I18N (references_i18n) ============== */
const LOCALE_ENUM = z.enum(LOCALES as unknown as [string, ...string[]]);

export const upsertReferenceI18nBodySchema = z.object({
  locale: LOCALE_ENUM.optional(),
  title: z.string().min(1).max(255).trim(),
  slug: z
    .string()
    .min(1).max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug sadece küçük harf, rakam ve tire içermelidir")
    .trim(),

  // kısa özet (opsiyonel, düz metin)
  summary: z.string().max(4000).nullable().optional(),

  // zengin içerik (JSON-string {"html": ...} olarak saklanacak)
  content: z.string().min(1),

  featured_image_alt: z.string().max(255).nullable().optional(),
  meta_title: z.string().max(255).nullable().optional(),
  meta_description: z.string().max(500).nullable().optional(),

  /** create: aynı içeriği tüm dillere kopyala? (default: true) */
  replicate_all_locales: z.coerce.boolean().default(true).optional(),
});
export type UpsertReferenceI18nBody = z.infer<typeof upsertReferenceI18nBodySchema>;

export const patchReferenceI18nBodySchema = z.object({
  locale: LOCALE_ENUM.optional(),
  title: z.string().min(1).max(255).trim().optional(),
  slug: z
    .string()
    .min(1).max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug sadece küçük harf, rakam ve tire içermelidir")
    .trim()
    .optional(),
  summary: z.string().max(4000).nullable().optional(),
  content: z.string().min(1).optional(),
  featured_image_alt: z.string().max(255).nullable().optional(),
  meta_title: z.string().max(255).nullable().optional(),
  meta_description: z.string().max(500).nullable().optional(),

  /** patch: tüm dillere uygula? (default: false) */
  apply_all_locales: z.coerce.boolean().default(false).optional(),
});
export type PatchReferenceI18nBody = z.infer<typeof patchReferenceI18nBodySchema>;

/* ============== COMBINED (kolay kullanım) ============== */
export const upsertReferenceBodySchema = upsertReferenceParentBodySchema.merge(upsertReferenceI18nBodySchema);
export type UpsertReferenceBody = z.infer<typeof upsertReferenceBodySchema>;

export const patchReferenceBodySchema = patchReferenceParentBodySchema.merge(patchReferenceI18nBodySchema);
export type PatchReferenceBody = z.infer<typeof patchReferenceBodySchema>;

/* ============== GALLERY: PARENT (reference_images) ============== */
export const upsertReferenceImageParentBodySchema = z.object({
  asset_id: z.string().length(36), // storage asset id
  image_url: z.string().url().nullable().optional(), // legacy/back-compat
  display_order: z.coerce.number().int().min(0).optional(),
  is_active: boolLike.optional().default(true),
});
export type UpsertReferenceImageParentBody = z.infer<typeof upsertReferenceImageParentBodySchema>;

export const patchReferenceImageParentBodySchema = upsertReferenceImageParentBodySchema.partial();
export type PatchReferenceImageParentBody = z.infer<typeof patchReferenceImageParentBodySchema>;

/* ============== GALLERY: I18N (reference_images_i18n) ============== */
export const upsertReferenceImageI18nBodySchema = z.object({
  locale: LOCALE_ENUM.optional(),
  alt: z.string().max(255).nullable().optional(),
  caption: z.string().max(1000).nullable().optional(),

  /** create: tüm dillere çoğalt (default: true) */
  replicate_all_locales: z.coerce.boolean().default(true).optional(),
});
export type UpsertReferenceImageI18nBody = z.infer<typeof upsertReferenceImageI18nBodySchema>;

export const patchReferenceImageI18nBodySchema = z.object({
  locale: LOCALE_ENUM.optional(),
  alt: z.string().max(255).nullable().optional(),
  caption: z.string().max(1000).nullable().optional(),

  /** patch: tüm dillere uygula (default: false) */
  apply_all_locales: z.coerce.boolean().default(false).optional(),
});
export type PatchReferenceImageI18nBody = z.infer<typeof patchReferenceImageI18nBodySchema>;

/* ============== GALLERY: COMBINED ============== */
export const upsertReferenceImageBodySchema = upsertReferenceImageParentBodySchema.merge(upsertReferenceImageI18nBodySchema);
export type UpsertReferenceImageBody = z.infer<typeof upsertReferenceImageBodySchema>;

export const patchReferenceImageBodySchema = patchReferenceImageParentBodySchema.merge(patchReferenceImageI18nBodySchema);
export type PatchReferenceImageBody = z.infer<typeof patchReferenceImageBodySchema>;
