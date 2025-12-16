// ===================================================================
// FILE: src/modules/faqs/validation.ts
// ===================================================================

import { z } from "zod";
import { LOCALES } from "@/core/i18n";

export const boolLike = z.union([
  z.boolean(),
  z.literal(0),
  z.literal(1),
  z.literal("0"),
  z.literal("1"),
  z.literal("true"),
  z.literal("false"),
]);

/** LIST query (public/admin ortak) */
export const faqListQuerySchema = z.object({
  // Sıralama
  order: z.string().optional(), // "created_at.asc" gibi
  sort: z.enum(["created_at", "updated_at", "display_order"]).optional(),
  orderDir: z.enum(["asc", "desc"]).optional(),

  // Paging
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),

  // Filtreler
  is_active: boolLike.optional(),
  q: z.string().optional(),
  slug: z.string().optional(),

  // Kategori filtreleri (ID bazlı – category modülü ile uyumlu)
  category_id: z.string().min(1).max(36).optional(),
  sub_category_id: z.string().min(1).max(36).optional(),

  // İleride SELECT kolon opt. kullanmak istersen
  select: z.string().optional(),
});
export type FaqListQuery = z.infer<typeof faqListQuerySchema>;

/** Parent create/update (dil bağımsız) */
export const upsertFaqParentBodySchema = z.object({
  is_active: boolLike.optional().default(true),
  display_order: z.coerce.number().int().min(0).optional(),

  // Kategori ID'leri (dil bağımsız)
  category_id: z.string().min(1).max(36).nullable().optional(),
  sub_category_id: z.string().min(1).max(36).nullable().optional(),
});
export type UpsertFaqParentBody = z.infer<typeof upsertFaqParentBodySchema>;

export const patchFaqParentBodySchema = upsertFaqParentBodySchema.partial();
export type PatchFaqParentBody = z.infer<typeof patchFaqParentBodySchema>;

/**
 * Translation (i18n) create/update.
 * Admin UI header’dan X-Locale gönderir; body.locale opsiyoneldir (body > header öncelikli).
 */
const LOCALE_ENUM = z.enum(LOCALES as unknown as [string, ...string[]]);

export const upsertFaqI18nBodySchema = z.object({
  locale: LOCALE_ENUM.optional(),
  question: z.string().min(1).max(500).trim(),
  answer: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "slug sadece küçük harf, rakam ve tire içermelidir",
    )
    .trim(),
});
export type UpsertFaqI18nBody = z.infer<typeof upsertFaqI18nBodySchema>;

export const patchFaqI18nBodySchema = z.object({
  locale: LOCALE_ENUM.optional(),
  question: z.string().min(1).max(500).trim().optional(),
  answer: z.string().min(1).optional(),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "slug sadece küçük harf, rakam ve tire içermelidir",
    )
    .trim()
    .optional(),
});
export type PatchFaqI18nBody = z.infer<typeof patchFaqI18nBodySchema>;

/**
 * Geriye dönük uyumluluk için:
 * Eski tek-body şema (parent + i18n birlikte) endpoint’lerinde hâlâ kullanılabilir.
 * create/update uçları bu alanları anlamlandırır.
 */
export const upsertFaqBodySchema = z.object({
  // i18n
  question: z.string().min(1).max(500).trim(),
  answer: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "slug sadece küçük harf, rakam ve tire içermelidir",
    )
    .trim(),
  locale: LOCALE_ENUM.optional(),

  // parent
  is_active: boolLike.optional().default(true),
  display_order: z.coerce.number().int().min(0).optional(),

  // Kategori ID'leri (dil bağımsız)
  category_id: z.string().min(1).max(36).nullable().optional(),
  sub_category_id: z.string().min(1).max(36).nullable().optional(),
});
export type UpsertFaqBody = z.infer<typeof upsertFaqBodySchema>;

export const patchFaqBodySchema = z.object({
  // i18n
  question: z.string().min(1).max(500).trim().optional(),
  answer: z.string().min(1).optional(),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "slug sadece küçük harf, rakam ve tire içermelidir",
    )
    .trim()
    .optional(),
  locale: LOCALE_ENUM.optional(),

  // parent
  is_active: boolLike.optional(),
  display_order: z.coerce.number().int().min(0).optional(),
  category_id: z.string().min(1).max(36).nullable().optional(),
  sub_category_id: z.string().min(1).max(36).nullable().optional(),
});
export type PatchFaqBody = z.infer<typeof patchFaqBodySchema>;
