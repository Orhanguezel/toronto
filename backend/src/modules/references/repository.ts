import { db } from "@/db/client";
import {
  references,
  referencesI18n,
  referenceImages,
  referenceImagesI18n,
  type NewReferenceRow,
  type NewReferenceI18nRow,
  type NewReferenceImageRow,
  type NewReferenceImageI18nRow,
} from "./schema";
import { and, asc, desc, eq, sql, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";

/* ============== helpers ============== */
type Sortable = "created_at" | "updated_at" | "display_order";

export type ReferenceListParams = {
  orderParam?: string;
  sort?: Sortable;
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;

  is_published?: boolean | 0 | 1 | "0" | "1" | "true" | "false";
  is_featured?: boolean | 0 | 1 | "0" | "1" | "true" | "false";

  q?: string;
  slug?: string;

  locale: string;
  defaultLocale: string;
};

const to01 = (v: any): 0 | 1 | undefined => {
  if (v === true || v === 1 || v === "1" || v === "true") return 1;
  if (v === false || v === 0 || v === "0" || v === "false") return 0;
  return undefined;
};

const parseOrder = (
  orderParam?: string,
  sort?: Sortable,
  ord?: "asc" | "desc",
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

const isRec = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

export const packContent = (htmlOrJson: string): string => {
  try {
    const parsed = JSON.parse(htmlOrJson) as unknown;
    if (isRec(parsed) && typeof (parsed as any).html === "string") {
      return JSON.stringify({ html: (parsed as any).html });
    }
  } catch {}
  return JSON.stringify({ html: htmlOrJson });
};

/* ============== merged select ============== */
export type ReferenceMerged = {
  id: string;
  is_published: 0 | 1;
  is_featured: 0 | 1;
  display_order: number;

  featured_image: string | null;
  featured_image_asset_id: string | null;
  website_url: string | null;

  created_at: string | Date;
  updated_at: string | Date;

  title: string | null;
  slug: string | null;
  summary: string | null;
  content: string | null;
  featured_image_alt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  locale_resolved: string | null;
};

function baseReferenceSelect(reqI: any, defI: any) {
  return {
    id: references.id,
    is_published: references.is_published,
    is_featured: references.is_featured,
    display_order: references.display_order,
    featured_image: references.featured_image,
    featured_image_asset_id: references.featured_image_asset_id,
    website_url: references.website_url,
    created_at: references.created_at,
    updated_at: references.updated_at,

    title: sql<string>`COALESCE(${reqI.title}, ${defI.title})`.as("title"),
    slug: sql<string>`COALESCE(${reqI.slug}, ${defI.slug})`.as("slug"),
    summary: sql<string>`COALESCE(${reqI.summary}, ${defI.summary})`.as("summary"),
    content: sql<string>`COALESCE(${reqI.content}, ${defI.content})`.as("content"),
    featured_image_alt: sql<string>`COALESCE(${reqI.featured_image_alt}, ${defI.featured_image_alt})`.as("featured_image_alt"),
    meta_title: sql<string>`COALESCE(${reqI.meta_title}, ${defI.meta_title})`.as("meta_title"),
    meta_description: sql<string>`COALESCE(${reqI.meta_description}, ${defI.meta_description})`.as("meta_description"),
    locale_resolved: sql<string>`
      CASE WHEN ${reqI.id} IS NOT NULL THEN ${reqI.locale} ELSE ${defI.locale} END
    `.as("locale_resolved"),
  };
}

/* ============== LIST / GET ============== */
export async function listReferences(params: ReferenceListParams) {
  const reqI = alias(referencesI18n, "ri_req");
  const defI = alias(referencesI18n, "ri_def");

  const filters: SQL[] = [];
  const pub = to01(params.is_published);
  if (pub !== undefined) filters.push(eq(references.is_published, pub));
  const feat = to01(params.is_featured);
  if (feat !== undefined) filters.push(eq(references.is_featured, feat));

  if (params.slug && params.slug.trim()) {
    const v = params.slug.trim();
    filters.push(sql`COALESCE(${reqI.slug}, ${defI.slug}) = ${v}`);
  }
  if (params.q && params.q.trim()) {
    const s = `%${params.q.trim()}%`;
    filters.push(sql`(
      COALESCE(${reqI.title}, ${defI.title}) LIKE ${s}
      OR COALESCE(${reqI.slug}, ${defI.slug}) LIKE ${s}
      OR COALESCE(${reqI.summary}, ${defI.summary}) LIKE ${s}
      OR COALESCE(${reqI.meta_title}, ${defI.meta_title}) LIKE ${s}
      OR COALESCE(${reqI.meta_description}, ${defI.meta_description}) LIKE ${s}
    )`);
  }

  const whereExpr: SQL | undefined = filters.length ? (and(...filters) as SQL) : undefined;

  const ord = parseOrder(params.orderParam, params.sort, params.order);
  const orderBy = ord
    ? (ord.dir === "asc" ? asc(references[ord.col]) : desc(references[ord.col]))
    : desc(references.created_at);

  const take = params.limit && params.limit > 0 ? params.limit : 50;
  const skip = params.offset && params.offset >= 0 ? params.offset : 0;

  const rows = await db
    .select(baseReferenceSelect(reqI, defI))
    .from(references)
    .leftJoin(reqI, and(eq(reqI.reference_id, references.id), eq(reqI.locale, params.locale)))
    .leftJoin(defI, and(eq(defI.reference_id, references.id), eq(defI.locale, params.defaultLocale)))
    .where(whereExpr!)
    .orderBy(orderBy)
    .limit(take)
    .offset(skip);

  const cnt = await db
    .select({ c: sql<number>`COUNT(1)` })
    .from(references)
    .leftJoin(reqI, and(eq(reqI.reference_id, references.id), eq(reqI.locale, params.locale)))
    .leftJoin(defI, and(eq(defI.reference_id, references.id), eq(defI.locale, params.defaultLocale)))
    .where(whereExpr!);

  const total = cnt[0]?.c ?? 0;
  return { items: rows as unknown as ReferenceMerged[], total };
}

export async function getReferenceMergedById(locale: string, defaultLocale: string, id: string) {
  const reqI = alias(referencesI18n, "ri_req");
  const defI = alias(referencesI18n, "ri_def");
  const rows = await db
    .select(baseReferenceSelect(reqI, defI))
    .from(references)
    .leftJoin(reqI, and(eq(reqI.reference_id, references.id), eq(reqI.locale, locale)))
    .leftJoin(defI, and(eq(defI.reference_id, references.id), eq(defI.locale, defaultLocale)))
    .where(eq(references.id, id))
    .limit(1);
  return (rows[0] ?? null) as unknown as ReferenceMerged | null;
}

export async function getReferenceMergedBySlug(locale: string, defaultLocale: string, slug: string) {
  const reqI = alias(referencesI18n, "ri_req");
  const defI = alias(referencesI18n, "ri_def");
  const rows = await db
    .select(baseReferenceSelect(reqI, defI))
    .from(references)
    .leftJoin(reqI, and(eq(reqI.reference_id, references.id), eq(reqI.locale, locale)))
    .leftJoin(defI, and(eq(defI.reference_id, references.id), eq(defI.locale, defaultLocale)))
    .where(
      sql`( ${reqI.id} IS NOT NULL AND ${reqI.slug} = ${slug} )
          OR ( ${reqI.id} IS NULL AND ${defI.slug} = ${slug} )`,
    )
    .limit(1);
  return (rows[0] ?? null) as unknown as ReferenceMerged | null;
}

/* ============== parent write ============== */
export async function createReferenceParent(values: NewReferenceRow) {
  await db.insert(references).values(values);
  return values.id;
}
export async function updateReferenceParent(id: string, patch: Partial<NewReferenceRow>) {
  await db.update(references).set({ ...patch, updated_at: new Date() as any }).where(eq(references.id, id));
}
export async function deleteReferenceParent(id: string) {
  const res = await db.delete(references).where(eq(references.id, id)).execute();
  const affected =
    typeof (res as unknown as { affectedRows?: number }).affectedRows === "number"
      ? (res as unknown as { affectedRows: number }).affectedRows
      : 0;
  return affected;
}

/* ============== i18n write ============== */
export async function upsertReferenceI18n(
  referenceId: string,
  locale: string,
  data: Partial<Pick<NewReferenceI18nRow,
    "title" | "slug" | "summary" | "content" | "featured_image_alt" | "meta_title" | "meta_description"
  >> & { id?: string }
) {
  const insertVals: NewReferenceI18nRow = {
    id: data.id ?? randomUUID(),
    reference_id: referenceId,
    locale,
    title: data.title ?? "",
    slug: data.slug ?? "",
    summary: typeof data.summary === "undefined" ? (null as any) : (data.summary ?? null),
    content: data.content ?? JSON.stringify({ html: "" }),
    featured_image_alt: typeof data.featured_image_alt === "undefined" ? (null as any) : (data.featured_image_alt ?? null),
    meta_title: typeof data.meta_title === "undefined" ? (null as any) : (data.meta_title ?? null),
    meta_description: typeof data.meta_description === "undefined" ? (null as any) : (data.meta_description ?? null),
    created_at: new Date() as any,
    updated_at: new Date() as any,
  };

  const setObj: Record<string, any> = {};
  if (typeof data.title !== "undefined") setObj.title = data.title;
  if (typeof data.slug !== "undefined") setObj.slug = data.slug;
  if (typeof data.summary !== "undefined") setObj.summary = data.summary ?? null;
  if (typeof data.content !== "undefined") setObj.content = data.content;
  if (typeof data.featured_image_alt !== "undefined") setObj.featured_image_alt = data.featured_image_alt ?? null;
  if (typeof data.meta_title !== "undefined") setObj.meta_title = data.meta_title ?? null;
  if (typeof data.meta_description !== "undefined") setObj.meta_description = data.meta_description ?? null;
  setObj.updated_at = new Date();

  if (Object.keys(setObj).length === 1) return;

  await db.insert(referencesI18n).values(insertVals).onDuplicateKeyUpdate({ set: setObj });
}

export async function getReferenceI18nRow(referenceId: string, locale: string) {
  const rows = await db.select().from(referencesI18n)
    .where(and(eq(referencesI18n.reference_id, referenceId), eq(referencesI18n.locale, locale)))
    .limit(1);
  return rows[0] ?? null;
}

/* ============== GALLERY repo ============== */
export type ReferenceImageMerged = {
  id: string;
  reference_id: string;
  asset_id: string;
  image_url: string | null;
  display_order: number;
  is_active: 0 | 1;
  created_at: string | Date;
  updated_at: string | Date;

  alt: string | null;
  caption: string | null;
  locale_resolved: string | null;
};

function baseImageSelect(reqI: any, defI: any) {
  return {
    id: referenceImages.id,
    reference_id: referenceImages.reference_id,
    asset_id: referenceImages.asset_id,
    image_url: referenceImages.image_url,
    display_order: referenceImages.display_order,
    is_active: referenceImages.is_active,
    created_at: referenceImages.created_at,
    updated_at: referenceImages.updated_at,

    alt: sql<string>`COALESCE(${reqI.alt}, ${defI.alt})`.as("alt"),
    caption: sql<string>`COALESCE(${reqI.caption}, ${defI.caption})`.as("caption"),
    locale_resolved: sql<string>`
      CASE WHEN ${reqI.id} IS NOT NULL THEN ${reqI.locale} ELSE ${defI.locale} END
    `.as("locale_resolved"),
  };
}

export async function listReferenceImagesMerged(referenceId: string, locale: string, defaultLocale: string) {
  const reqI = alias(referenceImagesI18n, "rii_req");
  const defI = alias(referenceImagesI18n, "rii_def");
  const rows = await db
    .select(baseImageSelect(reqI, defI))
    .from(referenceImages)
    .leftJoin(reqI, and(eq(reqI.image_id, referenceImages.id), eq(reqI.locale, locale)))
    .leftJoin(defI, and(eq(defI.image_id, referenceImages.id), eq(defI.locale, defaultLocale)))
    .where(eq(referenceImages.reference_id, referenceId))
    .orderBy(asc(referenceImages.display_order), asc(referenceImages.created_at));
  return rows as unknown as ReferenceImageMerged[];
}

export async function createReferenceImageParent(values: NewReferenceImageRow) {
  await db.insert(referenceImages).values(values);
  return values.id;
}

export async function updateReferenceImageParent(id: string, patch: Partial<NewReferenceImageRow>) {
  await db.update(referenceImages).set({ ...patch, updated_at: new Date() as any }).where(eq(referenceImages.id, id));
}

export async function deleteReferenceImageParent(id: string) {
  const res = await db.delete(referenceImages).where(eq(referenceImages.id, id)).execute();
  const affected =
    typeof (res as unknown as { affectedRows?: number }).affectedRows === "number"
      ? (res as unknown as { affectedRows: number }).affectedRows
      : 0;
  return affected;
}

export async function upsertReferenceImageI18n(
  imageId: string,
  locale: string,
  data: Partial<Pick<NewReferenceImageI18nRow, "alt" | "caption">> & { id?: string }
) {
  const insertVals: NewReferenceImageI18nRow = {
    id: data.id ?? randomUUID(),
    image_id: imageId,
    locale,
    alt: typeof data.alt === "undefined" ? (null as any) : (data.alt ?? null),
    caption: typeof data.caption === "undefined" ? (null as any) : (data.caption ?? null),
    created_at: new Date() as any,
    updated_at: new Date() as any,
  };

  const setObj: Record<string, any> = {};
  if (typeof data.alt !== "undefined") setObj.alt = data.alt ?? null;
  if (typeof data.caption !== "undefined") setObj.caption = data.caption ?? null;
  setObj.updated_at = new Date();

  if (Object.keys(setObj).length === 1) return;

  await db.insert(referenceImagesI18n).values(insertVals).onDuplicateKeyUpdate({ set: setObj });
}
