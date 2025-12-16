// =============================================================
// FILE: src/modules/products/controller.ts
// =============================================================
import type { RouteHandler } from "fastify";
import type { FastifyRequest, FastifyReply } from "fastify";
import { and, asc, desc, eq, like, sql } from "drizzle-orm";

import { db } from "@/db/client";
import {
  products,
  productFaqs,
  productSpecs,
  product_reviews,
  productI18n,
} from "./schema";
import {
  categories,
  categoryI18n,
} from "@/modules/categories/schema";
import {
  subCategories,
  subCategoryI18n,
} from "@/modules/subcategories/schema";

/* ----------------- helpers ----------------- */
const toNum = (x: any) =>
  x === null || x === undefined
    ? x
    : Number.isNaN(Number(x))
      ? x
      : Number(x);

const normalizeProduct = (row: any) => {
  if (!row) return row;
  const p = { ...row };

  p.price = toNum(p.price);
  p.rating = toNum(p.rating);
  p.review_count = toNum(p.review_count) ?? 0;
  p.stock_quantity = toNum(p.stock_quantity) ?? 0;

  if (typeof p.images === "string") {
    try {
      p.images = JSON.parse(p.images);
    } catch {
      /* noop */
    }
  }
  if (!Array.isArray(p.images)) p.images = [];

  if (typeof p.tags === "string") {
    try {
      p.tags = JSON.parse(p.tags);
    } catch {
      /* noop */
    }
  }
  if (!Array.isArray(p.tags)) p.tags = [];

  if (typeof p.specifications === "string") {
    try {
      p.specifications = JSON.parse(p.specifications);
    } catch {
      /* noop */
    }
  }

  if (typeof p.storage_image_ids === "string") {
    try {
      p.storage_image_ids = JSON.parse(p.storage_image_ids);
    } catch {
      /* noop */
    }
  }
  if (!Array.isArray(p.storage_image_ids)) {
    p.storage_image_ids = [];
  }

  return p;
};

const toBool = (v: unknown, def = false): boolean => {
  if (v === undefined || v === null || v === "") return def;
  if (typeof v === "boolean") return v;
  const s = String(v).toLowerCase().trim();
  if (["1", "true", "yes", "y", "on"].includes(s)) return true;
  if (["0", "false", "no", "n", "off"].includes(s)) return false;
  return def;
};
const toInt = (v: unknown, def = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : def;
};
const safeLimit = (v: unknown, def = 100, max = 500): number => {
  const n = toInt(v, def);
  return n > 0 ? Math.min(n, max) : def;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const normalizeLocaleFromString = (raw?: string | null, fallback = "tr") => {
  if (!raw) return fallback;
  const trimmed = raw.trim();
  if (!trimmed) return fallback;
  const [short] = trimmed.split("-");
  const norm = (short || fallback).toLowerCase();
  return norm || fallback;
};

/* ----------------- LIST / GET (PUBLIC) ----------------- */

/** GET /products?category_id=&sub_category_id=&is_active=&q=&limit=&offset=&sort=&order=&slug=&locale= */
export const listProducts: RouteHandler = async (req, reply) => {
  const q = (req.query || {}) as {
    category_id?: string;
    sub_category_id?: string;
    is_active?: string;
    q?: string;
    limit?: string;
    offset?: string;
    sort?: "price" | "rating" | "created_at";
    order?: "asc" | "desc" | string;
    slug?: string;
    min_price?: string;
    max_price?: string;
    locale?: string;
  };

  const locale = normalizeLocaleFromString(q.locale, "tr");

  // shortcut: by slug (+ locale)
  if (q.slug) {
    const conds: any[] = [
      eq(productI18n.slug, q.slug),
      eq(productI18n.locale, locale),
      eq(products.is_active, 1 as any),
    ];

    const rows = await db
      .select({
        p: products,
        i: productI18n,
        c: {
          id: categories.id,
          module_key: categories.module_key,
          image_url: categories.image_url,
          storage_asset_id: categories.storage_asset_id,
          alt: categories.alt,
          icon: categories.icon,
          is_active: categories.is_active,
          is_featured: categories.is_featured,
          display_order: categories.display_order,
          name: categoryI18n.name,
          slug: categoryI18n.slug,
        },
        s: {
          id: subCategories.id,
          category_id: subCategories.category_id,
          image_url: subCategories.image_url,
          storage_asset_id: subCategories.storage_asset_id,
          alt: subCategories.alt,
          icon: subCategories.icon,
          is_active: subCategories.is_active,
          is_featured: subCategories.is_featured,
          display_order: subCategories.display_order,
          name: subCategoryI18n.name,
          slug: subCategoryI18n.slug,
        },
      })
      .from(products)
      .innerJoin(productI18n, eq(productI18n.product_id, products.id))
      .leftJoin(categories, eq(products.category_id, categories.id))
      .leftJoin(
        categoryI18n,
        and(
          eq(categoryI18n.category_id, categories.id),
          eq(categoryI18n.locale, locale),
        ),
      )
      .leftJoin(subCategories, eq(products.sub_category_id, subCategories.id))
      .leftJoin(
        subCategoryI18n,
        and(
          eq(subCategoryI18n.sub_category_id, subCategories.id),
          eq(subCategoryI18n.locale, locale),
        ),
      )
      .where(and(...conds))
      .limit(1);

    if (!rows.length)
      return reply.code(404).send({ error: { message: "not_found" } });

    const r = rows[0];
    const merged = { ...r.i, ...r.p }; // i18n alanları + base
    return reply.send({
      ...normalizeProduct(merged),
      category: r.c,
      sub_category: r.s,
    });
  }

  const conds: any[] = [eq(productI18n.locale, locale)];
  if (q.category_id) conds.push(eq(products.category_id, q.category_id));
  if (q.sub_category_id)
    conds.push(eq(products.sub_category_id, q.sub_category_id));
  if (q.is_active !== undefined) {
    const v = q.is_active === "1" || q.is_active === "true" ? 1 : 0;
    conds.push(eq(products.is_active, v as any));
  }
  if (q.q) conds.push(like(productI18n.title, `%${q.q}%`));
  if (q.min_price) conds.push(sql`${products.price} >= ${q.min_price}`);
  if (q.max_price) conds.push(sql`${products.price} <= ${q.max_price}`);

  const whereExpr = conds.length ? and(...conds) : undefined;

  const limit = q.limit
    ? Math.min(parseInt(q.limit, 10) || 50, 100)
    : 50;
  const offset = q.offset
    ? Math.max(parseInt(q.offset, 10) || 0, 0)
    : 0;

  const colMap = {
    price: products.price,
    rating: products.rating,
    created_at: products.created_at,
  } as const;

  let sortKey: keyof typeof colMap = "created_at";
  let dir: "asc" | "desc" = "desc";

  if (q.sort) {
    sortKey = q.sort;
    dir = q.order === "asc" ? "asc" : "desc";
  } else if (q.order && q.order.includes(".")) {
    const [col, d] = String(q.order).split(".");
    sortKey = (["price", "rating", "created_at"] as const).includes(
      col as any,
    )
      ? (col as keyof typeof colMap)
      : "created_at";
    dir = d?.toLowerCase() === "asc" ? "asc" : "desc";
  }
  const orderExpr =
    dir === "asc" ? asc(colMap[sortKey]) : desc(colMap[sortKey]);

  const countBase = db
    .select({ total: sql<number>`COUNT(*)` })
    .from(products)
    .innerJoin(productI18n, eq(productI18n.product_id, products.id));

  const [{ total }] = await (whereExpr
    ? countBase.where(whereExpr as any)
    : countBase);

  const dataBase = db
    .select({
      p: products,
      i: productI18n,
      c: {
        id: categories.id,
        module_key: categories.module_key,
        image_url: categories.image_url,
        storage_asset_id: categories.storage_asset_id,
        alt: categories.alt,
        icon: categories.icon,
        is_active: categories.is_active,
        is_featured: categories.is_featured,
        display_order: categories.display_order,
        name: categoryI18n.name,
        slug: categoryI18n.slug,
      },
      s: {
        id: subCategories.id,
        category_id: subCategories.category_id,
        image_url: subCategories.image_url,
        storage_asset_id: subCategories.storage_asset_id,
        alt: subCategories.alt,
        icon: subCategories.icon,
        is_active: subCategories.is_active,
        is_featured: subCategories.is_featured,
        display_order: subCategories.display_order,
        name: subCategoryI18n.name,
        slug: subCategoryI18n.slug,
      },
    })
    .from(products)
    .innerJoin(productI18n, eq(productI18n.product_id, products.id))
    .leftJoin(categories, eq(products.category_id, categories.id))
    .leftJoin(
      categoryI18n,
      and(
        eq(categoryI18n.category_id, categories.id),
        eq(categoryI18n.locale, locale),
      ),
    )
    .leftJoin(subCategories, eq(products.sub_category_id, subCategories.id))
    .leftJoin(
      subCategoryI18n,
      and(
        eq(subCategoryI18n.sub_category_id, subCategories.id),
        eq(subCategoryI18n.locale, locale),
      ),
    );

  const rows = await (whereExpr
    ? dataBase.where(whereExpr as any)
    : dataBase)
    .orderBy(orderExpr)
    .limit(limit)
    .offset(offset);

  const out = rows.map((r) => {
    const merged = { ...r.i, ...r.p };
    return {
      ...normalizeProduct(merged),
      category: r.c,
      sub_category: r.s,
    };
  });

  reply.header("x-total-count", String(Number(total || 0)));
  reply.header("content-range", `*/${Number(total || 0)}`);
  reply.header(
    "access-control-expose-headers",
    "x-total-count, content-range",
  );

  return reply.send(out);
};

/** GET /products/:idOrSlug?locale= */
export const getProductByIdOrSlug: RouteHandler = async (req, reply) => {
  const { idOrSlug } = req.params as { idOrSlug: string };
  const { locale: localeParam } = (req.query || {}) as { locale?: string };
  const locale = normalizeLocaleFromString(localeParam, "tr");
  const isUuid = UUID_RE.test(idOrSlug);

  const conds: any[] = [eq(productI18n.locale, locale)];
  if (isUuid) {
    conds.push(eq(products.id, idOrSlug));
  } else {
    conds.push(eq(productI18n.slug, idOrSlug));
    conds.push(eq(products.is_active, 1 as any));
  }

  const rows = await db
    .select({
      p: products,
      i: productI18n,
      c: {
        id: categories.id,
        module_key: categories.module_key,
        image_url: categories.image_url,
        storage_asset_id: categories.storage_asset_id,
        alt: categories.alt,
        icon: categories.icon,
        is_active: categories.is_active,
        is_featured: categories.is_featured,
        display_order: categories.display_order,
        name: categoryI18n.name,
        slug: categoryI18n.slug,
      },
      s: {
        id: subCategories.id,
        category_id: subCategories.category_id,
        image_url: subCategories.image_url,
        storage_asset_id: subCategories.storage_asset_id,
        alt: subCategories.alt,
        icon: subCategories.icon,
        is_active: subCategories.is_active,
        is_featured: subCategories.is_featured,
        display_order: subCategories.display_order,
        name: subCategoryI18n.name,
        slug: subCategoryI18n.slug,
      },
    })
    .from(products)
    .innerJoin(productI18n, eq(productI18n.product_id, products.id))
    .leftJoin(categories, eq(products.category_id, categories.id))
    .leftJoin(
      categoryI18n,
      and(
        eq(categoryI18n.category_id, categories.id),
        eq(categoryI18n.locale, locale),
      ),
    )
    .leftJoin(subCategories, eq(products.sub_category_id, subCategories.id))
    .leftJoin(
      subCategoryI18n,
      and(
        eq(subCategoryI18n.sub_category_id, subCategories.id),
        eq(subCategoryI18n.locale, locale),
      ),
    )
    .where(and(...conds))
    .limit(1);

  if (!rows.length)
    return reply.code(404).send({ error: { message: "not_found" } });
  const r = rows[0];
  const merged = { ...r.i, ...r.p };
  return reply.send({
    ...normalizeProduct(merged),
    category: r.c,
    sub_category: r.s,
  });
};

/** GET /products/id/:id?locale= */
export const getProductById: RouteHandler = async (req, reply) => {
  const { id } = req.params as { id: string };
  const { locale: localeParam } = (req.query || {}) as { locale?: string };
  const locale = normalizeLocaleFromString(localeParam, "tr");

  const rows = await db
    .select({
      p: products,
      i: productI18n,
      c: {
        id: categories.id,
        module_key: categories.module_key,
        image_url: categories.image_url,
        storage_asset_id: categories.storage_asset_id,
        alt: categories.alt,
        icon: categories.icon,
        is_active: categories.is_active,
        is_featured: categories.is_featured,
        display_order: categories.display_order,
        name: categoryI18n.name,
        slug: categoryI18n.slug,
      },
      s: {
        id: subCategories.id,
        category_id: subCategories.category_id,
        image_url: subCategories.image_url,
        storage_asset_id: subCategories.storage_asset_id,
        alt: subCategories.alt,
        icon: subCategories.icon,
        is_active: subCategories.is_active,
        is_featured: subCategories.is_featured,
        display_order: subCategories.display_order,
        name: subCategoryI18n.name,
        slug: subCategoryI18n.slug,
      },
    })
    .from(products)
    .innerJoin(productI18n, eq(productI18n.product_id, products.id))
    .leftJoin(categories, eq(products.category_id, categories.id))
    .leftJoin(
      categoryI18n,
      and(
        eq(categoryI18n.category_id, categories.id),
        eq(categoryI18n.locale, locale),
      ),
    )
    .leftJoin(subCategories, eq(products.sub_category_id, subCategories.id))
    .leftJoin(
      subCategoryI18n,
      and(
        eq(subCategoryI18n.sub_category_id, subCategories.id),
        eq(subCategoryI18n.locale, locale),
      ),
    )
    .where(
      and(
        eq(products.id, id),
        eq(productI18n.locale, locale),
      ),
    )
    .limit(1);

  if (!rows.length)
    return reply.code(404).send({ error: { message: "not_found" } });
  const r = rows[0];
  const merged = { ...r.i, ...r.p };
  return reply.send({
    ...normalizeProduct(merged),
    category: r.c,
    sub_category: r.s,
  });
};

/** GET /products/by-slug/:slug?locale= */
export const getProductBySlug: RouteHandler<{
  Params: { slug: string };
  Querystring: { locale?: string };
}> = async (req, reply) => {
  const { slug } = req.params;
  const locale = normalizeLocaleFromString(req.query?.locale, "tr");

  const conds: any[] = [
    eq(productI18n.slug, slug),
    eq(productI18n.locale, locale),
    eq(products.is_active, 1 as any),
  ];

  const rows = await db
    .select({
      p: products,
      i: productI18n,
      c: {
        id: categories.id,
        module_key: categories.module_key,
        image_url: categories.image_url,
        storage_asset_id: categories.storage_asset_id,
        alt: categories.alt,
        icon: categories.icon,
        is_active: categories.is_active,
        is_featured: categories.is_featured,
        display_order: categories.display_order,
        name: categoryI18n.name,
        slug: categoryI18n.slug,
      },
      s: {
        id: subCategories.id,
        category_id: subCategories.category_id,
        image_url: subCategories.image_url,
        storage_asset_id: subCategories.storage_asset_id,
        alt: subCategories.alt,
        icon: subCategories.icon,
        is_active: subCategories.is_active,
        is_featured: subCategories.is_featured,
        display_order: subCategories.display_order,
        name: subCategoryI18n.name,
        slug: subCategoryI18n.slug,
      },
    })
    .from(products)
    .innerJoin(productI18n, eq(productI18n.product_id, products.id))
    .leftJoin(categories, eq(products.category_id, categories.id))
    .leftJoin(
      categoryI18n,
      and(
        eq(categoryI18n.category_id, categories.id),
        eq(categoryI18n.locale, locale),
      ),
    )
    .leftJoin(subCategories, eq(products.sub_category_id, subCategories.id))
    .leftJoin(
      subCategoryI18n,
      and(
        eq(subCategoryI18n.sub_category_id, subCategories.id),
        eq(subCategoryI18n.locale, locale),
      ),
    )
    .where(and(...conds))
    .limit(1);

  if (!rows.length)
    return reply.code(404).send({ error: { message: "not_found" } });
  const r = rows[0];
  const merged = { ...r.i, ...r.p };
  return reply.send({
    ...normalizeProduct(merged),
    category: r.c,
    sub_category: r.s,
  });
};

/* ===================== */
/* FAQ & SPECS & REVIEWS */
/* ===================== */

/** GET /product_faqs?product_id=&only_active=1&locale= */
export const listProductFaqs: RouteHandler = async (req, reply) => {
  const q = (req.query || {}) as {
    product_id?: string;
    only_active?: string;
    locale?: string;
  };

  const locale = normalizeLocaleFromString(q.locale, "tr");
  const conds: any[] = [eq(productFaqs.locale, locale)];

  if (q.product_id) conds.push(eq(productFaqs.product_id, q.product_id));
  if (q.only_active === "1" || q.only_active === "true")
    conds.push(eq(productFaqs.is_active, 1 as any));

  const whereExpr = conds.length ? and(...conds) : undefined;

  const base = db.select().from(productFaqs);
  const rows = await (whereExpr ? base.where(whereExpr as any) : base).orderBy(
    productFaqs.display_order,
  );

  return reply.send(rows);
};

/** GET /product_specs?product_id=&locale= */
export const listProductSpecs: RouteHandler = async (req, reply) => {
  const q = (req.query || {}) as { product_id?: string; locale?: string };

  const locale = normalizeLocaleFromString(q.locale, "tr");
  const conds: any[] = [eq(productSpecs.locale, locale)];

  if (q.product_id) conds.push(eq(productSpecs.product_id, q.product_id));

  const whereExpr = and(...conds);

  const rows = await db
    .select()
    .from(productSpecs)
    .where(whereExpr as any)
    .orderBy(asc(productSpecs.order_num));

  return reply.send(rows);
};

/** GET /product_reviews?product_id=&only_active=&limit=&offset= */
export async function listProductReviews(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const q = req.query as {
      product_id?: string;
      only_active?: string | number | boolean;
      limit?: string | number;
      offset?: string | number;
    };

    if (!q.product_id) {
      return reply.code(400).send({ error: "product_id zorunludur" });
    }

    const filters = [eq(product_reviews.product_id, q.product_id)];
    if (toBool(q.only_active, true)) {
      // tinyint(1) uyumu
      // @ts-expect-error drizzle tinyint boolean union
      filters.push(eq(product_reviews.is_active, 1));
    }

    const rows = await db
      .select()
      .from(product_reviews)
      .where(and(...filters))
      .orderBy(
        desc(product_reviews.review_date),
        desc(product_reviews.created_at),
      )
      .limit(safeLimit(q.limit))
      .offset(Math.max(0, toInt(q.offset, 0)));

    return reply.send(rows);
  } catch (err) {
    req.log.error({ err }, "listProductReviews failed");
    return reply.code(500).send({ error: "İç sunucu hatası" });
  }
}
