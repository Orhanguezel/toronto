// ===================================================================
// FILE: src/modules/faqs/admin.controller.ts
// ===================================================================

import type { RouteHandler } from "fastify";
import { randomUUID } from "crypto";
import { DEFAULT_LOCALE } from "@/core/i18n";
import {
  listFaqs,
  getFaqMergedById,
  getFaqMergedBySlug,
  createFaqParent,
  upsertFaqI18n,
  updateFaqParent,
  deleteFaqParent,
  getFaqI18nRow,
} from "./repository";
import {
  faqListQuerySchema,
  upsertFaqBodySchema,
  patchFaqBodySchema,
  type FaqListQuery,
  type UpsertFaqBody,
  type PatchFaqBody,
} from "./validation";

const toBool = (v: unknown): boolean =>
  v === true || v === 1 || v === "1" || v === "true";

/** LIST (admin) – coalesced */
export const listFaqsAdmin: RouteHandler<{
  Querystring: FaqListQuery;
}> = async (req, reply) => {
  const parsed = faqListQuerySchema.safeParse(req.query ?? {});
  if (!parsed.success) {
    return reply.code(400).send({
      error: {
        message: "invalid_query",
        issues: parsed.error.issues,
      },
    });
  }
  const q = parsed.data;

  const { items, total } = await listFaqs({
    orderParam:
      typeof q.order === "string" ? q.order : undefined,
    sort: q.sort,
    order: q.orderDir,
    limit: q.limit,
    offset: q.offset,
    is_active: q.is_active, // admin tümünü görebilir
    q: q.q,
    slug: q.slug,
    category_id: q.category_id,
    sub_category_id: q.sub_category_id,
    locale: (req as any).locale,
    defaultLocale: DEFAULT_LOCALE,
  });

  reply.header("x-total-count", String(total ?? 0));
  return reply.send(items);
};

/** GET BY ID (admin) – coalesced */
export const getFaqAdmin: RouteHandler<{
  Params: { id: string };
}> = async (req, reply) => {
  const row = await getFaqMergedById(
    (req as any).locale,
    DEFAULT_LOCALE,
    req.params.id,
  );
  if (!row) {
    return reply
      .code(404)
      .send({ error: { message: "not_found" } });
  }
  return reply.send(row);
};

/** GET BY SLUG (admin) – coalesced */
export const getFaqBySlugAdmin: RouteHandler<{
  Params: { slug: string };
}> = async (req, reply) => {
  const row = await getFaqMergedBySlug(
    (req as any).locale,
    DEFAULT_LOCALE,
    req.params.slug,
  );
  if (!row) {
    return reply
      .code(404)
      .send({ error: { message: "not_found" } });
  }
  return reply.send(row);
};

/** CREATE (admin)
 *  - Parent kaydı oluşturur
 *  - Body.locale > header.locale ile i18n satırını oluşturur
 */
export const createFaqAdmin: RouteHandler<{
  Body: UpsertFaqBody;
}> = async (req, reply) => {
  const parsed = upsertFaqBodySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({
      error: {
        message: "invalid_body",
        issues: parsed.error.issues,
      },
    });
  }
  const b = parsed.data;
  const locale = b.locale ?? (req as any).locale;

  try {
    const id = randomUUID();

    // parent
    await createFaqParent({
      id,
      is_active: toBool(b.is_active) ? 1 : 0,
      display_order:
        typeof b.display_order === "number" ? b.display_order : 0,
      category_id:
        typeof b.category_id === "string" && b.category_id.trim() !== ""
          ? b.category_id.trim()
          : null,
      sub_category_id:
        typeof b.sub_category_id === "string" &&
          b.sub_category_id.trim() !== ""
          ? b.sub_category_id.trim()
          : null,
      created_at: new Date() as any,
      updated_at: new Date() as any,
    });

    // i18n
    await upsertFaqI18n(id, locale, {
      question: b.question.trim(),
      answer: b.answer,
      slug: b.slug.trim(),
    });

    const row = await getFaqMergedById(
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
    req.log.error({ err }, "faqs_create_failed");
    return reply
      .code(500)
      .send({ error: { message: "faqs_create_failed" } });
  }
};

/** UPDATE (admin, partial)
 *  - Parent alanlar geldiyse parent patch
 *  - i18n alanlar geldiyse locale=body.locale??header için i18n upsert/update
 *  - Eğer ilgili locale’de i18n yoksa ve zorunlu alanlar eksikse 400 döner
 */
export const updateFaqAdmin: RouteHandler<{
  Params: { id: string };
  Body: PatchFaqBody;
}> = async (req, reply) => {
  const parsed = patchFaqBodySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({
      error: {
        message: "invalid_body",
        issues: parsed.error.issues,
      },
    });
  }
  const b = parsed.data;
  const locale = b.locale ?? (req as any).locale;

  try {
    // parent patch (varsa)
    if (
      typeof b.is_active !== "undefined" ||
      typeof b.display_order !== "undefined" ||
      typeof b.category_id !== "undefined" ||
      typeof b.sub_category_id !== "undefined"
    ) {
      await updateFaqParent(req.params.id, {
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
        category_id:
          typeof b.category_id === "string"
            ? b.category_id.trim() || null
            : typeof b.category_id === "object"
              ? null
              : undefined,
        sub_category_id:
          typeof b.sub_category_id === "string"
            ? b.sub_category_id.trim() || null
            : typeof b.sub_category_id === "object"
              ? null
              : undefined,
      } as any);
    }

    // i18n patch (varsa)
    const hasI18nFields =
      typeof b.question !== "undefined" ||
      typeof b.answer !== "undefined" ||
      typeof b.slug !== "undefined";

    if (hasI18nFields) {
      const exists = await getFaqI18nRow(req.params.id, locale);

      if (!exists) {
        // yeni çeviri oluşturmak için zorunlu alanlar şart
        if (!b.question || !b.answer || !b.slug) {
          return reply.code(400).send({
            error: {
              message:
                "missing_required_translation_fields",
            },
          });
        }
        await upsertFaqI18n(req.params.id, locale, {
          question: b.question!.trim(),
          answer: b.answer!,
          slug: b.slug!.trim(),
        });
      } else {
        await upsertFaqI18n(req.params.id, locale, {
          question:
            typeof b.question === "string"
              ? b.question.trim()
              : undefined,
          answer:
            typeof b.answer === "string"
              ? b.answer
              : undefined,
          slug:
            typeof b.slug === "string"
              ? b.slug.trim()
              : undefined,
        });
      }
    }

    const row = await getFaqMergedById(
      locale,
      DEFAULT_LOCALE,
      req.params.id,
    );
    if (!row) {
      return reply
        .code(404)
        .send({ error: { message: "not_found" } });
    }
    return reply.send(row);
  } catch (err: any) {
    if (err?.code === "ER_DUP_ENTRY") {
      return reply
        .code(409)
        .send({ error: { message: "slug_already_exists" } });
    }
    req.log.error({ err }, "faqs_update_failed");
    return reply
      .code(500)
      .send({ error: { message: "faqs_update_failed" } });
  }
};

/** DELETE (admin) */
export const removeFaqAdmin: RouteHandler<{
  Params: { id: string };
}> = async (req, reply) => {
  const affected = await deleteFaqParent(req.params.id);
  if (!affected) {
    return reply
      .code(404)
      .send({ error: { message: "not_found" } });
  }
  return reply.code(204).send();
};
