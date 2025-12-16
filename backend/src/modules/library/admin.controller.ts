// src/modules/library/admin.controller.ts
// =============================================================

import type { RouteHandler } from "fastify";
import { randomUUID } from "crypto";
import { DEFAULT_LOCALE, type Locale } from "@/core/i18n";
import {
  libraryListQuerySchema,
  upsertLibraryBodySchema,
  patchLibraryBodySchema,
  type LibraryListQuery,
  type UpsertLibraryBody,
  type PatchLibraryBody,
  upsertLibraryImageBodySchema,
  patchLibraryImageBodySchema,
  type UpsertLibraryImageBody,
  type PatchLibraryImageBody,
  upsertLibraryFileParentBodySchema,
  patchLibraryFileParentBodySchema,
  type UpsertLibraryFileParentBody,
  type PatchLibraryFileParentBody,
} from "./validation";
import {
  listLibraries,
  getLibraryMergedById,
  getLibraryMergedBySlug,
  createLibraryParent,
  updateLibraryParent,
  deleteLibraryParent,
  upsertLibraryI18n,
  upsertLibraryI18nAllLocales,
  getLibraryI18nRow,
  packContent,
  packTags,
  listLibraryImagesMerged,
  createLibraryImageParent,
  updateLibraryImageParent,
  deleteLibraryImageParent,
  upsertLibraryImageI18n,
  upsertLibraryImageI18nAllLocales,
  listLibraryFilesMerged,
  createLibraryFileParent,
  updateLibraryFileParent,
  deleteLibraryFileParent,
} from "./repository";

const toBool = (v: unknown): boolean =>
  v === true || v === 1 || v === "1" || v === "true";

/* ================= library: LIST/GET ================= */

export const listLibraryAdmin: RouteHandler<{
  Querystring: LibraryListQuery;
}> = async (req, reply) => {
  const parsed = libraryListQuerySchema.safeParse(req.query ?? {});
  if (!parsed.success) {
    return reply.code(400).send({
      error: {
        message: "invalid_query",
        issues: parsed.error.issues,
      },
    });
  }
  const q = parsed.data;

  const locale: Locale =
    (q.locale as Locale) ??
    ((req as any).locale as Locale) ??
    DEFAULT_LOCALE;

  const { items, total } = await listLibraries({
    orderParam: typeof q.order === "string" ? q.order : undefined,
    sort: q.sort,
    order: q.orderDir,
    limit: q.limit,
    offset: q.offset,
    is_published: q.is_published,
    is_active: q.is_active,
    q: q.q,
    slug: q.slug,
    category_id: q.category_id ?? undefined,
    sub_category_id: q.sub_category_id ?? undefined,
    author: q.author,
    published_before: q.published_before,
    published_after: q.published_after,
    locale,
    defaultLocale: DEFAULT_LOCALE,
  });

  reply.header("x-total-count", String(total ?? 0));
  return reply.send(items);
};

export const getLibraryAdmin: RouteHandler<{
  Params: { id: string };
  Querystring: { locale?: string };
}> = async (req, reply) => {
  const q = (req.query ?? {}) as { locale?: string };
  const locale: Locale =
    (q.locale as Locale) ??
    ((req as any).locale as Locale) ??
    DEFAULT_LOCALE;

  const row = await getLibraryMergedById(
    locale,
    DEFAULT_LOCALE,
    req.params.id,
  );
  if (!row)
    return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send(row);
};

export const getLibraryBySlugAdmin: RouteHandler<{
  Params: { slug: string };
  Querystring: { locale?: string };
}> = async (req, reply) => {
  const q = (req.query ?? {}) as { locale?: string };
  const locale: Locale =
    (q.locale as Locale) ??
    ((req as any).locale as Locale) ??
    DEFAULT_LOCALE;

  const row = await getLibraryMergedBySlug(
    locale,
    DEFAULT_LOCALE,
    req.params.slug,
  );
  if (!row)
    return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send(row);
};

/* ================= library: CREATE ================= */

export const createLibraryAdmin: RouteHandler<{
  Body: UpsertLibraryBody;
}> = async (req, reply) => {
  const parsed = upsertLibraryBodySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({
      error: {
        message: "invalid_body",
        issues: parsed.error.issues,
      },
    });
  }
  const b = parsed.data;
  const locale: Locale =
    (b.locale as Locale) ?? ((req as any).locale as Locale) ?? DEFAULT_LOCALE;

  try {
    const id = randomUUID();

    await createLibraryParent({
      id,
      is_published: toBool(b.is_published) ? 1 : 0,
      is_active: toBool(b.is_active) ? 1 : 0,
      display_order:
        typeof b.display_order === "number" ? b.display_order : 0,
      tags_json: packTags(b.tags),
      category_id:
        typeof b.category_id !== "undefined"
          ? b.category_id ?? null
          : null,
      sub_category_id:
        typeof b.sub_category_id !== "undefined"
          ? b.sub_category_id ?? null
          : null,
      author:
        typeof b.author !== "undefined" ? b.author ?? null : null,
      views: 0,
      download_count: 0,
      published_at:
        typeof b.published_at !== "undefined"
          ? (b.published_at ? new Date(b.published_at) : null)
          : null,
      created_at: new Date() as any,
      updated_at: new Date() as any,
    });

    // i18n alanları tamamen opsiyonel; varsa yaz, yoksa sadece parent kalsın
    const hasI18nFields =
      typeof b.title !== "undefined" ||
      typeof b.slug !== "undefined" ||
      typeof b.summary !== "undefined" ||
      typeof b.content !== "undefined" ||
      typeof b.meta_title !== "undefined" ||
      typeof b.meta_description !== "undefined";

    if (hasI18nFields) {
      // yeni kayıt için title/slug/content eksik ise hata verelim
      if (!b.title || !b.slug || !b.content) {
        return reply.code(400).send({
          error: {
            message: "missing_required_translation_fields",
          },
        });
      }

      const payload = {
        title: b.title.trim(),
        slug: b.slug.trim(),
        summary:
          typeof b.summary === "string"
            ? b.summary
            : b.summary ?? null,
        content: packContent(b.content),
        meta_title:
          typeof b.meta_title === "string"
            ? b.meta_title.trim()
            : b.meta_title ?? null,
        meta_description:
          typeof b.meta_description === "string"
            ? b.meta_description.trim()
            : b.meta_description ?? null,
      };

      const replicateAll = b.replicate_all_locales ?? true;
      if (replicateAll) {
        await upsertLibraryI18nAllLocales(id, payload);
      } else {
        await upsertLibraryI18n(id, locale, payload);
      }
    }

    const row = await getLibraryMergedById(
      locale,
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
    (req as any).log?.error?.({ err }, "library_create_failed");
    return reply
      .code(500)
      .send({ error: { message: "library_create_failed" } });
  }
};

/* ================= library: UPDATE ================= */

export const updateLibraryAdmin: RouteHandler<{
  Params: { id: string };
  Body: PatchLibraryBody;
}> = async (req, reply) => {
  const parsed = patchLibraryBodySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({
      error: {
        message: "invalid_body",
        issues: parsed.error.issues,
      },
    });
  }
  const b = parsed.data;
  const locale: Locale =
    (b.locale as Locale) ?? ((req as any).locale as Locale) ?? DEFAULT_LOCALE;

  try {
    const hasParentPatch =
      typeof b.is_published !== "undefined" ||
      typeof b.is_active !== "undefined" ||
      typeof b.display_order !== "undefined" ||
      typeof b.tags !== "undefined" ||
      typeof b.category_id !== "undefined" ||
      typeof b.sub_category_id !== "undefined" ||
      typeof b.author !== "undefined" ||
      typeof b.published_at !== "undefined";

    if (hasParentPatch) {
      await updateLibraryParent(req.params.id, {
        is_published:
          typeof b.is_published !== "undefined"
            ? toBool(b.is_published)
              ? 1
              : 0
            : undefined,
        is_active:
          typeof b.is_active !== "undefined"
            ? toBool(b.is_active)
              ? 1
              : 0
            : undefined,
        display_order:
          typeof b.display_order === "number"
            ? b.display_order
            : undefined,
        tags_json:
          typeof b.tags !== "undefined"
            ? packTags(b.tags)
            : undefined,
        category_id:
          typeof b.category_id !== "undefined"
            ? b.category_id ?? null
            : undefined,
        sub_category_id:
          typeof b.sub_category_id !== "undefined"
            ? b.sub_category_id ?? null
            : undefined,
        author:
          typeof b.author !== "undefined"
            ? b.author ?? null
            : undefined,
        published_at:
          typeof b.published_at !== "undefined"
            ? b.published_at
              ? new Date(b.published_at)
              : null
            : undefined,
      } as any);
    }

    const hasI18nFields =
      typeof b.title !== "undefined" ||
      typeof b.slug !== "undefined" ||
      typeof b.summary !== "undefined" ||
      typeof b.content !== "undefined" ||
      typeof b.meta_title !== "undefined" ||
      typeof b.meta_description !== "undefined";

    if (hasI18nFields) {
      const payload = {
        title:
          typeof b.title === "string" ? b.title.trim() : undefined,
        slug:
          typeof b.slug === "string" ? b.slug.trim() : undefined,
        summary:
          typeof b.summary !== "undefined"
            ? typeof b.summary === "string"
              ? b.summary
              : b.summary ?? null
            : undefined,
        content:
          typeof b.content === "string"
            ? packContent(b.content)
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
      };

      if (b.apply_all_locales) {
        await upsertLibraryI18nAllLocales(req.params.id, payload);
      } else {
        const exists = await getLibraryI18nRow(
          req.params.id,
          locale,
        );
        if (!exists) {
          if (!b.title || !b.slug || !b.content) {
            return reply.code(400).send({
              error: {
                message: "missing_required_translation_fields",
              },
            });
          }
          await upsertLibraryI18n(req.params.id, locale, {
            title: b.title!.trim(),
            slug: b.slug!.trim(),
            summary:
              typeof b.summary === "string"
                ? b.summary
                : b.summary ?? null,
            content: packContent(b.content!),
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
          await upsertLibraryI18n(
            req.params.id,
            locale,
            payload,
          );
        }
      }
    }

    const row = await getLibraryMergedById(
      locale,
      DEFAULT_LOCALE,
      req.params.id,
    );
    if (!row)
      return reply.code(404).send({ error: { message: "not_found" } });
    return reply.send(row);
  } catch (err: any) {
    if (err?.code === "ER_DUP_ENTRY") {
      return reply
        .code(409)
        .send({ error: { message: "slug_already_exists" } });
    }
    (req as any).log?.error?.({ err }, "library_update_failed");
    return reply
      .code(500)
      .send({ error: { message: "library_update_failed" } });
  }
};

/* ================= library: DELETE ================= */

export const removeLibraryAdmin: RouteHandler<{
  Params: { id: string };
}> = async (req, reply) => {
  const affected = await deleteLibraryParent(req.params.id);
  if (!affected)
    return reply.code(404).send({ error: { message: "not_found" } });
  return reply.code(204).send();
};

/* ================= images: LIST ================= */

export const listLibraryImagesAdmin: RouteHandler<{
  Params: { id: string };
}> = async (req, reply) => {
  const locale: Locale = (req as any).locale ?? DEFAULT_LOCALE;
  const items = await listLibraryImagesMerged(
    req.params.id,
    locale,
    DEFAULT_LOCALE,
  );
  return reply.send(items);
};

/* ================= images: CREATE ================= */

export const createLibraryImageAdmin: RouteHandler<{
  Params: { id: string };
  Body: UpsertLibraryImageBody;
}> = async (req, reply) => {
  const parsed = upsertLibraryImageBodySchema.safeParse(
    req.body ?? {},
  );
  if (!parsed.success) {
    return reply.code(400).send({
      error: {
        message: "invalid_body",
        issues: parsed.error.issues,
      },
    });
  }
  const b = parsed.data;
  const locale: Locale =
    (b.locale as Locale) ?? ((req as any).locale as Locale) ?? DEFAULT_LOCALE;

  const imageId = randomUUID();
  await createLibraryImageParent({
    id: imageId,
    library_id: req.params.id,
    asset_id: b.asset_id,
    image_url:
      typeof b.image_url !== "undefined"
        ? b.image_url ?? null
        : null,
    thumb_url:
      typeof b.thumb_url !== "undefined"
        ? b.thumb_url ?? null
        : null,
    webp_url:
      typeof b.webp_url !== "undefined"
        ? b.webp_url ?? null
        : null,
    display_order:
      typeof b.display_order === "number" ? b.display_order : 0,
    is_active: toBool(b.is_active) ? 1 : 0,
    created_at: new Date() as any,
    updated_at: new Date() as any,
  });

  const replicateAll = b.replicate_all_locales ?? true;
  const payload = {
    alt:
      typeof b.alt === "string" ? b.alt.trim() : b.alt ?? null,
    caption:
      typeof b.caption === "string"
        ? b.caption.trim()
        : b.caption ?? null,
  };
  if (replicateAll) {
    await upsertLibraryImageI18nAllLocales(imageId, payload);
  } else {
    await upsertLibraryImageI18n(imageId, locale, payload);
  }

  const items = await listLibraryImagesMerged(
    req.params.id,
    locale,
    DEFAULT_LOCALE,
  );
  return reply.code(201).send(items);
};

/* ================= images: UPDATE ================= */

export const updateLibraryImageAdmin: RouteHandler<{
  Params: { id: string; imageId: string };
  Body: PatchLibraryImageBody;
}> = async (req, reply) => {
  const parsed = patchLibraryImageBodySchema.safeParse(
    req.body ?? {},
  );
  if (!parsed.success) {
    return reply.code(400).send({
      error: {
        message: "invalid_body",
        issues: parsed.error.issues,
      },
    });
  }
  const b = parsed.data;
  const locale: Locale =
    (b.locale as Locale) ?? ((req as any).locale as Locale) ?? DEFAULT_LOCALE;

  if (
    typeof b.asset_id !== "undefined" ||
    typeof b.image_url !== "undefined" ||
    typeof b.thumb_url !== "undefined" ||
    typeof b.webp_url !== "undefined" ||
    typeof b.display_order !== "undefined" ||
    typeof b.is_active !== "undefined"
  ) {
    await updateLibraryImageParent(req.params.imageId, {
      asset_id:
        typeof b.asset_id === "string" ? b.asset_id : undefined,
      image_url:
        typeof b.image_url !== "undefined"
          ? b.image_url ?? null
          : undefined,
      thumb_url:
        typeof b.thumb_url !== "undefined"
          ? b.thumb_url ?? null
          : undefined,
      webp_url:
        typeof b.webp_url !== "undefined"
          ? b.webp_url ?? null
          : undefined,
      display_order:
        typeof b.display_order === "number"
          ? b.display_order
          : undefined,
      is_active:
        typeof b.is_active !== "undefined"
          ? toBool(b.is_active)
            ? 1
            : 0
          : undefined,
    } as any);
  }

  if (
    typeof b.alt !== "undefined" ||
    typeof b.caption !== "undefined" ||
    b.apply_all_locales
  ) {
    const payload = {
      alt:
        typeof b.alt !== "undefined"
          ? typeof b.alt === "string"
            ? b.alt.trim()
            : b.alt ?? null
          : undefined,
      caption:
        typeof b.caption !== "undefined"
          ? typeof b.caption === "string"
            ? b.caption.trim()
            : b.caption ?? null
          : undefined,
    };
    if (b.apply_all_locales) {
      await upsertLibraryImageI18nAllLocales(
        req.params.imageId,
        payload,
      );
    } else {
      await upsertLibraryImageI18n(
        req.params.imageId,
        locale,
        payload,
      );
    }
  }

  const items = await listLibraryImagesMerged(
    req.params.id,
    locale,
    DEFAULT_LOCALE,
  );
  return reply.send(items);
};

/* ================= images: DELETE ================= */

export const removeLibraryImageAdmin: RouteHandler<{
  Params: { id: string; imageId: string };
}> = async (req, reply) => {
  const affected = await deleteLibraryImageParent(
    req.params.imageId,
  );
  if (!affected)
    return reply.code(404).send({ error: { message: "not_found" } });
  return reply.code(204).send();
};

/* ================= files: LIST ================= */

export const listLibraryFilesAdmin: RouteHandler<{
  Params: { id: string };
}> = async (req, reply) => {
  const items = await listLibraryFilesMerged(req.params.id);
  return reply.send(items);
};

/* ================= files: CREATE ================= */

export const createLibraryFileAdmin: RouteHandler<{
  Params: { id: string };
  Body: UpsertLibraryFileParentBody;
}> = async (req, reply) => {
  const parsed = upsertLibraryFileParentBodySchema.safeParse(
    req.body ?? {},
  );
  if (!parsed.success) {
    return reply.code(400).send({
      error: {
        message: "invalid_body",
        issues: parsed.error.issues,
      },
    });
  }
  const b = parsed.data;

  const fileId = randomUUID();
  await createLibraryFileParent({
    id: fileId,
    library_id: req.params.id,
    asset_id: b.asset_id,
    file_url:
      typeof b.file_url !== "undefined"
        ? b.file_url ?? null
        : null,
    name: b.name,
    size_bytes:
      typeof b.size_bytes === "number" ? b.size_bytes : null,
    mime_type:
      typeof b.mime_type !== "undefined"
        ? b.mime_type ?? null
        : null,
    tags_json: packTags(b.tags),
    display_order:
      typeof b.display_order === "number" ? b.display_order : 0,
    is_active: toBool(b.is_active) ? 1 : 0,
    created_at: new Date() as any,
    updated_at: new Date() as any,
  });

  const items = await listLibraryFilesMerged(req.params.id);
  return reply.code(201).send(items);
};

/* ================= files: UPDATE ================= */

export const updateLibraryFileAdmin: RouteHandler<{
  Params: { id: string; fileId: string };
  Body: PatchLibraryFileParentBody;
}> = async (req, reply) => {
  const parsed = patchLibraryFileParentBodySchema.safeParse(
    req.body ?? {},
  );
  if (!parsed.success) {
    return reply.code(400).send({
      error: {
        message: "invalid_body",
        issues: parsed.error.issues,
      },
    });
  }
  const b = parsed.data;

  if (
    typeof b.asset_id !== "undefined" ||
    typeof b.file_url !== "undefined" ||
    typeof b.name !== "undefined" ||
    typeof b.size_bytes !== "undefined" ||
    typeof b.mime_type !== "undefined" ||
    typeof b.tags !== "undefined" ||
    typeof b.display_order !== "undefined" ||
    typeof b.is_active !== "undefined"
  ) {
    await updateLibraryFileParent(req.params.fileId, {
      asset_id:
        typeof b.asset_id === "string" ? b.asset_id : undefined,
      file_url:
        typeof b.file_url !== "undefined"
          ? b.file_url ?? null
          : undefined,
      name:
        typeof b.name === "string"
          ? b.name
          : undefined,
      size_bytes:
        typeof b.size_bytes === "number"
          ? b.size_bytes
          : undefined,
      mime_type:
        typeof b.mime_type !== "undefined"
          ? b.mime_type ?? null
          : undefined,
      tags_json:
        typeof b.tags !== "undefined"
          ? packTags(b.tags)
          : undefined,
      display_order:
        typeof b.display_order === "number"
          ? b.display_order
          : undefined,
      is_active:
        typeof b.is_active !== "undefined"
          ? toBool(b.is_active)
            ? 1
            : 0
          : undefined,
    } as any);
  }

  const items = await listLibraryFilesMerged(req.params.id);
  return reply.send(items);
};

/* ================= files: DELETE ================= */

export const removeLibraryFileAdmin: RouteHandler<{
  Params: { id: string; fileId: string };
}> = async (req, reply) => {
  const affected = await deleteLibraryFileParent(
    req.params.fileId,
  );
  if (!affected)
    return reply.code(404).send({ error: { message: "not_found" } });
  return reply.code(204).send();
};
