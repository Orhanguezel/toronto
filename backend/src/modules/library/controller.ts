// src/modules/library/controller.ts
// =============================================================

import type { RouteHandler } from "fastify";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/core/i18n";
import {
  listLibraries,
  getLibraryMergedById,
  getLibraryMergedBySlug,
  listLibraryImagesMerged,
  listLibraryFilesMerged,
} from "./repository";
import {
  publicLibraryListQuerySchema,
  type PublicLibraryListQuery,
} from "./validation";

const normalizeLocale = (raw?: unknown): Locale => {
  const cand = String(raw || "")
    .split("-")[0]
    .toLowerCase();
  if ((LOCALES as readonly string[]).includes(cand)) {
    return cand as Locale;
  }
  return DEFAULT_LOCALE;
};

/** LIST (public) */
export const listLibraryPublic: RouteHandler<{
  Querystring: PublicLibraryListQuery;
}> = async (req, reply) => {
  const parsed = publicLibraryListQuerySchema.safeParse(
    req.query ?? {},
  );
  if (!parsed.success) {
    return reply.code(400).send({
      error: {
        message: "invalid_query",
        issues: parsed.error.issues,
      },
    });
  }

  const q = parsed.data;

  // ÖNCE query.locale, yoksa req.locale, en sonda DEFAULT
  const locale: Locale = normalizeLocale(
    q.locale ?? (req as any).locale,
  );

  const { items, total } = await listLibraries({
    orderParam: typeof q.order === "string" ? q.order : undefined,
    sort: q.sort,
    order: q.orderDir,
    limit: q.limit,
    offset: q.offset,
    // public: sadece yayınlanmış + aktif
    is_published: 1,
    is_active: 1,
    q: q.q,
    slug: q.slug,
    category_id: q.category_id,
    sub_category_id: q.sub_category_id,
    author: q.author,
    published_before: q.published_before,
    published_after: q.published_after,
    locale,
    defaultLocale: DEFAULT_LOCALE,
  });

  reply.header("x-total-count", String(total ?? 0));
  return reply.send(items);
};

/** GET BY ID (public) */
export const getLibraryPublic: RouteHandler<{
  Params: { id: string };
  Querystring: { locale?: string };
}> = async (req, reply) => {
  const q = (req.query ?? {}) as { locale?: string };
  const locale: Locale = normalizeLocale(
    q.locale ?? (req as any).locale,
  );

  const row = await getLibraryMergedById(
    locale,
    DEFAULT_LOCALE,
    req.params.id,
  );
  if (!row)
    return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send(row);
};

/** GET BY SLUG (public) */
export const getLibraryBySlugPublic: RouteHandler<{
  Params: { slug: string };
  Querystring: { locale?: string };
}> = async (req, reply) => {
  const q = (req.query ?? {}) as { locale?: string };
  const locale: Locale = normalizeLocale(
    q.locale ?? (req as any).locale,
  );

  const row = await getLibraryMergedBySlug(
    locale,
    DEFAULT_LOCALE,
    req.params.slug,
  );
  if (!row)
    return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send(row);
};

/** LIST IMAGES of a library (public) */
export const listLibraryImagesPublic: RouteHandler<{
  Params: { id: string };
  Querystring: { locale?: string };
}> = async (req, reply) => {
  const q = (req.query ?? {}) as { locale?: string };
  const locale: Locale = normalizeLocale(
    q.locale ?? (req as any).locale,
  );

  const items = await listLibraryImagesMerged(
    req.params.id,
    locale,
    DEFAULT_LOCALE,
  );
  return reply.send(items);
};

/** LIST FILES of a library (public) */
export const listLibraryFilesPublic: RouteHandler<{
  Params: { id: string };
}> = async (req, reply) => {
  const items = await listLibraryFilesMerged(req.params.id);
  return reply.send(items);
};
