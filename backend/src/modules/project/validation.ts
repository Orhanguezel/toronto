import { z } from "zod";
import { LOCALES } from "@/core/i18n";

export const boolLike = z.union([
  z.boolean(),
  z.literal(0), z.literal(1),
  z.literal("0"), z.literal("1"),
  z.literal("true"), z.literal("false"),
]);

/* ================= LIST QUERY ================= */
export const projectListQuerySchema = z.object({
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
export type ProjectListQuery = z.infer<typeof projectListQuerySchema>;

/* ================= PARENT (projects) ================= */
export const upsertProjectParentBodySchema = z.object({
  is_published: boolLike.optional().default(false),
  is_featured: boolLike.optional().default(false),
  display_order: z.coerce.number().int().min(0).optional(),

  featured_image: z.string().url().nullable().optional(),
  featured_image_asset_id: z.string().length(36).nullable().optional(),

  demo_url: z.string().url().nullable().optional(),
  repo_url: z.string().url().nullable().optional(),

  // array of strings; DB'de JSON-string
  techs: z.array(z.string().min(1).max(100)).max(100).optional(),
});
export type UpsertProjectParentBody = z.infer<typeof upsertProjectParentBodySchema>;

export const patchProjectParentBodySchema = upsertProjectParentBodySchema.partial();
export type PatchProjectParentBody = z.infer<typeof patchProjectParentBodySchema>;

/* ================= I18N (projects_i18n) ================= */
const LOCALE_ENUM = z.enum(LOCALES as unknown as [string, ...string[]]);

export const upsertProjectI18nBodySchema = z.object({
  locale: LOCALE_ENUM.optional(),
  title: z.string().min(1).max(255).trim(),
  slug: z
    .string()
    .min(1).max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug sadece küçük harf, rakam ve tire içermelidir")
    .trim(),

  // kısa özet (düz metin)
  summary: z.string().max(4000).nullable().optional(),

  // zengin içerik (JSON-string {"html": ...} olarak saklanacak)
  content: z.string().min(1),

  featured_image_alt: z.string().max(255).nullable().optional(),
  meta_title: z.string().max(255).nullable().optional(),
  meta_description: z.string().max(500).nullable().optional(),
});
export type UpsertProjectI18nBody = z.infer<typeof upsertProjectI18nBodySchema>;

export const patchProjectI18nBodySchema = z.object({
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
});
export type PatchProjectI18nBody = z.infer<typeof patchProjectI18nBodySchema>;

/* ================= COMBINED (g-backward friendly) ================= */
export const upsertProjectBodySchema = upsertProjectParentBodySchema.merge(upsertProjectI18nBodySchema);
export type UpsertProjectBody = z.infer<typeof upsertProjectBodySchema>;

export const patchProjectBodySchema = patchProjectParentBodySchema.merge(patchProjectI18nBodySchema);
export type PatchProjectBody = z.infer<typeof patchProjectBodySchema>;

/* ================= GALLERY: PARENT (project_images) ================= */
export const upsertProjectImageParentBodySchema = z.object({
  asset_id: z.string().length(36), // storage asset id
  image_url: z.string().url().nullable().optional(), // legacy/back-compat
  display_order: z.coerce.number().int().min(0).optional(),
  is_active: boolLike.optional().default(true),
});
export type UpsertProjectImageParentBody = z.infer<typeof upsertProjectImageParentBodySchema>;

export const patchProjectImageParentBodySchema = upsertProjectImageParentBodySchema.partial();
export type PatchProjectImageParentBody = z.infer<typeof patchProjectImageParentBodySchema>;

/* ================= GALLERY: I18N (project_images_i18n) ================= */
export const upsertProjectImageI18nBodySchema = z.object({
  locale: LOCALE_ENUM.optional(),
  alt: z.string().max(255).nullable().optional(),
  caption: z.string().max(1000).nullable().optional(),
});
export type UpsertProjectImageI18nBody = z.infer<typeof upsertProjectImageI18nBodySchema>;

export const patchProjectImageI18nBodySchema = upsertProjectImageI18nBodySchema.partial();
export type PatchProjectImageI18nBody = z.infer<typeof patchProjectImageI18nBodySchema>;

/* ================= GALLERY: COMBINED ================= */
export const upsertProjectImageBodySchema = upsertProjectImageParentBodySchema.merge(upsertProjectImageI18nBodySchema);
export type UpsertProjectImageBody = z.infer<typeof upsertProjectImageBodySchema>;

export const patchProjectImageBodySchema = patchProjectImageParentBodySchema.merge(patchProjectImageI18nBodySchema);
export type PatchProjectImageBody = z.infer<typeof patchProjectImageBodySchema>;
