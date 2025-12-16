// =============================================================
// FILE: src/modules/subcategories/validation.ts
// =============================================================
import { z } from "zod";

const emptyToNull = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (v === "" ? null : v), schema);

/**
 * FE'den gelebilecek bütün boolean varyantlarını kabul et
 * (true/false, 0/1, "0"/"1", "true"/"false")
 */
export const boolLike = z.union([
  z.boolean(),
  z.literal(0),
  z.literal(1),
  z.literal("0"),
  z.literal("1"),
  z.literal("true"),
  z.literal("false"),
]);

const baseSubCategorySchema = z
  .object({
    id: z.string().uuid().optional(),
    category_id: z.string().uuid(),

    // 🌍 Çok dilli – yoksa "tr"
    locale: z
      .string()
      .min(2)
      .max(8)
      .default("tr"),

    name: z.string().min(1).max(255),
    slug: z.string().min(1).max(255),

    description: emptyToNull(z.string().optional().nullable()),
    image_url: emptyToNull(z.string().url().optional().nullable()),
    alt: emptyToNull(z.string().max(255).optional().nullable()),
    icon: emptyToNull(z.string().max(100).optional().nullable()),

    is_active: boolLike.optional(),
    is_featured: boolLike.optional(),
    display_order: z.coerce.number().int().min(0).optional(),

    // FE’de olabilir; DB’de yok (göz ardı edilir)
    seo_title: emptyToNull(z.string().max(255).optional().nullable()),
    seo_description: emptyToNull(z.string().max(500).optional().nullable()),
  })
  .passthrough();

/**
 * CREATE şeması
 */
export const subCategoryCreateSchema = baseSubCategorySchema;

/**
 * UPDATE şeması (PATCH / PUT)
 *  - partial: tüm alanlar opsiyonel
 *  - Boş PATCH → no-op (categories ile uyumlu)
 */
export const subCategoryUpdateSchema = baseSubCategorySchema.partial();

export type SubCategoryCreateInput = z.infer<typeof subCategoryCreateSchema>;
export type SubCategoryUpdateInput = z.infer<typeof subCategoryUpdateSchema>;

/** ✅ Storage asset ile alt kategori görselini ayarlama/silme (+ alt) */
export const subCategorySetImageSchema = z
  .object({
    /** null/undefined ⇒ görseli kaldır */
    asset_id: z.string().uuid().nullable().optional(),
    /** alt gelirse güncellenir; null/"" ⇒ alt temizlenir */
    alt: emptyToNull(z.string().max(255).optional().nullable()),
  })
  .strict();

export type SubCategorySetImageInput = z.infer<
  typeof subCategorySetImageSchema
>;
