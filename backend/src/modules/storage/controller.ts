import type { RouteHandler } from "fastify";
import type { MultipartFile } from "@fastify/multipart";
import { randomUUID } from "node:crypto";
import { db } from "@/db/client";
import { storageAssets } from "./schema";
import { getCloudinaryConfig, uploadBufferAuto } from "./cloudinary";
import { env } from "@/core/env";

/* ----------------------------- küçük yardımcılar ---------------------------- */
const encSeg = (s: string) => encodeURIComponent(s);
const encPath = (p: string) => p.split("/").map(encSeg).join("/");

function publicUrlOf(bucket: string, path: string, providerUrl?: string | null): string {
  if (providerUrl) return providerUrl;
  const cdnBase = (env.CDN_PUBLIC_BASE || "").replace(/\/+$/, "");
  if (cdnBase) return `${cdnBase}/${encSeg(bucket)}/${encPath(path)}`;
  const apiBase = (env.PUBLIC_API_BASE || "").replace(/\/+$/, "");
  return `${apiBase || ""}/storage/${encSeg(bucket)}/${encPath(path)}`;
}

/* ---------------------------------- PUBLIC ---------------------------------- */

/** GET /storage/:bucket/* → provider URL'ye 302 */
export const publicServe: RouteHandler<{ Params: { bucket: string; "*": string } }> = async (req, reply) => {
  const { bucket } = req.params;
  const path = req.params["*"];
  const rows = await db.select().from(storageAssets).where(
    (storageAssets.bucket as any).eq?.(bucket) ?? ({} as any)
  ).execute?.() as any[] | undefined;

  const row = Array.isArray(rows)
    ? rows.find((r) => r.path === path)
    : null;

  if (row?.url) return reply.redirect(302, row.url);
  return reply.code(404).send({ message: "not_found" });
};

/** POST /storage/:bucket/upload (FormData) — server-side signed upload */
export const uploadToBucket: RouteHandler<{
  Params: { bucket: string };
  Querystring: { path?: string; upsert?: string };
}> = async (req, reply) => {
  const cfg = getCloudinaryConfig();
  if (!cfg) return reply.code(501).send({ message: "cloudinary_not_configured" });

  const mp: MultipartFile | undefined = await (req as any).file();
  if (!mp) return reply.code(400).send({ message: "file_required" });

  const buf = await mp.toBuffer();
  const { bucket } = req.params;

  const desired = (req.query?.path ?? mp.filename ?? "file").trim();
  const cleanName = desired.split("/").pop()!.replace(/[^\w.\-]+/g, "_");
  const folder = desired.includes("/") ? desired.split("/").slice(0, -1).join("/") : undefined;

  const publicIdBase = cleanName.replace(/\.[^.]+$/, "");

  let up: any;
  try {
    up = await uploadBufferAuto(cfg, buf, { folder, publicId: publicIdBase, mime: mp.mimetype }, true);
  } catch (e: any) {
    const http = Number(e?.http_code) || 502;
    const msg = e?.message || "upload_failed";
    return reply.code(http >= 400 && http < 500 ? http : 502).send({
      error: { code: "cloudinary_upload_error", message: msg },
    });
  }

  const path = folder ? `${folder}/${cleanName}` : cleanName;

  const record = {
    id: randomUUID(),
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
    provider: "cloudinary" as const,
    provider_public_id: up.public_id ?? null,
    provider_resource_type: up.resource_type ?? null,
    provider_format: up.format ?? null,
    provider_version: typeof up.version === "number" ? up.version : null,
    metadata: null as Record<string, string> | null,
    created_at: new Date(),
    updated_at: new Date(),
  } as const;

  await db.insert(storageAssets).values(record as any);

  return reply.send({ path, url: publicUrlOf(bucket, path, up.secure_url) });
};

/** İmza uçları (S3 için placeholder, Cloudinary unsigned için form-data alanı döner) */
export const signPut: RouteHandler = async (_req, reply) =>
  reply.code(501).send({ message: "s3_not_configured" });

export const signMultipart: RouteHandler = async (req, reply) => {
  const cfg = getCloudinaryConfig();
  if (!cfg) return reply.code(501).send({ message: "cloudinary_not_configured" });
  if (!cfg.uploadPreset) return reply.code(501).send({ message: "unsigned_upload_disabled" });

  const { filename, folder } = (req.body || {}) as { filename?: string; folder?: string };
  const clean = (filename || "file").replace(/[^\w.\-]+/g, "_");
  const public_id = clean.replace(/\.[^.]+$/, "");

  const upload_url = `https://api.cloudinary.com/v1_1/${cfg.cloudName}/auto/upload`;
  const fields: Record<string, string> = {
    upload_preset: cfg.uploadPreset!,
    folder: folder ?? "",
    public_id,
  };
  return reply.send({ upload_url, fields });
};
