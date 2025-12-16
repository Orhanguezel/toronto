// =============================================================
// FILE: src/modules/slider/controller.ts  (PUBLIC)
// =============================================================
import type { RouteHandler } from "fastify";
import {
  publicListQuerySchema,
  idOrSlugParamSchema,
  type PublicListQuery,
} from "./validation";
import {
  repoListPublic,
  repoGetBySlug,
  type RowWithAsset,
} from "./repository";

/** FE SlideData (public) */
type SlideData = {
  id: string;
  title: string;
  description: string;
  image: string;
  alt?: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  order: number;
  priority?: "low" | "medium" | "high";
  showOnMobile?: boolean;
  showOnDesktop?: boolean;
  locale: string;
};

const rowToPublic = (row: RowWithAsset): SlideData => {
  const base = row.sl;
  const t = row.i18n;
  const url = row.asset_url ?? base.image_url ?? "";

  return {
    id: String(base.id),
    title: t.name,
    description: t.description ?? "",
    image: url,
    alt: t.alt ?? undefined,
    buttonText: t.buttonText ?? "İncele",
    buttonLink: t.buttonLink ?? "",
    isActive: !!base.is_active,
    order: base.display_order ?? 0,
    priority: base.featured ? "high" : "medium",
    showOnMobile: true,
    showOnDesktop: true,
    locale: t.locale,
  };
};

/** GET /sliders (public, sadece aktifler, locale destekli) */
export const listPublicSlides: RouteHandler = async (req, reply) => {
  const parsed = publicListQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return reply.code(400).send({
      error: {
        message: "invalid_query",
        issues: parsed.error.flatten(),
      },
    });
  }
  const q = parsed.data as PublicListQuery;
  const rows = await repoListPublic(q);
  return rows.map(rowToPublic);
};

/** GET /sliders/:idOrSlug?locale=tr (opsiyonel public detail) */
export const getPublicSlide: RouteHandler = async (req, reply) => {
  const v = idOrSlugParamSchema.safeParse(req.params);
  if (!v.success) {
    return reply
      .code(400)
      .send({ error: { message: "invalid_params" } });
  }

  const slug = v.data.idOrSlug;

  // locale query string'den; yoksa "tr"
  const q = (req.query ?? {}) as Record<string, unknown>;
  let locale = "tr";
  if (typeof q.locale === "string" && q.locale.trim()) {
    locale = q.locale.trim();
  }

  const row = await repoGetBySlug(slug, locale);
  if (!row || !row.sl?.is_active) {
    return reply
      .code(404)
      .send({ error: { message: "not_found" } });
  }
  return rowToPublic(row);
};
