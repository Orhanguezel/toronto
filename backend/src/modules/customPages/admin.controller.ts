import type { RouteHandler } from "fastify";
import { randomUUID } from "crypto";
import { DEFAULT_LOCALE } from "@/core/i18n";

import {
  listCustomPages,
  getCustomPageMergedById,
  getCustomPageMergedBySlug,
  createCustomPageParent,
  upsertCustomPageI18n,
  updateCustomPageParent,
  deleteCustomPageParent,
  getCustomPageI18nRow,
  packContent,
  reorderCustomPages,
} from "./repository";
import {
  customPageListQuerySchema,
  upsertCustomPageBodySchema,
  patchCustomPageBodySchema,
  type CustomPageListQuery,
  type UpsertCustomPageBody,
  type PatchCustomPageBody,
} from "./validation";
import { setContentRange } from "@/common/utils/contentRange";

const DEFAULT_LOCALE_NORMALIZED = DEFAULT_LOCALE.toLowerCase();

/** Fastify / query / req.locale içinden locale çekip normalize eder */
const resolveLocale = (
  explicit?: string | null,
  reqLocale?: unknown,
): string => {
  const fromExplicit =
    typeof explicit === "string" && explicit.trim().length > 0
      ? explicit.trim()
      : null;
  const fromReq =
    typeof reqLocale === "string" && reqLocale.trim().length > 0
      ? reqLocale.trim()
      : null;

  const raw = fromExplicit ?? fromReq ?? DEFAULT_LOCALE_NORMALIZED;
  return raw.toLowerCase();
};

const toBool = (v: unknown): boolean =>
  v === true || v === 1 || v === "1" || v === "true";

/** LIST (admin) – coalesced */
export const listPagesAdmin: RouteHandler<{
  Querystring: CustomPageListQuery;
}> = async (req, reply) => {
  const parsed = customPageListQuerySchema.safeParse(req.query ?? {});
  if (!parsed.success) {
    return reply.code(400).send({
      error: { message: "invalid_query", issues: parsed.error.issues },
    });
  }
  const q = parsed.data;

  const locale = resolveLocale(q.locale ?? null, req.locale);

  const { items, total } = await listCustomPages({
    orderParam: typeof q.order === "string" ? q.order : undefined,
    sort: q.sort,
    order: q.orderDir,
    limit: q.limit,
    offset: q.offset,
    is_published: q.is_published,
    q: q.q,
    slug: q.slug,
    category_id: q.category_id,
    sub_category_id: q.sub_category_id,
    module_key: q.module_key,
    locale,
    defaultLocale: DEFAULT_LOCALE_NORMALIZED,
  });

  const offset = q.offset ?? 0;
  const limit = q.limit ?? items.length ?? 0;

  setContentRange(reply, offset, limit, total);
  reply.header("x-total-count", String(total ?? 0));
  return reply.send(items);
};

/** GET BY ID (admin) – coalesced */
export const getPageAdmin: RouteHandler<{ Params: { id: string } }> = async (
  req,
  reply,
) => {
  const locale = resolveLocale(null, req.locale);

  const row = await getCustomPageMergedById(
    locale,
    DEFAULT_LOCALE_NORMALIZED,
    req.params.id,
  );
  if (!row) {
    return reply.code(404).send({ error: { message: "not_found" } });
  }
  return reply.send(row);
};

/** GET BY SLUG (admin) – coalesced */
export const getPageBySlugAdmin: RouteHandler<{
  Params: { slug: string };
}> = async (req, reply) => {
  const locale = resolveLocale(null, req.locale);

  const row = await getCustomPageMergedBySlug(
    locale,
    DEFAULT_LOCALE_NORMALIZED,
    req.params.slug,
  );
  if (!row) {
    return reply.code(404).send({ error: { message: "not_found" } });
  }
  return reply.send(row);
};

/** CREATE (admin) */
export const createPageAdmin: RouteHandler<{
  Body: UpsertCustomPageBody;
}> = async (req, reply) => {
  const parsed = upsertCustomPageBodySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({
      error: { message: "invalid_body", issues: parsed.error.issues },
    });
  }
  const b = parsed.data;

  // Primary locale: body.locale > req.locale > DEFAULT_LOCALE
  const primaryLocale = resolveLocale(b.locale ?? null, req.locale);

  try {
    const id = randomUUID();

    // Parent (dil bağımsız) kayıt
    await createCustomPageParent({
      id,
      is_published: toBool(b.is_published) ? 1 : 0,
      featured_image:
        typeof b.featured_image !== "undefined"
          ? b.featured_image ?? null
          : null,
      featured_image_asset_id:
        typeof b.featured_image_asset_id !== "undefined"
          ? b.featured_image_asset_id ?? null
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

    // İlk içerik sadece primaryLocale için yazılır,
    // gerektiğinde admin diğer dillerde çeviri ekler.
    const packedContent = packContent(b.content);
    const basePayload = {
      title: b.title.trim(),
      slug: b.slug.trim(),
      content: packedContent,
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
      tags:
        typeof b.tags === "string" ? b.tags.trim() : b.tags ?? null,
    };

    // Primary locale için i18n kaydı
    await upsertCustomPageI18n(id, primaryLocale, basePayload);

    // Eğer primaryLocale, defaultLocale'den farklıysa
    // fallback düzgün çalışsın diye defaultLocale için de kopya oluştur.
    if (primaryLocale !== DEFAULT_LOCALE_NORMALIZED) {
      await upsertCustomPageI18n(
        id,
        DEFAULT_LOCALE_NORMALIZED,
        basePayload,
      );
    }

    // Response: primary locale’e göre coalesced kayıt
    const row = await getCustomPageMergedById(
      primaryLocale,
      DEFAULT_LOCALE_NORMALIZED,
      id,
    );
    return reply.code(201).send(row);
  } catch (err: any) {
    if (err?.code === "ER_DUP_ENTRY") {
      return reply
        .code(409)
        .send({ error: { message: "slug_already_exists" } });
    }
    req.log.error({ err }, "custom_pages_create_failed");
    return reply
      .code(500)
      .send({ error: { message: "custom_pages_create_failed" } });
  }
};

/** UPDATE (admin, partial) */
export const updatePageAdmin: RouteHandler<{
  Params: { id: string };
  Body: PatchCustomPageBody;
}> = async (req, reply) => {
  const parsed = patchCustomPageBodySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({
      error: { message: "invalid_body", issues: parsed.error.issues },
    });
  }
  const b = parsed.data;
  const locale = resolveLocale(b.locale ?? null, req.locale);

  try {
    // parent patch (varsa)
    const hasParentFields =
      typeof b.is_published !== "undefined" ||
      typeof b.featured_image !== "undefined" ||
      typeof b.featured_image_asset_id !== "undefined" ||
      typeof b.category_id !== "undefined" ||
      typeof b.sub_category_id !== "undefined";

    if (hasParentFields) {
      await updateCustomPageParent(req.params.id, {
        is_published:
          typeof b.is_published !== "undefined"
            ? (toBool(b.is_published) ? 1 : 0)
            : undefined,
        featured_image:
          typeof b.featured_image !== "undefined"
            ? b.featured_image ?? null
            : undefined,
        featured_image_asset_id:
          typeof b.featured_image_asset_id !== "undefined"
            ? b.featured_image_asset_id ?? null
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

    // i18n patch (varsa)
    const hasI18nFields =
      typeof b.title !== "undefined" ||
      typeof b.slug !== "undefined" ||
      typeof b.content !== "undefined" ||
      typeof b.summary !== "undefined" ||
      typeof b.featured_image_alt !== "undefined" ||
      typeof b.meta_title !== "undefined" ||
      typeof b.meta_description !== "undefined" ||
      typeof b.tags !== "undefined";

    if (hasI18nFields) {
      const exists = await getCustomPageI18nRow(req.params.id, locale);

      if (!exists) {
        // yeni çeviri oluşturmak için zorunlu alanlar şart
        if (!b.title || !b.slug || !b.content) {
          return reply.code(400).send({
            error: { message: "missing_required_translation_fields" },
          });
        }
        await upsertCustomPageI18n(req.params.id, locale, {
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
          tags:
            typeof b.tags === "string"
              ? b.tags.trim()
              : b.tags ?? null,
        });
      } else {
        await upsertCustomPageI18n(req.params.id, locale, {
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
          tags:
            typeof b.tags !== "undefined"
              ? typeof b.tags === "string"
                ? b.tags.trim()
                : b.tags ?? null
              : undefined,
        });
      }
    }

    const row = await getCustomPageMergedById(
      locale,
      DEFAULT_LOCALE_NORMALIZED,
      req.params.id,
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
    req.log.error({ err }, "custom_pages_update_failed");
    return reply
      .code(500)
      .send({ error: { message: "custom_pages_update_failed" } });
  }
};

/** DELETE (admin) */
export const removePageAdmin: RouteHandler<{ Params: { id: string } }> =
  async (req, reply) => {
    const affected = await deleteCustomPageParent(req.params.id);
    if (!affected) {
      return reply.code(404).send({ error: { message: "not_found" } });
    }
    return reply.code(204).send();
  };

/** REORDER (admin) – display_order toplu güncelle */
export const reorderCustomPagesAdmin: RouteHandler<{
  Body: { items?: { id?: string; display_order?: number }[] };
}> = async (req, reply) => {
  const body = (req.body ?? {}) as {
    items?: { id?: string; display_order?: number }[];
  };

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return reply.code(400).send({
      error: { message: "invalid_body", detail: "items boş olamaz" },
    });
  }

  const normalized = body.items
    .map((item) => ({
      id: String(item.id ?? "").trim(),
      display_order:
        typeof item.display_order === "number"
          ? item.display_order
          : 0,
    }))
    .filter((x) => x.id.length > 0);

  if (!normalized.length) {
    return reply.code(400).send({
      error: { message: "invalid_body", detail: "geçerli id bulunamadı" },
    });
  }

  await reorderCustomPages(normalized);
  return reply.code(204).send();
};
