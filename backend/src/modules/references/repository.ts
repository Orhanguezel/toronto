// =============================================================
// FILE: src/modules/references/repository.ts
// =============================================================
import { db } from "@/db/client";
import {
  and,
  asc,
  desc,
  eq,
  like,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";

import {
  referencesTable,
  referencesI18n,
  referenceImages,
  referenceImagesI18n,
  type NewReferenceRow,
  type NewReferenceI18nRow,
} from "./schema";
import { categories } from "@/modules/categories/schema";
import { subCategories } from "@/modules/subcategories/schema";
import type { Locale } from "./validation";

/** Güvenilir sıralama kolonları */
type Sortable = "created_at" | "updated_at" | "display_order";

export type ListParams = {
  orderParam?: string;
  sort?: Sortable;
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;

  is_published?: boolean | 0 | 1 | "0" | "1" | "true" | "false";
  is_featured?: boolean | 0 | 1 | "0" | "1" | "true" | "false";
  q?: string;
  slug?: string;

  category_id?: string;
  sub_category_id?: string;
  module_key?: string;
  has_website?: boolean | 0 | 1 | "0" | "1" | "true" | "false";

  locale: Locale;
  defaultLocale: Locale;
};

const to01 = (
  v: ListParams["is_published"],
): 0 | 1 | undefined => {
  if (v === true || v === 1 || v === "1" || v === "true") return 1;
  if (v === false || v === 0 || v === "0" || v === "false") return 0;
  return undefined;
};

const toBool = (v: unknown): boolean =>
  v === true || v === 1 || v === "1" || v === "true";

const parseOrder = (
  orderParam?: string,
  sort?: ListParams["sort"],
  ord?: ListParams["order"],
): { col: Sortable; dir: "asc" | "desc" } | null => {
  if (orderParam) {
    const m = orderParam.match(/^([a-zA-Z0-9_]+)\.(asc|desc)$/);
    const col = m?.[1] as Sortable | undefined;
    const dir = m?.[2] as "asc" | "desc" | undefined;
    if (
      col &&
      dir &&
      (col === "created_at" ||
        col === "updated_at" ||
        col === "display_order")
    ) {
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
  } catch {
    // düz HTML ise no-op
  }
  return JSON.stringify({ html: htmlOrJson });
};

export type ReferenceMerged = {
  id: string;
  is_published: 0 | 1;
  is_featured: 0 | 1;
  display_order: number;

  featured_image: string | null;
  featured_image_asset_id: string | null;
  website_url: string | null;

  category_id: string | null;
  category_name: string | null;
  category_slug: string | null;

  sub_category_id: string | null;
  sub_category_name: string | null;
  sub_category_slug: string | null;

  title: string | null;
  slug: string | null;
  summary: string | null;
  content: string | null;
  featured_image_alt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  locale_resolved: string | null;
};

/* ==================================================================== */
/* LIST (admin/public ortak) – sade Drizzle SELECT                      */
/* ==================================================================== */

export async function listReferences(
  params: ListParams,
): Promise<{ items: ReferenceMerged[]; total: number }> {
  // or/and SQL | undefined döndürebildiği için union tipte tutuyoruz
  const conds: (SQL | undefined)[] = [];

  const pub = to01(params.is_published);
  if (pub !== undefined) conds.push(eq(referencesTable.is_published, pub));

  const feat = to01(params.is_featured);
  if (feat !== undefined) conds.push(eq(referencesTable.is_featured, feat));

  // locale zorunlu – direkt referencesI18n üzerinden
  conds.push(eq(referencesI18n.locale, params.locale));

  if (params.slug && params.slug.trim()) {
    const v = params.slug.trim();
    conds.push(eq(referencesI18n.slug, v));
  }

  if (params.q && params.q.trim()) {
    const s = `%${params.q.trim()}%`;

    // or(...) SQL | undefined tipinde, önce değişkene al
    const searchCond = or(
      like(referencesI18n.title, s),
      like(referencesI18n.slug, s),
      like(referencesI18n.summary, s),
      like(referencesI18n.meta_title, s),
      like(referencesI18n.meta_description, s),
    );

    if (searchCond) {
      conds.push(searchCond);
    }
  }

  if (params.category_id) {
    conds.push(eq(referencesTable.category_id, params.category_id));
  }
  if (params.sub_category_id) {
    conds.push(
      eq(referencesTable.sub_category_id, params.sub_category_id),
    );
  }

  // module_key => categories.module_key filtresi
  if (params.module_key) {
    conds.push(eq(categories.module_key, params.module_key));
  }

  // website URL var/yok
  if (typeof params.has_website !== "undefined") {
    if (toBool(params.has_website)) {
      conds.push(
        sql`${referencesTable.website_url} IS NOT NULL AND ${referencesTable.website_url} <> ''`,
      );
    } else {
      conds.push(
        sql`(${referencesTable.website_url} IS NULL OR ${referencesTable.website_url} = '')`,
      );
    }
  }

  const ord = parseOrder(
    params.orderParam,
    params.sort,
    params.order,
  );

  let orderExpr: SQL;
  if (ord) {
    switch (ord.col) {
      case "created_at":
        orderExpr =
          ord.dir === "asc"
            ? asc(referencesTable.created_at)
            : desc(referencesTable.created_at);
        break;
      case "updated_at":
        orderExpr =
          ord.dir === "asc"
            ? asc(referencesTable.updated_at)
            : desc(referencesTable.updated_at);
        break;
      case "display_order":
      default:
        orderExpr =
          ord.dir === "asc"
            ? asc(referencesTable.display_order)
            : desc(referencesTable.display_order);
        break;
    }
  } else {
    orderExpr = asc(referencesTable.display_order);
  }

  const take = params.limit && params.limit > 0 ? params.limit : 50;
  const skip = params.offset && params.offset >= 0 ? params.offset : 0;

  // Ana query – sade select objesi
  const baseSelect = {
    id: referencesTable.id,
    is_published: referencesTable.is_published,
    is_featured: referencesTable.is_featured,
    display_order: referencesTable.display_order,

    featured_image: referencesTable.featured_image,
    featured_image_asset_id: referencesTable.featured_image_asset_id,
    website_url: referencesTable.website_url,

    category_id: referencesTable.category_id,
    sub_category_id: referencesTable.sub_category_id,

    // Şu an kategori isimleri parent tabloda yok, NULL placeholder
    category_name: sql<string | null>`NULL`.as("category_name"),
    category_slug: sql<string | null>`NULL`.as("category_slug"),
    sub_category_name: sql<string | null>`NULL`.as(
      "sub_category_name",
    ),
    sub_category_slug: sql<string | null>`NULL`.as(
      "sub_category_slug",
    ),

    title: referencesI18n.title,
    slug: referencesI18n.slug,
    summary: referencesI18n.summary,
    content: referencesI18n.content,
    featured_image_alt: referencesI18n.featured_image_alt,
    meta_title: referencesI18n.meta_title,
    meta_description: referencesI18n.meta_description,
    locale_resolved: referencesI18n.locale,
  };

  const baseQuery = db
    .select(baseSelect)
    .from(referencesTable)
    .innerJoin(
      referencesI18n,
      eq(referencesI18n.reference_id, referencesTable.id),
    )
    .leftJoin(
      categories,
      eq(categories.id, referencesTable.category_id),
    )
    .leftJoin(
      subCategories,
      eq(subCategories.id, referencesTable.sub_category_id),
    );

  // where condition – and(...) SQL | undefined olduğundan cast ediyoruz
  const whereCond =
    conds.length > 0
      ? (and(...conds.filter(Boolean) as SQL[]) as SQL)
      : undefined;

  const rowsQuery = whereCond
    ? baseQuery.where(whereCond as SQL)
    : baseQuery;

  const rows = await rowsQuery
    .orderBy(
      orderExpr,
      asc(referencesTable.created_at),
      asc(referencesTable.id),
    )
    .limit(take)
    .offset(skip);

  // Count
  const countBase = db
    .select({ c: sql<number>`COUNT(*)` })
    .from(referencesTable)
    .innerJoin(
      referencesI18n,
      eq(referencesI18n.reference_id, referencesTable.id),
    )
    .leftJoin(
      categories,
      eq(categories.id, referencesTable.category_id),
    )
    .leftJoin(
      subCategories,
      eq(subCategories.id, referencesTable.sub_category_id),
    );

  const countQuery = whereCond
    ? countBase.where(whereCond as SQL)
    : countBase;

  const cnt = await countQuery;
  const total = cnt[0]?.c ?? 0;

  return {
    items: rows as unknown as ReferenceMerged[],
    total,
  };
}

/* ==================================================================== */
/* GET by id / slug                                                     */
/* ==================================================================== */

export async function getReferenceMergedById(
  locale: Locale,
  _defaultLocale: Locale,
  id: string,
): Promise<ReferenceMerged | null> {
  const rows = await db
    .select({
      id: referencesTable.id,
      is_published: referencesTable.is_published,
      is_featured: referencesTable.is_featured,
      display_order: referencesTable.display_order,

      featured_image: referencesTable.featured_image,
      featured_image_asset_id: referencesTable.featured_image_asset_id,
      website_url: referencesTable.website_url,

      category_id: referencesTable.category_id,
      sub_category_id: referencesTable.sub_category_id,

      category_name: sql<string | null>`NULL`.as("category_name"),
      category_slug: sql<string | null>`NULL`.as("category_slug"),
      sub_category_name: sql<string | null>`NULL`.as(
        "sub_category_name",
      ),
      sub_category_slug: sql<string | null>`NULL`.as(
        "sub_category_slug",
      ),

      title: referencesI18n.title,
      slug: referencesI18n.slug,
      summary: referencesI18n.summary,
      content: referencesI18n.content,
      featured_image_alt: referencesI18n.featured_image_alt,
      meta_title: referencesI18n.meta_title,
      meta_description: referencesI18n.meta_description,
      locale_resolved: referencesI18n.locale,
    })
    .from(referencesTable)
    .innerJoin(
      referencesI18n,
      and(
        eq(referencesI18n.reference_id, referencesTable.id),
        eq(referencesI18n.locale, locale),
      ),
    )
    .leftJoin(
      categories,
      eq(categories.id, referencesTable.category_id),
    )
    .leftJoin(
      subCategories,
      eq(subCategories.id, referencesTable.sub_category_id),
    )
    .where(eq(referencesTable.id, id))
    .limit(1);

  return (rows[0] as ReferenceMerged) ?? null;
}

export async function getReferenceMergedBySlug(
  locale: Locale,
  _defaultLocale: Locale,
  slugStr: string,
): Promise<ReferenceMerged | null> {
  const rows = await db
    .select({
      id: referencesTable.id,
      is_published: referencesTable.is_published,
      is_featured: referencesTable.is_featured,
      display_order: referencesTable.display_order,

      featured_image: referencesTable.featured_image,
      featured_image_asset_id: referencesTable.featured_image_asset_id,
      website_url: referencesTable.website_url,

      category_id: referencesTable.category_id,
      sub_category_id: referencesTable.sub_category_id,

      category_name: sql<string | null>`NULL`.as("category_name"),
      category_slug: sql<string | null>`NULL`.as("category_slug"),
      sub_category_name: sql<string | null>`NULL`.as(
        "sub_category_name",
      ),
      sub_category_slug: sql<string | null>`NULL`.as(
        "sub_category_slug",
      ),

      title: referencesI18n.title,
      slug: referencesI18n.slug,
      summary: referencesI18n.summary,
      content: referencesI18n.content,
      featured_image_alt: referencesI18n.featured_image_alt,
      meta_title: referencesI18n.meta_title,
      meta_description: referencesI18n.meta_description,
      locale_resolved: referencesI18n.locale,
    })
    .from(referencesTable)
    .innerJoin(
      referencesI18n,
      and(
        eq(referencesI18n.reference_id, referencesTable.id),
        eq(referencesI18n.locale, locale),
      ),
    )
    .leftJoin(
      categories,
      eq(categories.id, referencesTable.category_id),
    )
    .leftJoin(
      subCategories,
      eq(subCategories.id, referencesTable.sub_category_id),
    )
    .where(eq(referencesI18n.slug, slugStr))
    .limit(1);

  return (rows[0] as ReferenceMerged) ?? null;
}

/* ==================================================================== */
/* Admin write helpers                                                  */
/* ==================================================================== */

export async function createReferenceParent(
  values: NewReferenceRow,
) {
  await db.insert(referencesTable).values(values);
  return values.id;
}

export async function updateReferenceParent(
  id: string,
  patch: Partial<NewReferenceRow>,
) {
  await db
    .update(referencesTable)
    .set({ ...patch, updated_at: new Date() as any })
    .where(eq(referencesTable.id, id));
}

export async function deleteReferenceParent(id: string) {
  const res = await db
    .delete(referencesTable)
    .where(eq(referencesTable.id, id))
    .execute();
  const affected =
    typeof (res as unknown as { affectedRows?: number }).affectedRows ===
    "number"
      ? (res as unknown as { affectedRows: number }).affectedRows
      : 0;
  return affected;
}

export async function getReferenceI18nRow(
  referenceId: string,
  locale: Locale,
) {
  const rows = await db
    .select()
    .from(referencesI18n)
    .where(
      and(
        eq(referencesI18n.reference_id, referenceId),
        eq(referencesI18n.locale, locale),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertReferenceI18n(
  referenceId: string,
  locale: Locale,
  data: Partial<
    Pick<
      NewReferenceI18nRow,
      | "title"
      | "slug"
      | "summary"
      | "content"
      | "featured_image_alt"
      | "meta_title"
      | "meta_description"
    >
  > & { id?: string },
) {
  const insertVals: NewReferenceI18nRow = {
    id: data.id ?? randomUUID(),
    reference_id: referenceId,
    locale,
    title: data.title ?? "",
    slug: data.slug ?? "",
    content:
      data.content != null ? data.content : JSON.stringify({ html: "" }),
    summary:
      typeof data.summary === "undefined"
        ? (null as any)
        : data.summary ?? null,
    featured_image_alt:
      typeof data.featured_image_alt === "undefined"
        ? (null as any)
        : data.featured_image_alt ?? null,
    meta_title:
      typeof data.meta_title === "undefined"
        ? (null as any)
        : data.meta_title ?? null,
    meta_description:
      typeof data.meta_description === "undefined"
        ? (null as any)
        : data.meta_description ?? null,
    created_at: new Date() as any,
    updated_at: new Date() as any,
  };

  const setObj: Record<string, any> = {};
  if (typeof data.title !== "undefined") setObj.title = data.title;
  if (typeof data.slug !== "undefined") setObj.slug = data.slug;
  if (typeof data.content !== "undefined") setObj.content = data.content;
  if (typeof data.summary !== "undefined")
    setObj.summary = data.summary ?? null;
  if (typeof data.featured_image_alt !== "undefined")
    setObj.featured_image_alt = data.featured_image_alt ?? null;
  if (typeof data.meta_title !== "undefined")
    setObj.meta_title = data.meta_title ?? null;
  if (typeof data.meta_description !== "undefined")
    setObj.meta_description = data.meta_description ?? null;
  setObj.updated_at = new Date();

  // Sadece updated_at varsa boş update atma
  if (Object.keys(setObj).length === 1) return;

  await db
    .insert(referencesI18n)
    .values(insertVals)
    .onDuplicateKeyUpdate({ set: setObj });
}

/* ==================================================================== */
/* Gallery read helpers                                                 */
/* ==================================================================== */

export type ReferenceImageMerged = {
  id: string;
  reference_id: string;
  asset_id: string;
  image_url: string | null;
  display_order: number;
  is_active: 0 | 1;
  alt: string | null;
  caption: string | null;
  locale_resolved: string | null;
};

export async function listReferenceImagesForReference(
  referenceId: string,
  locale: Locale,
  defaultLocale: Locale,
): Promise<ReferenceImageMerged[]> {
  const i18nReq = alias(referenceImagesI18n, "imgi_req");
  const i18nDef = alias(referenceImagesI18n, "imgi_def");

  const rows = await db
    .select({
      id: referenceImages.id,
      reference_id: referenceImages.reference_id,
      asset_id: referenceImages.asset_id,
      image_url: referenceImages.image_url,
      display_order: referenceImages.display_order,
      is_active: referenceImages.is_active,
      alt: sql<string>`COALESCE(${i18nReq.alt}, ${i18nDef.alt})`.as(
        "alt",
      ),
      caption: sql<string>`COALESCE(${i18nReq.caption}, ${i18nDef.caption})`.as(
        "caption",
      ),
      locale_resolved: sql<string>`
        CASE WHEN ${i18nReq.id} IS NOT NULL
             THEN ${i18nReq.locale}
             ELSE ${i18nDef.locale}
        END
      `.as("locale_resolved"),
    })
    .from(referenceImages)
    .leftJoin(
      i18nReq,
      and(
        eq(i18nReq.image_id, referenceImages.id),
        eq(i18nReq.locale, locale),
      ),
    )
    .leftJoin(
      i18nDef,
      and(
        eq(i18nDef.image_id, referenceImages.id),
        eq(i18nDef.locale, defaultLocale),
      ),
    )
    .where(eq(referenceImages.reference_id, referenceId))
    .orderBy(
      asc(referenceImages.display_order),
      asc(referenceImages.created_at),
    );

  return rows as ReferenceImageMerged[];
}
