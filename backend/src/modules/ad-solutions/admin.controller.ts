import type { RouteHandler } from "fastify";
import { randomUUID } from "crypto";
import { DEFAULT_LOCALE } from "@/core/i18n";
import {
  adSolutionListQuerySchema,
  type AdSolutionListQuery,
  upsertAdSolutionBodySchema,
  patchAdSolutionBodySchema,
  upsertAdSolutionImageBodySchema,
  patchAdSolutionImageBodySchema,
  type UpsertAdSolutionBody,
  type PatchAdSolutionBody,
} from "./validation";
import {
  listAdSolutions,
  getAdSolutionMergedById,
  getAdSolutionMergedBySlug,
  createAdSolutionParent,
  updateAdSolutionParent,
  deleteAdSolutionParent,
  upsertAdSolutionI18n,
  listImages,
  createImage,
  updateImage,
  deleteImage,
  upsertImageI18n,
} from "./repository";

/* ---------------- LIST (admin) ---------------- */
export const listAdSolutionsAdmin: RouteHandler<{ Querystring: AdSolutionListQuery }> = async (req, reply) => {
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
    is_active: q.is_active,
    q: q.q,
    category: q.category,
    locale: (req as any).locale,
    defaultLocale: DEFAULT_LOCALE,
  });

  reply.header("x-total-count", String(total ?? 0));
  return reply.send(items);
};

/* ---------------- GET (admin) ---------------- */
export const getAdSolutionAdmin: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const row = await getAdSolutionMergedById((req as any).locale, DEFAULT_LOCALE, req.params.id);
  if (!row) return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send(row);
};

export const getAdSolutionBySlugAdmin: RouteHandler<{ Params: { slug: string } }> = async (req, reply) => {
  const row = await getAdSolutionMergedBySlug((req as any).locale, DEFAULT_LOCALE, req.params.slug);
  if (!row) return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send(row);
};

/* ---------------- CREATE (admin) ---------------- */
export const createAdSolutionAdmin: RouteHandler<{ Body: UpsertAdSolutionBody }> = async (req, reply) => {
  const parsed = upsertAdSolutionBodySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: "invalid_body", issues: parsed.error.issues } });
  }
  const b = parsed.data;
  const id = randomUUID();
  const now = new Date();

  await createAdSolutionParent({
    id,
    category: b.category ?? "general",
    featured: (b.featured === true || b.featured === 1 || b.featured === "1" || b.featured === "true") ? 1 : 0,
    is_active: (b.is_active === false || b.is_active === 0 || b.is_active === "0" || b.is_active === "false") ? 0 : 1,
    display_order: typeof b.display_order === "number" ? b.display_order : 0,
    featured_image: typeof b.featured_image === "string" ? b.featured_image : null,
    image_url: typeof b.image_url === "string" ? b.image_url : null,
    image_asset_id: typeof b.image_asset_id === "string" ? b.image_asset_id : null,
    created_at: now as any,
    updated_at: now as any,
  });

  const loc = b.locale ?? (req as any).locale;
  if (loc) {
    await upsertAdSolutionI18n(id, loc, {
      name: typeof b.name === "string" ? b.name.trim() : undefined,
      slug: typeof b.slug === "string" ? b.slug.trim() : undefined,
      summary: typeof b.summary === "string" ? b.summary : undefined,
      content: typeof b.content === "string" ? b.content : undefined,
      image_alt: typeof b.image_alt === "string" ? b.image_alt : undefined,
      meta_title: typeof b.meta_title === "string" ? b.meta_title : undefined,
      meta_description: typeof b.meta_description === "string" ? b.meta_description : undefined,
    });
  }

  const row = await getAdSolutionMergedById((req as any).locale, DEFAULT_LOCALE, id);
  return reply.code(201).send(row);
};

/* ---------------- UPDATE (admin) ---------------- */
export const updateAdSolutionAdmin: RouteHandler<{ Params: { id: string }; Body: PatchAdSolutionBody }> = async (req, reply) => {
  const parsed = patchAdSolutionBodySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: "invalid_body", issues: parsed.error.issues } });
  }
  const b = parsed.data;

  await updateAdSolutionParent(req.params.id, {
    category: typeof b.category === "string" ? b.category : undefined,
    featured: typeof b.featured !== "undefined"
      ? ((b.featured === true || b.featured === 1 || b.featured === "1" || b.featured === "true") ? 1 : 0)
      : undefined,
    is_active: typeof b.is_active !== "undefined"
      ? ((b.is_active === false || b.is_active === 0 || b.is_active === "0" || b.is_active === "false") ? 0 : 1)
      : undefined,
    display_order: typeof b.display_order === "number" ? b.display_order : undefined,

    featured_image: typeof b.featured_image !== "undefined" ? (b.featured_image ?? null) : undefined,
    image_url: typeof b.image_url !== "undefined" ? (b.image_url ?? null) : undefined,
    image_asset_id: typeof b.image_asset_id !== "undefined" ? (b.image_asset_id ?? null) : undefined,
  });

  const loc = b.locale ?? (req as any).locale;
  if (loc) {
    await upsertAdSolutionI18n(req.params.id, loc, {
      name: typeof b.name !== "undefined" ? (b.name ?? null) : undefined,
      slug: typeof b.slug !== "undefined" ? (b.slug ?? null) : undefined,
      summary: typeof b.summary !== "undefined" ? (b.summary ?? null) : undefined,
      content: typeof b.content !== "undefined" ? (b.content ?? null) : undefined,
      image_alt: typeof b.image_alt !== "undefined" ? (b.image_alt ?? null) : undefined,
      meta_title: typeof b.meta_title !== "undefined" ? (b.meta_title ?? null) : undefined,
      meta_description: typeof b.meta_description !== "undefined" ? (b.meta_description ?? null) : undefined,
    });
  }

  const row = await getAdSolutionMergedById((req as any).locale, DEFAULT_LOCALE, req.params.id);
  if (!row) return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send(row);
};

/* ---------------- DELETE (admin) ---------------- */
export const removeAdSolutionAdmin: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const affected = await deleteAdSolutionParent(req.params.id);
  if (!affected) return reply.code(404).send({ error: { message: "not_found" } });
  return reply.code(204).send();
};

/* ---------------- GALLERY (admin) ---------------- */
export const listAdSolutionImagesAdmin: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const imgs = await listImages(req.params.id, (req as any).locale, DEFAULT_LOCALE);
  return reply.send(imgs);
};

export const createAdSolutionImageAdmin: RouteHandler<{ Params: { id: string }; Body: any }> = async (req, reply) => {
  const parsed = upsertAdSolutionImageBodySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: "invalid_body", issues: parsed.error.issues } });
  }
  const b = parsed.data;

  const imageId = randomUUID();
  const now = new Date();

  await createImage({
    id: imageId,
    ad_id: req.params.id,
    image_asset_id: typeof b.image_asset_id === "string" ? b.image_asset_id : null,
    image_url: typeof b.image_url === "string" ? b.image_url : null,
    is_active: (b.is_active === false || b.is_active === 0 || b.is_active === "0" || b.is_active === "false") ? 0 : 1,
    display_order: typeof b.display_order === "number" ? b.display_order : 0,
    created_at: now as any,
    updated_at: now as any,
  });

  const loc = b.locale ?? (req as any).locale;
  if (loc && (b.title || b.alt || b.caption)) {
    await upsertImageI18n(imageId, loc, {
      title: typeof b.title === "string" ? b.title : undefined,
      alt: typeof b.alt === "string" ? b.alt : undefined,
      caption: typeof b.caption === "string" ? b.caption : undefined,
    });
  }

  const imgs = await listImages(req.params.id, (req as any).locale, DEFAULT_LOCALE);
  return reply.code(201).send(imgs);
};

export const updateAdSolutionImageAdmin: RouteHandler<{ Params: { id: string; imageId: string }; Body: any }> = async (req, reply) => {
  const parsed = patchAdSolutionImageBodySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: "invalid_body", issues: parsed.error.issues } });
  }
  const b = parsed.data;

  await updateImage(req.params.imageId, {
    image_asset_id: typeof b.image_asset_id !== "undefined" ? (b.image_asset_id ?? null) : undefined,
    image_url: typeof b.image_url !== "undefined" ? (b.image_url ?? null) : undefined,
    is_active: typeof b.is_active !== "undefined"
      ? ((b.is_active === false || b.is_active === 0 || b.is_active === "0" || b.is_active === "false") ? 0 : 1)
      : undefined,
    display_order: typeof b.display_order === "number" ? b.display_order : undefined,
  });

  const loc = b.locale ?? (req as any).locale;
  if (loc && (typeof b.title !== "undefined" || typeof b.alt !== "undefined" || typeof b.caption !== "undefined")) {
    await upsertImageI18n(req.params.imageId, loc, {
      title: typeof b.title !== "undefined" ? (b.title ?? null) : undefined,
      alt: typeof b.alt !== "undefined" ? (b.alt ?? null) : undefined,
      caption: typeof b.caption !== "undefined" ? (b.caption ?? null) : undefined,
    });
  }

  const imgs = await listImages(req.params.id, (req as any).locale, DEFAULT_LOCALE);
  return reply.send(imgs);
};

export const removeAdSolutionImageAdmin: RouteHandler<{ Params: { id: string; imageId: string } }> = async (req, reply) => {
  const affected = await deleteImage(req.params.imageId);
  if (!affected) return reply.code(404).send({ error: { message: "not_found" } });
  const imgs = await listImages(req.params.id, (req as any).locale, DEFAULT_LOCALE);
  return reply.send(imgs);
};
