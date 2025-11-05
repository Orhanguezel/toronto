import { db } from "@/db/client";
import {
  customPages,
  customPagesI18n,
  type NewCustomPageRow,
  type NewCustomPageI18nRow,
} from "./schema";
import { and, asc, desc, eq, sql, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";

/** Güvenilir sıralama kolonları */
type Sortable = "created_at" | "updated_at";

export type ListParams = {
  orderParam?: string;
  sort?: Sortable;
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;

  is_published?: boolean | 0 | 1 | "0" | "1" | "true" | "false";
  q?: string;
  slug?: string;

  locale: string;
  defaultLocale: string;
};

const to01 = (v: ListParams["is_published"]): 0 | 1 | undefined => {
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
    if (col && dir && (col === "created_at" || col === "updated_at")) {
      return { col, dir };
    }
  }
  if (sort && ord) return { col: sort, dir: ord };
  return null;
};

const isRec = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

/** HTML string → JSON-string {"html": "..."} */
export const packContent = (htmlOrJson: string): string => {
  try {
    const parsed = JSON.parse(htmlOrJson) as unknown;
    if (isRec(parsed) && typeof parsed.html === "string") {
      return JSON.stringify({ html: parsed.html });
    }
  } catch { /* düz HTML ise no-op */ }
  return JSON.stringify({ html: htmlOrJson });
};

export type CustomPageMerged = {
  id: string;
  is_published: 0 | 1;
  featured_image: string | null;
  featured_image_asset_id: string | null;
  created_at: string | Date;
  updated_at: string | Date;

  // localized (coalesced)
  title: string | null;
  slug: string | null;
  content: string | null; // JSON-string {"html":"..."}
  featured_image_alt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  locale_resolved: string | null;
};

function baseSelect(i18nReq: any, i18nDef: any) {
  return {
    id: customPages.id,
    is_published: customPages.is_published,
    featured_image: customPages.featured_image,
    featured_image_asset_id: customPages.featured_image_asset_id,
    created_at: customPages.created_at,
    updated_at: customPages.updated_at,

    title: sql<string>`COALESCE(${i18nReq.title}, ${i18nDef.title})`.as("title"),
    slug: sql<string>`COALESCE(${i18nReq.slug}, ${i18nDef.slug})`.as("slug"),
    content: sql<string>`COALESCE(${i18nReq.content}, ${i18nDef.content})`.as("content"),
    featured_image_alt: sql<string>`COALESCE(${i18nReq.featured_image_alt}, ${i18nDef.featured_image_alt})`.as("featured_image_alt"),
    meta_title: sql<string>`COALESCE(${i18nReq.meta_title}, ${i18nDef.meta_title})`.as("meta_title"),
    meta_description: sql<string>`COALESCE(${i18nReq.meta_description}, ${i18nDef.meta_description})`.as("meta_description"),
    locale_resolved: sql<string>`
      CASE WHEN ${i18nReq.id} IS NOT NULL THEN ${i18nReq.locale} ELSE ${i18nDef.locale} END
    `.as("locale_resolved"),
  };
}

/** LIST (coalesced) */
export async function listCustomPages(params: Omit<ListParams, "locale" | "defaultLocale"> & { locale: string; defaultLocale: string; }) {
  const i18nReq = alias(customPagesI18n, "cpi_req");
  const i18nDef = alias(customPagesI18n, "cpi_def");

  const filters: SQL[] = [];

  const pub = to01(params.is_published);
  if (pub !== undefined) filters.push(eq(customPages.is_published, pub));

  if (params.slug && params.slug.trim()) {
    const v = params.slug.trim();
    filters.push(sql`COALESCE(${i18nReq.slug}, ${i18nDef.slug}) = ${v}`);
  }

  if (params.q && params.q.trim()) {
    const s = `%${params.q.trim()}%`;
    filters.push(sql`(
      COALESCE(${i18nReq.title}, ${i18nDef.title}) LIKE ${s}
      OR COALESCE(${i18nReq.slug}, ${i18nDef.slug}) LIKE ${s}
      OR COALESCE(${i18nReq.meta_title}, ${i18nDef.meta_title}) LIKE ${s}
      OR COALESCE(${i18nReq.meta_description}, ${i18nDef.meta_description}) LIKE ${s}
    )`);
  }

  const whereExpr: SQL | undefined = filters.length ? (and(...filters) as SQL) : undefined;

  const ord = parseOrder(params.orderParam, params.sort, params.order);
  const orderBy = ord
    ? (ord.dir === "asc" ? asc(customPages[ord.col]) : desc(customPages[ord.col]))
    : desc(customPages.created_at);

  const take = params.limit && params.limit > 0 ? params.limit : 50;
  const skip = params.offset && params.offset >= 0 ? params.offset : 0;

  const rows = await db
    .select(baseSelect(i18nReq, i18nDef))
    .from(customPages)
    .leftJoin(i18nReq, and(eq(i18nReq.page_id, customPages.id), eq(i18nReq.locale, params.locale)))
    .leftJoin(i18nDef, and(eq(i18nDef.page_id, customPages.id), eq(i18nDef.locale, params.defaultLocale)))
    .where(whereExpr!)
    .orderBy(orderBy)
    .limit(take)
    .offset(skip);

  const cnt = await db
    .select({ c: sql<number>`COUNT(1)` })
    .from(customPages)
    .leftJoin(i18nReq, and(eq(i18nReq.page_id, customPages.id), eq(i18nReq.locale, params.locale)))
    .leftJoin(i18nDef, and(eq(i18nDef.page_id, customPages.id), eq(i18nDef.locale, params.defaultLocale)))
    .where(whereExpr!);

  const total = cnt[0]?.c ?? 0;
  return { items: rows as unknown as CustomPageMerged[], total };
}

/** GET by id (coalesced) */
export async function getCustomPageMergedById(locale: string, defaultLocale: string, id: string) {
  const i18nReq = alias(customPagesI18n, "cpi_req");
  const i18nDef = alias(customPagesI18n, "cpi_def");
  const rows = await db
    .select(baseSelect(i18nReq, i18nDef))
    .from(customPages)
    .leftJoin(i18nReq, and(eq(i18nReq.page_id, customPages.id), eq(i18nReq.locale, locale)))
    .leftJoin(i18nDef, and(eq(i18nDef.page_id, customPages.id), eq(i18nDef.locale, defaultLocale)))
    .where(eq(customPages.id, id))
    .limit(1);
  return (rows[0] ?? null) as unknown as CustomPageMerged | null;
}

/** GET by slug (coalesced) */
export async function getCustomPageMergedBySlug(locale: string, defaultLocale: string, slug: string) {
  const i18nReq = alias(customPagesI18n, "cpi_req");
  const i18nDef = alias(customPagesI18n, "cpi_def");

  const rows = await db
    .select(baseSelect(i18nReq, i18nDef))
    .from(customPages)
    .leftJoin(i18nReq, and(eq(i18nReq.page_id, customPages.id), eq(i18nReq.locale, locale)))
    .leftJoin(i18nDef, and(eq(i18nDef.page_id, customPages.id), eq(i18nDef.locale, defaultLocale)))
    .where(
      sql`( ${i18nReq.id} IS NOT NULL AND ${i18nReq.slug} = ${slug} )
          OR ( ${i18nReq.id} IS NULL AND ${i18nDef.slug} = ${slug} )`,
    )
    .limit(1);

  return (rows[0] ?? null) as unknown as CustomPageMerged | null;
}

/* ----------------- Admin write helpers ----------------- */

export async function createCustomPageParent(values: NewCustomPageRow) {
  await db.insert(customPages).values(values);
  return values.id;
}

export async function upsertCustomPageI18n(
  pageId: string,
  locale: string,
  data: Partial<Pick<NewCustomPageI18nRow,
    "title" | "slug" | "content" | "featured_image_alt" | "meta_title" | "meta_description"
  >> & { id?: string }
) {
  const insertVals: NewCustomPageI18nRow = {
    id: data.id ?? randomUUID(),
    page_id: pageId,
    locale,
    title: data.title ?? "",
    slug: data.slug ?? "",
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
  if (typeof data.content !== "undefined") setObj.content = data.content;
  if (typeof data.featured_image_alt !== "undefined") setObj.featured_image_alt = data.featured_image_alt ?? null;
  if (typeof data.meta_title !== "undefined") setObj.meta_title = data.meta_title ?? null;
  if (typeof data.meta_description !== "undefined") setObj.meta_description = data.meta_description ?? null;
  setObj.updated_at = new Date();

  if (Object.keys(setObj).length === 1) return;

  await db
    .insert(customPagesI18n)
    .values(insertVals)
    .onDuplicateKeyUpdate({ set: setObj });
}

export async function updateCustomPageParent(id: string, patch: Partial<NewCustomPageRow>) {
  await db.update(customPages).set({ ...patch, updated_at: new Date() as any }).where(eq(customPages.id, id));
}

export async function deleteCustomPageParent(id: string) {
  const res = await db.delete(customPages).where(eq(customPages.id, id)).execute();
  const affected =
    typeof (res as unknown as { affectedRows?: number }).affectedRows === "number"
      ? (res as unknown as { affectedRows: number }).affectedRows
      : 0;
  return affected;
}

export async function getCustomPageI18nRow(pageId: string, locale: string) {
  const rows = await db.select().from(customPagesI18n)
    .where(and(eq(customPagesI18n.page_id, pageId), eq(customPagesI18n.locale, locale)))
    .limit(1);
  return rows[0] ?? null;
}
