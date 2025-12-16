// =============================================================
// FILE: src/modules/sub-categories/controller.ts  (PUBLIC)
// =============================================================
import type { RouteHandler } from "fastify";
import { randomUUID } from "crypto";
import { db } from "@/db/client";
import { subCategories, subCategoryI18n } from "./schema";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import type {
  SubCategoryCreateInput,
  SubCategoryUpdateInput,
} from "./validation";

const nullIfEmpty = (v: unknown) => (v === "" ? null : v);

// FE’den gelen her türü -> boolean
function toBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  const s = String(v).toLowerCase();
  return s === "1" || s === "true";
}

const ORDER_WHITELIST = {
  display_order: subCategories.display_order,
  name: subCategoryI18n.name,
  created_at: subCategories.created_at,
  updated_at: subCategories.updated_at,
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

const subCategorySelectFields = {
  id: subCategories.id,
  category_id: subCategories.category_id,
  image_url: subCategories.image_url,
  storage_asset_id: subCategories.storage_asset_id,
  alt: subCategories.alt,
  icon: subCategories.icon,
  is_active: subCategories.is_active,
  is_featured: subCategories.is_featured,
  display_order: subCategories.display_order,
  created_at: subCategories.created_at,
  updated_at: subCategories.updated_at,
  locale: subCategoryI18n.locale,
  name: subCategoryI18n.name,
  slug: subCategoryI18n.slug,
  description: subCategoryI18n.description,
};

/** GET /sub-categories (public) */
export const listSubCategories: RouteHandler<{
  Querystring: {
    q?: string;
    category_id?: string | null;
    locale?: string;
    is_active?: string | number | boolean;
    is_featured?: string | number | boolean;
    limit?: string | number;
    offset?: string | number;
    sort?: string;
    order?: string;
  };
}> = async (req, reply) => {
  const q = req.query ?? {};
  const conds: any[] = [];

  const locale =
    typeof q.locale === "string" && q.locale.trim()
      ? q.locale.trim()
      : "tr";
  conds.push(eq(subCategoryI18n.locale, locale));

  if (q.q) {
    const s = `%${String(q.q).trim()}%`;
    conds.push(
      sql`${subCategoryI18n.name} LIKE ${s} OR ${subCategoryI18n.slug} LIKE ${s}`,
    );
  }

  if (q.category_id) {
    const v = String(q.category_id).trim();
    if (v.length > 0) {
      conds.push(eq(subCategories.category_id, v));
    }
  }

  if (q.is_active !== undefined)
    conds.push(eq(subCategories.is_active, toBool(q.is_active)));
  if (q.is_featured !== undefined)
    conds.push(eq(subCategories.is_featured, toBool(q.is_featured)));

  const where = conds.length ? and(...conds) : undefined;

  const limit = Math.min(Number(q.limit ?? 50) || 50, 100);
  const offset = Math.max(Number(q.offset ?? 0) || 0, 0);
  const { primary, primaryCol } = parseOrder(q as any);

  const countBase = db
    .select({ total: sql<number>`COUNT(*)` })
    .from(subCategories)
    .innerJoin(
      subCategoryI18n,
      eq(subCategoryI18n.sub_category_id, subCategories.id),
    );
  const [{ total }] = where
    ? await countBase.where(where as any)
    : await countBase;

  const rowsBase = db
    .select(subCategorySelectFields)
    .from(subCategories)
    .innerJoin(
      subCategoryI18n,
      eq(subCategoryI18n.sub_category_id, subCategories.id),
    );
  const rowsQ = where ? rowsBase.where(where as any) : rowsBase;

  const orderExprs: any[] = [primary as any];
  if (primaryCol !== "display_order")
    orderExprs.push(asc(subCategories.display_order));

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

/** GET /sub-categories/:id (public) */
export const getSubCategoryById: RouteHandler<{
  Params: { id: string };
}> = async (req, reply) => {
  const { id } = req.params;
  const locale = "tr"; // public by-id için default locale

  const rows = await db
    .select(subCategorySelectFields)
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

  if (!rows.length)
    return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send(rows[0]);
};

/** GET /sub-categories/by-slug/:slug (public) — ?category_id=...&locale=... */
export const getSubCategoryBySlug: RouteHandler<{
  Params: { slug: string };
  Querystring: { category_id?: string; locale?: string };
}> = async (req, reply) => {
  const { slug } = req.params;
  const { category_id, locale } = req.query ?? {};

  const conds: any[] = [
    eq(subCategoryI18n.slug, slug),
    eq(subCategoryI18n.locale, (locale ?? "tr").trim() || "tr"),
  ];

  if (category_id) {
    conds.push(eq(subCategories.category_id, category_id));
  }

  const rows = await db
    .select(subCategorySelectFields)
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

/** Ortak payload yardımcıları (admin controller kullanıyor) */
export function buildInsertPayload(input: SubCategoryCreateInput) {
  const id = input.id ?? randomUUID();
  const category_id = String(input.category_id ?? "").trim();

  return {
    id,
    category_id,
    image_url:
      (nullIfEmpty(input.image_url) as string | null) ?? null,
    storage_asset_id: null as string | null,
    alt: (nullIfEmpty(input.alt) as string | null) ?? null,
    icon: (nullIfEmpty(input.icon) as string | null) ?? null,

    is_active:
      input.is_active === undefined
        ? true
        : toBool(input.is_active),
    is_featured:
      input.is_featured === undefined
        ? false
        : toBool(input.is_featured),

    display_order: input.display_order ?? 0,
  };
}

export function buildUpdatePayload(patch: SubCategoryUpdateInput) {
  const set: Record<string, unknown> = {
    updated_at: sql`CURRENT_TIMESTAMP(3)`,
  };

  if (patch.category_id !== undefined)
    set.category_id = String(patch.category_id).trim();

  if (patch.image_url !== undefined)
    set.image_url = nullIfEmpty(
      patch.image_url,
    ) as string | null;
  if (patch.alt !== undefined)
    set.alt = nullIfEmpty(patch.alt) as string | null;
  if (patch.icon !== undefined)
    set.icon = nullIfEmpty(patch.icon) as string | null;

  if (patch.is_active !== undefined)
    set.is_active = toBool(patch.is_active);
  if (patch.is_featured !== undefined)
    set.is_featured = toBool(patch.is_featured);

  if (patch.display_order !== undefined)
    set.display_order = Number(patch.display_order) || 0;

  return set;
}
