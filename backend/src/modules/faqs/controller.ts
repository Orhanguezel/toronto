// ===================================================================
// FILE: src/modules/faqs/controller.ts
// ===================================================================

import type { RouteHandler } from "fastify";
import { DEFAULT_LOCALE } from "@/core/i18n";
import {
  listFaqs,
  getFaqMergedById,
  getFaqMergedBySlug,
} from "./repository";
import {
  faqListQuerySchema,
  type FaqListQuery,
} from "./validation";

/** LIST (public) */
export const listFaqsPublic: RouteHandler<{
  Querystring: FaqListQuery;
}> = async (req, reply) => {
  const parsed = faqListQuerySchema.safeParse(req.query ?? {});
  if (!parsed.success) {
    return reply.code(400).send({
      error: {
        message: "invalid_query",
        issues: parsed.error.issues,
      },
    });
  }

  const q = parsed.data;

  const { items, total } = await listFaqs({
    orderParam:
      typeof q.order === "string" ? q.order : undefined,
    sort: q.sort,
    order: q.orderDir,
    limit: q.limit,
    offset: q.offset,
    // Public için default sadece aktifler
    is_active: q.is_active ?? 1,
    q: q.q,
    slug: q.slug,
    category_id: q.category_id,
    sub_category_id: q.sub_category_id,
    locale: (req as any).locale,
    defaultLocale: DEFAULT_LOCALE,
  });

  reply.header("x-total-count", String(total ?? 0));
  return reply.send(items);
};

/** GET BY ID (public) */
export const getFaqPublic: RouteHandler<{
  Params: { id: string };
}> = async (req, reply) => {
  const row = await getFaqMergedById(
    (req as any).locale,
    DEFAULT_LOCALE,
    req.params.id,
  );
  if (!row) {
    return reply
      .code(404)
      .send({ error: { message: "not_found" } });
  }
  return reply.send(row);
};

/** GET BY SLUG (public) */
export const getFaqBySlugPublic: RouteHandler<{
  Params: { slug: string };
}> = async (req, reply) => {
  const row = await getFaqMergedBySlug(
    (req as any).locale,
    DEFAULT_LOCALE,
    req.params.slug,
  );
  if (!row) {
    return reply
      .code(404)
      .send({ error: { message: "not_found" } });
  }
  return reply.send(row);
};
