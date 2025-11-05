import type { RouteHandler } from "fastify";
import { DEFAULT_LOCALE } from "@/core/i18n";
import {
  listCustomPages,
  getCustomPageMergedById,
  getCustomPageMergedBySlug,
} from "./repository";

type ListQuery = {
  order?: string;
  sort?: "created_at" | "updated_at";
  orderDir?: "asc" | "desc";
  limit?: string;
  offset?: string;
  is_published?: "0" | "1" | "true" | "false";
  q?: string;
  slug?: string;
  select?: string;
};

/** LIST (public) */
export const listPages: RouteHandler<{ Querystring: ListQuery }> = async (req, reply) => {
  const { select: _select, ...q } = (req.query ?? {}) as ListQuery;
  const limitNum  = q.limit  ? Number(q.limit)  : undefined;
  const offsetNum = q.offset ? Number(q.offset) : undefined;

  const { items, total } = await listCustomPages({
    orderParam: typeof q.order === "string" ? q.order : undefined,
    sort: q.sort,
    order: q.orderDir,
    limit: Number.isFinite(limitNum as number) ? (limitNum as number) : undefined,
    offset: Number.isFinite(offsetNum as number) ? (offsetNum as number) : undefined,
    is_published: q.is_published,
    q: q.q,
    slug: q.slug,
    locale: (req as any).locale,
    defaultLocale: DEFAULT_LOCALE,
  });

  reply.header("x-total-count", String(total ?? 0));
  return reply.send(items);
};

/** GET BY ID (public) */
export const getPage: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const row = await getCustomPageMergedById((req as any).locale, DEFAULT_LOCALE, req.params.id);
  if (!row) return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send(row);
};

/** GET BY SLUG (public) */
export const getPageBySlug: RouteHandler<{ Params: { slug: string } }> = async (req, reply) => {
  const row = await getCustomPageMergedBySlug((req as any).locale, DEFAULT_LOCALE, req.params.slug);
  if (!row) return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send(row);
};
