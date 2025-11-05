import type { RouteHandler } from "fastify";
import { DEFAULT_LOCALE } from "@/core/i18n";
import {
  listReferences,
  getReferenceMergedById,
  getReferenceMergedBySlug,
  listReferenceImagesMerged,
} from "./repository";

type ListQuery = {
  order?: string;
  sort?: "created_at" | "updated_at" | "display_order";
  orderDir?: "asc" | "desc";
  limit?: string;
  offset?: string;
  is_published?: "0" | "1" | "true" | "false";
  is_featured?: "0" | "1" | "true" | "false";
  q?: string;
  slug?: string;
  select?: string;
};

/** LIST (public) */
export const listReferencesPublic: RouteHandler<{ Querystring: ListQuery }> = async (req, reply) => {
  const q = (req.query ?? {}) as ListQuery;
  const limitNum = q.limit ? Number(q.limit) : undefined;
  const offsetNum = q.offset ? Number(q.offset) : undefined;

  const { items, total } = await listReferences({
    orderParam: typeof q.order === "string" ? q.order : undefined,
    sort: q.sort,
    order: q.orderDir,
    limit: Number.isFinite(limitNum as number) ? (limitNum as number) : undefined,
    offset: Number.isFinite(offsetNum as number) ? (offsetNum as number) : undefined,
    is_published: q.is_published,
    is_featured: q.is_featured,
    q: q.q,
    slug: q.slug,
    locale: (req as any).locale,
    defaultLocale: DEFAULT_LOCALE,
  });

  reply.header("x-total-count", String(total ?? 0));
  return reply.send(items);
};

/** GET BY ID (public) */
export const getReferencePublic: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const row = await getReferenceMergedById((req as any).locale, DEFAULT_LOCALE, req.params.id);
  if (!row) return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send(row);
};

/** GET BY SLUG (public) */
export const getReferenceBySlugPublic: RouteHandler<{ Params: { slug: string } }> = async (req, reply) => {
  const row = await getReferenceMergedBySlug((req as any).locale, DEFAULT_LOCALE, req.params.slug);
  if (!row) return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send(row);
};

/** LIST IMAGES of a reference (public, coalesced) */
export const listReferenceImagesPublic: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const items = await listReferenceImagesMerged(req.params.id, (req as any).locale, DEFAULT_LOCALE);
  return reply.send(items);
};
