import type { RouteHandler } from "fastify";
import { randomUUID } from "crypto";
import { DEFAULT_LOCALE, LOCALES } from "@/core/i18n";
import {
  serviceListQuerySchema,
  upsertServiceBodySchema,
  patchServiceBodySchema,
  upsertServiceImageBodySchema,
  patchServiceImageBodySchema,
  type ServiceListQuery,
  type UpsertServiceBody,
  type PatchServiceBody,
  type UpsertServiceImageBody,
  type PatchServiceImageBody,
} from "./validation";
import {
  listServices,
  getServiceMergedById,
  getServiceMergedBySlug,
  createServiceParent,
  upsertServiceI18n,
  updateServiceParent,
  deleteServiceParent,
  listServiceImages,
  createServiceImage,
  upsertServiceImageI18n,
  updateServiceImage,
  deleteServiceImage,
} from "./repository";

/* ----------------------------- list/get ----------------------------- */

export const listServicesAdmin: RouteHandler<{ Querystring: ServiceListQuery }> = async (req, reply) => {
  const parsed = serviceListQuerySchema.safeParse(req.query ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: "invalid_query", issues: parsed.error.issues } });
  }
  const q = parsed.data;
  const locale = (req as any).locale;
  const def = DEFAULT_LOCALE;

  const { items, total } = await listServices({
    locale, defaultLocale: def,
    orderParam: typeof q.order === "string" ? q.order : undefined,
    sort: q.sort,
    order: q.orderDir,
    limit: q.limit,
    offset: q.offset,
    q: q.q,
    type: q.type,
    category: q.category,
    featured: q.featured,
    is_active: q.is_active,
  });

  reply.header("x-total-count", String(total ?? 0));
  return reply.send(items);
};

export const getServiceAdmin: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const locale = (req as any).locale;
  const def = DEFAULT_LOCALE;
  const row = await getServiceMergedById(locale, def, req.params.id);
  if (!row) return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send(row);
};

export const getServiceBySlugAdmin: RouteHandler<{ Params: { slug: string } }> = async (req, reply) => {
  const locale = (req as any).locale;
  const def = DEFAULT_LOCALE;
  const row = await getServiceMergedBySlug(locale, def, req.params.slug);
  if (!row) return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send(row);
};

/* ----------------------------- create/update/delete (service) ----------------------------- */

export const createServiceAdmin: RouteHandler<{ Body: UpsertServiceBody }> = async (req, reply) => {
  const parsed = upsertServiceBodySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: "invalid_body", issues: parsed.error.issues } });
  }
  const b = parsed.data;
  const id = randomUUID();
  const now = new Date();

  // parent (non-i18n)
  await createServiceParent({
    id,
    type: b.type ?? "other",
    category: b.category ?? "general",
    featured: (b.featured === true || b.featured === 1 || b.featured === "1" || b.featured === "true") ? 1 : 0,
    is_active: (b.is_active === false || b.is_active === 0 || b.is_active === "0" || b.is_active === "false") ? 0 : 1,
    display_order: typeof b.display_order === "number" ? b.display_order : 1,

    featured_image: typeof b.featured_image !== "undefined" ? (b.featured_image ?? null) : null,
    image_url: typeof b.image_url !== "undefined" ? (b.image_url ?? null) : null,
    image_asset_id: typeof b.image_asset_id !== "undefined" ? (b.image_asset_id ?? null) : null,

    area: typeof b.area === "string" ? b.area : null,
    duration: typeof b.duration === "string" ? b.duration : null,
    maintenance: typeof b.maintenance === "string" ? b.maintenance : null,
    season: typeof b.season === "string" ? b.season : null,

    soil_type: typeof b.soil_type === "string" ? b.soil_type : null,
    thickness: typeof b.thickness === "string" ? b.thickness : null,
    equipment: typeof b.equipment === "string" ? b.equipment : null,

    created_at: now as any,
    updated_at: now as any,
  });

  // i18n: tüm LOCALES için satır oluştur (seçili locale dolu, diğerleri boş)
  const reqLocale = (b.locale || (req as any).locale || DEFAULT_LOCALE) as string;
  for (const L of LOCALES) {
    await upsertServiceI18n(id, L, {
      slug: L === reqLocale ? b.slug?.trim() : undefined,
      name: L === reqLocale ? b.name?.trim() : undefined,
      description: L === reqLocale ? b.description : undefined,
      material: L === reqLocale ? b.material : undefined,
      price: L === reqLocale ? b.price : undefined,
      includes: L === reqLocale ? b.includes : undefined,
      warranty: L === reqLocale ? b.warranty : undefined,
      image_alt: L === reqLocale ? b.image_alt : undefined,
    });
  }

  const row = await getServiceMergedById(reqLocale, DEFAULT_LOCALE, id);
  return reply.code(201).send(row);
};

export const updateServiceAdmin: RouteHandler<{ Params: { id: string }; Body: PatchServiceBody }> = async (req, reply) => {
  const parsed = patchServiceBodySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: "invalid_body", issues: parsed.error.issues } });
  }
  const b = parsed.data;

  // parent patch
  const parentPatch: any = {};
  const boolTrue = (v: any) => (v === true || v === 1 || v === "1" || v === "true");
  const boolFalse = (v: any) => (v === false || v === 0 || v === "0" || v === "false");

  if (typeof b.type !== "undefined") parentPatch.type = b.type;
  if (typeof b.category !== "undefined") parentPatch.category = b.category;
  if (typeof b.featured !== "undefined") parentPatch.featured = boolTrue(b.featured) ? 1 : 0;
  if (typeof b.is_active !== "undefined") parentPatch.is_active = boolFalse(b.is_active) ? 0 : 1;
  if (typeof b.display_order !== "undefined") parentPatch.display_order = b.display_order;

  if (typeof b.featured_image !== "undefined") parentPatch.featured_image = b.featured_image ?? null;
  if (typeof b.image_url !== "undefined") parentPatch.image_url = b.image_url ?? null;
  if (typeof b.image_asset_id !== "undefined") parentPatch.image_asset_id = b.image_asset_id ?? null;

  for (const k of ["area","duration","maintenance","season","soil_type","thickness","equipment"] as const) {
    if (typeof (b as any)[k] !== "undefined") (parentPatch as any)[k] = (b as any)[k];
  }

  if (Object.keys(parentPatch).length) {
    await updateServiceParent(req.params.id, parentPatch);
  }

  // i18n patch (varsa)
  const anyI18n =
    typeof b.slug !== "undefined" ||
    typeof b.name !== "undefined" ||
    typeof b.description !== "undefined" ||
    typeof b.material !== "undefined" ||
    typeof b.price !== "undefined" ||
    typeof b.includes !== "undefined" ||
    typeof b.warranty !== "undefined" ||
    typeof b.image_alt !== "undefined";

  if (anyI18n) {
    const loc = (b.locale || (req as any).locale || DEFAULT_LOCALE) as string;
    await upsertServiceI18n(req.params.id, loc, {
      slug: b.slug?.trim(),
      name: b.name?.trim(),
      description: b.description,
      material: b.material,
      price: b.price,
      includes: b.includes,
      warranty: b.warranty,
      image_alt: b.image_alt,
    });
  }

  const locale = (b.locale || (req as any).locale || DEFAULT_LOCALE) as string;
  const row = await getServiceMergedById(locale, DEFAULT_LOCALE, req.params.id);
  if (!row) return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send(row);
};

export const removeServiceAdmin: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const affected = await deleteServiceParent(req.params.id);
  if (!affected) return reply.code(404).send({ error: { message: "not_found" } });
  return reply.code(204).send();
};

/* ----------------------------- images (gallery) ----------------------------- */

export const listServiceImagesAdmin: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const locale = (req as any).locale;
  const def = DEFAULT_LOCALE;
  const rows = await listServiceImages({ serviceId: req.params.id, locale, defaultLocale: def });
  return reply.send(rows);
};

export const createServiceImageAdmin: RouteHandler<{ Params: { id: string }; Body: UpsertServiceImageBody }> = async (req, reply) => {
  const parsed = upsertServiceImageBodySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: "invalid_body", issues: parsed.error.issues } });
  }
  const b = parsed.data;
  const id = randomUUID();
  const now = new Date();

  await createServiceImage({
    id,
    service_id: req.params.id,
    image_asset_id: typeof b.image_asset_id !== "undefined" ? (b.image_asset_id ?? null) : null,
    image_url: typeof b.image_url !== "undefined" ? (b.image_url ?? null) : null,
    is_active: (b.is_active === false || b.is_active === 0 || b.is_active === "0" || b.is_active === "false") ? 0 : 1,
    display_order: typeof b.display_order === "number" ? b.display_order : 0,
    created_at: now as any,
    updated_at: now as any,
  });

  const loc = (b.locale || (req as any).locale || DEFAULT_LOCALE) as string;
  if (b.title || b.alt || b.caption) {
    await upsertServiceImageI18n(id, loc, {
      title: b.title ?? null,
      alt: b.alt ?? null,
      caption: b.caption ?? null,
    });
  }

  const rows = await listServiceImages({ serviceId: req.params.id, locale: loc, defaultLocale: DEFAULT_LOCALE });
  return reply.code(201).send(rows);
};

export const updateServiceImageAdmin: RouteHandler<{ Params: { id: string; imageId: string }; Body: PatchServiceImageBody }> = async (req, reply) => {
  const parsed = patchServiceImageBodySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: "invalid_body", issues: parsed.error.issues } });
  }
  const b = parsed.data;

  const patch: any = {};
  if (typeof b.image_asset_id !== "undefined") patch.image_asset_id = b.image_asset_id ?? null;
  if (typeof b.image_url !== "undefined") patch.image_url = b.image_url ?? null;
  if (typeof b.is_active !== "undefined") {
    patch.is_active = (b.is_active === false || b.is_active === 0 || b.is_active === "0" || b.is_active === "false") ? 0 : 1;
  }
  if (typeof b.display_order !== "undefined") patch.display_order = b.display_order;

  if (Object.keys(patch).length) await updateServiceImage(req.params.imageId, patch);

  if (typeof b.title !== "undefined" || typeof b.alt !== "undefined" || typeof b.caption !== "undefined") {
    const loc = (b.locale || (req as any).locale || DEFAULT_LOCALE) as string;
    await upsertServiceImageI18n(req.params.imageId, loc, {
      title: typeof b.title !== "undefined" ? b.title : undefined,
      alt: typeof b.alt !== "undefined" ? b.alt : undefined,
      caption: typeof b.caption !== "undefined" ? b.caption : undefined,
    });
  }

  const locale = (b.locale || (req as any).locale || DEFAULT_LOCALE) as string;
  const rows = await listServiceImages({ serviceId: req.params.id, locale, defaultLocale: DEFAULT_LOCALE });
  return reply.send(rows);
};

export const removeServiceImageAdmin: RouteHandler<{ Params: { id: string; imageId: string } }> = async (req, reply) => {
  const affected = await deleteServiceImage(req.params.imageId);
  if (!affected) return reply.code(404).send({ error: { message: "not_found" } });
  const rows = await listServiceImages({
    serviceId: req.params.id,
    locale: (req as any).locale,
    defaultLocale: DEFAULT_LOCALE
  });
  return reply.send(rows);
};
