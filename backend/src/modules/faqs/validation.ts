import { z } from "zod";
import { LOCALES } from "@/core/i18n";

export const boolLike = z.union([
  z.boolean(),
  z.literal(0), z.literal(1),
  z.literal("0"), z.literal("1"),
  z.literal("true"), z.literal("false"),
]);

/** LIST query (public/admin ortak) */
export const faqListQuerySchema = z.object({
  order: z.string().optional(),
  sort: z.enum(["created_at", "updated_at", "display_order"]).optional(),
  orderDir: z.enum(["asc", "desc"]).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  is_active: boolLike.optional(),
  q: z.string().optional(),
  slug: z.string().optional(),
  category: z.string().optional(),
  select: z.string().optional(),
});
export type FaqListQuery = z.infer<typeof faqListQuerySchema>;

/** Parent create/update (dil bağımsız) */
export const upsertFaqParentBodySchema = z.object({
  is_active: boolLike.optional().default(true),
  display_order: z.coerce.number().int().min(0).optional(),
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
    .min(1).max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug sadece küçük harf, rakam ve tire içermelidir")
    .trim(),
  category: z.string().max(255).nullable().optional(),
});
export type UpsertFaqI18nBody = z.infer<typeof upsertFaqI18nBodySchema>;

export const patchFaqI18nBodySchema = z.object({
  locale: LOCALE_ENUM.optional(),
  question: z.string().min(1).max(500).trim().optional(),
  answer: z.string().min(1).optional(),
  slug: z
    .string()
    .min(1).max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug sadece küçük harf, rakam ve tire içermelidir")
    .trim()
    .optional(),
  category: z.string().max(255).nullable().optional(),
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
    .min(1).max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug sadece küçük harf, rakam ve tire içermelidir")
    .trim(),
  category: z.string().max(255).nullable().optional(),
  locale: LOCALE_ENUM.optional(),

  // parent
  is_active: boolLike.optional().default(true),
  display_order: z.coerce.number().int().min(0).optional(),
});
export type UpsertFaqBody = z.infer<typeof upsertFaqBodySchema>;

export const patchFaqBodySchema = z.object({
  // i18n
  question: z.string().min(1).max(500).trim().optional(),
  answer: z.string().min(1).optional(),
  slug: z
    .string()
    .min(1).max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug sadece küçük harf, rakam ve tire içermelidir")
    .trim()
    .optional(),
  category: z.string().max(255).nullable().optional(),
  locale: LOCALE_ENUM.optional(),

  // parent
  is_active: boolLike.optional(),
  display_order: z.coerce.number().int().min(0).optional(),
});
export type PatchFaqBody = z.infer<typeof patchFaqBodySchema>;
