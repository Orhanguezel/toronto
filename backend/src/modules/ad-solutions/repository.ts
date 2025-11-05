import { db } from "@/db/client";
import {
  adSolutions,
  adSolutionsI18n,
  adSolutionImages,
  adSolutionImagesI18n,
  type NewAdSolutionRow,
  type NewAdSolutionI18nRow,
  type NewAdSolutionImageRow,
  type NewAdSolutionImageI18nRow,
} from "./schema";
import { and, asc, desc, eq, like, or, sql, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";

/* -------------------- types -------------------- */
type Sortable = "created_at" | "updated_at" | "display_order";

export type ListParams = {
  orderParam?: string;
  sort?: Sortable;
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;

  featured?: boolean | 0 | 1 | "0" | "1" | "true" | "false";
  is_active?: boolean | 0 | 1 | "0" | "1" | "true" | "false";
  q?: string;
  category?: string;
};

const to01 = (v: ListParams["featured"]): 0 | 1 | undefined => {
  if (v === true || v === 1 || v === "1" || v === "true") return 1;
  if (v === false || v === 0 || v === "0" || v === "false") return 0;
  return undefined;
};

const parseOrder = (
  orderParam?: string,
  sort?: ListParams["sort"],
  ord?: ListParams["order"],
): { col: Sortable; dir: "asc" | "desc" } | null => {
  if (orderParam) {
    const m = orderParam.match(/^([a-zA-Z0-9_]+)\.(asc|desc)$/);
    const col = m?.[1] as Sortable | undefined;
    const dir = m?.[2] as "asc" | "desc" | undefined;
    if (col && dir && (col === "created_at" || col === "updated_at" || col === "display_order")) {
      return { col, dir };
    }
  }
  if (sort && ord) return { col: sort, dir: ord };
  return null;
};

export type AdSolutionMerged = {
  id: string;

  // base
  category: string;
  featured: 0 | 1;
  is_active: 0 | 1;
  display_order: number;
  featured_image: string | null;
  image_url: string | null;
  image_asset_id: string | null;
  created_at: string | Date;
  updated_at: string | Date;

  // coalesced i18n
  name: string | null;
  slug: string | null;
  summary: string | null;
  content: string | null;
  image_alt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  locale_resolved: string | null;
};

function baseSelect(iReq: any, iDef: any) {
  return {
    id: adSolutions.id,
    category: adSolutions.category,
    featured: adSolutions.featured,
    is_active: adSolutions.is_active,
    display_order: adSolutions.display_order,
    featured_image: adSolutions.featured_image,
    image_url: adSolutions.image_url,
    image_asset_id: adSolutions.image_asset_id,
    created_at: adSolutions.created_at,
    updated_at: adSolutions.updated_at,

    name:  sql<string>`COALESCE(${iReq.name},  ${iDef.name})`.as("name"),
    slug:  sql<string>`COALESCE(${iReq.slug},  ${iDef.slug})`.as("slug"),
    summary: sql<string>`COALESCE(${iReq.summary}, ${iDef.summary})`.as("summary"),
    content: sql<string>`COALESCE(${iReq.content}, ${iDef.content})`.as("content"),
    image_alt: sql<string>`COALESCE(${iReq.image_alt}, ${iDef.image_alt})`.as("image_alt"),
    meta_title: sql<string>`COALESCE(${iReq.meta_title}, ${iDef.meta_title})`.as("meta_title"),
    meta_description: sql<string>`COALESCE(${iReq.meta_description}, ${iDef.meta_description})`.as("meta_description"),
    locale_resolved: sql<string>`
      CASE WHEN ${iReq.id} IS NOT NULL THEN ${iReq.locale} ELSE ${iDef.locale} END
    `.as("locale_resolved"),
  };
}

/* -------------------- list / get -------------------- */
export async function listAdSolutions(params: ListParams & { locale: string; defaultLocale: string; }) {
  const iReq = alias(adSolutionsI18n, "i_req");
  const iDef = alias(adSolutionsI18n, "i_def");

  const filters: SQL[] = [];
  const act = to01(params.is_active);
  if (act !== undefined) filters.push(eq(adSolutions.is_active, act));
  const feat = to01(params.featured);
  if (feat !== undefined) filters.push(eq(adSolutions.featured, feat));
  if (params.category && params.category.trim()) {
    filters.push(eq(adSolutions.category, params.category.trim()));
  }
  if (params.q && params.q.trim()) {
    const s = `%${params.q.trim()}%`;
    filters.push(sql`(
      COALESCE(${iReq.name}, ${iDef.name}) LIKE ${s}
      OR COALESCE(${iReq.slug}, ${iDef.slug}) LIKE ${s}
      OR COALESCE(${iReq.summary}, ${iDef.summary}) LIKE ${s}
      OR COALESCE(${iReq.content}, ${iDef.content}) LIKE ${s}
      OR COALESCE(${iReq.meta_title}, ${iDef.meta_title}) LIKE ${s}
      OR COALESCE(${iReq.meta_description}, ${iDef.meta_description}) LIKE ${s}
    )`);
  }

  const whereExpr: SQL | undefined = filters.length ? (and(...filters) as SQL) : undefined;

  const ord = parseOrder(params.orderParam, params.sort, params.order);
  const orderBy = ord
    ? (ord.dir === "asc" ? asc(adSolutions[ord.col]) : desc(adSolutions[ord.col]))
    : asc(adSolutions.display_order);

  const take = params.limit && params.limit > 0 ? params.limit : 50;
  const skip = params.offset && params.offset >= 0 ? params.offset : 0;

  const rows = await db
    .select(baseSelect(iReq, iDef))
    .from(adSolutions)
    .leftJoin(iReq, and(eq(iReq.ad_id, adSolutions.id), eq(iReq.locale, params.locale)))
    .leftJoin(iDef, and(eq(iDef.ad_id, adSolutions.id), eq(iDef.locale, params.defaultLocale)))
    .where(whereExpr!)
    .orderBy(orderBy)
    .limit(take)
    .offset(skip);

  const cnt = await db
    .select({ c: sql<number>`COUNT(1)` })
    .from(adSolutions)
    .leftJoin(iReq, and(eq(iReq.ad_id, adSolutions.id), eq(iReq.locale, params.locale)))
    .leftJoin(iDef, and(eq(iDef.ad_id, adSolutions.id), eq(iDef.locale, params.defaultLocale)))
    .where(whereExpr!);

  const total = cnt[0]?.c ?? 0;
  return { items: rows as unknown as AdSolutionMerged[], total };
}

export async function getAdSolutionMergedById(locale: string, defaultLocale: string, id: string) {
  const iReq = alias(adSolutionsI18n, "i_req");
  const iDef = alias(adSolutionsI18n, "i_def");
  const rows = await db
    .select(baseSelect(iReq, iDef))
    .from(adSolutions)
    .leftJoin(iReq, and(eq(iReq.ad_id, adSolutions.id), eq(iReq.locale, locale)))
    .leftJoin(iDef, and(eq(iDef.ad_id, adSolutions.id), eq(iDef.locale, defaultLocale)))
    .where(eq(adSolutions.id, id))
    .limit(1);
  return (rows[0] ?? null) as unknown as AdSolutionMerged | null;
}

export async function getAdSolutionMergedBySlug(locale: string, defaultLocale: string, slug: string) {
  const iReq = alias(adSolutionsI18n, "i_req");
  const iDef = alias(adSolutionsI18n, "i_def");
  const rows = await db
    .select(baseSelect(iReq, iDef))
    .from(adSolutions)
    .leftJoin(iReq, and(eq(iReq.ad_id, adSolutions.id), eq(iReq.locale, locale)))
    .leftJoin(iDef, and(eq(iDef.ad_id, adSolutions.id), eq(iDef.locale, defaultLocale)))
    .where(
      sql`( ${iReq.id} IS NOT NULL AND ${iReq.slug} = ${slug} )
           OR ( ${iReq.id} IS NULL AND ${iDef.slug} = ${slug} )`,
    )
    .limit(1);
  return (rows[0] ?? null) as unknown as AdSolutionMerged | null;
}

/* -------------------- write (entity) -------------------- */
export async function createAdSolutionParent(values: NewAdSolutionRow) {
  await db.insert(adSolutions).values(values);
  return values.id;
}

export async function updateAdSolutionParent(id: string, patch: Partial<NewAdSolutionRow>) {
  await db.update(adSolutions).set({ ...patch, updated_at: new Date() as any }).where(eq(adSolutions.id, id));
}

export async function deleteAdSolutionParent(id: string) {
  const res = await db.delete(adSolutions).where(eq(adSolutions.id, id)).execute();
  const affected =
    typeof (res as unknown as { affectedRows?: number }).affectedRows === "number"
      ? (res as unknown as { affectedRows: number }).affectedRows
      : 0;
  return affected;
}

/** i18n upsert (ON DUPLICATE KEY) – (ad_id, locale) unique */
export async function upsertAdSolutionI18n(
  adId: string,
  locale: string,
  data: Partial<Pick<NewAdSolutionI18nRow, "name" | "slug" | "summary" | "content" | "image_alt" | "meta_title" | "meta_description">> & { id?: string }
) {
  const insertVals: NewAdSolutionI18nRow = {
    id: data.id ?? crypto.randomUUID(),
    ad_id: adId,
    locale,
    name: typeof data.name === "undefined" ? (null as any) : (data.name ?? null),
    slug: typeof data.slug === "undefined" ? (null as any) : (data.slug ?? null),
    summary: typeof data.summary === "undefined" ? (null as any) : (data.summary ?? null),
    content: typeof data.content === "undefined" ? (null as any) : (data.content ?? null),
    image_alt: typeof data.image_alt === "undefined" ? (null as any) : (data.image_alt ?? null),
    meta_title: typeof data.meta_title === "undefined" ? (null as any) : (data.meta_title ?? null),
    meta_description: typeof data.meta_description === "undefined" ? (null as any) : (data.meta_description ?? null),
    created_at: new Date() as any,
    updated_at: new Date() as any,
  };

  const setObj: Record<string, any> = {};
  if (typeof data.name !== "undefined") setObj.name = data.name ?? null;
  if (typeof data.slug !== "undefined") setObj.slug = data.slug ?? null;
  if (typeof data.summary !== "undefined") setObj.summary = data.summary ?? null;
  if (typeof data.content !== "undefined") setObj.content = data.content ?? null;
  if (typeof data.image_alt !== "undefined") setObj.image_alt = data.image_alt ?? null;
  if (typeof data.meta_title !== "undefined") setObj.meta_title = data.meta_title ?? null;
  if (typeof data.meta_description !== "undefined") setObj.meta_description = data.meta_description ?? null;
  setObj.updated_at = new Date();

  if (Object.keys(setObj).length === 1) return;

  await db
    .insert(adSolutionsI18n)
    .values(insertVals)
    .onDuplicateKeyUpdate({ set: setObj });
}

/* -------------------- gallery ops -------------------- */
export type ImageMerged = {
  id: string;
  ad_id: string;
  image_asset_id: string | null;
  image_url: string | null;
  is_active: 0 | 1;
  display_order: number;
  created_at: string | Date;
  updated_at: string | Date;
  // i18n
  title: string | null;
  alt: string | null;
  caption: string | null;
  locale_resolved: string | null;
};

function imageSelect(iReq: any, iDef: any) {
  return {
    id: adSolutionImages.id,
    ad_id: adSolutionImages.ad_id,
    image_asset_id: adSolutionImages.image_asset_id,
    image_url: adSolutionImages.image_url,
    is_active: adSolutionImages.is_active,
    display_order: adSolutionImages.display_order,
    created_at: adSolutionImages.created_at,
    updated_at: adSolutionImages.updated_at,

    title: sql<string>`COALESCE(${iReq.title}, ${iDef.title})`.as("title"),
    alt: sql<string>`COALESCE(${iReq.alt}, ${iDef.alt})`.as("alt"),
    caption: sql<string>`COALESCE(${iReq.caption}, ${iDef.caption})`.as("caption"),
    locale_resolved: sql<string>`
      CASE WHEN ${iReq.id} IS NOT NULL THEN ${iReq.locale} ELSE ${iDef.locale} END
    `.as("locale_resolved"),
  };
}

export async function listImages(adId: string, locale: string, defaultLocale: string) {
  const iReq = alias(adSolutionImagesI18n, "gi_req");
  const iDef = alias(adSolutionImagesI18n, "gi_def");

  const rows = await db
    .select(imageSelect(iReq, iDef))
    .from(adSolutionImages)
    .leftJoin(iReq, and(eq(iReq.image_id, adSolutionImages.id), eq(iReq.locale, locale)))
    .leftJoin(iDef, and(eq(iDef.image_id, adSolutionImages.id), eq(iDef.locale, defaultLocale)))
    .where(eq(adSolutionImages.ad_id, adId))
    .orderBy(asc(adSolutionImages.display_order), asc(adSolutionImages.created_at));

  return rows as unknown as ImageMerged[];
}

export async function createImage(values: NewAdSolutionImageRow) {
  await db.insert(adSolutionImages).values(values);
  return values.id;
}

export async function updateImage(imageId: string, patch: Partial<NewAdSolutionImageRow>) {
  await db.update(adSolutionImages).set({ ...patch, updated_at: new Date() as any }).where(eq(adSolutionImages.id, imageId));
}

export async function deleteImage(imageId: string) {
  const res = await db.delete(adSolutionImages).where(eq(adSolutionImages.id, imageId)).execute();
  const affected =
    typeof (res as unknown as { affectedRows?: number }).affectedRows === "number"
      ? (res as unknown as { affectedRows: number }).affectedRows
      : 0;
  return affected;
}

export async function upsertImageI18n(
  imageId: string,
  locale: string,
  data: Partial<Pick<NewAdSolutionImageI18nRow, "title" | "alt" | "caption">> & { id?: string }
) {
  const insertVals: NewAdSolutionImageI18nRow = {
    id: data.id ?? crypto.randomUUID(),
    image_id: imageId,
    locale,
    title: typeof data.title === "undefined" ? (null as any) : (data.title ?? null),
    alt: typeof data.alt === "undefined" ? (null as any) : (data.alt ?? null),
    caption: typeof data.caption === "undefined" ? (null as any) : (data.caption ?? null),
    created_at: new Date() as any,
    updated_at: new Date() as any,
  };

  const setObj: Record<string, any> = {};
  if (typeof data.title !== "undefined") setObj.title = data.title ?? null;
  if (typeof data.alt !== "undefined") setObj.alt = data.alt ?? null;
  if (typeof data.caption !== "undefined") setObj.caption = data.caption ?? null;
  setObj.updated_at = new Date();

  if (Object.keys(setObj).length === 1) return;

  await db.insert(adSolutionImagesI18n).values(insertVals).onDuplicateKeyUpdate({ set: setObj });
}
