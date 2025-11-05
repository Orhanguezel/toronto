import type { RouteHandler } from "fastify";
import { and, asc, desc, eq, like, sql as dsql } from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";
import { db } from "@/db/client";
import { DEFAULT_LOCALE } from "@/core/i18n";
import {
  storageAssets,
  storageAssetsI18n,
  type NewStorageAssetI18n,
} from "./schema";
import {
  storageListQuerySchema,
  type StorageListQuery,
  storageUpdateSchema,
  type StorageUpdateInput,
  patchAssetI18nBodySchema,
  type PatchAssetI18nBody,
} from "./validation";
import {
  getCloudinaryConfig,
  uploadBufferAuto,
  destroyCloudinaryById,
  renameCloudinaryPublicId,
} from "./cloudinary";
import type { MultipartFile, MultipartValue } from "@fastify/multipart";

/* -------------------------------- helpers -------------------------------- */

const ORDER = {
  created_at: storageAssets.created_at,
  name: storageAssets.name,
  size: storageAssets.size,
} as const;

function parseOrder(q: StorageListQuery) {
  const sort = q.sort ?? "created_at";
  const order = q.order ?? "desc";
  const col = ORDER[sort] ?? storageAssets.created_at;
  const primary = order === "asc" ? asc(col) : desc(col);
  return { primary };
}

async function getAssetById(id: string) {
  const rows = await db.select().from(storageAssets).where(eq(storageAssets.id, id)).limit(1);
  return rows[0] ?? null;
}

/** i18n upsert helper (tek locale) — handler çağrısı yok, pure */
async function upsertAssetI18n(
  assetId: string,
  locale: string,
  data: Partial<Pick<NewStorageAssetI18n, "title" | "alt" | "caption" | "description">> & { id?: string }
) {
  const insertVals: NewStorageAssetI18n = {
    id: data.id ?? randomUUID(),
    asset_id: assetId,
    locale,
    title: typeof data.title === "undefined" ? (null as any) : (data.title ?? null),
    alt: typeof data.alt === "undefined" ? (null as any) : (data.alt ?? null),
    caption: typeof data.caption === "undefined" ? (null as any) : (data.caption ?? null),
    description: typeof data.description === "undefined" ? (null as any) : (data.description ?? null),
    created_at: new Date() as any,
    updated_at: new Date() as any,
  };

  const setObj: Record<string, any> = {};
  if (typeof data.title !== "undefined") setObj.title = data.title ?? null;
  if (typeof data.alt !== "undefined") setObj.alt = data.alt ?? null;
  if (typeof data.caption !== "undefined") setObj.caption = data.caption ?? null;
  if (typeof data.description !== "undefined") setObj.description = data.description ?? null;
  setObj.updated_at = new Date();

  if (Object.keys(setObj).length === 1) return;
  await db.insert(storageAssetsI18n).values(insertVals).onDuplicateKeyUpdate({ set: setObj });
}

/* ------------------------------- merged select ------------------------------ */

type AssetMerged = {
  id: string;
  name: string;
  bucket: string;
  path: string;
  folder: string | null;
  mime: string;
  size: number;
  width: number | null;
  height: number | null;
  url: string | null;
  provider: string;
  provider_public_id: string | null;
  provider_resource_type: string | null;
  provider_format: string | null;
  provider_version: number | null;
  metadata: Record<string, string> | null;
  created_at: string | Date;
  updated_at: string | Date;

  // i18n (coalesced)
  title: string | null;
  alt: string | null;
  caption: string | null;
  description: string | null;
  locale_resolved: string | null;
};

function baseSelect(i18nReq: any, i18nDef: any) {
  return {
    id: storageAssets.id,
    name: storageAssets.name,
    bucket: storageAssets.bucket,
    path: storageAssets.path,
    folder: storageAssets.folder,
    mime: storageAssets.mime,
    size: storageAssets.size,
    width: storageAssets.width,
    height: storageAssets.height,
    url: storageAssets.url,
    provider: storageAssets.provider,
    provider_public_id: storageAssets.provider_public_id,
    provider_resource_type: storageAssets.provider_resource_type,
    provider_format: storageAssets.provider_format,
    provider_version: storageAssets.provider_version,
    metadata: storageAssets.metadata,
    created_at: storageAssets.created_at,
    updated_at: storageAssets.updated_at,

    title: dsql<string>`COALESCE(${i18nReq.title}, ${i18nDef.title})`.as("title"),
    alt: dsql<string>`COALESCE(${i18nReq.alt}, ${i18nDef.alt})`.as("alt"),
    caption: dsql<string>`COALESCE(${i18nReq.caption}, ${i18nDef.caption})`.as("caption"),
    description: dsql<string>`COALESCE(${i18nReq.description}, ${i18nDef.description})`.as("description"),
    locale_resolved: dsql<string>`
      CASE WHEN ${i18nReq.id} IS NOT NULL THEN ${i18nReq.locale} ELSE ${i18nDef.locale} END
    `.as("locale_resolved"),
  };
}

/** PURE: merged asset seçimi — handler’lar bunu kullanır */
async function selectMergedAsset(id: string, locale: string, defLocale: string) {
  const iReq = alias(storageAssetsI18n, "sai_req");
  const iDef = alias(storageAssetsI18n, "sai_def");

  const rows = await db
    .select(baseSelect(iReq, iDef))
    .from(storageAssets)
    .leftJoin(iReq, and(eq(iReq.asset_id, storageAssets.id), eq(iReq.locale, locale)))
    .leftJoin(iDef, and(eq(iDef.asset_id, storageAssets.id), eq(iDef.locale, defLocale)))
    .where(eq(storageAssets.id, id))
    .limit(1);

  return (rows[0] ?? null) as unknown as AssetMerged | null;
}

/* ---------------------------------- LIST ----------------------------------- */

export const adminListAssets: RouteHandler<{ Querystring: unknown }> = async (req, reply) => {
  const parsed = storageListQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: "invalid_query", issues: parsed.error.flatten() } });
  }
  const q = parsed.data;
  const locale = (req as any).locale;
  const def = DEFAULT_LOCALE;

  const iReq = alias(storageAssetsI18n, "sai_req");
  const iDef = alias(storageAssetsI18n, "sai_def");

  const where =
    and(
      q.bucket ? eq(storageAssets.bucket, q.bucket) : dsql`1=1`,
      q.folder != null ? eq(storageAssets.folder, q.folder) : dsql`1=1`,
      q.mime ? like(storageAssets.mime, `${q.mime}%`) : dsql`1=1`,
      q.q
        ? dsql`(
            ${storageAssets.name} LIKE ${'%' + q.q + '%'}
            OR COALESCE(${iReq.title}, ${iDef.title}) LIKE ${'%' + q.q + '%'}
            OR COALESCE(${iReq.caption}, ${iDef.caption}) LIKE ${'%' + q.q + '%'}
            OR COALESCE(${iReq.description}, ${iDef.description}) LIKE ${'%' + q.q + '%'}
          )`
        : dsql`1=1`,
    );

  const [{ total }] = await db
    .select({ total: dsql<number>`COUNT(1)` })
    .from(storageAssets)
    .leftJoin(iReq, and(eq(iReq.asset_id, storageAssets.id), eq(iReq.locale, locale)))
    .leftJoin(iDef, and(eq(iDef.asset_id, storageAssets.id), eq(iDef.locale, def)))
    .where(where);

  const { primary } = parseOrder(q);
  const rows = await db
    .select(baseSelect(iReq, iDef))
    .from(storageAssets)
    .leftJoin(iReq, and(eq(iReq.asset_id, storageAssets.id), eq(iReq.locale, locale)))
    .leftJoin(iDef, and(eq(iDef.asset_id, storageAssets.id), eq(iDef.locale, def)))
    .where(where)
    .orderBy(primary)
    .limit(q.limit)
    .offset(q.offset);

  reply.header("x-total-count", String(total));
  reply.header("content-range", `*/${total}`);
  reply.header("access-control-expose-headers", "x-total-count, content-range");
  return reply.send(rows as unknown as AssetMerged[]);
};

/* ---------------------------------- GET ------------------------------------ */

export const adminGetAsset: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const row = await getAssetById(req.params.id);
  if (!row) return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send(row);
};

export const adminGetAssetMerged: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const locale = (req as any).locale;
  const def = DEFAULT_LOCALE;
  const row = await selectMergedAsset(req.params.id, locale, def);
  if (!row) return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send(row);
};

/* -------------------------------- CREATE ----------------------------------- */

export const adminCreateAsset: RouteHandler = async (req, reply) => {
  const cfg = getCloudinaryConfig();
  if (!cfg) return reply.code(501).send({ message: "cloudinary_not_configured" });

  const mp: MultipartFile | undefined = await (req as any).file();
  if (!mp) return reply.code(400).send({ message: "file_required" });
  const buf = await mp.toBuffer();

  const fields = mp.fields as Record<string, MultipartValue>;
  const s = (k: string): string | undefined => (fields[k] ? String(fields[k].value) : undefined);

  const bucket = s("bucket") ?? "default";
  const folder = s("folder") ?? undefined;

  const cleanName = (mp.filename || "file").replace(/[^\w.\-]+/g, "_");
  const publicIdBase = cleanName.replace(/\.[^.]+$/, "");

  const up = await uploadBufferAuto(cfg, buf, { folder, publicId: publicIdBase, mime: mp.mimetype }, true);

  const path = folder ? `${folder}/${cleanName}` : cleanName;
  const id = randomUUID();
  const now = new Date();

  await db.insert(storageAssets).values({
    id,
    user_id: (req as any).user?.id ? String((req as any).user.id) : null,
    name: cleanName,
    bucket,
    path,
    folder: folder ?? null,
    mime: mp.mimetype,
    size: up.bytes,
    width: up.width ?? null,
    height: up.height ?? null,
    url: up.secure_url,
    hash: up.etag ?? null,
    etag: up.etag ?? null,
    provider: "cloudinary",
    provider_public_id: up.public_id ?? null,
    provider_resource_type: up.resource_type ?? null,
    provider_format: up.format ?? null,
    provider_version: typeof up.version === "number" ? up.version : null,
    metadata: (() => {
      const raw = s("metadata");
      if (!raw) return null;
      try { return JSON.parse(raw) as Record<string, string>; } catch { return null; }
    })(),
    created_at: now as any,
    updated_at: now as any,
  });

  // Opsiyonel i18n alanları
  const locale = s("locale") || (req as any).locale;
  const title = s("title");
  const alt = s("alt");
  const caption = s("caption");
  const description = s("description");
  if (locale && (title || alt || caption || description)) {
    await upsertAssetI18n(id, locale, {
      title: typeof title === "string" ? title.trim() : undefined,
      alt: typeof alt === "string" ? alt.trim() : undefined,
      caption: typeof caption === "string" ? caption.trim() : undefined,
      description: typeof description === "string" ? description.trim() : undefined,
    });
  }

  return reply.code(201).send(await getAssetById(id));
};

/* --------------------------------- PATCH ----------------------------------- */

export const adminPatchAsset: RouteHandler<{ Params: { id: string }; Body: StorageUpdateInput }> = async (req, reply) => {
  const parsed = storageUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: "invalid_body", issues: parsed.error.flatten() } });
  }

  const patch = parsed.data;
  const cur = await getAssetById(req.params.id);
  if (!cur) return reply.code(404).send({ error: { message: "not_found" } });

  const sets: Record<string, unknown> = { updated_at: dsql`CURRENT_TIMESTAMP(3)` };

  if (patch.name !== undefined) sets.name = patch.name;

  if (patch.folder !== undefined) {
    if (cur.provider_public_id) {
      const baseName = (cur.provider_public_id.split("/").pop() || cur.name).replace(/^\//, "");
      const newPublicId = patch.folder ? `${patch.folder}/${baseName}` : baseName;

      const renamed = await renameCloudinaryPublicId(
        cur.provider_public_id,
        newPublicId,
        cur.provider_resource_type || "image"
      );

      sets.folder = patch.folder;
      sets.path = patch.folder ? `${patch.folder}/${cur.name}` : cur.name;
      sets.provider_public_id = renamed.public_id ?? newPublicId;
      sets.url = renamed.secure_url ?? cur.url;
      sets.provider_version = typeof renamed.version === "number" ? renamed.version : cur.provider_version;
      sets.provider_format = renamed.format ?? cur.provider_format;
    } else {
      const baseName = cur.path.split("/").pop()!;
      sets.folder = patch.folder;
      sets.path = patch.folder ? `${patch.folder}/${baseName}` : baseName;
    }
  }

  if (patch.metadata !== undefined) sets.metadata = patch.metadata;

  await db.update(storageAssets).set(sets).where(eq(storageAssets.id, req.params.id));
  const fresh = await getAssetById(req.params.id);
  if (!fresh) return reply.code(404).send({ error: { message: "not_found" } });

  return reply.send(fresh);
};

/* --------------------------------- i18n PATCH -------------------------------- */

export const adminPatchAssetI18n: RouteHandler<{ Params: { id: string }; Body: PatchAssetI18nBody }> = async (req, reply) => {
  const parsed = patchAssetI18nBodySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return reply.code(400).send({ error: { message: "invalid_body", issues: parsed.error.flatten() } });
  }
  const b = parsed.data;
  const cur = await getAssetById(req.params.id);
  if (!cur) return reply.code(404).send({ error: { message: "not_found" } });

  const locale = b.locale ?? (req as any).locale;
  await upsertAssetI18n(req.params.id, locale, {
    title: typeof b.title !== "undefined" ? (b.title ?? null) : undefined,
    alt: typeof b.alt !== "undefined" ? (b.alt ?? null) : undefined,
    caption: typeof b.caption !== "undefined" ? (b.caption ?? null) : undefined,
    description: typeof b.description !== "undefined" ? (b.description ?? null) : undefined,
  });

  // ❌ handler çağırma yok → ✅ pure helper ile merged dön
  const def = DEFAULT_LOCALE;
  const merged = await selectMergedAsset(req.params.id, locale, def);
  if (!merged) return reply.code(404).send({ error: { message: "not_found" } });
  return reply.send(merged);
};

/* --------------------------------- DELETE ---------------------------------- */

export const adminDeleteAsset: RouteHandler<{ Params: { id: string } }> = async (req, reply) => {
  const row = await getAssetById(req.params.id);
  if (!row) return reply.code(404).send({ error: { message: "not_found" } });
  try {
    const publicId = row.provider_public_id || row.path.replace(/\.[^.]+$/, "");
    await destroyCloudinaryById(publicId, row.provider_resource_type || undefined);
  } catch {}
  await db.delete(storageAssets).where(eq(storageAssets.id, req.params.id));
  return reply.code(204).send();
};

export const adminBulkDelete: RouteHandler<{ Body: { ids: string[] } }> = async (req, reply) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
  let deleted = 0;
  for (const id of ids) {
    const row = await getAssetById(id);
    if (!row) continue;
    try {
      const publicId = row.provider_public_id || row.path.replace(/\.[^.]+$/, "");
      await destroyCloudinaryById(publicId, row.provider_resource_type || undefined);
    } catch {}
    await db.delete(storageAssets).where(eq(storageAssets.id, id));
    deleted++;
  }
  return reply.send({ deleted });
};

/* --------------------------------- FOLDERS --------------------------------- */

export const adminListFolders: RouteHandler = async (_req, reply) => {
  const rows = await db
    .select({ folder: storageAssets.folder })
    .from(storageAssets)
    .where(dsql`${storageAssets.folder} IS NOT NULL`)
    .groupBy(storageAssets.folder);

  const folders = rows.map(r => r.folder as string).filter(Boolean);
  return reply.send(folders);
};
