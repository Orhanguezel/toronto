// =============================================================
// FILE: src/integrations/rtk/constants.ts
// Next.js için API URL sabitleri
// =============================================================

function trimSlash(x: string) {
  return x.replace(/\/+$/, "");
}

/**
 * Önerilen .env.local:
 *
 *  NEXT_PUBLIC_API_URL=http://127.0.0.1:8081/api
 *
 * Production'da ise:
 *  NEXT_PUBLIC_API_URL=https://ensotek.com/api
 */
const rawBase =
  (process.env.NEXT_PUBLIC_API_URL as string | undefined) ||
  (process.env.NEXT_PUBLIC_ENSOTEK_API_URL as string | undefined) ||
  "";

// Eğer env yoksa backend'i reverse proxy ile /api altında bekliyoruz.
export const BASE_URL = rawBase ? trimSlash(rawBase) : "/api";

export const EDGE_URL = BASE_URL;
export const APP_URL = BASE_URL;
