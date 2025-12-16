// ===================================================================
// FILE: src/modules/footerSections/admin.controller.ts
// ===================================================================

import type { RouteHandler } from "fastify";
import { randomUUID } from "crypto";
import { DEFAULT_LOCALE } from "@/core/i18n";
import {
  listFooterSections,
  getFooterSectionMergedById,
  getFooterSectionMergedBySlug,
  createFooterSectionParent,
  updateFooterSectionParent,
  deleteFooterSectionParent,
  upsertFooterSectionI18n,
  getFooterSectionI18nRow,
} from "./repository";
import {
  footerSectionListQuerySchema,
  upsertFooterSectionBodySchema,
  patchFooterSectionBodySchema,
  type FooterSectionListQuery,
  type UpsertFooterSectionBody,
  type PatchFooterSectionBody,
} from "./validation";

const toBool = (v: unknown): boolean =>
  v === true || v === 1 || v === "1" || v === "true";

/** LIST (admin) – coalesced */
export const listFooterSectionsAdmin: RouteHandler = async (req, reply) => {
  const parsed = footerSectionListQuerySchema.safeParse(
    (req.query ?? {}) as FooterSectionListQuery
  );

  if (!parsed.success) {
    return reply.code(400).send({
      error: { message: "invalid_query", issues: parsed.error.issues },
    });
  }
  const q = parsed.data;

  const { items, total } = await listFooterSections({
    ...q,
    locale: (req as any).locale,
    defaultLocale: DEFAULT_LOCALE,
  });

  reply.header("x-total-count", String(total ?? 0));
  return reply.send(items);
};

/** GET BY ID (admin) – coalesced */
export const getFooterSectionAdmin: RouteHandler = async (req, reply) => {
  const { id } = (req.params ?? {}) as { id: string };

  const row = await getFooterSectionMergedById(
    (req as any).locale,
    DEFAULT_LOCALE,
    id,
  );
  if (!row) {
    return reply.code(404).send({ error: { message: "not_found" } });
  }
  return reply.send(row);
};

/** GET BY SLUG (admin) – coalesced */
export const getFooterSectionBySlugAdmin: RouteHandler = async (req, reply) => {
  const { slug } = (req.params ?? {}) as { slug: string };

  const row = await getFooterSectionMergedBySlug(
    (req as any).locale,
    DEFAULT_LOCALE,
    slug,
  );
  if (!row) {
    return reply.code(404).send({ error: { message: "not_found" } });
  }
  return reply.send(row);
};

/** CREATE (admin) */
export const createFooterSectionAdmin: RouteHandler = async (req, reply) => {
  const parsed = upsertFooterSectionBodySchema.safeParse(
    (req.body ?? {}) as UpsertFooterSectionBody,
  );
  if (!parsed.success) {
    return reply.code(400).send({
      error: { message: "invalid_body", issues: parsed.error.issues },
    });
  }
  const b = parsed.data;
  const locale = b.locale ?? (req as any).locale;

  try {
    const id = randomUUID();

    await createFooterSectionParent({
      id,
      is_active: toBool(b.is_active) ? 1 : 0,
      display_order:
        typeof b.display_order === "number" ? b.display_order : 0,
      created_at: new Date() as any,
      updated_at: new Date() as any,
    });

    await upsertFooterSectionI18n(id, locale, {
      title: b.title.trim(),
      slug: b.slug.trim(),
      description:
        typeof b.description === "string"
          ? b.description
          : b.description ?? null,
    });

    const row = await getFooterSectionMergedById(
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
    req.log.error({ err }, "footer_sections_create_failed");
    return reply
      .code(500)
      .send({ error: { message: "footer_sections_create_failed" } });
  }
};

/** UPDATE (admin, partial) */
export const updateFooterSectionAdmin: RouteHandler = async (req, reply) => {
  const { id } = (req.params ?? {}) as { id: string };

  const parsed = patchFooterSectionBodySchema.safeParse(
    (req.body ?? {}) as PatchFooterSectionBody,
  );
  if (!parsed.success) {
    return reply.code(400).send({
      error: { message: "invalid_body", issues: parsed.error.issues },
    });
  }
  const b = parsed.data;
  const locale = b.locale ?? (req as any).locale;

  try {
    // parent patch
    if (
      typeof b.is_active !== "undefined" ||
      typeof b.display_order !== "undefined"
    ) {
      await updateFooterSectionParent(id, {
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
      } as any);
    }

    // i18n patch
    const hasI18nFields =
      typeof b.title !== "undefined" ||
      typeof b.slug !== "undefined" ||
      typeof b.description !== "undefined";

    if (hasI18nFields) {
      const exists = await getFooterSectionI18nRow(id, locale);

      if (!exists) {
        if (!b.title || !b.slug) {
          return reply.code(400).send({
            error: {
              message: "missing_required_translation_fields",
            },
          });
        }
        await upsertFooterSectionI18n(id, locale, {
          title: b.title!.trim(),
          slug: b.slug!.trim(),
          description:
            typeof b.description === "string"
              ? b.description
              : b.description ?? null,
        });
      } else {
        await upsertFooterSectionI18n(id, locale, {
          title:
            typeof b.title === "string"
              ? b.title.trim()
              : undefined,
          slug:
            typeof b.slug === "string" ? b.slug.trim() : undefined,
          description:
            typeof b.description !== "undefined"
              ? b.description ?? null
              : undefined,
        });
      }
    }

    const row = await getFooterSectionMergedById(
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
    req.log.error({ err }, "footer_sections_update_failed");
    return reply
      .code(500)
      .send({ error: { message: "footer_sections_update_failed" } });
  }
};

/** DELETE (admin) */
export const removeFooterSectionAdmin: RouteHandler = async (req, reply) => {
  const { id } = (req.params ?? {}) as { id: string };

  const affected = await deleteFooterSectionParent(id);
  if (!affected) {
    return reply.code(404).send({ error: { message: "not_found" } });
  }
  return reply.code(204).send();
};
