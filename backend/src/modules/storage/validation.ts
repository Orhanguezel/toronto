import { z } from "zod";
import { LOCALES } from "@/core/i18n";

/** Query: admin list (merged i18n alanlarıyla arama destekler) */
export const storageListQuerySchema = z.object({
  q: z.string().optional(),
  bucket: z.string().min(1).max(64).optional(),
  folder: z.string().max(255).nullish(),
  mime: z.string().max(127).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  sort: z.enum(["created_at", "name", "size"]).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
}).strict().passthrough();
export type StorageListQuery = z.infer<typeof storageListQuerySchema>;

/** PATCH/PUT body: admin update (parent alanları) */
export const storageUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  folder: z.string().max(255).nullable().optional(),
  metadata: z.record(z.string()).nullable().optional(),
})
.partial()
.refine(v => Object.keys(v).length > 0, { message: "no_fields_to_update" });

export type StorageUpdateInput = z.infer<typeof storageUpdateSchema>;

/** Sign bodies (public upload yardımcıları) */
export const signPutBodySchema = z.object({
  filename: z.string().min(1),
  content_type: z.string().min(1),
  folder: z.string().max(255).optional(),
}).strict();
export type SignPutBody = z.infer<typeof signPutBodySchema>;

export const signMultipartBodySchema = signPutBodySchema;
export type SignMultipartBody = z.infer<typeof signMultipartBodySchema>;

/* ==================== i18n (storage_assets_i18n) ==================== */

const LOCALE_ENUM = z.enum(LOCALES as unknown as [string, ...string[]]);

/** i18n upsert (tek locale) */
export const upsertAssetI18nBodySchema = z.object({
  locale: LOCALE_ENUM.optional(),        // verilmezse req.locale
  title: z.string().max(255).nullable().optional(),
  alt: z.string().max(255).nullable().optional(),
  caption: z.string().max(1000).nullable().optional(),
  description: z.string().max(4000).nullable().optional(),
});
export type UpsertAssetI18nBody = z.infer<typeof upsertAssetI18nBodySchema>;

/** i18n patch (hepsi opsiyonel) */
export const patchAssetI18nBodySchema = upsertAssetI18nBodySchema;
export type PatchAssetI18nBody = z.infer<typeof patchAssetI18nBodySchema>;
