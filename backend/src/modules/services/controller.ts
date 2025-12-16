// src/modules/services/controller.ts
// =============================================================
// Ensotek – Public Services Controller
//  - GET /services
//  - GET /services/:id
//  - GET /services/by-slug/:slug
//  - GET /services/:id/images
// =============================================================

import type { RouteHandler } from "fastify";
import { DEFAULT_LOCALE, type Locale } from "@/core/i18n";

import {
  serviceListQuerySchema,
  type ServiceListQuery,
} from "./validation";

import {
  listServices,
  getServiceMergedById,
  getServiceMergedBySlug,
  listServiceImages,
} from "./repository";

/* ----------------------------- locale helper (PUBLIC) ----------------------------- */

type LocaleQueryLike = { locale?: string; default_locale?: string };

/**
 * Public endpoint'ler için locale çözümü:
 *  - Öncelik: query.locale > req.locale > DEFAULT_LOCALE
 *  - default_locale: query.default_locale > DEFAULT_LOCALE
 *
 * Admin tarafındaki resolveLocales ile aynı davranış.
 */
function resolveLocalesPublic(
  req: any,
  query?: LocaleQueryLike,
): { locale: Locale; def: Locale } {
  const q = query ?? ((req.query ?? {}) as LocaleQueryLike);

  const rawLocale =
    typeof q.locale === "string" && q.locale.length > 0
      ? q.locale
      : (req.locale as string | undefined);

  const rawDef =
    typeof q.default_locale === "string" && q.default_locale.length > 0
      ? q.default_locale
      : undefined;

  const locale = (rawLocale ?? DEFAULT_LOCALE) as Locale;
  const def = (rawDef ?? DEFAULT_LOCALE) as Locale;

  return { locale, def };
}

/* ----------------------------- LIST (PUBLIC) ----------------------------- */
/**
 * GET /services
 * - Public liste endpoint'i
 * - Varsayılan olarak sadece is_active = 1 kayıtlar
 * - Admin'deki listServicesAdmin ile aynı query şemasını kullanır
 *   (locale / default_locale dahil)
 */
export const listServicesPublic: RouteHandler<{
  Querystring: ServiceListQuery;
}> = async (req, reply) => {
  const parsed = serviceListQuerySchema.safeParse(req.query ?? {});
  if (!parsed.success) {
    return reply.code(400).send({
      error: { message: "invalid_query", issues: parsed.error.issues },
    });
  }

  const q = parsed.data;

  // 🔥 QUERY ÜZERİNDEN LOCALE / DEFAULT_LOCALE DESTEĞİ (public)
  const { locale, def } = resolveLocalesPublic(req, {
    locale: q.locale,
    default_locale: q.default_locale,
  });

  // Public tarafta default: sadece aktif kayıtlar
  const isActive =
    typeof q.is_active === "undefined" ? true : q.is_active;

  const { items, total } = await listServices({
    locale,
    defaultLocale: def,
    orderParam: typeof q.order === "string" ? q.order : undefined,
    sort: q.sort,
    order: q.orderDir,
    limit: q.limit,
    offset: q.offset,
    q: q.q,
    type: q.type,
    category_id: q.category_id,
    sub_category_id: q.sub_category_id,
    featured: q.featured,
    is_active: isActive,
  });

  reply.header("x-total-count", String(total ?? 0));
  return reply.send(items);
};

/* ----------------------------- GET BY ID (PUBLIC) ----------------------------- */
/**
 * GET /services/:id
 * - Public detay
 * - Varsayılan locale + fallback (locale/default_locale)
 * - is_active = 0 olanlar için 404
 *
 * Not: İstersen burada da query'den locale/default_locale alabilirsin:
 *   GET /services/:id?locale=tr&default_locale=en
 */
export const getServicePublic: RouteHandler<{
  Params: { id: string };
}> = async (req, reply) => {
  const { locale, def } = resolveLocalesPublic(req);

  const row = await getServiceMergedById(locale, def, req.params.id);
  if (!row || row.is_active !== 1) {
    return reply.code(404).send({ error: { message: "not_found" } });
  }

  return reply.send(row);
};

/* ----------------------------- GET BY SLUG (PUBLIC) ----------------------------- */
/**
 * GET /services/by-slug/:slug
 * - Public detay (slug ile)
 * - is_active = 0 olanlar için 404
 *
 * FE:
 *   GET /services/by-slug/modernization?locale=en&default_locale=tr
 *   GET /services/by-slug/bakim-ve-onarim?locale=tr&default_locale=tr
 */
export const getServiceBySlugPublic: RouteHandler<{
  Params: { slug: string };
}> = async (req, reply) => {
  const { locale, def } = resolveLocalesPublic(req);

  const row = await getServiceMergedBySlug(
    locale,
    def,
    req.params.slug,
  );

  if (!row || row.is_active !== 1) {
    return reply.code(404).send({ error: { message: "not_found" } });
  }

  return reply.send(row);
};

/* ----------------------------- IMAGES (PUBLIC) ----------------------------- */
/**
 * GET /services/:id/images
 * - Public gallery
 * - Varsayılan: sadece aktif görseller (onlyActive: true)
 * - locale/default_locale query'den ya da req.locale'den çözülür
 */
export const listServiceImagesPublic: RouteHandler<{
  Params: { id: string };
}> = async (req, reply) => {
  const { locale, def } = resolveLocalesPublic(req);

  const rows = await listServiceImages({
    serviceId: req.params.id,
    locale,
    defaultLocale: def,
    onlyActive: true,
  });

  return reply.send(rows);
};
