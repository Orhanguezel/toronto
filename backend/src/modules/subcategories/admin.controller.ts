// =============================================================
// FILE: src/modules/subcategories/admin.controller.ts
// =============================================================
import type { RouteHandler } from "fastify";
import { db } from "@/db/client";
import { subCategories, subCategoryI18n } from "./schema";
import { storageAssets } from "@/modules/storage/schema";
import { and, or, like, eq, sql, asc, desc } from "drizzle-orm";
import {
  subCategoryCreateSchema,
  subCategoryUpdateSchema,
  subCategorySetImageSchema,
  type SubCategoryCreateInput,
  type SubCategoryUpdateInput,
  type SubCategorySetImageInput,
} from "./validation";
import { buildPublicUrl } from "@/modules/storage/_util";
import { randomUUID } from "crypto";

/* ---------- VIEW FIELDS (Base + i18n) ---------- */

const SUBCATEGORY_VIEW_FIELDS = {
  id: subCategories.id,
  category_id: subCategories.category_id,

  // i18n
  locale: subCategoryI18n.locale,
  name: subCategoryI18n.name,
  slug: subCategoryI18n.slug,
  description: subCategoryI18n.description,
  alt: subCategoryI18n.alt,

  // base
  image_url: subCategories.image_url,
  storage_asset_id: subCategories.storage_asset_id,
  icon: subCategories.icon,
  is_active: subCategories.is_active,
  is_featured: subCategories.is_featured,
  display_order: subCategories.display_order,
  created_at: subCategories.created_at,
  updated_at: subCategories.updated_at,
} as const;

/* ---------- helpers ---------- */

const toBoolQS = (v: unknown): boolean | undefined => {
  if (v === undefined) return undefined;
  if (typeof v === "boolean") return v;
  const s = String(v).toLowerCase();
  if (s === "true" || s === "1") return true;
  if (s === "false" || s === "0") return false;
  return undefined;
};

const toNum = (v: unknown, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

const isDup = (e: any) =>
  (e?.code ?? e?.errno) === "ER_DUP_ENTRY" ||
  (e?.code ?? e?.errno) === 1062;

const isFk = (e: any) =>
  (e?.code ?? e?.errno) === "ER_NO_REFERENCED_ROW_2" ||
  (e?.code ?? e?.errno) === 1452;

// 🌍 Çoklu dil oluşturma için yardımcılar
const FALLBACK_LOCALES = ["tr"];

function normalizeLocale(loc: unknown): string | null {
  if (!loc) return null;
  const s = String(loc).trim();
  if (!s) return null;
  return s.toLowerCase();
}

/**
 * CREATE sırasında kullanılacak tüm locale listesini döndürür.
 *
 * Öncelik:
 *   1) .env'den APP_LOCALES / NEXT_PUBLIC_APP_LOCALES / LOCALES  (örn: "tr,en,de")
 *   2) Fallback: ["tr"]
 *   3) Base locale listede yoksa başa eklenir
 */
function getLocalesForCreate(baseLocale: string): string[] {
  const base = normalizeLocale(baseLocale) ?? "tr";

  const envLocalesRaw =
    process.env.APP_LOCALES ||
    process.env.NEXT_PUBLIC_APP_LOCALES ||
    process.env.LOCALES ||
    "";

  let envLocales: string[] = [];
  if (envLocalesRaw) {
    envLocales = envLocalesRaw
      .split(",")
      .map((x) => normalizeLocale(x))
      .filter((x): x is string => !!x);
  }

  let list = envLocales.length ? envLocales : [...FALLBACK_LOCALES];

  if (!list.includes(base)) list.unshift(base);

  // Tekilleştir
  list = Array.from(new Set(list));

  return list;
}

function toBoolBody(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  const s = String(v).toLowerCase();
  return s === "1" || s === "true";
}

function nullIfEmpty(v: unknown): string | null {
  if (v === "" || v === null || v === undefined) return null;
  return String(v);
}

/** Ortak: admin tarafı için view query helper */
async function fetchSubCategoryViewByIdAndLocale(id: string, locale: string) {
  const rows = await db
    .select(SUBCATEGORY_VIEW_FIELDS)
    .from(subCategories)
    .innerJoin(
      subCategoryI18n,
      and(
        eq(subCategoryI18n.sub_category_id, subCategories.id),
        eq(subCategoryI18n.locale, locale),
      ),
    )
    .where(eq(subCategories.id, id))
    .limit(1);

  return rows[0] ?? null;
}

// LIST QS tipi
export type AdminSubListQS = {
  q?: string;
  category_id?: string;
  locale?: string;
  is_active?: string | boolean;
  is_featured?: string | boolean;
  limit?: number | string;
  offset?: number | string;
  sort?: "display_order" | "name" | "created_at" | "updated_at";
  order?: "asc" | "desc";
};

/* ========================= */
/* CREATE / UPDATE / DELETE  */
/* ========================= */

/**
 * POST /sub-categories (admin)
 *  - Base tablo: sub_categories
 *  - Çoklu dil: sub_category_i18n (tüm aktif locale'ler için row)
 */
export const adminCreateSubCategory: RouteHandler<{
  Body: SubCategoryCreateInput;
}> = async (req, reply) => {
  const parsed = subCategoryCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.code(400).send({
      error: {
        message: "invalid_body",
        issues: parsed.error.flatten(),
      },
    });
  }

  const data = parsed.data;

  const baseId = data.id ?? randomUUID();
  const baseLocale = normalizeLocale(data.locale) ?? "tr";
  const locales = getLocalesForCreate(baseLocale);

  const basePayload = {
    id: baseId,
    category_id: data.category_id,
    image_url:
      (nullIfEmpty(data.image_url) as string | null) ?? null,
    storage_asset_id: null as string | null,
    alt: (nullIfEmpty(data.alt) as string | null) ?? null,
    icon: (nullIfEmpty(data.icon) as string | null) ?? null,
    is_active:
      data.is_active === undefined
        ? true
        : toBoolBody(data.is_active),
    is_featured:
      data.is_featured === undefined
        ? false
        : toBoolBody(data.is_featured),
    display_order: data.display_order ?? 0,
  };

  const baseName = String(data.name ?? "").trim();
  const baseSlug = String(data.slug ?? "").trim();
  const baseDescription =
    (nullIfEmpty(data.description) as string | null) ?? null;
  const baseAlt =
    (nullIfEmpty(data.alt) as string | null) ?? null;

  const i18nRows = locales.map((loc) => ({
    sub_category_id: baseId,
    locale: loc,
    name: baseName,
    slug: baseSlug,
    description: baseDescription,
    alt: baseAlt,
  }));

  try {
    await db.transaction(async (tx) => {
      await tx.insert(subCategories).values(basePayload as any);
      await tx.insert(subCategoryI18n).values(i18nRows as any);
    });
  } catch (err: any) {
    if (isDup(err)) {
      return reply
        .code(409)
        .send({ error: { message: "duplicate_slug_in_category" } });
    }
    if (isFk(err)) {
      return reply
        .code(400)
        .send({ error: { message: "invalid_category_id" } });
    }
    return reply.code(500).send({
      error: {
        message: "db_error",
        detail: String(err?.message ?? err),
      },
    });
  }

  const created = await fetchSubCategoryViewByIdAndLocale(
    baseId,
    baseLocale,
  );
  return reply.code(201).send(created);
};

/* PUT /sub-categories/:id (admin) */
export const adminPutSubCategory: RouteHandler<{
  Params: { id: string };
  Body: SubCategoryUpdateInput;
}> = async (req, reply) => {
  const { id } = req.params;
  const parsed = subCategoryUpdateSchema.safeParse(req.body);
  if (!parsed.success)
    return reply.code(400).send({
      error: {
        message: "invalid_body",
        issues: parsed.error.flatten(),
      },
    });

  const patch = parsed.data;
  const targetLocale = normalizeLocale(patch.locale) ?? "tr";

  const baseSet: Record<string, unknown> = {
    updated_at: sql`CURRENT_TIMESTAMP(3)`,
  };
  const i18nSet: Record<string, unknown> = {
    updated_at: sql`CURRENT_TIMESTAMP(3)`,
  };
  let hasBase = false;
  let hasI18n = false;

  if (patch.category_id !== undefined) {
    baseSet.category_id = String(patch.category_id);
    hasBase = true;
  }
  if (patch.image_url !== undefined) {
    baseSet.image_url = nullIfEmpty(patch.image_url);
    hasBase = true;
  }
  if (patch.icon !== undefined) {
    baseSet.icon = nullIfEmpty(patch.icon);
    hasBase = true;
  }
  if (patch.is_active !== undefined) {
    baseSet.is_active = toBoolBody(patch.is_active);
    hasBase = true;
  }
  if (patch.is_featured !== undefined) {
    baseSet.is_featured = toBoolBody(patch.is_featured);
    hasBase = true;
  }
  if (patch.display_order !== undefined) {
    baseSet.display_order = Number(patch.display_order) || 0;
    hasBase = true;
  }

  if (patch.name !== undefined) {
    i18nSet.name = String(patch.name).trim();
    hasI18n = true;
  }
  if (patch.slug !== undefined) {
    i18nSet.slug = String(patch.slug).trim();
    hasI18n = true;
  }
  if (patch.description !== undefined) {
    i18nSet.description = nullIfEmpty(patch.description);
    hasI18n = true;
  }
  if (patch.alt !== undefined) {
    const altVal = nullIfEmpty(patch.alt);
    i18nSet.alt = altVal;
    baseSet.alt = altVal;
    hasI18n = true;
    hasBase = true;
  }

  try {
    await db.transaction(async (tx) => {
      if (hasBase) {
        await tx
          .update(subCategories)
          .set(baseSet as any)
          .where(eq(subCategories.id, id));
      }

      if (hasI18n) {
        await tx
          .update(subCategoryI18n)
          .set(i18nSet as any)
          .where(
            and(
              eq(subCategoryI18n.sub_category_id, id),
              eq(subCategoryI18n.locale, targetLocale),
            ),
          );
      }
    });
  } catch (err: any) {
    if (isDup(err))
      return reply
        .code(409)
        .send({ error: { message: "duplicate_slug_in_category" } });
    if (isFk(err))
      return reply
        .code(400)
        .send({ error: { message: "invalid_category_id" } });
    return reply.code(500).send({
      error: {
        message: "db_error",
        detail: String(err?.message ?? err),
      },
    });
  }

  const row = await fetchSubCategoryViewByIdAndLocale(
    id,
    targetLocale,
  );
  if (!row)
    return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send(row);
};

/* PATCH /sub-categories/:id (admin) */
export const adminPatchSubCategory: RouteHandler<{
  Params: { id: string };
  Body: SubCategoryUpdateInput;
}> = async (req, reply) => {
  const { id } = req.params;
  const parsed = subCategoryUpdateSchema.safeParse(req.body);
  if (!parsed.success)
    return reply.code(400).send({
      error: {
        message: "invalid_body",
        issues: parsed.error.flatten(),
      },
    });

  const patch = parsed.data;
  const targetLocale = normalizeLocale(patch.locale) ?? "tr";

  const baseSet: Record<string, unknown> = {
    updated_at: sql`CURRENT_TIMESTAMP(3)`,
  };
  const i18nSet: Record<string, unknown> = {
    updated_at: sql`CURRENT_TIMESTAMP(3)`,
  };
  let hasBase = false;
  let hasI18n = false;

  if (patch.category_id !== undefined) {
    baseSet.category_id = String(patch.category_id);
    hasBase = true;
  }
  if (patch.image_url !== undefined) {
    baseSet.image_url = nullIfEmpty(patch.image_url);
    hasBase = true;
  }
  if (patch.icon !== undefined) {
    baseSet.icon = nullIfEmpty(patch.icon);
    hasBase = true;
  }
  if (patch.is_active !== undefined) {
    baseSet.is_active = toBoolBody(patch.is_active);
    hasBase = true;
  }
  if (patch.is_featured !== undefined) {
    baseSet.is_featured = toBoolBody(patch.is_featured);
    hasBase = true;
  }
  if (patch.display_order !== undefined) {
    baseSet.display_order = Number(patch.display_order) || 0;
    hasBase = true;
  }

  if (patch.name !== undefined) {
    i18nSet.name = String(patch.name).trim();
    hasI18n = true;
  }
  if (patch.slug !== undefined) {
    i18nSet.slug = String(patch.slug).trim();
    hasI18n = true;
  }
  if (patch.description !== undefined) {
    i18nSet.description = nullIfEmpty(patch.description);
    hasI18n = true;
  }
  if (patch.alt !== undefined) {
    const altVal = nullIfEmpty(patch.alt);
    i18nSet.alt = altVal;
    baseSet.alt = altVal;
    hasI18n = true;
    hasBase = true;
  }

  try {
    await db.transaction(async (tx) => {
      if (hasBase) {
        await tx
          .update(subCategories)
          .set(baseSet as any)
          .where(eq(subCategories.id, id));
      }

      if (hasI18n) {
        await tx
          .update(subCategoryI18n)
          .set(i18nSet as any)
          .where(
            and(
              eq(subCategoryI18n.sub_category_id, id),
              eq(subCategoryI18n.locale, targetLocale),
            ),
          );
      }
    });
  } catch (err: any) {
    if (isDup(err))
      return reply
        .code(409)
        .send({ error: { message: "duplicate_slug_in_category" } });
    if (isFk(err))
      return reply
        .code(400)
        .send({ error: { message: "invalid_category_id" } });
    return reply.code(500).send({
      error: {
        message: "db_error",
        detail: String(err?.message ?? err),
      },
    });
  }

  const row = await fetchSubCategoryViewByIdAndLocale(
    id,
    targetLocale,
  );
  if (!row)
    return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send(row);
};

/* DELETE /sub-categories/:id */
export const adminDeleteSubCategory: RouteHandler<{
  Params: { id: string };
}> = async (req, reply) => {
  await db
    .delete(subCategories)
    .where(eq(subCategories.id, req.params.id));
  // ON DELETE CASCADE ile i18n otomatik silinecek
  return reply.code(204).send();
};

/* POST /sub-categories/reorder */
export const adminReorderSubCategories: RouteHandler<{
  Body: { items: Array<{ id: string; display_order: number }> };
}> = async (req, reply) => {
  const items = Array.isArray(req.body?.items)
    ? req.body.items
    : [];
  if (!items.length) return reply.send({ ok: true });

  for (const it of items) {
    await db
      .update(subCategories)
      .set({
        display_order: Number(it.display_order) || 0,
        updated_at: sql`CURRENT_TIMESTAMP(3)`,
      } as any)
      .where(eq(subCategories.id, it.id));
  }
  return reply.send({ ok: true });
};

/* PATCH /sub-categories/:id/active */
export const adminToggleSubActive: RouteHandler<{
  Params: { id: string };
  Body: { is_active: boolean };
}> = async (req, reply) => {
  const { id } = req.params;
  const v = !!req.body?.is_active;

  await db
    .update(subCategories)
    .set({
      is_active: v,
      updated_at: sql`CURRENT_TIMESTAMP(3)`,
    } as any)
    .where(eq(subCategories.id, id));

  const row = await fetchSubCategoryViewByIdAndLocale(id, "tr");
  if (!row)
    return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send(row);
};

/* PATCH /sub-categories/:id/featured */
export const adminToggleSubFeatured: RouteHandler<{
  Params: { id: string };
  Body: { is_featured: boolean };
}> = async (req, reply) => {
  const { id } = req.params;
  const v = !!req.body?.is_featured;

  await db
    .update(subCategories)
    .set({
      is_featured: v,
      updated_at: sql`CURRENT_TIMESTAMP(3)`,
    } as any)
    .where(eq(subCategories.id, id));

  const row = await fetchSubCategoryViewByIdAndLocale(id, "tr");
  if (!row)
    return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send(row);
};

/* PATCH /sub-categories/:id/image (asset_id + alt) */
export const adminSetSubCategoryImage: RouteHandler<{
  Params: { id: string };
  Body: SubCategorySetImageInput;
}> = async (req, reply) => {
  const { id } = req.params;
  const parsed = subCategorySetImageSchema.safeParse(req.body ?? {});
  if (!parsed.success)
    return reply.code(400).send({
      error: {
        message: "invalid_body",
        issues: parsed.error.flatten(),
      },
    });
  const assetId = parsed.data.asset_id ?? null;
  const alt = parsed.data.alt; // undefined ⇒ dokunma, null ⇒ temizle

  // Görseli kaldır
  if (!assetId) {
    const patch: Record<string, unknown> = {
      image_url: null,
      storage_asset_id: null,
      updated_at: sql`CURRENT_TIMESTAMP(3)`,
    };
    if (alt !== undefined) patch.alt = alt as string | null;

    await db
      .update(subCategories)
      .set(patch as any)
      .where(eq(subCategories.id, id));

    const row = await fetchSubCategoryViewByIdAndLocale(id, "tr");
    if (!row)
      return reply.code(404).send({ error: { message: "not_found" } });
    return reply.send(row);
  }

  // Asset’i getir
  const [asset] = await db
    .select({
      bucket: storageAssets.bucket,
      path: storageAssets.path,
      url: storageAssets.url,
    })
    .from(storageAssets)
    .where(eq(storageAssets.id, assetId))
    .limit(1);

  if (!asset)
    return reply
      .code(404)
      .send({ error: { message: "asset_not_found" } });

  const publicUrl = buildPublicUrl(
    asset.bucket,
    asset.path,
    asset.url ?? null,
  );

  const patch: Record<string, unknown> = {
    image_url: publicUrl,
    storage_asset_id: assetId,
    updated_at: sql`CURRENT_TIMESTAMP(3)`,
  };
  if (alt !== undefined) patch.alt = alt as string | null;

  await db
    .update(subCategories)
    .set(patch as any)
    .where(eq(subCategories.id, id));

  const row = await fetchSubCategoryViewByIdAndLocale(id, "tr");
  if (!row)
    return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send(row);
};

/* GET /sub-categories/list (admin) */
export const adminListSubCategories: RouteHandler<{
  Querystring: AdminSubListQS;
}> = async (req, reply) => {
  const {
    q,
    category_id,
    locale,
    is_active,
    is_featured,
    limit = 500,
    offset = 0,
    sort = "display_order",
    order = "asc",
  } = req.query ?? {};
  const conds: any[] = [];

  const effectiveLocale = normalizeLocale(locale) ?? "tr";
  conds.push(eq(subCategoryI18n.locale, effectiveLocale));

  if (q && q.trim()) {
    const p = `%${q.trim()}%`;
    conds.push(
      or(
        like(subCategoryI18n.name, p),
        like(subCategoryI18n.slug, p),
      ),
    );
  }
  if (category_id)
    conds.push(eq(subCategories.category_id, category_id));

  const a = toBoolQS(is_active);
  if (a !== undefined) conds.push(eq(subCategories.is_active, a));
  const f = toBoolQS(is_featured);
  if (f !== undefined)
    conds.push(eq(subCategories.is_featured, f));

  const col =
    sort === "name"
      ? subCategoryI18n.name
      : sort === "created_at"
        ? subCategories.created_at
        : sort === "updated_at"
          ? subCategories.updated_at
          : subCategories.display_order;

  let qb = db
    .select(SUBCATEGORY_VIEW_FIELDS)
    .from(subCategories)
    .innerJoin(
      subCategoryI18n,
      eq(subCategoryI18n.sub_category_id, subCategories.id),
    )
    .$dynamic();

  if (conds.length) qb = qb.where(and(...conds));

  const rows = await qb
    .orderBy(order === "desc" ? desc(col) : asc(col))
    .limit(toNum(limit, 500))
    .offset(toNum(offset, 0));

  return reply.send(rows);
};

/* GET /sub-categories/:id (admin) */
export const adminGetSubCategoryById: RouteHandler<{
  Params: { id: string };
  Querystring: { locale?: string };
}> = async (req, reply) => {
  const { id } = req.params;
  const effectiveLocale =
    normalizeLocale(req.query?.locale) ?? "tr";

  const row = await fetchSubCategoryViewByIdAndLocale(
    id,
    effectiveLocale,
  );
  if (!row)
    return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send(row);
};

/* GET /sub-categories/by-slug/:slug (admin) */
export const adminGetSubCategoryBySlug: RouteHandler<{
  Params: { slug: string };
  Querystring: { category_id?: string; locale?: string };
}> = async (req, reply) => {
  const { slug } = req.params;
  const { category_id, locale } = req.query ?? {};
  const effectiveLocale = normalizeLocale(locale) ?? "tr";

  const conds: any[] = [
    eq(subCategoryI18n.slug, slug),
    eq(subCategoryI18n.locale, effectiveLocale),
  ];
  if (category_id)
    conds.push(eq(subCategories.category_id, category_id));

  const rows = await db
    .select(SUBCATEGORY_VIEW_FIELDS)
    .from(subCategories)
    .innerJoin(
      subCategoryI18n,
      eq(subCategoryI18n.sub_category_id, subCategories.id),
    )
    .where(and(...conds))
    .limit(1);

  if (!rows.length)
    return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send(rows[0]);
};
