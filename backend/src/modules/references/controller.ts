// =============================================================
// FILE: src/modules/references/controller.ts  (PUBLIC)
// =============================================================
import type { RouteHandler } from "fastify";
import {
  publicReferencesListQuerySchema,
  referenceBySlugParamsSchema,
  referenceBySlugQuerySchema,
  type PublicReferencesListQuery,
  type ReferenceBySlugQuery,
  type Locale,
  LOCALES,
} from "./validation";
import {
  listReferences,
  getReferenceMergedById,
  getReferenceMergedBySlug,
  listReferenceImagesForReference,
} from "./repository";

// ✅ Lokal i18n pattern (core import yok)
const DEFAULT_LOCALE: Locale = LOCALES[0];

/** LIST (public) – sadece is_published = 1 */
export const listReferencesPublic: RouteHandler = async (req, reply) => {
  const parsed = publicReferencesListQuerySchema.safeParse(req.query ?? {});
  if (!parsed.success) {
    return reply.code(400).send({
      error: {
        message: "invalid_query",
        issues: parsed.error.flatten(),
      },
    });
  }
  const q = parsed.data as PublicReferencesListQuery;

  const locale: Locale =
    (q.locale as Locale | undefined) ??
    ((req as any).locale as Locale | undefined) ??
    DEFAULT_LOCALE;

  const { items, total } = await listReferences({
    orderParam: typeof q.order === "string" ? q.order : undefined,
    sort: q.sort,
    order: q.orderDir,
    limit: q.limit,
    offset: q.offset,
    is_published: true,
    is_featured: q.is_featured,
    q: q.q,
    slug: q.slug,
    category_id: q.category_id,
    sub_category_id: q.sub_category_id,
    module_key: q.module_key,
    has_website: q.has_website,
    locale,
    defaultLocale: DEFAULT_LOCALE,
  });

  reply.header("x-total-count", String(total ?? 0));
  return reply.send(items);
};

/** GET BY ID (public) – referans + gallery, locale-aware (?locale=) */
export const getReferencePublic: RouteHandler = async (req, reply) => {
  const { id } = (req.params ?? {}) as { id: string };
  const q = (req.query ?? {}) as { locale?: string };

  const locale: Locale =
    (q.locale as Locale | undefined) ??
    ((req as any).locale as Locale | undefined) ??
    DEFAULT_LOCALE;

  const row = await getReferenceMergedById(
    locale,
    DEFAULT_LOCALE,
    id,
  );
  if (!row || !row.is_published) {
    return reply.code(404).send({ error: { message: "not_found" } });
  }

  const gallery = await listReferenceImagesForReference(
    row.id,
    locale,
    DEFAULT_LOCALE,
  );

  return reply.send({ ...row, gallery });
};

/** GET BY SLUG (public) – referans + gallery */
export const getReferenceBySlugPublic: RouteHandler = async (
  req,
  reply,
) => {
  const { slug } = referenceBySlugParamsSchema.parse(req.params ?? {});
  const q = referenceBySlugQuerySchema.parse(req.query ?? {}) as ReferenceBySlugQuery;

  const locale: Locale =
    (q.locale as Locale | undefined) ??
    ((req as any).locale as Locale | undefined) ??
    DEFAULT_LOCALE;

  const row = await getReferenceMergedBySlug(
    locale,
    DEFAULT_LOCALE,
    slug,
  );
  if (!row || !row.is_published) {
    return reply.code(404).send({ error: { message: "not_found" } });
  }

  const gallery = await listReferenceImagesForReference(
    row.id,
    locale,
    DEFAULT_LOCALE,
  );

  return reply.send({ ...row, gallery });
};
