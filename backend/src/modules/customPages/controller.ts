import type { RouteHandler } from "fastify";
import { DEFAULT_LOCALE, type Locale } from "@/core/i18n";
import {
  listCustomPages,
  getCustomPageMergedById,
  getCustomPageMergedBySlug,
} from "./repository";

import {
  customPageListQuerySchema,
  customPageBySlugParamsSchema,
  customPageBySlugQuerySchema,
} from "./validation";

type ListQuery = {
  order?: string;
  sort?: "created_at" | "updated_at";
  orderDir?: "asc" | "desc";
  limit?: string | number;
  offset?: string | number;
  is_published?: "0" | "1" | "true" | "false";
  q?: string;
  slug?: string;
  select?: string;

  category_id?: string;
  sub_category_id?: string;

  // 🔗 module filtre
  module_key?: string;

  // 🔗 locale override
  locale?: string;
};

/** LIST (public) */
export const listPages: RouteHandler<{ Querystring: ListQuery }> = async (
  req,
  reply,
) => {
  const q = (req.query ?? {}) as ListQuery;

  const limitNum =
    q.limit != null && q.limit !== ""
      ? Number(q.limit)
      : undefined;
  const offsetNum =
    q.offset != null && q.offset !== ""
      ? Number(q.offset)
      : undefined;

  const locale: Locale =
    (q.locale as Locale) ??
    ((req as any).locale as Locale | undefined) ??
    DEFAULT_LOCALE;

  const { items, total } = await listCustomPages({
    orderParam: typeof q.order === "string" ? q.order : undefined,
    sort: q.sort,
    order: q.orderDir,
    limit: Number.isFinite(limitNum as number)
      ? (limitNum as number)
      : undefined,
    offset: Number.isFinite(offsetNum as number)
      ? (offsetNum as number)
      : undefined,
    is_published: q.is_published,
    q: q.q,
    slug: q.slug,
    category_id: q.category_id,
    sub_category_id: q.sub_category_id,
    module_key: q.module_key,
    locale,
    defaultLocale: DEFAULT_LOCALE,
  });

  // Public uç: sadece toplamı header’a koymak yeterli
  reply.header("x-total-count", String(total ?? 0));
  return reply.send(items);
};

/** GET BY ID (public) */
export const getPage: RouteHandler<{ Params: { id: string } }> = async (
  req,
  reply,
) => {
  const locale: Locale =
    ((req as any).locale as Locale | undefined) ?? DEFAULT_LOCALE;

  const row = await getCustomPageMergedById(
    locale,
    DEFAULT_LOCALE,
    req.params.id,
  );
  if (!row) {
    return reply.code(404).send({ error: { message: "not_found" } });
  }
  return reply.send(row);
};

/** GET BY SLUG (public) */
export const getPageBySlug: RouteHandler = async (req, reply) => {
  const { slug } = customPageBySlugParamsSchema.parse(req.params ?? {});
  const q = customPageBySlugQuerySchema.parse(req.query ?? {});

  const locale: Locale =
    (q.locale as Locale | undefined) ??
    ((req as any).locale as Locale | undefined) ??
    DEFAULT_LOCALE;

  const row = await getCustomPageMergedBySlug(
    locale,
    DEFAULT_LOCALE,
    slug,
  );

  if (!row) {
    return reply.code(404).send({ error: { message: "not_found" } });
  }
  return reply.send(row);
};
