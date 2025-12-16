// =============================================================
// FILE: src/modules/categories/validation.ts
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

/**
 * NOT: DB artık base + i18n (categories + category_i18n)
 * ama API input'unda name/slug/locale almaya devam ediyoruz.
 * Admin tarafında bunları base ve i18n tablosuna paylaştırıyoruz.
 */
const baseCategorySchema = z
  .object({
    id: z.string().uuid().optional(),

    /** Çoklu dil (i18n tablosu için) */
    locale: z
      .string()
      .min(2)
      .max(8)
      .default("tr"),

    /** Hangi modül / domain için bu kategori? */
    module_key: z
      .string()
      .min(1)
      .max(64)
      .default("general"),

    /** i18n alanları */
    name: z.string().min(1).max(255),
    slug: z.string().min(1).max(255),

    description: emptyToNull(z.string().optional().nullable()),

    /** Base tablo görsel alanları */
    image_url: emptyToNull(z.string().url().optional().nullable()),
    alt: emptyToNull(z.string().max(255).optional().nullable()),

    icon: emptyToNull(z.string().max(255).optional().nullable()),

    // create/update tarafında boolLike ile gelen değeri
    // olduğu gibi (true/false / "1"/"0" vs) kabul ediyoruz;
    // DB update sırasında zaten bool'a cast edilecek.
    is_active: boolLike.optional(),
    is_featured: boolLike.optional(),
    display_order: z.coerce.number().int().min(0).optional(),

    // FE’den gelebilecek ama DB’de olmayan alanları tolere et
    seo_title: emptyToNull(z.string().max(255).optional().nullable()),
    seo_description: emptyToNull(z.string().max(500).optional().nullable()),
  })
  .passthrough();

/**
 * CREATE şeması
 */
export const categoryCreateSchema = baseCategorySchema.superRefine(
  (data, ctx) => {
    // Şu an için parent_id bu tabloda yok; ayrı alt kategori modülü var.
    if ("parent_id" in (data as Record<string, unknown>)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "parent_id_not_supported_on_categories",
        path: ["parent_id"],
      });
    }
  },
);

/**
 * UPDATE şeması (PATCH / PUT)
 *  - partial: tüm alanlar opsiyonel
 *  - parent_id hâlâ yasak
 *  - ❌ no_fields_to_update kontrolünü kaldırdık (boş PATCH no-op olsun)
 */
export const categoryUpdateSchema = baseCategorySchema
  .partial()
  .superRefine((data, ctx) => {
    if ("parent_id" in (data as Record<string, unknown>)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "parent_id_not_supported_on_categories",
        path: ["parent_id"],
      });
    }
  });

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;

/** ✅ Storage asset ile kategori görselini ayarlama/silme (+ alt) */
export const categorySetImageSchema = z
  .object({
    /** null/undefined ⇒ görseli kaldır */
    asset_id: z.string().uuid().nullable().optional(),
    /** alt gelirse güncellenir; null/"" ⇒ alt temizlenir */
    alt: emptyToNull(z.string().max(255).optional().nullable()),
  })
  .strict();

export type CategorySetImageInput = z.infer<typeof categorySetImageSchema>;
