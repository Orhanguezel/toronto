import { z } from "zod";
import { LOCALES } from "@/core/i18n";

export const boolLike = z.union([
  z.boolean(),
  z.literal(0), z.literal(1),
  z.literal("0"), z.literal("1"),
  z.literal("true"), z.literal("false"),
]);

/** LIST query (public/admin ortak) */
export const customPageListQuerySchema = z.object({
  order: z.string().optional(),
  sort: z.enum(["created_at", "updated_at"]).optional(),
  orderDir: z.enum(["asc", "desc"]).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  is_published: boolLike.optional(),
  q: z.string().optional(),
  slug: z.string().optional(),
  select: z.string().optional(),
});
export type CustomPageListQuery = z.infer<typeof customPageListQuerySchema>;

/** Parent (dil-bağımsız) create/update */
export const upsertCustomPageParentBodySchema = z.object({
  is_published: boolLike.optional().default(false),
  /** Eski/serbest URL (opsiyonel) */
  featured_image: z.string().url().nullable().optional(),
  /** Storage bağı: asset id (opsiyonel) */
  featured_image_asset_id: z.string().length(36).nullable().optional(),
});
export type UpsertCustomPageParentBody = z.infer<typeof upsertCustomPageParentBodySchema>;
export const patchCustomPageParentBodySchema = upsertCustomPageParentBodySchema.partial();
export type PatchCustomPageParentBody = z.infer<typeof patchCustomPageParentBodySchema>;

/** i18n create/update (title/slug/content/meta/alt) */
const LOCALE_ENUM = z.enum(LOCALES as unknown as [string, ...string[]]);

export const upsertCustomPageI18nBodySchema = z.object({
  locale: LOCALE_ENUM.optional(),
  title: z.string().min(1).max(255).trim(),
  slug: z
    .string()
    .min(1).max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug sadece küçük harf, rakam ve tire içermelidir")
    .trim(),
  /** düz HTML (repo.packContent ile {"html":"..."}’a sarılır) */
  content: z.string().min(1),

  /** Görsel alt metni (çeviri) */
  featured_image_alt: z.string().max(255).nullable().optional(),

  meta_title: z.string().max(255).nullable().optional(),
  meta_description: z.string().max(500).nullable().optional(),
});
export type UpsertCustomPageI18nBody = z.infer<typeof upsertCustomPageI18nBodySchema>;

export const patchCustomPageI18nBodySchema = z.object({
  locale: LOCALE_ENUM.optional(),
  title: z.string().min(1).max(255).trim().optional(),
  slug: z
    .string()
    .min(1).max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug sadece küçük harf, rakam ve tire içermelidir")
    .trim()
    .optional(),
  content: z.string().min(1).optional(),

  featured_image_alt: z.string().max(255).nullable().optional(),

  meta_title: z.string().max(255).nullable().optional(),
  meta_description: z.string().max(500).nullable().optional(),
});
export type PatchCustomPageI18nBody = z.infer<typeof patchCustomPageI18nBodySchema>;

/** Geriye dönük: tek body (parent + i18n birlikte) */
export const upsertCustomPageBodySchema = upsertCustomPageI18nBodySchema.extend({
  is_published: boolLike.optional().default(false),
  featured_image: z.string().url().nullable().optional(),
  featured_image_asset_id: z.string().length(36).nullable().optional(),
});
export type UpsertCustomPageBody = z.infer<typeof upsertCustomPageBodySchema>;

export const patchCustomPageBodySchema = patchCustomPageI18nBodySchema.extend({
  is_published: boolLike.optional(),
  featured_image: z.string().url().nullable().optional(),
  featured_image_asset_id: z.string().length(36).nullable().optional(),
});
export type PatchCustomPageBody = z.infer<typeof patchCustomPageBodySchema>;
