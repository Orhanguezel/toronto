import type { RouteHandler } from "fastify";
import { DEFAULT_LOCALE } from "@/core/i18n";
import {
  adSolutionListQuerySchema,
  type AdSolutionListQuery,
} from "./validation";
import {
  listAdSolutions,
  getAdSolutionMergedById,
  getAdSolutionMergedBySlug,
  listImages,
} from "./repository";

/* ------------- PUBLIC LIST ------------- */
export const listAdSolutionsPublic: RouteHandler<{ Querystring: AdSolutionListQuery }> = async (req, reply) => {
  const parsed = adSolutionListQuerySchema.safeParse(req.query ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: "invalid_query", issues: parsed.error.issues } });
  }
  const q = parsed.data;

  const { items, total } = await listAdSolutions({
    orderParam: typeof q.order === "string" ? q.order : undefined,
    sort: q.sort,
    order: q.orderDir,
    limit: q.limit,
    offset: q.offset,
    featured: q.featured,
    is_active: typeof q.is_active !== "undefined" ? q.is_active : 1,
    q: q.q,
    category: q.category,
    locale: (req as any).locale,
    defaultLocale: DEFAULT_LOCALE,
  });

  reply.header("x-total-count", String(total ?? 0));
  return reply.send(items.filter(x => x.is_active === 1));
};

/* ------------- PUBLIC GET BY ID ------------- */
export const getAdSolutionPublic: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const row = await getAdSolutionMergedById((req as any).locale, DEFAULT_LOCALE, req.params.id);
  if (!row || row.is_active !== 1) return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send(row);
};

/* ------------- PUBLIC GET BY SLUG ------------- */
export const getAdSolutionBySlugPublic: RouteHandler<{ Params: { slug: string } }> = async (req, reply) => {
  const row = await getAdSolutionMergedBySlug((req as any).locale, DEFAULT_LOCALE, req.params.slug);
  if (!row || row.is_active !== 1) return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send(row);
};

/* ------------- PUBLIC GALLERY LIST ------------- */
export const listAdSolutionImagesPublic: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const items = await listImages(req.params.id, (req as any).locale, DEFAULT_LOCALE);
  return reply.send(items.filter(x => x.is_active === 1));
};
