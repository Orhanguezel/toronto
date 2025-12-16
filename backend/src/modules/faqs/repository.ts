// ===================================================================
// FILE: src/modules/faqs/repository.ts
// ===================================================================

import { randomUUID } from "crypto";
import { db } from "@/db/client";
import {
  faqs,
  faqsI18n,
  type NewFaqRow,
  type NewFaqI18nRow,
} from "./schema";
import {
  and,
  asc,
  desc,
  eq,
  sql,
  type SQL,
} from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";

// 🔗 Kategoriler (base + i18n)
import {
  categories,
  categoryI18n,
} from "@/modules/categories/schema";
import {
  subCategories,
  subCategoryI18n,
} from "@/modules/subcategories/schema";

type Sortable = "created_at" | "updated_at" | "display_order";

export type ListParams = {
  orderParam?: string; // "created_at.asc" gibi
  sort?: Sortable;
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;

  is_active?: boolean | 0 | 1 | "0" | "1" | "true" | "false";
  q?: string;
  slug?: string;

  // Kategori filtreleri (ID bazlı)
  category_id?: string;
  sub_category_id?: string;

  locale: string;
  defaultLocale: string;
};

const to01 = (v: ListParams["is_active"]): 0 | 1 | undefined => {
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

export type FaqMerged = {
  id: string;
  is_active: 0 | 1;
  display_order: number;
  created_at: string | Date;
  updated_at: string | Date;

  // 🔗 Kategori ID'leri (dil bağımsız)
  category_id: string | null;
  sub_category_id: string | null;

  // 🔗 Kategori isim/slug (locale-aware)
  category_name: string | null;
  category_slug: string | null;

  // 🔗 Alt kategori isim/slug (locale-aware)
  sub_category_name: string | null;
  sub_category_slug: string | null;

  // Localize alanlar (coalesced: req.locale > defaultLocale)
  question: string | null;
  answer: string | null;
  slug: string | null;
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
    id: faqs.id,
    is_active: faqs.is_active,
    display_order: faqs.display_order,
    created_at: faqs.created_at,
    updated_at: faqs.updated_at,

    category_id: faqs.category_id,
    sub_category_id: faqs.sub_category_id,

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

    question: sql<string>`
      COALESCE(${i18nReq.question}, ${i18nDef.question})
    `.as("question"),
    answer: sql<string>`
      COALESCE(${i18nReq.answer}, ${i18nDef.answer})
    `.as("answer"),
    slug: sql<string>`
      COALESCE(${i18nReq.slug}, ${i18nDef.slug})
    `.as("slug"),
    locale_resolved: sql<string>`
      CASE 
        WHEN ${i18nReq.id} IS NOT NULL THEN ${i18nReq.locale}
        ELSE ${i18nDef.locale}
      END
    `.as("locale_resolved"),
  };
}

export async function listFaqs(params: ListParams) {
  const i18nReq = alias(faqsI18n, "fi_req");
  const i18nDef = alias(faqsI18n, "fi_def");

  // 🔹 category_i18n için alias (requested + default locale)
  const catReq = alias(categoryI18n, "cat_req");
  const catDef = alias(categoryI18n, "cat_def");

  // 🔹 sub_category_i18n için alias
  const subCatReq = alias(subCategoryI18n, "subcat_req");
  const subCatDef = alias(subCategoryI18n, "subcat_def");

  const filters: SQL[] = [];

  const active = to01(params.is_active);
  if (active !== undefined) {
    filters.push(eq(faqs.is_active, active));
  }

  if (params.slug && params.slug.trim()) {
    const v = params.slug.trim();
    filters.push(
      sql`COALESCE(${i18nReq.slug}, ${i18nDef.slug}) = ${v}`,
    );
  }

  if (params.category_id && params.category_id.trim()) {
    const v = params.category_id.trim();
    filters.push(eq(faqs.category_id, v));
  }

  if (params.sub_category_id && params.sub_category_id.trim()) {
    const v = params.sub_category_id.trim();
    filters.push(eq(faqs.sub_category_id, v));
  }

  if (params.q && params.q.trim()) {
    const s = `%${params.q.trim()}%`;
    filters.push(
      sql`(
        COALESCE(${i18nReq.question}, ${i18nDef.question}) LIKE ${s}
        OR COALESCE(${i18nReq.slug}, ${i18nDef.slug}) LIKE ${s}
        OR COALESCE(${i18nReq.answer}, ${i18nDef.answer}) LIKE ${s}
      )`,
    );
  }

  const whereExpr: SQL | undefined =
    filters.length > 0 ? (and(...filters) as SQL) : undefined;

  const ord = parseOrder(params.orderParam, params.sort, params.order);
  const orderBy =
    ord != null
      ? ord.dir === "asc"
        ? asc(faqs[ord.col] as any)
        : desc(faqs[ord.col] as any)
      : asc(faqs.display_order);

  const take = params.limit && params.limit > 0 ? params.limit : 50;
  const skip = params.offset && params.offset >= 0 ? params.offset : 0;

  // ---- Liste query ----
  const baseQuery = db
    .select(
      baseSelect(i18nReq, i18nDef, catReq, catDef, subCatReq, subCatDef),
    )
    .from(faqs)
    .leftJoin(
      i18nReq,
      and(eq(i18nReq.faq_id, faqs.id), eq(i18nReq.locale, params.locale)),
    )
    .leftJoin(
      i18nDef,
      and(
        eq(i18nDef.faq_id, faqs.id),
        eq(i18nDef.locale, params.defaultLocale),
      ),
    )
    // kategori i18n (requested)
    .leftJoin(
      catReq,
      and(
        eq(catReq.category_id, faqs.category_id),
        eq(catReq.locale, params.locale),
      ),
    )
    // kategori i18n (default)
    .leftJoin(
      catDef,
      and(
        eq(catDef.category_id, faqs.category_id),
        eq(catDef.locale, params.defaultLocale),
      ),
    )
    // alt kategori i18n (requested)
    .leftJoin(
      subCatReq,
      and(
        eq(subCatReq.sub_category_id, faqs.sub_category_id),
        eq(subCatReq.locale, params.locale),
      ),
    )
    // alt kategori i18n (default)
    .leftJoin(
      subCatDef,
      and(
        eq(subCatDef.sub_category_id, faqs.sub_category_id),
        eq(subCatDef.locale, params.defaultLocale),
      ),
    );

  let query: any = baseQuery;
  if (whereExpr) {
    query = query.where(whereExpr);
  }

  const rows = await query.orderBy(orderBy).limit(take).offset(skip);

  // ---- Count query (aynı filtreler) ----
  const baseCountQuery = db
    .select({ c: sql<number>`COUNT(1)` })
    .from(faqs)
    .leftJoin(
      i18nReq,
      and(eq(i18nReq.faq_id, faqs.id), eq(i18nReq.locale, params.locale)),
    )
    .leftJoin(
      i18nDef,
      and(
        eq(i18nDef.faq_id, faqs.id),
        eq(i18nDef.locale, params.defaultLocale),
      ),
    );

  let countQuery: any = baseCountQuery;
  if (whereExpr) {
    countQuery = countQuery.where(whereExpr);
  }

  const cnt = await countQuery;
  const total = cnt[0]?.c ?? 0;

  return {
    items: rows as unknown as FaqMerged[],
    total,
  };
}

export async function getFaqMergedById(
  locale: string,
  defaultLocale: string,
  id: string,
) {
  const i18nReq = alias(faqsI18n, "fi_req");
  const i18nDef = alias(faqsI18n, "fi_def");

  const catReq = alias(categoryI18n, "cat_req");
  const catDef = alias(categoryI18n, "cat_def");
  const subCatReq = alias(subCategoryI18n, "subcat_req");
  const subCatDef = alias(subCategoryI18n, "subcat_def");

  const rows = await db
    .select(
      baseSelect(i18nReq, i18nDef, catReq, catDef, subCatReq, subCatDef),
    )
    .from(faqs)
    .leftJoin(
      i18nReq,
      and(eq(i18nReq.faq_id, faqs.id), eq(i18nReq.locale, locale)),
    )
    .leftJoin(
      i18nDef,
      and(
        eq(i18nDef.faq_id, faqs.id),
        eq(i18nDef.locale, defaultLocale),
      ),
    )
    .leftJoin(
      catReq,
      and(
        eq(catReq.category_id, faqs.category_id),
        eq(catReq.locale, locale),
      ),
    )
    .leftJoin(
      catDef,
      and(
        eq(catDef.category_id, faqs.category_id),
        eq(catDef.locale, defaultLocale),
      ),
    )
    .leftJoin(
      subCatReq,
      and(
        eq(subCatReq.sub_category_id, faqs.sub_category_id),
        eq(subCatReq.locale, locale),
      ),
    )
    .leftJoin(
      subCatDef,
      and(
        eq(subCatDef.sub_category_id, faqs.sub_category_id),
        eq(subCatDef.locale, defaultLocale),
      ),
    )
    .where(eq(faqs.id, id))
    .limit(1);

  return (rows[0] ?? null) as unknown as FaqMerged | null;
}

export async function getFaqMergedBySlug(
  locale: string,
  defaultLocale: string,
  slug: string,
) {
  const i18nReq = alias(faqsI18n, "fi_req");
  const i18nDef = alias(faqsI18n, "fi_def");

  const catReq = alias(categoryI18n, "cat_req");
  const catDef = alias(categoryI18n, "cat_def");
  const subCatReq = alias(subCategoryI18n, "subcat_req");
  const subCatDef = alias(subCategoryI18n, "subcat_def");

  const rows = await db
    .select(
      baseSelect(i18nReq, i18nDef, catReq, catDef, subCatReq, subCatDef),
    )
    .from(faqs)
    .leftJoin(
      i18nReq,
      and(eq(i18nReq.faq_id, faqs.id), eq(i18nReq.locale, locale)),
    )
    .leftJoin(
      i18nDef,
      and(
        eq(i18nDef.faq_id, faqs.id),
        eq(i18nDef.locale, defaultLocale),
      ),
    )
    .leftJoin(
      catReq,
      and(
        eq(catReq.category_id, faqs.category_id),
        eq(catReq.locale, locale),
      ),
    )
    .leftJoin(
      catDef,
      and(
        eq(catDef.category_id, faqs.category_id),
        eq(catDef.locale, defaultLocale),
      ),
    )
    .leftJoin(
      subCatReq,
      and(
        eq(subCatReq.sub_category_id, faqs.sub_category_id),
        eq(subCatReq.locale, locale),
      ),
    )
    .leftJoin(
      subCatDef,
      and(
        eq(subCatDef.sub_category_id, faqs.sub_category_id),
        eq(subCatDef.locale, defaultLocale),
      ),
    )
    .where(
      sql`(
        ${i18nReq.id} IS NOT NULL AND ${i18nReq.slug} = ${slug}
      ) OR (
        ${i18nReq.id} IS NULL AND ${i18nDef.slug} = ${slug}
      )`,
    )
    .limit(1);

  return (rows[0] ?? null) as unknown as FaqMerged | null;
}

/* ----------------- Admin write helpers ----------------- */

export async function createFaqParent(values: NewFaqRow) {
  await db.insert(faqs).values(values);
  return values.id;
}

export async function insertFaqI18n(values: NewFaqI18nRow) {
  await db.insert(faqsI18n).values(values);
}

export async function upsertFaqI18n(
  faqId: string,
  locale: string,
  data: Partial<
    Pick<NewFaqI18nRow, "question" | "answer" | "slug">
  > & { id?: string },
) {
  const insertVals: NewFaqI18nRow = {
    id: data.id ?? randomUUID(),
    faq_id: faqId,
    locale,
    question: data.question ?? "",
    answer: data.answer ?? "",
    slug: data.slug ?? "",
    created_at: new Date() as any,
    updated_at: new Date() as any,
  };

  const setObj: Record<string, any> = {};
  if (typeof data.question !== "undefined") {
    setObj.question = data.question;
  }
  if (typeof data.answer !== "undefined") {
    setObj.answer = data.answer;
  }
  if (typeof data.slug !== "undefined") {
    setObj.slug = data.slug;
  }
  setObj.updated_at = new Date();

  if (Object.keys(setObj).length === 1) return; // sadece updated_at

  await db
    .insert(faqsI18n)
    .values(insertVals)
    .onDuplicateKeyUpdate({
      set: setObj,
    });
}

export async function updateFaqParent(
  id: string,
  patch: Partial<NewFaqRow>,
) {
  await db
    .update(faqs)
    .set({ ...patch, updated_at: new Date() as any })
    .where(eq(faqs.id, id));
}

export async function deleteFaqParent(id: string) {
  const res = await db.delete(faqs).where(eq(faqs.id, id)).execute();
  const affected =
    (res as any)?.affectedRows != null
      ? Number((res as any).affectedRows)
      : 0;
  return affected;
}

export async function getFaqI18nRow(
  faqId: string,
  locale: string,
) {
  const rows = await db
    .select()
    .from(faqsI18n)
    .where(
      and(eq(faqsI18n.faq_id, faqId), eq(faqsI18n.locale, locale)),
    )
    .limit(1);
  return rows[0] ?? null;
}
