import type { RouteHandler } from "fastify";
import { randomUUID } from "crypto";
import { DEFAULT_LOCALE } from "@/core/i18n";
import {
  referenceListQuerySchema,
  upsertReferenceBodySchema,
  patchReferenceBodySchema,
  type ReferenceListQuery,
  type UpsertReferenceBody,
  type PatchReferenceBody,
  upsertReferenceImageBodySchema,
  patchReferenceImageBodySchema,
  type UpsertReferenceImageBody,
  type PatchReferenceImageBody,
} from "./validation";
import {
  listReferences,
  getReferenceMergedById,
  getReferenceMergedBySlug,
  createReferenceParent,
  updateReferenceParent,
  deleteReferenceParent,
  upsertReferenceI18n,
  upsertReferenceI18nAllLocales,
  getReferenceI18nRow,
  packContent,

  listReferenceImagesMerged,
  createReferenceImageParent,
  updateReferenceImageParent,
  deleteReferenceImageParent,
  upsertReferenceImageI18n,
  upsertReferenceImageI18nAllLocales,
} from "./repository";

const toBool = (v: unknown): boolean =>
  v === true || v === 1 || v === "1" || v === "true";

/* ================= references: LIST/GET ================= */
export const listReferencesAdmin: RouteHandler<{ Querystring: ReferenceListQuery }> = async (req, reply) => {
  const parsed = referenceListQuerySchema.safeParse(req.query ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: "invalid_query", issues: parsed.error.issues } });
  }
  const q = parsed.data;

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
    locale: (req as any).locale,
    defaultLocale: DEFAULT_LOCALE,
  });

  reply.header("x-total-count", String(total ?? 0));
  return reply.send(items);
};

export const getReferenceAdmin: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const row = await getReferenceMergedById((req as any).locale, DEFAULT_LOCALE, req.params.id);
  if (!row) return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send(row);
};

export const getReferenceBySlugAdmin: RouteHandler<{ Params: { slug: string } }> = async (req, reply) => {
  const row = await getReferenceMergedBySlug((req as any).locale, DEFAULT_LOCALE, req.params.slug);
  if (!row) return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send(row);
};

/* ================= references: CREATE ================= */
export const createReferenceAdmin: RouteHandler<{ Body: UpsertReferenceBody }> = async (req, reply) => {
  const parsed = upsertReferenceBodySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: "invalid_body", issues: parsed.error.issues } });
  }
  const b = parsed.data;
  const locale = b.locale ?? (req as any).locale;

  try {
    const id = randomUUID();
    await createReferenceParent({
      id,
      is_published: toBool(b.is_published) ? 1 : 0,
      is_featured: toBool(b.is_featured) ? 1 : 0,
      display_order: typeof b.display_order === "number" ? b.display_order : 0,

      featured_image: typeof b.featured_image !== "undefined" ? (b.featured_image ?? null) : null,
      featured_image_asset_id:
        typeof b.featured_image_asset_id !== "undefined" ? (b.featured_image_asset_id ?? null) : null,

      website_url: typeof b.website_url !== "undefined" ? (b.website_url ?? null) : null,

      created_at: new Date() as any,
      updated_at: new Date() as any,
    });

    const payload = {
      title: b.title.trim(),
      slug: b.slug.trim(),
      summary: typeof b.summary === "string" ? b.summary : (b.summary ?? null),
      content: packContent(b.content),
      featured_image_alt: typeof b.featured_image_alt === "string" ? b.featured_image_alt.trim() : (b.featured_image_alt ?? null),
      meta_title: typeof b.meta_title === "string" ? b.meta_title.trim() : (b.meta_title ?? null),
      meta_description: typeof b.meta_description === "string" ? b.meta_description.trim() : (b.meta_description ?? null),
    };

    const replicateAll = b.replicate_all_locales ?? true;
    if (replicateAll) {
      await upsertReferenceI18nAllLocales(id, payload);
    } else {
      await upsertReferenceI18n(id, locale, payload);
    }

    const row = await getReferenceMergedById(locale, DEFAULT_LOCALE, id);
    return reply.code(201).send(row);
  } catch (err: any) {
    if (err?.code === "ER_DUP_ENTRY") {
      return reply.code(409).send({ error: { message: "slug_already_exists" } });
    }
    req.log.error({ err }, "references_create_failed");
    return reply.code(500).send({ error: { message: "references_create_failed" } });
  }
};

/* ================= references: UPDATE ================= */
export const updateReferenceAdmin: RouteHandler<{ Params: { id: string }; Body: PatchReferenceBody }> = async (req, reply) => {
  const parsed = patchReferenceBodySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: "invalid_body", issues: parsed.error.issues } });
  }
  const b = parsed.data;
  const locale = b.locale ?? (req as any).locale;

  try {
    // parent patch (varsa)
    if (
      typeof b.is_published !== "undefined" ||
      typeof b.is_featured !== "undefined" ||
      typeof b.display_order !== "undefined" ||
      typeof b.featured_image !== "undefined" ||
      typeof b.featured_image_asset_id !== "undefined" ||
      typeof b.website_url !== "undefined"
    ) {
      await updateReferenceParent(req.params.id, {
        is_published: typeof b.is_published !== "undefined" ? (toBool(b.is_published) ? 1 : 0) : undefined,
        is_featured: typeof b.is_featured !== "undefined" ? (toBool(b.is_featured) ? 1 : 0) : undefined,
        display_order: typeof b.display_order === "number" ? b.display_order : undefined,

        featured_image: typeof b.featured_image !== "undefined" ? (b.featured_image ?? null) : undefined,
        featured_image_asset_id:
          typeof b.featured_image_asset_id !== "undefined" ? (b.featured_image_asset_id ?? null) : undefined,

        website_url: typeof b.website_url !== "undefined" ? (b.website_url ?? null) : undefined,
      } as any);
    }

    // i18n patch (varsa)
    const hasI18nFields =
      typeof b.title !== "undefined" ||
      typeof b.slug !== "undefined" ||
      typeof b.summary !== "undefined" ||
      typeof b.content !== "undefined" ||
      typeof b.featured_image_alt !== "undefined" ||
      typeof b.meta_title !== "undefined" ||
      typeof b.meta_description !== "undefined";

    if (hasI18nFields) {
      const payload = {
        title: typeof b.title === "string" ? b.title.trim() : undefined,
        slug: typeof b.slug === "string" ? b.slug.trim() : undefined,
        summary:
          typeof b.summary !== "undefined"
            ? (typeof b.summary === "string" ? b.summary : (b.summary ?? null))
            : undefined,
        content: typeof b.content === "string" ? packContent(b.content) : undefined,
        featured_image_alt:
          typeof b.featured_image_alt !== "undefined"
            ? (typeof b.featured_image_alt === "string" ? b.featured_image_alt.trim() : (b.featured_image_alt ?? null))
            : undefined,
        meta_title:
          typeof b.meta_title !== "undefined"
            ? (typeof b.meta_title === "string" ? b.meta_title.trim() : (b.meta_title ?? null))
            : undefined,
        meta_description:
          typeof b.meta_description !== "undefined"
            ? (typeof b.meta_description === "string" ? b.meta_description.trim() : (b.meta_description ?? null))
            : undefined,
      };

      if (b.apply_all_locales) {
        await upsertReferenceI18nAllLocales(req.params.id, payload);
      } else {
        const exists = await getReferenceI18nRow(req.params.id, locale);
        if (!exists) {
          if (!b.title || !b.slug || !b.content) {
            return reply.code(400).send({ error: { message: "missing_required_translation_fields" } });
          }
          await upsertReferenceI18n(req.params.id, locale, {
            title: b.title!.trim(),
            slug: b.slug!.trim(),
            summary: typeof b.summary === "string" ? b.summary : (b.summary ?? null),
            content: packContent(b.content!),
            featured_image_alt:
              typeof b.featured_image_alt === "string" ? b.featured_image_alt.trim() : (b.featured_image_alt ?? null),
            meta_title: typeof b.meta_title === "string" ? b.meta_title.trim() : (b.meta_title ?? null),
            meta_description: typeof b.meta_description === "string" ? b.meta_description.trim() : (b.meta_description ?? null),
          });
        } else {
          await upsertReferenceI18n(req.params.id, locale, payload);
        }
      }
    }

    const row = await getReferenceMergedById(locale, DEFAULT_LOCALE, req.params.id);
    if (!row) return reply.code(404).send({ error: { message: "not_found" } });
    return reply.send(row);
  } catch (err: any) {
    if (err?.code === "ER_DUP_ENTRY") {
      return reply.code(409).send({ error: { message: "slug_already_exists" } });
    }
    req.log.error({ err }, "references_update_failed");
    return reply.code(500).send({ error: { message: "references_update_failed" } });
  }
};

/* ================= references: DELETE ================= */
export const removeReferenceAdmin: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const affected = await deleteReferenceParent(req.params.id);
  if (!affected) return reply.code(404).send({ error: { message: "not_found" } });
  return reply.code(204).send();
};

/* ================= gallery: LIST ================= */
export const listReferenceImagesAdmin: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const items = await listReferenceImagesMerged(req.params.id, (req as any).locale, DEFAULT_LOCALE);
  return reply.send(items);
};

/* ================= gallery: CREATE ================= */
export const createReferenceImageAdmin: RouteHandler<{ Params: { id: string }; Body: UpsertReferenceImageBody }> = async (req, reply) => {
  const parsed = upsertReferenceImageBodySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: "invalid_body", issues: parsed.error.issues } });
  }
  const b = parsed.data;
  const locale = b.locale ?? (req as any).locale;

  const imageId = randomUUID();
  await createReferenceImageParent({
    id: imageId,
    reference_id: req.params.id,
    asset_id: b.asset_id,
    image_url: typeof b.image_url !== "undefined" ? (b.image_url ?? null) : null,
    display_order: typeof b.display_order === "number" ? b.display_order : 0,
    is_active: toBool(b.is_active) ? 1 : 0,
    created_at: new Date() as any,
    updated_at: new Date() as any,
  });

  const replicateAll = b.replicate_all_locales ?? true;
  const payload = {
    alt: typeof b.alt === "string" ? b.alt.trim() : (b.alt ?? null),
    caption: typeof b.caption === "string" ? b.caption.trim() : (b.caption ?? null),
  };
  if (replicateAll) {
    await upsertReferenceImageI18nAllLocales(imageId, payload);
  } else {
    await upsertReferenceImageI18n(imageId, locale, payload);
  }

  const items = await listReferenceImagesMerged(req.params.id, locale, DEFAULT_LOCALE);
  return reply.code(201).send(items);
};

/* ================= gallery: UPDATE ================= */
export const updateReferenceImageAdmin: RouteHandler<{ Params: { id: string; imageId: string }; Body: PatchReferenceImageBody }> = async (req, reply) => {
  const parsed = patchReferenceImageBodySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: "invalid_body", issues: parsed.error.issues } });
  }
  const b = parsed.data;
  const locale = b.locale ?? (req as any).locale;

  if (
    typeof b.asset_id !== "undefined" ||
    typeof b.image_url !== "undefined" ||
    typeof b.display_order !== "undefined" ||
    typeof b.is_active !== "undefined"
  ) {
    await updateReferenceImageParent(req.params.imageId, {
      asset_id: typeof b.asset_id === "string" ? b.asset_id : undefined,
      image_url: typeof b.image_url !== "undefined" ? (b.image_url ?? null) : undefined,
      display_order: typeof b.display_order === "number" ? b.display_order : undefined,
      is_active: typeof b.is_active !== "undefined" ? (toBool(b.is_active) ? 1 : 0) : undefined,
    } as any);
  }

  if (typeof b.alt !== "undefined" || typeof b.caption !== "undefined" || b.apply_all_locales) {
    const payload = {
      alt: typeof b.alt !== "undefined" ? (typeof b.alt === "string" ? b.alt.trim() : (b.alt ?? null)) : undefined,
      caption: typeof b.caption !== "undefined" ? (typeof b.caption === "string" ? b.caption.trim() : (b.caption ?? null)) : undefined,
    };
    if (b.apply_all_locales) {
      await upsertReferenceImageI18nAllLocales(req.params.imageId, payload);
    } else {
      await upsertReferenceImageI18n(req.params.imageId, locale, payload);
    }
  }

  const items = await listReferenceImagesMerged(req.params.id, locale, DEFAULT_LOCALE);
  return reply.send(items);
};

/* ================= gallery: DELETE ================= */
export const removeReferenceImageAdmin: RouteHandler<{ Params: { id: string; imageId: string } }> = async (req, reply) => {
  const affected = await deleteReferenceImageParent(req.params.imageId);
  if (!affected) return reply.code(404).send({ error: { message: "not_found" } });
  return reply.code(204).send();
};
