// =============================================================
// FILE: src/modules/customPages/repository.ts
// =============================================================

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

// 🔗 Kategoriler (base + i18n)
import {
  categories,
  categoryI18n,
} from "@/modules/categories/schema";
import {
  subCategories,
  subCategoryI18n,
} from "@/modules/subcategories/schema";

/** Güvenilir sıralama kolonları */
type Sortable = "created_at" | "updated_at" | "display_order";

export type ListParams = {
  orderParam?: string;
  sort?: Sortable;
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;

  is_published?: boolean | 0 | 1 | "0" | "1" | "true" | "false";
  q?: string;
  slug?: string;

  // 🔗 Kategori filtreleri
  category_id?: string;
  sub_category_id?: string;

  // 🔗 Module filtresi (kategori üzerinden: categories.module_key)
  module_key?: string;

  // Dil bilgisi – dinamik, herhangi bir string olabilir
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

export type CustomPageMerged = {
  id: string;
  is_published: 0 | 1;
  featured_image: string | null;
  featured_image_asset_id: string | null;
  created_at: Date;
  updated_at: Date;

  category_id: string | null;
  category_name: string | null;
  category_slug: string | null;

  sub_category_id: string | null;
  sub_category_name: string | null;
  sub_category_slug: string | null;

  title: string | null;
  slug: string | null;
  content: string | null;
  summary: string | null;
  featured_image_alt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  tags: string | null;
  locale_resolved: string | null;
};

function baseSelect(
  i18nReq: any,
  i18nDef: any,
  catReq: any,
  catDef: any,
  subCatReq: any,
  subCatDef: any,
) {
  return {
    id: customPages.id,
    is_published: customPages.is_published,
    featured_image: customPages.featured_image,
    featured_image_asset_id: customPages.featured_image_asset_id,
    created_at: customPages.created_at,
    updated_at: customPages.updated_at,

    category_id: customPages.category_id,
    sub_category_id: customPages.sub_category_id,

    // 🔹 Kategori isim/slug – category_i18n üzerinden coalesced
    category_name: sql<string>`
      COALESCE(${catReq.name}, ${catDef.name})
    `.as("category_name"),
    category_slug: sql<string>`
      COALESCE(${catReq.slug}, ${catDef.slug})
    `.as("category_slug"),

    // 🔹 Alt kategori isim/slug – sub_category_i18n üzerinden coalesced
    sub_category_name: sql<string>`
      COALESCE(${subCatReq.name}, ${subCatDef.name})
    `.as("sub_category_name"),
    sub_category_slug: sql<string>`
      COALESCE(${subCatReq.slug}, ${subCatDef.slug})
    `.as("sub_category_slug"),

    // 🔹 Sayfanın kendi i18n alanları
    title: sql<string>`COALESCE(${i18nReq.title}, ${i18nDef.title})`.as(
      "title",
    ),
    slug: sql<string>`COALESCE(${i18nReq.slug}, ${i18nDef.slug})`.as(
      "slug",
    ),
    content: sql<string>`COALESCE(${i18nReq.content}, ${i18nDef.content})`.as(
      "content",
    ),
    summary: sql<string>`COALESCE(${i18nReq.summary}, ${i18nDef.summary})`.as(
      "summary",
    ),
    featured_image_alt: sql<string>`COALESCE(${i18nReq.featured_image_alt}, ${i18nDef.featured_image_alt})`.as(
      "featured_image_alt",
    ),
    meta_title: sql<string>`COALESCE(${i18nReq.meta_title}, ${i18nDef.meta_title})`.as(
      "meta_title",
    ),
    meta_description: sql<string>`COALESCE(${i18nReq.meta_description}, ${i18nDef.meta_description})`.as(
      "meta_description",
    ),
    tags: sql<string>`COALESCE(${i18nReq.tags}, ${i18nDef.tags})`.as("tags"),
    locale_resolved: sql<string>`
      CASE WHEN ${i18nReq.id} IS NOT NULL
           THEN ${i18nReq.locale}
           ELSE ${i18nDef.locale}
      END
    `.as("locale_resolved"),
  };
}

/** LIST (coalesced) */
export async function listCustomPages(params: ListParams) {
  const i18nReq = alias(customPagesI18n, "cpi_req");
  const i18nDef = alias(customPagesI18n, "cpi_def");

  // 🔹 category_i18n için alias (requested + default locale)
  const catReq = alias(categoryI18n, "cat_req");
  const catDef = alias(categoryI18n, "cat_def");

  // 🔹 sub_category_i18n için alias
  const subCatReq = alias(subCategoryI18n, "subcat_req");
  const subCatDef = alias(subCategoryI18n, "subcat_def");

  // Locale’leri normalize et (dinamik ama her zaman lowercase)
  const locale = params.locale.toLowerCase();
  const defaultLocale = params.defaultLocale.toLowerCase();

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
      OR COALESCE(${i18nReq.summary}, ${i18nDef.summary}) LIKE ${s}
      OR COALESCE(${i18nReq.tags}, ${i18nDef.tags}) LIKE ${s}
    )`);
  }

  if (params.category_id) {
    filters.push(eq(customPages.category_id, params.category_id));
  }
  if (params.sub_category_id) {
    filters.push(eq(customPages.sub_category_id, params.sub_category_id));
  }

  // 🔗 module_key filtresi: categories.module_key üzerinden (base tablo)
  if (params.module_key) {
    const mk = params.module_key;
    filters.push(
      sql`
        EXISTS (
          SELECT 1
          FROM ${categories} c
          WHERE c.id = ${customPages.category_id}
            AND c.module_key = ${mk}
        )
      `,
    );
  }

  let whereExpr: SQL | undefined;
  if (filters.length) {
    whereExpr = and(...filters) as SQL;
  }

  const ord = parseOrder(params.orderParam, params.sort, params.order);

  // 👇 TS’nin customPages[ord.col] index’ini sevmemesi yüzünden switch ile çözüyoruz
  const orderBy =
    ord != null
      ? (() => {
          switch (ord.col) {
            case "created_at":
              return ord.dir === "asc"
                ? asc(customPages.created_at)
                : desc(customPages.created_at);
            case "updated_at":
              return ord.dir === "asc"
                ? asc(customPages.updated_at)
                : desc(customPages.updated_at);
            case "display_order":
            default:
              return ord.dir === "asc"
                ? asc(customPages.display_order)
                : desc(customPages.display_order);
          }
        })()
      : asc(customPages.display_order); // default: display_order ASC

  const take = params.limit && params.limit > 0 ? params.limit : 50;
  const skip = params.offset && params.offset >= 0 ? params.offset : 0;

  const baseQuery = db
    .select(
      baseSelect(i18nReq, i18nDef, catReq, catDef, subCatReq, subCatDef),
    )
    .from(customPages)
    // i18n (requested locale)
    .leftJoin(
      i18nReq,
      and(
        eq(i18nReq.page_id, customPages.id),
        eq(i18nReq.locale, locale),
      ),
    )
    // i18n (default locale)
    .leftJoin(
      i18nDef,
      and(
        eq(i18nDef.page_id, customPages.id),
        eq(i18nDef.locale, defaultLocale),
      ),
    )
    // kategori i18n (requested)
    .leftJoin(
      catReq,
      and(
        eq(catReq.category_id, customPages.category_id),
        eq(catReq.locale, locale),
      ),
    )
    // kategori i18n (default)
    .leftJoin(
      catDef,
      and(
        eq(catDef.category_id, customPages.category_id),
        eq(catDef.locale, defaultLocale),
      ),
    )
    // alt kategori i18n (requested)
    .leftJoin(
      subCatReq,
      and(
        eq(subCatReq.sub_category_id, customPages.sub_category_id),
        eq(subCatReq.locale, locale),
      ),
    )
    // alt kategori i18n (default)
    .leftJoin(
      subCatDef,
      and(
        eq(subCatDef.sub_category_id, customPages.sub_category_id),
        eq(subCatDef.locale, defaultLocale),
      ),
    );

  const rowsQuery = whereExpr ? baseQuery.where(whereExpr) : baseQuery;

  const rows = await rowsQuery.orderBy(orderBy).limit(take).offset(skip);

  const baseCountQuery = db
    .select({ c: sql<number>`COUNT(1)` })
    .from(customPages)
    .leftJoin(
      i18nReq,
      and(
        eq(i18nReq.page_id, customPages.id),
        eq(i18nReq.locale, locale),
      ),
    )
    .leftJoin(
      i18nDef,
      and(
        eq(i18nDef.page_id, customPages.id),
        eq(i18nDef.locale, defaultLocale),
      ),
    );

  const countQuery = whereExpr
    ? baseCountQuery.where(whereExpr)
    : baseCountQuery;

  const cnt = await countQuery;

  const total = cnt[0]?.c ?? 0;
  return { items: rows as unknown as CustomPageMerged[], total };
}

/** GET by id (coalesced) */
export async function getCustomPageMergedById(
  locale: string,
  defaultLocale: string,
  id: string,
) {
  const i18nReq = alias(customPagesI18n, "cpi_req");
  const i18nDef = alias(customPagesI18n, "cpi_def");

  const catReq = alias(categoryI18n, "cat_req");
  const catDef = alias(categoryI18n, "cat_def");
  const subCatReq = alias(subCategoryI18n, "subcat_req");
  const subCatDef = alias(subCategoryI18n, "subcat_def");

  const loc = locale.toLowerCase();
  const defLoc = defaultLocale.toLowerCase();

  const rows = await db
    .select(
      baseSelect(i18nReq, i18nDef, catReq, catDef, subCatReq, subCatDef),
    )
    .from(customPages)
    .leftJoin(
      i18nReq,
      and(eq(i18nReq.page_id, customPages.id), eq(i18nReq.locale, loc)),
    )
    .leftJoin(
      i18nDef,
      and(
        eq(i18nDef.page_id, customPages.id),
        eq(i18nDef.locale, defLoc),
      ),
    )
    .leftJoin(
      catReq,
      and(
        eq(catReq.category_id, customPages.category_id),
        eq(catReq.locale, loc),
      ),
    )
    .leftJoin(
      catDef,
      and(
        eq(catDef.category_id, customPages.category_id),
        eq(catDef.locale, defLoc),
      ),
    )
    .leftJoin(
      subCatReq,
      and(
        eq(subCatReq.sub_category_id, customPages.sub_category_id),
        eq(subCatReq.locale, loc),
      ),
    )
    .leftJoin(
      subCatDef,
      and(
        eq(subCatDef.sub_category_id, customPages.sub_category_id),
        eq(subCatDef.locale, defLoc),
      ),
    )
    .where(eq(customPages.id, id))
    .limit(1);

  return (rows[0] ?? null) as unknown as CustomPageMerged | null;
}

/** GET by slug (coalesced) */
export async function getCustomPageMergedBySlug(
  locale: string,
  defaultLocale: string,
  slug: string,
) {
  const i18nReq = alias(customPagesI18n, "cpi_req");
  const i18nDef = alias(customPagesI18n, "cpi_def");

  const catReq = alias(categoryI18n, "cat_req");
  const catDef = alias(categoryI18n, "cat_def");
  const subCatReq = alias(subCategoryI18n, "subcat_req");
  const subCatDef = alias(subCategoryI18n, "subcat_def");

  const loc = locale.toLowerCase();
  const defLoc = defaultLocale.toLowerCase();
  const slugTrimmed = slug.trim();

  const rows = await db
    .select(
      baseSelect(i18nReq, i18nDef, catReq, catDef, subCatReq, subCatDef),
    )
    .from(customPages)
    .leftJoin(
      i18nReq,
      and(eq(i18nReq.page_id, customPages.id), eq(i18nReq.locale, loc)),
    )
    .leftJoin(
      i18nDef,
      and(
        eq(i18nDef.page_id, customPages.id),
        eq(i18nDef.locale, defLoc),
      ),
    )
    .leftJoin(
      catReq,
      and(
        eq(catReq.category_id, customPages.category_id),
        eq(catReq.locale, loc),
      ),
    )
    .leftJoin(
      catDef,
      and(
        eq(catDef.category_id, customPages.category_id),
        eq(catDef.locale, defLoc),
      ),
    )
    .leftJoin(
      subCatReq,
      and(
        eq(subCatReq.sub_category_id, customPages.sub_category_id),
        eq(subCatReq.locale, loc),
      ),
    )
    .leftJoin(
      subCatDef,
      and(
        eq(subCatDef.sub_category_id, customPages.sub_category_id),
        eq(subCatDef.locale, defLoc),
      ),
    )
    .where(
      sql`COALESCE(${i18nReq.slug}, ${i18nDef.slug}) = ${slugTrimmed}`,
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
  data: Partial<
    Pick<
      NewCustomPageI18nRow,
      | "title"
      | "slug"
      | "content"
      | "summary"
      | "featured_image_alt"
      | "meta_title"
      | "meta_description"
      | "tags"
    >
  > & { id?: string },
) {
  const loc = locale.toLowerCase();

  const insertVals: NewCustomPageI18nRow = {
    id: data.id ?? randomUUID(),
    page_id: pageId,
    locale: loc,
    title: data.title ?? "",
    slug: data.slug ?? "",
    content: data.content ?? JSON.stringify({ html: "" }),
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
    tags:
      typeof data.tags === "undefined"
        ? (null as any)
        : data.tags ?? null,
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
  if (typeof data.tags !== "undefined") setObj.tags = data.tags ?? null;
  setObj.updated_at = new Date();

  // sadece updated_at varsa update etmeye gerek yok
  if (Object.keys(setObj).length === 1) return;

  await db
    .insert(customPagesI18n)
    .values(insertVals)
    .onDuplicateKeyUpdate({ set: setObj });
}

export async function updateCustomPageParent(
  id: string,
  patch: Partial<NewCustomPageRow>,
) {
  await db
    .update(customPages)
    .set({ ...patch, updated_at: new Date() as any })
    .where(eq(customPages.id, id));
}

export async function deleteCustomPageParent(id: string) {
  const res = await db
    .delete(customPages)
    .where(eq(customPages.id, id))
    .execute();
  const affected =
    typeof (res as unknown as { affectedRows?: number }).affectedRows ===
    "number"
      ? (res as unknown as { affectedRows: number }).affectedRows
      : 0;
  return affected;
}

export async function getCustomPageI18nRow(
  pageId: string,
  locale: string,
) {
  const loc = locale.toLowerCase();
  const rows = await db
    .select()
    .from(customPagesI18n)
    .where(
      and(
        eq(customPagesI18n.page_id, pageId),
        eq(customPagesI18n.locale, loc),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

/** REORDER – display_order toplu güncelle */
export async function reorderCustomPages(items: {
  id: string;
  display_order: number;
}[]) {
  if (!items || !items.length) return;

  await db.transaction(async (tx) => {
    for (const item of items) {
      await tx
        .update(customPages)
        .set({
          display_order: item.display_order,
          updated_at: new Date() as any,
        })
        .where(eq(customPages.id, item.id));
    }
  });
}
