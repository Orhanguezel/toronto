// =============================================================
// FILE: src/modules/references/admin.controller.ts
// =============================================================
import type { RouteHandler } from "fastify";
import { randomUUID } from "crypto";
import {
  listReferences,
  getReferenceMergedById,
  getReferenceMergedBySlug,
  createReferenceParent,
  updateReferenceParent,
  deleteReferenceParent,
  getReferenceI18nRow,
  upsertReferenceI18n,
  packContent,
} from "./repository";
import {
  referencesListQuerySchema,
  upsertReferenceBodySchema,
  patchReferenceBodySchema,
  type ReferencesListQuery,
  type UpsertReferenceBody,
  type PatchReferenceBody,
  LOCALES,
  type Locale,
} from "./validation";
import { setContentRange } from "@/common/utils/contentRange";

const DEFAULT_LOCALE: Locale = LOCALES[0];

const toBool = (v: unknown): boolean =>
  v === true || v === 1 || v === "1" || v === "true";

/** LIST (admin) – coalesced */
export const listReferencesAdmin: RouteHandler = async (req, reply) => {
  const parsed = referencesListQuerySchema.safeParse(req.query ?? {});
  if (!parsed.success) {
    return reply.code(400).send({
      error: { message: "invalid_query", issues: parsed.error.issues },
    });
  }
  const q = parsed.data as ReferencesListQuery;

  const locale: Locale =
    (q.locale as Locale) ??
    ((req as any).locale as Locale | undefined) ??
    DEFAULT_LOCALE;

  const { items, total } = await listReferences({
    orderParam: typeof q.order === "string" ? q.order : undefined,
    sort: q.sort,
    order: q.orderDir,
    limit: q.limit,
    offset: q.offset,
    is_published: q.is_published,
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

  const offset = q.offset ?? 0;
  const limit = q.limit ?? items.length ?? 0;

  setContentRange(reply, offset, limit, total);
  reply.header("x-total-count", String(total ?? 0));
  return reply.send(items);
};

/** GET BY ID (admin) – coalesced, locale-aware (?locale=) */
export const getReferenceAdmin: RouteHandler = async (req, reply) => {
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
  if (!row) {
    return reply.code(404).send({ error: { message: "not_found" } });
  }
  return reply.send(row);
};

/** GET BY SLUG (admin) – coalesced, locale-aware (?locale=) */
export const getReferenceBySlugAdmin: RouteHandler = async (
  req,
  reply,
) => {
  const { slug } = (req.params ?? {}) as { slug: string };
  const q = (req.query ?? {}) as { locale?: string };

  const locale: Locale =
    (q.locale as Locale | undefined) ??
    ((req as any).locale as Locale | undefined) ??
    DEFAULT_LOCALE;

  const row = await getReferenceMergedBySlug(
    locale,
    DEFAULT_LOCALE,
    slug,
  );
  if (!row) {
    return reply.code(404).send({ error: { message: "not_found" } });
  }
  return reply.send(row);
};

/** CREATE (admin) */
export const createReferenceAdmin: RouteHandler = async (req, reply) => {
  const parsed = upsertReferenceBodySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({
      error: { message: "invalid_body", issues: parsed.error.issues },
    });
  }
  const b = parsed.data as UpsertReferenceBody;

  const primaryLocale: Locale =
    (b.locale as Locale) ??
    ((req as any).locale as Locale | undefined) ??
    DEFAULT_LOCALE;

  try {
    const id = randomUUID();

    await createReferenceParent({
      id,
      is_published: toBool(b.is_published) ? 1 : 0,
      is_featured: toBool(b.is_featured) ? 1 : 0,
      display_order: b.display_order ?? 0,

      featured_image:
        typeof b.featured_image !== "undefined"
          ? b.featured_image ?? null
          : null,
      featured_image_asset_id:
        typeof b.featured_image_asset_id !== "undefined"
          ? b.featured_image_asset_id ?? null
          : null,

      website_url:
        typeof b.website_url !== "undefined"
          ? b.website_url ?? null
          : null,

      category_id:
        typeof b.category_id !== "undefined"
          ? b.category_id ?? null
          : null,
      sub_category_id:
        typeof b.sub_category_id !== "undefined"
          ? b.sub_category_id ?? null
          : null,

      created_at: new Date() as any,
      updated_at: new Date() as any,
    });

    const packedContent = packContent(b.content);
    const basePayload = {
      title: b.title.trim(),
      slug: b.slug.trim(),
      summary:
        typeof b.summary === "string"
          ? b.summary.trim()
          : b.summary ?? null,
      content: packedContent,
      featured_image_alt:
        typeof b.featured_image_alt === "string"
          ? b.featured_image_alt.trim()
          : b.featured_image_alt ?? null,
      meta_title:
        typeof b.meta_title === "string"
          ? b.meta_title.trim()
          : b.meta_title ?? null,
      meta_description:
        typeof b.meta_description === "string"
          ? b.meta_description.trim()
          : b.meta_description ?? null,
    };

    // İlk kayıt tüm LOCALES için klon
    const localesToCreate: Locale[] = [...LOCALES];
    localesToCreate.sort((a, bLoc) =>
      a === primaryLocale ? -1 : bLoc === primaryLocale ? 1 : 0,
    );

    for (const loc of localesToCreate) {
      await upsertReferenceI18n(id, loc, basePayload);
    }

    const row = await getReferenceMergedById(
      primaryLocale,
      DEFAULT_LOCALE,
      id,
    );
    return reply.code(201).send(row);
  } catch (err: any) {
    if (err?.code === "ER_DUP_ENTRY") {
      return reply
        .code(409)
        .send({ error: { message: "slug_already_exists" } });
    }
    (req as any).log.error({ err }, "references_create_failed");
    return reply
      .code(500)
      .send({ error: { message: "references_create_failed" } });
  }
};

/** UPDATE (admin, partial) */
export const updateReferenceAdmin: RouteHandler = async (req, reply) => {
  const { id } = (req.params ?? {}) as { id: string };

  const parsed = patchReferenceBodySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({
      error: { message: "invalid_body", issues: parsed.error.issues },
    });
  }
  const b = parsed.data as PatchReferenceBody;

  const locale: Locale =
    (b.locale as Locale) ??
    ((req as any).locale as Locale | undefined) ??
    DEFAULT_LOCALE;

  try {
    const hasParentFields =
      typeof b.is_published !== "undefined" ||
      typeof b.is_featured !== "undefined" ||
      typeof b.display_order !== "undefined" ||
      typeof b.featured_image !== "undefined" ||
      typeof b.featured_image_asset_id !== "undefined" ||
      typeof b.category_id !== "undefined" ||
      typeof b.sub_category_id !== "undefined" ||
      typeof b.website_url !== "undefined";

    if (hasParentFields) {
      await updateReferenceParent(id, {
        is_published:
          typeof b.is_published !== "undefined"
            ? toBool(b.is_published)
              ? (1 as any)
              : (0 as any)
            : undefined,
        is_featured:
          typeof b.is_featured !== "undefined"
            ? toBool(b.is_featured)
              ? (1 as any)
              : (0 as any)
            : undefined,
        display_order:
          typeof b.display_order !== "undefined"
            ? b.display_order
            : undefined,
        featured_image:
          typeof b.featured_image !== "undefined"
            ? b.featured_image ?? null
            : undefined,
        featured_image_asset_id:
          typeof b.featured_image_asset_id !== "undefined"
            ? b.featured_image_asset_id ?? null
            : undefined,
        website_url:
          typeof b.website_url !== "undefined"
            ? b.website_url ?? null
            : undefined,
        category_id:
          typeof b.category_id !== "undefined"
            ? b.category_id ?? null
            : undefined,
        sub_category_id:
          typeof b.sub_category_id !== "undefined"
            ? b.sub_category_id ?? null
            : undefined,
      } as any);
    }

    const hasI18nFields =
      typeof b.title !== "undefined" ||
      typeof b.slug !== "undefined" ||
      typeof b.summary !== "undefined" ||
      typeof b.content !== "undefined" ||
      typeof b.featured_image_alt !== "undefined" ||
      typeof b.meta_title !== "undefined" ||
      typeof b.meta_description !== "undefined";

    if (hasI18nFields) {
      const exists = await getReferenceI18nRow(id, locale);

      if (!exists) {
        if (!b.title || !b.slug || !b.content) {
          return reply.code(400).send({
            error: { message: "missing_required_translation_fields" },
          });
        }
        await upsertReferenceI18n(id, locale, {
          title: b.title!.trim(),
          slug: b.slug!.trim(),
          content: packContent(b.content!),
          summary:
            typeof b.summary === "string"
              ? b.summary.trim()
              : b.summary ?? null,
          featured_image_alt:
            typeof b.featured_image_alt === "string"
              ? b.featured_image_alt.trim()
              : b.featured_image_alt ?? null,
          meta_title:
            typeof b.meta_title === "string"
              ? b.meta_title.trim()
              : b.meta_title ?? null,
          meta_description:
            typeof b.meta_description === "string"
              ? b.meta_description.trim()
              : b.meta_description ?? null,
        });
      } else {
        await upsertReferenceI18n(id, locale, {
          title:
            typeof b.title === "string" ? b.title.trim() : undefined,
          slug:
            typeof b.slug === "string" ? b.slug.trim() : undefined,
          content:
            typeof b.content === "string"
              ? packContent(b.content)
              : undefined,
          summary:
            typeof b.summary !== "undefined"
              ? typeof b.summary === "string"
                ? b.summary.trim()
                : b.summary ?? null
              : undefined,
          featured_image_alt:
            typeof b.featured_image_alt !== "undefined"
              ? typeof b.featured_image_alt === "string"
                ? b.featured_image_alt.trim()
                : b.featured_image_alt ?? null
              : undefined,
          meta_title:
            typeof b.meta_title !== "undefined"
              ? typeof b.meta_title === "string"
                ? b.meta_title.trim()
                : b.meta_title ?? null
              : undefined,
          meta_description:
            typeof b.meta_description !== "undefined"
              ? typeof b.meta_description === "string"
                ? b.meta_description.trim()
                : b.meta_description ?? null
              : undefined,
        });
      }
    }

    const row = await getReferenceMergedById(
      locale,
      DEFAULT_LOCALE,
      id,
    );
    if (!row) {
      return reply.code(404).send({ error: { message: "not_found" } });
    }
    return reply.send(row);
  } catch (err: any) {
    if (err?.code === "ER_DUP_ENTRY") {
      return reply
        .code(409)
        .send({ error: { message: "slug_already_exists" } });
    }
    (req as any).log.error({ err }, "references_update_failed");
    return reply
      .code(500)
      .send({ error: { message: "references_update_failed" } });
  }
};

/** DELETE (admin) */
export const removeReferenceAdmin: RouteHandler = async (req, reply) => {
  const { id } = (req.params ?? {}) as { id: string };

  const affected = await deleteReferenceParent(id);
  if (!affected) {
    return reply.code(404).send({ error: { message: "not_found" } });
  }
  return reply.code(204).send();
};
