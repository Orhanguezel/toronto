// =============================================================
// FILE: src/modules/categories/controller.ts  (PUBLIC)
// =============================================================
import type { RouteHandler } from "fastify";
import { db } from "@/db/client";
import { categories, categoryI18n } from "./schema";
import { and, asc, desc, eq, sql, or, like } from "drizzle-orm";

function toBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  const s = String(v).toLowerCase();
  return s === "1" || s === "true";
}

function normalizeLocale(loc: unknown): string | null {
  if (!loc) return null;
  const s = String(loc).trim();
  if (!s) return null;
  return s.toLowerCase();
}

const ORDER_WHITELIST = {
  display_order: categories.display_order,
  name: categoryI18n.name,
  created_at: categories.created_at,
  updated_at: categories.updated_at,
} as const;

function parseOrder(q: Record<string, unknown>) {
  const sort = typeof q.sort === "string" ? q.sort : undefined;
  const dir1 = typeof q.order === "string" ? q.order : undefined;
  const combined =
    typeof q.order === "string" && q.order.includes(".")
      ? q.order
      : undefined;

  let col: keyof typeof ORDER_WHITELIST = "created_at";
  let dir: "asc" | "desc" = "desc";

  if (combined) {
    const [c, d] = combined.split(".");
    if (c && c in ORDER_WHITELIST)
      col = c as keyof typeof ORDER_WHITELIST;
    if (d === "asc" || d === "desc") dir = d;
  } else {
    if (sort && sort in ORDER_WHITELIST)
      col = sort as keyof typeof ORDER_WHITELIST;
    if (dir1 === "asc" || dir1 === "desc") dir = dir1;
  }

  const colExpr = ORDER_WHITELIST[col];
  const primary = dir === "asc" ? asc(colExpr) : desc(colExpr);
  return { primary, primaryCol: col };
}

const CATEGORY_VIEW_FIELDS = {
  id: categories.id,
  module_key: categories.module_key,
  locale: categoryI18n.locale,
  name: categoryI18n.name,
  slug: categoryI18n.slug,
  description: categoryI18n.description,
  image_url: categories.image_url,
  storage_asset_id: categories.storage_asset_id,
  alt: categoryI18n.alt,
  icon: categories.icon,
  is_active: categories.is_active,
  is_featured: categories.is_featured,
  display_order: categories.display_order,
  created_at: categories.created_at,
  updated_at: categories.updated_at,
} as const;

/** GET /categories (public) — üst kategoriler (çok dilli + module_key destekli) */
export const listCategories: RouteHandler<{
  Querystring: {
    q?: string;
    is_active?: string | number | boolean;
    is_featured?: string | number | boolean;
    limit?: string | number;
    offset?: string | number;
    sort?: string;
    order?: string;
    locale?: string;
    module_key?: string;
  };
}> = async (req, reply) => {
  const q = req.query ?? {};
  const conds: any[] = [];

  const rawLocale =
    typeof q.locale === "string" && q.locale.trim()
      ? q.locale.trim()
      : undefined;
  const effectiveLocale = normalizeLocale(rawLocale) ?? "tr";

  if (q.q) {
    const pattern = `%${String(q.q).trim()}%`;
    conds.push(
      or(
        like(categoryI18n.name, pattern),
        like(categoryI18n.slug, pattern),
      ),
    );
  }

  if (q.is_active !== undefined)
    conds.push(eq(categories.is_active, toBool(q.is_active)));
  if (q.is_featured !== undefined)
    conds.push(eq(categories.is_featured, toBool(q.is_featured)));

  // 🌍 i18n locale filtresi
  conds.push(eq(categoryI18n.locale, effectiveLocale));

  // ✅ Modul/domain filtresi (blog, news, library, product, docs, ...)
  const moduleKey =
    typeof q.module_key === "string" && q.module_key.trim()
      ? q.module_key.trim()
      : undefined;
  if (moduleKey) {
    conds.push(eq(categories.module_key, moduleKey));
  }

  const where = conds.length ? and(...conds) : undefined;

  const limit = Math.min(Number(q.limit ?? 50) || 50, 100);
  const offset = Math.max(Number(q.offset ?? 0) || 0, 0);
  const { primary, primaryCol } = parseOrder(q as any);

  // COUNT
  const countBase = db
    .select({ total: sql<number>`COUNT(*)` })
    .from(categories)
    .innerJoin(
      categoryI18n,
      eq(categoryI18n.category_id, categories.id),
    );

  const countQ = where
    ? countBase.where(where as any)
    : countBase;

  const [{ total }] = await countQ;

  // ROWS
  const rowsBase = db
    .select(CATEGORY_VIEW_FIELDS)
    .from(categories)
    .innerJoin(
      categoryI18n,
      eq(categoryI18n.category_id, categories.id),
    );

  const rowsQ = where
    ? rowsBase.where(where as any)
    : rowsBase;

  const orderExprs: any[] = [primary as any];
  if (primaryCol !== "display_order")
    orderExprs.push(asc(categories.display_order));

  const rows = await rowsQ
    .orderBy(...orderExprs)
    .limit(limit)
    .offset(offset);

  reply.header("x-total-count", String(total));
  reply.header("content-range", `*/${total}`);
  reply.header(
    "access-control-expose-headers",
    "x-total-count, content-range",
  );

  return reply.send(rows);
};

/** GET /categories/:id (public) */
export const getCategoryById: RouteHandler<{
  Params: { id: string };
  Querystring: { locale?: string };
}> = async (req, reply) => {
  const { id } = req.params;
  const rawLocale =
    typeof req.query?.locale === "string" &&
    req.query.locale.trim()
      ? req.query.locale.trim()
      : undefined;
  const effectiveLocale = normalizeLocale(rawLocale) ?? "tr";

  const rows = await db
    .select(CATEGORY_VIEW_FIELDS)
    .from(categories)
    .innerJoin(
      categoryI18n,
      eq(categoryI18n.category_id, categories.id),
    )
    .where(
      and(
        eq(categories.id, id),
        eq(categoryI18n.locale, effectiveLocale),
      ),
    )
    .limit(1);

  if (!rows.length)
    return reply.code(404).send({ error: { message: "not_found" } });

  return reply.send(rows[0]);
};

/** GET /categories/by-slug/:slug (public) — opsiyonel locale + module_key */
export const getCategoryBySlug: RouteHandler<{
  Params: { slug: string };
  Querystring?: { locale?: string; module_key?: string };
}> = async (req, reply) => {
  const { slug } = req.params;
  const rawLocale =
    typeof req.query?.locale === "string" &&
    req.query.locale.trim()
      ? req.query.locale.trim()
      : undefined;
  const effectiveLocale = normalizeLocale(rawLocale) ?? "tr";

  const moduleKey =
    typeof req.query?.module_key === "string" &&
    req.query.module_key.trim()
      ? req.query.module_key.trim()
      : undefined;

  const conds: any[] = [
    eq(categoryI18n.slug, slug),
    eq(categoryI18n.locale, effectiveLocale),
  ];
  if (moduleKey) {
    conds.push(eq(categories.module_key, moduleKey));
  }

  const rows = await db
    .select(CATEGORY_VIEW_FIELDS)
    .from(categories)
    .innerJoin(
      categoryI18n,
      eq(categoryI18n.category_id, categories.id),
    )
    .where(and(...conds))
    .limit(1);

  if (!rows.length)
    return reply.code(404).send({ error: { message: "not_found" } });

  return reply.send(rows[0]);
};
