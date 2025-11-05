import type { RouteHandler } from "fastify";
import { DEFAULT_LOCALE } from "@/core/i18n";
import { serviceListQuerySchema, type ServiceListQuery } from "./validation";
import {
  listServices,
  getServiceMergedById,
  getServiceMergedBySlug,
  listServiceImages,
} from "./repository";

const imgUrl = (row: { featured_image: any; image_url: any; image_asset_id: any }, apiBase?: string) => {
  // Eğer storage asset var ve PUBLIC_API_BASE varsa /storage yolu ile sun. (opsiyonel)
  if (row.image_asset_id && !row.image_url && !row.featured_image) {
    const base = (process.env.PUBLIC_API_BASE || "").replace(/\/+$/, "");
    if (base) return `${base}/storage/${encodeURIComponent("default")}/${encodeURIComponent(row.image_asset_id)}`;
  }
  return (row.featured_image ?? row.image_url ?? null) as string | null;
};

export const listServicesPublic: RouteHandler<{ Querystring: ServiceListQuery }> = async (req, reply) => {
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
    is_active: 1, // public: sadece aktifler
  });

  const mapped = items
    .filter(x => x.is_active === 1)
    .map(x => ({ ...x, featured_image_url: imgUrl(x) }));

  reply.header("x-total-count", String(total ?? 0));
  return reply.send(mapped);
};

export const getServicePublic: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const locale = (req as any).locale;
  const def = DEFAULT_LOCALE;

  const row = await getServiceMergedById(locale, def, req.params.id);
  if (!row || row.is_active !== 1) return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send({ ...row, featured_image_url: imgUrl(row) });
};

export const getServiceBySlugPublic: RouteHandler<{ Params: { slug: string } }> = async (req, reply) => {
  const locale = (req as any).locale;
  const def = DEFAULT_LOCALE;

  const row = await getServiceMergedBySlug(locale, def, req.params.slug);
  if (!row || row.is_active !== 1) return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send({ ...row, featured_image_url: imgUrl(row) });
};

export const listServiceImagesPublic: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const locale = (req as any).locale;
  const def = DEFAULT_LOCALE;

  const rows = await listServiceImages({ serviceId: req.params.id, locale, defaultLocale: def, onlyActive: true });
  return reply.send(rows);
};
