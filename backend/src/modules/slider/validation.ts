// =============================================================
// FILE: src/modules/slider/validation.ts
// Slider – parent + i18n (kategori pattern'iyle uyumlu)
// =============================================================
import { z } from "zod";

/** Ortak: id param (parent id = slider.id) */
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/** Ortak: idOrSlug param (public detail – slug veya id gibi kullanmak istersen) */
export const idOrSlugParamSchema = z.object({
  idOrSlug: z.string().min(1),
});

/** Public list (is_active dışarıdan alınmaz, hep aktifler) */
export const publicListQuerySchema = z.object({
  locale: z.string().trim().min(2).max(8).default("tr"),
  q: z.string().optional(),
  limit: z.coerce.number().int().min(0).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  sort: z
    .enum(["display_order", "name", "created_at", "updated_at"])
    .default("display_order"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

/**
 * Admin list – kategori pattern'i ile uyumlu:
 *  - locale: opsiyonel (verirsen o dildeki i18n kayıtları, vermezsen tüm diller)
 *  - is_active: opsiyonel (parent slider.is_active)
 */
export const adminListQuerySchema = z.object({
  locale: z.string().trim().min(2).max(8).optional(),
  q: z.string().optional(),
  limit: z.coerce.number().int().min(0).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  sort: z
    .enum(["display_order", "name", "created_at", "updated_at"])
    .default("display_order"),
  order: z.enum(["asc", "desc"]).default("asc"),
  is_active: z.coerce.boolean().optional(),
});

/**
 * Create:
 *  - Parent + i18n tek body içinde (kategori ile aynı pattern)
 *  - locale + (name, slug, description, alt, buttonText, buttonLink) => i18n
 *  - image_url, image_asset_id, featured, is_active, display_order => parent
 */
export const createSchema = z.object({
  locale: z.string().trim().min(2).max(8).default("tr"),

  name: z.string().min(1),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().optional().nullable(),

  image_url: z.string().url().optional().nullable(),
  image_asset_id: z.string().uuid().optional().nullable(),
  alt: z.string().max(255).optional().nullable(),
  buttonText: z.string().max(100).optional().nullable(),
  buttonLink: z.string().max(255).optional().nullable(),

  featured: z.coerce.boolean().optional().default(false),
  is_active: z.coerce.boolean().optional().default(true),

  display_order: z.coerce.number().int().min(0).optional(),
});

/**
 * Update:
 *  - Tamamen partial (kategori gibi)
 *  - locale gönderirsen o dil için i18n upsert (yeni locale yaratma imkanı)
 */
export const updateSchema = createSchema.partial();

/** Reorder (verilen parent id sırasına göre 1..N) */
export const reorderSchema = z.object({
  ids: z.array(z.coerce.number().int().positive()).min(1),
});

/** Toggle/set status (parent slider.is_active) */
export const setStatusSchema = z.object({
  is_active: z.coerce.boolean(),
});

/** ✅ Görsel bağlama/çıkarma (parent slider.image_* alanları) */
export const setImageSchema = z.object({
  /** null/undefined ⇒ görseli kaldır */
  asset_id: z.string().uuid().nullable().optional(),
});

export type PublicListQuery = z.infer<typeof publicListQuerySchema>;
export type AdminListQuery = z.infer<typeof adminListQuerySchema>;
export type CreateBody = z.infer<typeof createSchema>;
export type UpdateBody = z.infer<typeof updateSchema>;
export type SetImageBody = z.infer<typeof setImageSchema>;
