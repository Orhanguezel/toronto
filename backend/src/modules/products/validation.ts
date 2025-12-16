// =============================================================
// FILE: src/modules/products/validation.ts  (LOCALE DESTEKLİ DTO)
// =============================================================
import { z } from "zod";

/* ----------------- helpers ----------------- */
export const emptyToNull = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (v === "" ? null : v), schema);

export const boolLike = z.union([
  z.boolean(),
  z.literal(0),
  z.literal(1),
  z.literal("0"),
  z.literal("1"),
  z.literal("true"),
  z.literal("false"),
]);

// ❗ Storage asset ID'leri için (uuid'e zorlamıyoruz)
const assetId = z.string().min(1).max(64);

// ❗ Admin tarafında client'tan gelen id alanları için (FAQ, SPEC vs.)
//    Eski verilerde "1", "2" gibi değerler olabildiği için uuid zorlamıyoruz.
const entityId = z.preprocess(
  (v) => {
    if (v == null || v === "") return undefined;
    return String(v);
  },
  z.string().max(64),
);

/* ----------------- PRODUCT ----------------- */
/**
 * NOT:
 * - Base tablo: products
 *   - category_id, sub_category_id, price, images, storage_asset_id, stock, vs.
 * - I18N tablo: product_i18n
 *   - locale, title, slug, description, alt, tags, specifications, meta_title, meta_description
 *
 * Admin create/update payload'ı ikisini birlikte taşımaya devam ediyor.
 */
export const productCreateSchema = z.object({
  id: z.string().uuid().optional(),

  // 🌍 Çok dilli – ürün bazında locale (product_i18n.locale)
  locale: z.string().min(2).max(8).optional(), // yoksa backend "tr" ile dolduracak

  // I18N alanlar
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  description: emptyToNull(z.string().optional().nullable()),
  alt: emptyToNull(z.string().max(255).optional().nullable()),
  tags: z.array(z.string()).optional().default([]),

  // Teknik özellikler: serbest key/value (capacity, fanType, warranty, vs.)
  specifications: z.record(z.string(), z.string()).optional(),

  // Base alanlar
  price: z.coerce.number().nonnegative(),
  category_id: z.string().uuid(),
  sub_category_id: emptyToNull(z.string().uuid().optional().nullable()),

  image_url: emptyToNull(z.string().url().optional().nullable()),
  images: z.array(z.string().url()).optional().default([]),

  // ❗ Artık uuid yerine assetId (ör. storage_assets.id gibi)
  storage_asset_id: emptyToNull(assetId.optional().nullable()),
  storage_image_ids: z.array(assetId).optional().default([]),

  is_active: boolLike.optional(),
  is_featured: boolLike.optional(),

  product_code: emptyToNull(z.string().max(64).optional().nullable()),
  stock_quantity: z.coerce.number().int().min(0).optional().default(0),
  rating: z.coerce.number().min(0).max(5).optional(),
  review_count: z.coerce.number().int().min(0).optional(),

  meta_title: emptyToNull(z.string().max(255).optional().nullable()),
  meta_description: emptyToNull(z.string().max(500).optional().nullable()),
});

export const productUpdateSchema = productCreateSchema.partial();

/* ------------ Images ------------ */
export const productSetImagesSchema = z.object({
  // ❗ uuid değil; storage asset id formatı neyse ona izin veriyoruz
  cover_id: emptyToNull(assetId.optional().nullable()),
  image_ids: z.array(assetId).min(0),
  alt: emptyToNull(z.string().max(255).optional().nullable()),
});
export type ProductSetImagesInput = z.infer<typeof productSetImagesSchema>;

/* ----------------- FAQ ----------------- */
export const productFaqCreateSchema = z.object({
  // ❗ uuid zorlamıyoruz; eski kayıtlar "1", "2" vb. olabilir
  id: entityId.optional(),
  product_id: z.string().uuid(),
  locale: z.string().min(2).max(8).optional(), // default backend'de "tr"
  question: z.string().min(1).max(500),
  answer: z.string().min(1),
  display_order: z.coerce.number().int().min(0).optional().default(0),
  is_active: boolLike.optional(),
});
export const productFaqUpdateSchema = productFaqCreateSchema.partial();
export type ProductFaqCreateInput = z.infer<typeof productFaqCreateSchema>;
export type ProductFaqUpdateInput = z.infer<typeof productFaqUpdateSchema>;

/* ----------------- SPEC ----------------- */
export const productSpecCreateSchema = z.object({
  // ❗ uuid zorlamıyoruz; FE'den boş veya string gelebilir
  id: entityId.optional(),
  product_id: z.string().uuid(),
  locale: z.string().min(2).max(8).optional(), // default backend'de "tr"
  name: z.string().min(1).max(255),
  value: z.string().min(1),
  category: z
    .enum(["physical", "material", "service", "custom"])
    .default("custom"),
  order_num: z.coerce.number().int().min(0).optional().default(0),
});
export const productSpecUpdateSchema = productSpecCreateSchema.partial();
export type ProductSpecCreateInput = z.infer<typeof productSpecCreateSchema>;
export type ProductSpecUpdateInput = z.infer<typeof productSpecUpdateSchema>;

/* ----------------- REVIEW (YENİ) ----------------- */
export const productReviewCreateSchema = z.object({
  id: z.string().uuid().optional(),
  product_id: z.string().uuid(),
  user_id: emptyToNull(z.string().uuid().optional().nullable()),
  rating: z.coerce.number().int().min(1).max(5),
  comment: emptyToNull(z.string().optional().nullable()),
  is_active: boolLike.optional(),
  customer_name: emptyToNull(z.string().max(255).optional().nullable()),
  review_date: emptyToNull(z.string().datetime().optional().nullable()),
});
export const productReviewUpdateSchema = productReviewCreateSchema.partial();
export type ProductReviewCreateInput = z.infer<
  typeof productReviewCreateSchema
>;
export type ProductReviewUpdateInput = z.infer<
  typeof productReviewUpdateSchema
>;
