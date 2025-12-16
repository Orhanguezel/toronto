// =============================================================
// FILE: src/modules/siteSettings/service.ts
// =============================================================

import { db } from "@/db/client";
import { siteSettings } from "./schema";
import { inArray } from "drizzle-orm";
import { env } from "@/core/env";

// ---------------------------------------------------------------------------
// KEY LİSTELERİ
// ---------------------------------------------------------------------------

const SMTP_KEYS = [
  "smtp_host",
  "smtp_port",
  "smtp_username",
  "smtp_password",
  "smtp_from_email",
  "smtp_from_name",
  "smtp_ssl",
] as const;

const STORAGE_KEYS = [
  "storage_driver",
  "storage_local_root",
  "storage_local_base_url",
  "cloudinary_cloud_name",
  "cloudinary_api_key",
  "cloudinary_api_secret",
  "cloudinary_folder",
  "cloudinary_unsigned_preset",
  "storage_cdn_public_base",
  "storage_public_api_base",
] as const;

const GOOGLE_KEYS = [
  "google_client_id",
  "google_client_secret",
] as const;

const APP_LOCALES_KEYS = ["app_locales"] as const;

// ---------------------------------------------------------------------------
// COMMON HELPERS
// ---------------------------------------------------------------------------

const toBool = (v: string | null | undefined): boolean => {
  if (!v) return false;
  const s = v.toLowerCase();
  return ["1", "true", "yes", "on"].includes(s);
};

/**
 * Boş stringleri ("" / "   ") null olarak ele al.
 */
const normalizeStr = (v: string | null | undefined): string | null => {
  if (v == null) return null;
  const trimmed = String(v).trim();
  return trimmed === "" ? null : trimmed;
};

/**
 * Ortak setting loader:
 *  - İstenen key listesi için site_settings tablosunu okur
 *  - JSON string ise primitive string/number'ı normalize eder
 *
 * NOT: Bir key için birden fazla locale satırı varsa
 *      bu fonksiyon "son gelen" ile overwrite eder.
 *      SMTP için bundan bağımsız özel logic kullanıyoruz.
 */
async function loadSettingsMap(
  keys: readonly string[],
): Promise<Map<string, string>> {
  const rows = await db
    .select()
    .from(siteSettings)
    .where(inArray(siteSettings.key, keys));

  const map = new Map<string, string>();
  for (const r of rows) {
    let v = r.value as string;
    try {
      const parsed = JSON.parse(v);
      if (typeof parsed === "string" || typeof parsed === "number") {
        v = String(parsed);
      }
    } catch {
      // value zaten plain string
    }
    map.set(r.key, v);
  }
  return map;
}

// ---------------------------------------------------------------------------
// SMTP SETTINGS  💡 SADECE site_settings TABLOSUNDAN OKUR
// ---------------------------------------------------------------------------

export type SmtpSettings = {
  host: string | null;
  port: number | null;
  username: string | null;
  password: string | null;
  fromEmail: string | null;
  fromName: string | null;
  secure: boolean; // smtp_ssl
};

/**
 * SMTP ayar okuyucu
 *
 * Kaynak:
 *   - Sadece site_settings tablosundaki global key'ler
 *   - ENV FALLBACK YOK
 *
 * ÖZEL NOKTA:
 *   - Aynı key için birden fazla locale satırı olabilir (tr/en/de).
 *   - Burada "boş olmayan" değeri tercih ediyoruz.
 *   - Hiç dolu değer yoksa null.
 *
 * Beklenen key'ler:
 *   smtp_host        → host
 *   smtp_port        → port (string, number'a parse edilir)
 *   smtp_username    → username
 *   smtp_password    → password
 *   smtp_from_email  → fromEmail
 *   smtp_from_name   → fromName
 *   smtp_ssl         → secure (boolean string)
 */
export async function getSmtpSettings(): Promise<SmtpSettings> {
  const rows = await db
    .select()
    .from(siteSettings)
    .where(inArray(siteSettings.key, SMTP_KEYS));

  // key → "en iyi değer" map’i
  const map = new Map<string, string | null>();

  for (const r of rows) {
    const key = r.key;
    let v = r.value as string;

    // JSON ise primitive string/number'a indir
    try {
      const parsed = JSON.parse(v);
      if (typeof parsed === "string" || typeof parsed === "number") {
        v = String(parsed);
      }
    } catch {
      // plain string ise aynen bırak
    }

    const norm = normalizeStr(v);
    const current = map.get(key);

    // Eğer henüz bir değer yoksa → yaz
    if (current === undefined) {
      map.set(key, norm);
      continue;
    }

    // Eğer mevcut değer boş/null ise ve yeni gelen doluysa → overwrite
    if ((current == null || current === "") && norm != null) {
      map.set(key, norm);
      continue;
    }

    // Mevcut dolu, yeni de dolu → birini seçmek için ek bir kurala
    // ihtiyacımız yok; ilk dolu değeri koruyabiliriz.
    // (İstersek son dolu değeri de alabilirdik, fark etmez.)
  }

  const host = normalizeStr(map.get("smtp_host") ?? null);
  const portStr = normalizeStr(map.get("smtp_port") ?? null);
  const port = portStr ? Number(portStr) : null;

  const username = normalizeStr(map.get("smtp_username") ?? null);
  const password = normalizeStr(map.get("smtp_password") ?? null);
  const fromEmail = normalizeStr(map.get("smtp_from_email") ?? null);
  const fromName = normalizeStr(map.get("smtp_from_name") ?? null);
  const secure = toBool(normalizeStr(map.get("smtp_ssl") ?? null));

  return {
    host,
    port,
    username,
    password,
    fromEmail,
    fromName,
    secure,
  };
}

// ---------------------------------------------------------------------------
// STORAGE SETTINGS (Cloudinary / Local) - site_settings + ENV fallback
// ---------------------------------------------------------------------------

export type StorageDriver = "local" | "cloudinary";

export type StorageSettings = {
  driver: StorageDriver;
  localRoot: string | null;
  localBaseUrl: string | null;
  cloudName: string | null;
  apiKey: string | null;
  apiSecret: string | null;
  folder: string | null;
  unsignedUploadPreset: string | null;
  cdnPublicBase: string | null;
  publicApiBase: string | null;
};

/**
 * Driver seçimi:
 *   1) site_settings.storage_driver  ✅ (öncelik)
 *   2) ENV (STORAGE_DRIVER)          🔁 (fallback)
 *   3) default: "cloudinary"
 */
const toDriver = (raw: string | null | undefined): StorageDriver => {
  const v = (raw || "").trim().toLowerCase();
  if (v === "local" || v === "cloudinary") return v;

  const envRaw = (env.STORAGE_DRIVER || "").trim().toLowerCase();
  if (envRaw === "local" || envRaw === "cloudinary") {
    return envRaw as StorageDriver;
  }

  return "cloudinary";
};

export async function getStorageSettings(): Promise<StorageSettings> {
  const rows = await db
    .select()
    .from(siteSettings)
    .where(inArray(siteSettings.key, STORAGE_KEYS));

  const map = new Map<string, string>();
  for (const r of rows) {
    let v = r.value as string;
    try {
      const parsed = JSON.parse(v);
      if (typeof parsed === "string" || typeof parsed === "number") {
        v = String(parsed);
      }
    } catch {
      // plain string ise aynen bırak
    }
    map.set(r.key, v);
  }

  // Driver: önce DB, sonra env, sonra default
  const driver = toDriver(map.get("storage_driver"));

  // 👇 HER ALANDA önce site_settings, sonra env fallback
  const localRoot =
    normalizeStr(map.get("storage_local_root")) ??
    normalizeStr(env.LOCAL_STORAGE_ROOT) ??
    null;

  const localBaseUrl =
    normalizeStr(map.get("storage_local_base_url")) ??
    normalizeStr(env.LOCAL_STORAGE_BASE_URL) ??
    null;

  const cdnPublicBase =
    normalizeStr(map.get("storage_cdn_public_base")) ??
    normalizeStr(env.STORAGE_CDN_PUBLIC_BASE) ??
    null;

  const publicApiBase =
    normalizeStr(map.get("storage_public_api_base")) ??
    normalizeStr(env.STORAGE_PUBLIC_API_BASE) ??
    null;

  const cloudName =
    normalizeStr(map.get("cloudinary_cloud_name")) ??
    normalizeStr(env.CLOUDINARY_CLOUD_NAME) ??
    normalizeStr(env.CLOUDINARY?.cloudName) ??
    null;

  const apiKey =
    normalizeStr(map.get("cloudinary_api_key")) ??
    normalizeStr(env.CLOUDINARY_API_KEY) ??
    normalizeStr(env.CLOUDINARY?.apiKey) ??
    null;

  const apiSecret =
    normalizeStr(map.get("cloudinary_api_secret")) ??
    normalizeStr(env.CLOUDINARY_API_SECRET) ??
    normalizeStr(env.CLOUDINARY?.apiSecret) ??
    null;

  const folder =
    normalizeStr(map.get("cloudinary_folder")) ??
    normalizeStr(env.CLOUDINARY_FOLDER) ??
    normalizeStr(env.CLOUDINARY?.folder) ??
    null;

  const unsignedUploadPreset =
    normalizeStr(map.get("cloudinary_unsigned_preset")) ??
    normalizeStr(env.CLOUDINARY_UNSIGNED_PRESET) ??
    normalizeStr((env.CLOUDINARY as any)?.unsignedUploadPreset) ??
    normalizeStr((env.CLOUDINARY as any)?.uploadPreset) ??
    null;

  return {
    driver,
    localRoot,
    localBaseUrl,
    cloudName,
    apiKey,
    apiSecret,
    folder,
    unsignedUploadPreset,
    cdnPublicBase,
    publicApiBase,
  };
}

// ---------------------------------------------------------------------------
// GOOGLE OAUTH SETTINGS
// ---------------------------------------------------------------------------

export type GoogleSettings = {
  clientId: string | null;
  clientSecret: string | null;
};

/**
 * Google OAuth ayarları:
 *   1) Öncelik: site_settings tablosu (google_client_id / google_client_secret)
 *   2) Fallback: ENV (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)
 */
export async function getGoogleSettings(): Promise<GoogleSettings> {
  const map = await loadSettingsMap(GOOGLE_KEYS);

  const clientId =
    normalizeStr(map.get("google_client_id")) ??
    normalizeStr(env.GOOGLE_CLIENT_ID) ??
    null;

  const clientSecret =
    normalizeStr(map.get("google_client_secret")) ??
    normalizeStr(env.GOOGLE_CLIENT_SECRET) ??
    null;

  return {
    clientId,
    clientSecret,
  };
}

// ---------------------------------------------------------------------------
// APP LOCALES – site_settings.app_locales
// FE / BE ortak kullanabilecek
// ---------------------------------------------------------------------------

export async function getAppLocales(): Promise<string[]> {
  const map = await loadSettingsMap(APP_LOCALES_KEYS);

  const raw = map.get("app_locales");
  if (!raw) {
    // fallback: en azından tr + en
    return ["tr", "en"];
  }

  // JSON_ARRAY('tr','en') gibi bir değer bekliyoruz
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const list = parsed
        .map((v) => String(v).trim())
        .filter(Boolean);

      if (list.length) {
        return list;
      }
    }
  } catch {
    // value JSON değilse, virgülle ayrılmış string olabilir
    const list = raw
      .split(/[;,]+/)
      .map((v) => v.trim())
      .filter(Boolean);

    if (list.length) {
      return list;
    }
  }

  // Her durumda son fallback
  return ["tr", "en"];
}
