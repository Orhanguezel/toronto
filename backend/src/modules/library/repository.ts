// src/modules/library/repository.ts
// =============================================================

import { db } from "@/db/client";
import {
  library,
  libraryI18n,
  libraryImages,
  libraryImagesI18n,
  libraryFiles,
  type NewLibraryRow,
  type NewLibraryI18nRow,
  type NewLibraryImageRow,
  type NewLibraryImageI18nRow,
  type NewLibraryFileRow,
} from "./schema";
import { and, asc, desc, eq, sql, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";
import { LOCALES, type Locale } from "@/core/i18n";

// storage join
import { storageAssets } from "@/modules/storage/schema";
import { publicUrlOf } from "@/modules/storage/_util";

// 🔗 Kategoriler (base + i18n)
import {
  categories,
  categoryI18n,
} from "@/modules/categories/schema";
import {
  subCategories,
  subCategoryI18n,
} from "@/modules/subcategories/schema";

/* ============== helpers ============== */

type Sortable =
  | "created_at"
  | "updated_at"
  | "published_at"
  | "display_order"
  | "views"
  | "download_count";

export type LibraryListParams = {
  orderParam?: string;
  sort?: Sortable;
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;

  is_published?:
  | boolean
  | 0
  | 1
  | "0"
  | "1"
  | "true"
  | "false";
  is_active?:
  | boolean
  | 0
  | 1
  | "0"
  | "1"
  | "true"
  | "false";

  q?: string;
  slug?: string;

  // 🔗 Kategori filtreleri
  category_id?: string;
  sub_category_id?: string;

  // 🔗 Module filtresi (kategorinin module_key üzerinden)
  module_key?: string;

  author?: string;

  published_before?: string;
  published_after?: string;

  locale: Locale;
  defaultLocale: Locale;
};

const to01 = (v: unknown): 0 | 1 | undefined => {
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
    if (
      col &&
      dir &&
      (
        col === "created_at" ||
        col === "updated_at" ||
        col === "published_at" ||
        col === "display_order" ||
        col === "views" ||
        col === "download_count"
      )
    ) {
      return { col, dir };
    }
  }
  if (sort && ord) return { col: sort, dir: ord };
  return null;
};

const isRec = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

/** HTML string → JSON-string {"html": "..."} (şu an kullanılmıyor ama dursun) */
export const packContent = (htmlOrJson: string): string => {
  try {
    const parsed = JSON.parse(htmlOrJson) as unknown;
    if (isRec(parsed) && typeof (parsed as any).html === "string") {
      return JSON.stringify({ html: (parsed as any).html });
    }
  } catch { }
  return JSON.stringify({ html: htmlOrJson });
};

/**
 * Eski davranış: düz string[] → JSON-string
 * (library_files.tags_json ve eski düz yapılar için)
 */
export const packTags = (tags?: string[] | null): string | null => {
  if (!tags || !tags.length) return null;
  try {
    return JSON.stringify(tags);
  } catch {
    return null;
  }
};

/**
 * Düz string[] JSON'undan tags çıkar (locale bağımsız)
 * - ["a","b"] → ["a","b"]
 * - geçersiz JSON → null
 */
export const unpackTagsSimple = (
  json?: string | null,
): string[] | null => {
  if (!json) return null;
  try {
    const val = JSON.parse(json);
    if (Array.isArray(val)) {
      return val.filter((x) => typeof x === "string") as string[];
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Locale-aware tags parser:
 * - {"tr":["..."],"en":["..."]} → o anki locale’e göre tags
 * - Eğer obje değil ama array ise → array olduğu gibi döner (backward compat)
 * - Hiçbir şey tutmuyorsa → null
 */
export const unpackTagsLocalized = (
  json: string | null | undefined,
  locale: Locale,
  defaultLocale: Locale,
): string[] | null => {
  if (!json) return null;
  try {
    const val = JSON.parse(json);

    // Eski yapı: düz string[]
    if (Array.isArray(val)) {
      return val.filter((x) => typeof x === "string") as string[];
    }

    // Yeni yapı: { "tr": [...], "en": [...] }
    if (val && typeof val === "object") {
      const obj = val as Record<string, unknown>;
      const fromLocale = obj[locale];
      const fromDefault = obj[defaultLocale];

      let picked: unknown[] | null = null;

      if (Array.isArray(fromLocale)) {
        picked = fromLocale as unknown[];
      } else if (Array.isArray(fromDefault)) {
        picked = fromDefault as unknown[];
      }

      if (!picked) return null;
      return picked.filter((x) => typeof x === "string") as string[];
    }

    return null;
  } catch {
    return null;
  }
};

// Eski import'lar kırılmasın diye:
export const unpackTags = unpackTagsSimple;

/* ============== merged select (library) ============== */

export type LibraryMerged = {
  id: string;
  is_published: 0 | 1;
  is_active: 0 | 1;
  display_order: number;
  tags_json: string | null;

  category_id: string | null;
  category_name: string | null;
  category_slug: string | null;

  sub_category_id: string | null;
  sub_category_name: string | null;
  sub_category_slug: string | null;

  author: string | null;
  views: number;
  download_count: number;
  published_at: string | Date | null;

  created_at: string | Date;
  updated_at: string | Date;

  title: string | null;
  slug: string | null;
  summary: string | null;
  content: string | null;
  meta_title: string | null;
  meta_description: string | null;
  locale_resolved: string | null;
};

export type LibraryView = {
  id: string;
  is_published: 0 | 1;
  is_active: 0 | 1;
  display_order: number;
  tags: string[] | null;

  category_id: string | null;
  category_name: string | null;
  category_slug: string | null;

  sub_category_id: string | null;
  sub_category_name: string | null;
  sub_category_slug: string | null;

  author: string | null;
  views: number;
  download_count: number;
  published_at: string | null;

  created_at: string | Date;
  updated_at: string | Date;

  title: string | null;
  slug: string | null;
  summary: string | null;
  content: string | null;
  meta_title: string | null;
  meta_description: string | null;
  locale_resolved: string | null;
};

function baseLibrarySelect(
  reqI: any,
  defI: any,
  catReq: any,
  catDef: any,
  subCatReq: any,
  subCatDef: any,
) {
  return {
    id: library.id,
    is_published: library.is_published,
    is_active: library.is_active,
    display_order: library.display_order,
    tags_json: library.tags_json,

    category_id: library.category_id,
    sub_category_id: library.sub_category_id,

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

    author: library.author,
    views: library.views,
    download_count: library.download_count,
    published_at: library.published_at,
    created_at: library.created_at,
    updated_at: library.updated_at,

    title: sql<string>`COALESCE(${reqI.title}, ${defI.title})`.as("title"),
    slug: sql<string>`COALESCE(${reqI.slug}, ${defI.slug})`.as("slug"),
    summary: sql<string>`COALESCE(${reqI.summary}, ${defI.summary})`.as(
      "summary",
    ),
    content: sql<string>`COALESCE(${reqI.content}, ${defI.content})`.as(
      "content",
    ),
    meta_title: sql<string>`COALESCE(${reqI.meta_title}, ${defI.meta_title})`.as(
      "meta_title",
    ),
    meta_description: sql<string>`COALESCE(${reqI.meta_description}, ${defI.meta_description})`.as(
      "meta_description",
    ),
    locale_resolved: sql<string>`
      CASE WHEN ${reqI.id} IS NOT NULL THEN ${reqI.locale} ELSE ${defI.locale} END
    `.as("locale_resolved"),
  };
}

/* ============== LIST / GET (library) ============== */

export async function listLibraries(
  params: LibraryListParams,
): Promise<{ items: LibraryView[]; total: number }> {
  const reqI = alias(libraryI18n, "li_req");
  const defI = alias(libraryI18n, "li_def");

  // 🔹 category_i18n için alias (requested + default locale)
  const catReq = alias(categoryI18n, "cat_req");
  const catDef = alias(categoryI18n, "cat_def");

  // 🔹 sub_category_i18n için alias
  const subCatReq = alias(subCategoryI18n, "subcat_req");
  const subCatDef = alias(subCategoryI18n, "subcat_def");

  const filters: SQL[] = [];

  const pub = to01(params.is_published);
  if (pub !== undefined) filters.push(eq(library.is_published, pub));
  const act = to01(params.is_active);
  if (act !== undefined) filters.push(eq(library.is_active, act));

  if (params.slug && params.slug.trim()) {
    const v = params.slug.trim();
    filters.push(sql`COALESCE(${reqI.slug}, ${defI.slug}) = ${v}`);
  }

  if (params.q && params.q.trim()) {
    const s = `%${params.q.trim()}%`;
    filters.push(sql`(
      COALESCE(${reqI.title}, ${defI.title}) LIKE ${s}
      OR COALESCE(${reqI.summary}, ${defI.summary}) LIKE ${s}
      OR COALESCE(${reqI.meta_title}, ${defI.meta_title}) LIKE ${s}
      OR COALESCE(${reqI.meta_description}, ${defI.meta_description}) LIKE ${s}
    )`);
  }

  if (params.category_id) {
    filters.push(eq(library.category_id, params.category_id));
  }
  if (params.sub_category_id) {
    filters.push(eq(library.sub_category_id, params.sub_category_id));
  }

  // 🔗 module_key filtresi: categories.module_key üzerinden
  if (params.module_key) {
    const mk = params.module_key;
    filters.push(
      sql`
        EXISTS (
          SELECT 1
          FROM ${categories} c
          WHERE c.id = ${library.category_id}
            AND c.module_key = ${mk}
        )
      `,
    );
  }

  if (params.author && params.author.trim()) {
    filters.push(eq(library.author, params.author.trim()));
  }

  if (params.published_before) {
    filters.push(sql`${library.published_at} < ${params.published_before}`);
  }
  if (params.published_after) {
    filters.push(sql`${library.published_at} > ${params.published_after}`);
  }

  const whereExpr: SQL =
    filters.length ? ((and(...filters) as SQL)) : sql`1=1`;

  const ord = parseOrder(params.orderParam, params.sort, params.order);
  const orderBy = ord
    ? ord.dir === "asc"
      ? asc(library[ord.col])
      : desc(library[ord.col])
    : desc(library.created_at);

  const take = params.limit && params.limit > 0 ? params.limit : 50;
  const skip = params.offset && params.offset >= 0 ? params.offset : 0;

  const rows = await db
    .select(
      baseLibrarySelect(reqI, defI, catReq, catDef, subCatReq, subCatDef),
    )
    .from(library)
    .leftJoin(
      reqI,
      and(eq(reqI.library_id, library.id), eq(reqI.locale, params.locale)),
    )
    .leftJoin(
      defI,
      and(
        eq(defI.library_id, library.id),
        eq(defI.locale, params.defaultLocale),
      ),
    )
    // kategori i18n (requested)
    .leftJoin(
      catReq,
      and(
        eq(catReq.category_id, library.category_id),
        eq(catReq.locale, params.locale),
      ),
    )
    // kategori i18n (default)
    .leftJoin(
      catDef,
      and(
        eq(catDef.category_id, library.category_id),
        eq(catDef.locale, params.defaultLocale),
      ),
    )
    // alt kategori i18n (requested)
    .leftJoin(
      subCatReq,
      and(
        eq(subCatReq.sub_category_id, library.sub_category_id),
        eq(subCatReq.locale, params.locale),
      ),
    )
    // alt kategori i18n (default)
    .leftJoin(
      subCatDef,
      and(
        eq(subCatDef.sub_category_id, library.sub_category_id),
        eq(subCatDef.locale, params.defaultLocale),
      ),
    )
    .where(whereExpr)
    .orderBy(orderBy)
    .limit(take)
    .offset(skip);

  const cnt = await db
    .select({ c: sql<number>`COUNT(1)` })
    .from(library)
    .leftJoin(
      reqI,
      and(eq(reqI.library_id, library.id), eq(reqI.locale, params.locale)),
    )
    .leftJoin(
      defI,
      and(
        eq(defI.library_id, library.id),
        eq(defI.locale, params.defaultLocale),
      ),
    )
    .where(whereExpr);

  const total = cnt[0]?.c ?? 0;

  const items: LibraryView[] = (rows as any[]).map((r) => ({
    id: r.id,
    is_published: r.is_published,
    is_active: r.is_active,
    display_order: r.display_order,
    // 🔹 tags artık locale-aware
    tags: unpackTagsLocalized(
      r.tags_json,
      params.locale,
      params.defaultLocale,
    ),

    category_id: r.category_id ?? null,
    category_name: r.category_name ?? null,
    category_slug: r.category_slug ?? null,

    sub_category_id: r.sub_category_id ?? null,
    sub_category_name: r.sub_category_name ?? null,
    sub_category_slug: r.sub_category_slug ?? null,

    author: r.author ?? null,
    views: r.views ?? 0,
    download_count: r.download_count ?? 0,
    published_at: r.published_at ? String(r.published_at) : null,

    created_at: r.created_at,
    updated_at: r.updated_at,

    title: r.title ?? null,
    slug: r.slug ?? null,
    summary: r.summary ?? null,
    content: r.content ?? null,
    meta_title: r.meta_title ?? null,
    meta_description: r.meta_description ?? null,
    locale_resolved: r.locale_resolved ?? null,
  }));

  return { items, total };
}

export async function getLibraryMergedById(
  locale: Locale,
  defaultLocale: Locale,
  id: string,
): Promise<LibraryView | null> {
  const reqI = alias(libraryI18n, "li_req");
  const defI = alias(libraryI18n, "li_def");

  const catReq = alias(categoryI18n, "cat_req");
  const catDef = alias(categoryI18n, "cat_def");
  const subCatReq = alias(subCategoryI18n, "subcat_req");
  const subCatDef = alias(subCategoryI18n, "subcat_def");

  const rows = await db
    .select(
      baseLibrarySelect(reqI, defI, catReq, catDef, subCatReq, subCatDef),
    )
    .from(library)
    .leftJoin(
      reqI,
      and(eq(reqI.library_id, library.id), eq(reqI.locale, locale)),
    )
    .leftJoin(
      defI,
      and(
        eq(defI.library_id, library.id),
        eq(defI.locale, defaultLocale),
      ),
    )
    .leftJoin(
      catReq,
      and(
        eq(catReq.category_id, library.category_id),
        eq(catReq.locale, locale),
      ),
    )
    .leftJoin(
      catDef,
      and(
        eq(catDef.category_id, library.category_id),
        eq(catDef.locale, defaultLocale),
      ),
    )
    .leftJoin(
      subCatReq,
      and(
        eq(subCatReq.sub_category_id, library.sub_category_id),
        eq(subCatReq.locale, locale),
      ),
    )
    .leftJoin(
      subCatDef,
      and(
        eq(subCatDef.sub_category_id, library.sub_category_id),
        eq(subCatDef.locale, defaultLocale),
      ),
    )
    .where(eq(library.id, id))
    .limit(1);

  const r: any = rows[0];
  if (!r) return null;

  return {
    id: r.id,
    is_published: r.is_published,
    is_active: r.is_active,
    display_order: r.display_order,
    tags: unpackTagsLocalized(r.tags_json, locale, defaultLocale),
    category_id: r.category_id ?? null,
    category_name: r.category_name ?? null,
    category_slug: r.category_slug ?? null,
    sub_category_id: r.sub_category_id ?? null,
    sub_category_name: r.sub_category_name ?? null,
    sub_category_slug: r.sub_category_slug ?? null,
    author: r.author ?? null,
    views: r.views ?? 0,
    download_count: r.download_count ?? 0,
    published_at: r.published_at ? String(r.published_at) : null,
    created_at: r.created_at,
    updated_at: r.updated_at,
    title: r.title ?? null,
    slug: r.slug ?? null,
    summary: r.summary ?? null,
    content: r.content ?? null,
    meta_title: r.meta_title ?? null,
    meta_description: r.meta_description ?? null,
    locale_resolved: r.locale_resolved ?? null,
  };
}

export async function getLibraryMergedBySlug(
  locale: Locale,
  defaultLocale: Locale,
  slugValue: string,
): Promise<LibraryView | null> {
  const reqI = alias(libraryI18n, "li_req");
  const defI = alias(libraryI18n, "li_def");

  const catReq = alias(categoryI18n, "cat_req");
  const catDef = alias(categoryI18n, "cat_def");
  const subCatReq = alias(subCategoryI18n, "subcat_req");
  const subCatDef = alias(subCategoryI18n, "subcat_def");

  const rows = await db
    .select(
      baseLibrarySelect(reqI, defI, catReq, catDef, subCatReq, subCatDef),
    )
    .from(library)
    .leftJoin(
      reqI,
      and(eq(reqI.library_id, library.id), eq(reqI.locale, locale)),
    )
    .leftJoin(
      defI,
      and(
        eq(defI.library_id, library.id),
        eq(defI.locale, defaultLocale),
      ),
    )
    .leftJoin(
      catReq,
      and(
        eq(catReq.category_id, library.category_id),
        eq(catReq.locale, locale),
      ),
    )
    .leftJoin(
      catDef,
      and(
        eq(catDef.category_id, library.category_id),
        eq(catDef.locale, defaultLocale),
      ),
    )
    .leftJoin(
      subCatReq,
      and(
        eq(subCatReq.sub_category_id, library.sub_category_id),
        eq(subCatReq.locale, locale),
      ),
    )
    .leftJoin(
      subCatDef,
      and(
        eq(subCatDef.sub_category_id, library.sub_category_id),
        eq(subCatDef.locale, defaultLocale),
      ),
    )
    .where(
      sql`( ${reqI.id} IS NOT NULL AND ${reqI.slug} = ${slugValue} )
          OR ( ${reqI.id} IS NULL AND ${defI.slug} = ${slugValue} )`,
    )
    .limit(1);

  const r: any = rows[0];
  if (!r) return null;

  return {
    id: r.id,
    is_published: r.is_published,
    is_active: r.is_active,
    display_order: r.display_order,
    tags: unpackTagsLocalized(r.tags_json, locale, defaultLocale),
    category_id: r.category_id ?? null,
    category_name: r.category_name ?? null,
    category_slug: r.category_slug ?? null,
    sub_category_id: r.sub_category_id ?? null,
    sub_category_name: r.sub_category_name ?? null,
    sub_category_slug: r.sub_category_slug ?? null,
    author: r.author ?? null,
    views: r.views ?? 0,
    download_count: r.download_count ?? 0,
    published_at: r.published_at ? String(r.published_at) : null,
    created_at: r.created_at,
    updated_at: r.updated_at,
    title: r.title ?? null,
    slug: r.slug ?? null,
    summary: r.summary ?? null,
    content: r.content ?? null,
    meta_title: r.meta_title ?? null,
    meta_description: r.meta_description ?? null,
    locale_resolved: r.locale_resolved ?? null,
  };
}

/* ============== parent write (library) ============== */

export async function createLibraryParent(values: NewLibraryRow) {
  await db.insert(library).values(values);
  return values.id;
}

export async function updateLibraryParent(
  id: string,
  patch: Partial<NewLibraryRow>,
) {
  await db
    .update(library)
    .set({ ...patch, updated_at: new Date() as any })
    .where(eq(library.id, id));
}

export async function deleteLibraryParent(id: string) {
  const res = await db.delete(library).where(eq(library.id, id)).execute();
  const affected =
    typeof (res as unknown as { affectedRows?: number }).affectedRows ===
      "number"
      ? (res as unknown as { affectedRows: number }).affectedRows
      : 0;
  return affected;
}

/* ============== i18n write (library_i18n) ============== */

export async function upsertLibraryI18n(
  libraryId: string,
  locale: Locale,
  data: Partial<
    Pick<
      NewLibraryI18nRow,
      "title" | "slug" | "summary" | "content" | "meta_title" | "meta_description"
    >
  > & { id?: string },
) {
  const insertVals: NewLibraryI18nRow = {
    id: data.id ?? randomUUID(),
    library_id: libraryId,
    locale,
    title: data.title ?? "",
    slug: data.slug ?? "",
    summary:
      typeof data.summary === "undefined"
        ? (null as any)
        : data.summary ?? null,
    content: data.content ?? JSON.stringify({ html: "" }),
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
  if (typeof data.summary !== "undefined")
    setObj.summary = data.summary ?? null;
  if (typeof data.content !== "undefined") setObj.content = data.content;
  if (typeof data.meta_title !== "undefined")
    setObj.meta_title = data.meta_title ?? null;
  if (typeof data.meta_description !== "undefined")
    setObj.meta_description = data.meta_description ?? null;
  setObj.updated_at = new Date();

  if (Object.keys(setObj).length === 1) return;

  await db
    .insert(libraryI18n)
    .values(insertVals)
    .onDuplicateKeyUpdate({ set: setObj });
}

export async function upsertLibraryI18nAllLocales(
  libraryId: string,
  data: Partial<
    Pick<
      NewLibraryI18nRow,
      "title" | "slug" | "summary" | "content" | "meta_title" | "meta_description"
    >
  >,
) {
  for (const l of LOCALES) {
    await upsertLibraryI18n(libraryId, l as Locale, data);
  }
}

export async function getLibraryI18nRow(
  libraryId: string,
  locale: Locale,
) {
  const rows = await db
    .select()
    .from(libraryI18n)
    .where(
      and(
        eq(libraryI18n.library_id, libraryId),
        eq(libraryI18n.locale, locale),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

/* ============== IMAGES repo (storage join) ============== */

export type LibraryImageMerged = {
  id: string;
  library_id: string;
  asset_id: string;
  image_url: string | null;
  thumb_url: string | null;
  webp_url: string | null;
  display_order: number;
  is_active: 0 | 1;
  created_at: string | Date;
  updated_at: string | Date;

  alt: string | null;
  caption: string | null;
  locale_resolved: string | null;

  img_bucket?: string | null;
  img_path?: string | null;
  img_url?: string | null;
  img_width?: number | null;
  img_height?: number | null;
  img_mime?: string | null;
};

export type LibraryImageView = {
  id: string;
  library_id: string;
  asset_id: string;
  url: string | null;
  thumbnail: string | null;
  webp: string | null;
  alt: string | null;
  caption: string | null;
  display_order: number;
  is_active: 0 | 1;
  created_at: string | Date;
  updated_at: string | Date;
  asset?: {
    bucket: string;
    path: string;
    url: string | null;
    width: number | null;
    height: number | null;
    mime: string | null;
  } | null;
};

function baseImageSelect(reqI: any, defI: any, sa: any) {
  return {
    id: libraryImages.id,
    library_id: libraryImages.library_id,
    asset_id: libraryImages.asset_id,
    image_url: libraryImages.image_url,
    thumb_url: libraryImages.thumb_url,
    webp_url: libraryImages.webp_url,
    display_order: libraryImages.display_order,
    is_active: libraryImages.is_active,
    created_at: libraryImages.created_at,
    updated_at: libraryImages.updated_at,

    alt: sql<string>`COALESCE(${reqI.alt}, ${defI.alt})`.as("alt"),
    caption: sql<string>`COALESCE(${reqI.caption}, ${defI.caption})`.as(
      "caption",
    ),
    locale_resolved: sql<string>`
      CASE WHEN ${reqI.id} IS NOT NULL THEN ${reqI.locale} ELSE ${defI.locale} END
    `.as("locale_resolved"),

    img_bucket: sa.bucket,
    img_path: sa.path,
    img_url: sa.url,
    img_width: sa.width,
    img_height: sa.height,
    img_mime: sa.mime,
  };
}

export async function listLibraryImagesMerged(
  libraryId: string,
  locale: Locale,
  defaultLocale: Locale,
): Promise<LibraryImageView[]> {
  const reqI = alias(libraryImagesI18n, "lii_req");
  const defI = alias(libraryImagesI18n, "lii_def");
  const saImg = alias(storageAssets, "sa_img");

  const rows = await db
    .select(baseImageSelect(reqI, defI, saImg))
    .from(libraryImages)
    .leftJoin(
      reqI,
      and(eq(reqI.image_id, libraryImages.id), eq(reqI.locale, locale)),
    )
    .leftJoin(
      defI,
      and(
        eq(defI.image_id, libraryImages.id),
        eq(defI.locale, defaultLocale),
      ),
    )
    .leftJoin(saImg, eq(saImg.id, libraryImages.asset_id))
    .where(eq(libraryImages.library_id, libraryId))
    .orderBy(
      asc(libraryImages.display_order),
      asc(libraryImages.created_at),
    );

  const items: LibraryImageView[] = (rows as any[]).map((r) => {
    const b = r.img_bucket as string | null;
    const p = r.img_path as string | null;
    const u = r.img_url as string | null;
    const resolved =
      r.image_url || (b && p ? publicUrlOf(b, p, u) : null);
    const thumb = r.thumb_url || resolved;
    const webp = r.webp_url || null;

    return {
      id: r.id,
      library_id: r.library_id,
      asset_id: r.asset_id,
      url: resolved,
      thumbnail: thumb,
      webp,
      alt: r.alt ?? null,
      caption: r.caption ?? null,
      display_order: r.display_order,
      is_active: r.is_active,
      created_at: r.created_at,
      updated_at: r.updated_at,
      asset:
        b && p
          ? {
            bucket: b,
            path: p,
            url: u ?? null,
            width: (r.img_width ?? null) as number | null,
            height: (r.img_height ?? null) as number | null,
            mime: (r.img_mime ?? null) as string | null,
          }
          : null,
    };
  });

  return items;
}

export async function createLibraryImageParent(
  values: NewLibraryImageRow,
) {
  await db.insert(libraryImages).values(values);
  return values.id;
}

export async function updateLibraryImageParent(
  id: string,
  patch: Partial<NewLibraryImageRow>,
) {
  await db
    .update(libraryImages)
    .set({ ...patch, updated_at: new Date() as any })
    .where(eq(libraryImages.id, id));
}

export async function deleteLibraryImageParent(id: string) {
  const res = await db
    .delete(libraryImages)
    .where(eq(libraryImages.id, id))
    .execute();
  const affected =
    typeof (res as unknown as { affectedRows?: number }).affectedRows ===
      "number"
      ? (res as unknown as { affectedRows: number }).affectedRows
      : 0;
  return affected;
}

export async function upsertLibraryImageI18n(
  imageId: string,
  locale: Locale,
  data: Partial<Pick<NewLibraryImageI18nRow, "alt" | "caption">> & {
    id?: string;
  },
) {
  const insertVals: NewLibraryImageI18nRow = {
    id: data.id ?? randomUUID(),
    image_id: imageId,
    locale,
    alt:
      typeof data.alt === "undefined"
        ? (null as any)
        : data.alt ?? null,
    caption:
      typeof data.caption === "undefined"
        ? (null as any)
        : data.caption ?? null,
    created_at: new Date() as any,
    updated_at: new Date() as any,
  };

  const setObj: Record<string, any> = {};
  if (typeof data.alt !== "undefined") setObj.alt = data.alt ?? null;
  if (typeof data.caption !== "undefined")
    setObj.caption = data.caption ?? null;
  setObj.updated_at = new Date();

  if (Object.keys(setObj).length === 1) return;

  await db
    .insert(libraryImagesI18n)
    .values(insertVals)
    .onDuplicateKeyUpdate({ set: setObj });
}

export async function upsertLibraryImageI18nAllLocales(
  imageId: string,
  data: Partial<Pick<NewLibraryImageI18nRow, "alt" | "caption">>,
) {
  for (const l of LOCALES) {
    await upsertLibraryImageI18n(imageId, l as Locale, data);
  }
}

/* ============== FILES repo (storage join) ============== */

export type LibraryFileView = {
  id: string;
  library_id: string;
  asset_id: string;
  url: string | null;
  name: string;
  size_bytes: number | null;
  mime_type: string | null;

  // tags_json’dan çözümlenen dizi
  tags: string[] | null;

  display_order: number;
  is_active: 0 | 1;
  created_at: string | Date;
  updated_at: string | Date;
  asset?: {
    bucket: string;
    path: string;
    url: string | null;
    mime: string | null;
  } | null;
};

function baseFileSelect(sa: any) {
  return {
    id: libraryFiles.id,
    library_id: libraryFiles.library_id,
    asset_id: libraryFiles.asset_id,
    file_url: libraryFiles.file_url,
    name: libraryFiles.name,
    size_bytes: libraryFiles.size_bytes,
    mime_type: libraryFiles.mime_type,
    tags_json: libraryFiles.tags_json,
    display_order: libraryFiles.display_order,
    is_active: libraryFiles.is_active,
    created_at: libraryFiles.created_at,
    updated_at: libraryFiles.updated_at,

    f_bucket: sa.bucket,
    f_path: sa.path,
    f_url: sa.url,
    f_mime: sa.mime,
  };
}

export async function listLibraryFilesMerged(
  libraryId: string,
): Promise<LibraryFileView[]> {
  const saFile = alias(storageAssets, "sa_file");

  const rows = await db
    .select(baseFileSelect(saFile))
    .from(libraryFiles)
    .leftJoin(saFile, eq(saFile.id, libraryFiles.asset_id))
    .where(eq(libraryFiles.library_id, libraryId))
    .orderBy(
      asc(libraryFiles.display_order),
      asc(libraryFiles.created_at),
    );

  const items: LibraryFileView[] = (rows as any[]).map((r) => {
    const b = r.f_bucket as string | null;
    const p = r.f_path as string | null;
    const u = r.f_url as string | null;
    const resolved =
      r.file_url || (b && p ? publicUrlOf(b, p, u) : null);
    return {
      id: r.id,
      library_id: r.library_id,
      asset_id: r.asset_id,
      url: resolved,
      name: r.name,
      size_bytes: r.size_bytes ?? null,
      mime_type: r.mime_type ?? (r.f_mime ?? null),
      // 🔹 files tarafında eski düz array yapısını kullanıyoruz
      tags: unpackTagsSimple(r.tags_json),
      display_order: r.display_order,
      is_active: r.is_active,
      created_at: r.created_at,
      updated_at: r.updated_at,
      asset:
        b && p
          ? {
            bucket: b,
            path: p,
            url: u ?? null,
            mime: (r.f_mime ?? null) as string | null,
          }
          : null,
    };
  });

  return items;
}

export async function createLibraryFileParent(
  values: NewLibraryFileRow,
) {
  await db.insert(libraryFiles).values(values);
  return values.id;
}

export async function updateLibraryFileParent(
  id: string,
  patch: Partial<NewLibraryFileRow>,
) {
  await db
    .update(libraryFiles)
    .set({ ...patch, updated_at: new Date() as any })
    .where(eq(libraryFiles.id, id));
}

export async function deleteLibraryFileParent(id: string) {
  const res = await db
    .delete(libraryFiles)
    .where(eq(libraryFiles.id, id))
    .execute();
  const affected =
    typeof (res as unknown as { affectedRows?: number }).affectedRows ===
      "number"
      ? (res as unknown as { affectedRows: number }).affectedRows
      : 0;
  return affected;
}
