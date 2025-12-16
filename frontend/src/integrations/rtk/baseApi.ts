// =============================================================
// FILE: src/integrations/rtk/baseApi.ts
// Ensotek Next.js + Fastify backend (8086 /api) için RTK base
// =============================================================

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from "@reduxjs/toolkit/query";
import { metahubTags } from "./tags";
import { tokenStore } from "@/integrations/core/token";
import { BASE_URL as CONFIG_BASE_URL } from "@/integrations/rtk/constants";

/** ---------- Base URL resolve ---------- */
function trimSlash(x: string) {
  return x.replace(/\/+$/, "");
}

/**
 * Env yoksa dev ortamda otomatik tahmin:
 *  - Next dev: http://localhost:3000
 *  - Backend:  http://localhost:8081/api
 */
function guessDevBackend(): string {
  try {
    if (typeof window !== "undefined") {
      const loc = window.location;
      const host = loc.hostname || "localhost";
      const proto = loc.protocol || "http:";
      // Fastify 8086 + /api prefix
      return `${proto}//${host}:8086/api`;
    }
  } catch {
    /* noop */
  }
  return "http://localhost:8081/api";
}

const BASE_URL = trimSlash(
  CONFIG_BASE_URL ||
  (process.env.NODE_ENV !== "production" ? guessDevBackend() : "/api"),
);

/** ---------- helpers & guards ---------- */
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
type AnyArgs = string | FetchArgs;

function isJsonLikeBody(b: unknown): b is Record<string, unknown> {
  if (typeof FormData !== "undefined" && b instanceof FormData) return false;
  if (typeof Blob !== "undefined" && b instanceof Blob) return false;
  if (typeof ArrayBuffer !== "undefined" && b instanceof ArrayBuffer) return false;
  return isRecord(b);
}

/** İstekleri BE uyumluluğuna göre hafifçe ayarla (legacy) */
function compatAdjustArgs(args: AnyArgs): AnyArgs {
  if (typeof args === "string") return args;
  const a: FetchArgs = { ...args };

  const urlNoSlash = (a.url ?? "").replace(/\/+$/, "");
  const isGet = !a.method || a.method.toUpperCase() === "GET";

  // Supa benzeri GET /profiles?id=..&limit=1 → /profiles/:id
  if (urlNoSlash === "/profiles" && isGet) {
    const params = isRecord(a.params) ? (a.params as Record<string, unknown>) : undefined;
    const id = typeof params?.id === "string" ? params.id : null;
    const limitIsOne = params ? String(params.limit) === "1" : false;
    if (id && limitIsOne) {
      a.url = `/profiles/${encodeURIComponent(id)}`;
      if (params) {
        const { ...rest } = params;
        a.params = Object.keys(rest).length ? rest : undefined;
      }
    }
  }

  // admin/users mini-batch: ids[] → "a,b,c"
  if (urlNoSlash === "/admin/users" && isGet && isRecord(a.params)) {
    const p = { ...(a.params as Record<string, unknown>) };
    if (Array.isArray(p.ids)) {
      p.ids = (p.ids as unknown[]).map(String).join(",");
    }
    a.params = p;
  }

  return a;
}

/** ---------- Base Query ---------- */
type RBQ = BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, unknown, FetchBaseQueryMeta>;

const DEFAULT_LOCALE =
  (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as string | undefined) || "tr";

const rawBaseQuery: RBQ = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",
  prepareHeaders: (headers) => {
    // `x-skip-auth` ile refresh işleminde auth'u bypass et
    if (headers.get("x-skip-auth") === "1") {
      headers.delete("x-skip-auth");
      if (!headers.has("Accept")) headers.set("Accept", "application/json");
      if (!headers.has("Accept-Language")) {
        headers.set("Accept-Language", DEFAULT_LOCALE || "tr");
      }
      return headers;
    }

    const token = tokenStore.get();
    if (token && !headers.has("authorization")) {
      headers.set("authorization", `Bearer ${token}`);
    }
    if (!headers.has("Accept")) headers.set("Accept", "application/json");
    if (!headers.has("Accept-Language")) {
      headers.set("Accept-Language", DEFAULT_LOCALE || "tr");
    }
    return headers;
  },
  responseHandler: async (response) => {
    const ct = response.headers.get("content-type") || "";
    if (ct.includes("application/json")) return response.json();
    if (ct.includes("text/")) return response.text();
    try {
      const t = await response.text();
      return t || null;
    } catch {
      return null;
    }
  },
  validateStatus: (res) => res.ok,
}) as RBQ;

/** ---------- 401 → refresh → retry ---------- */
type RawResult = Awaited<ReturnType<typeof rawBaseQuery>>;

// Bu endpoint'lerde 401 alırsak refresh denemesi yapma
const AUTH_SKIP_REAUTH = new Set<string>([
  "/auth/token",
  "/auth/signup",
  "/auth/google",
  "/auth/google/start",
  "/auth/token/refresh",
  "/auth/logout",
]);

function extractPath(u: string): string {
  try {
    if (/^https?:\/\//i.test(u)) return new URL(u).pathname.replace(/\/+$/, "");
    return u.replace(/^https?:\/\/[^/]+/i, "").replace(/\/+$/, "");
  } catch {
    return u.replace(/\/+$/, "");
  }
}

const baseQueryWithReauth: RBQ = async (args, api, extra) => {
  let req: AnyArgs = compatAdjustArgs(args);
  const path = typeof req === "string" ? req : req.url || "";
  const cleanPath = extractPath(path);

  const ensureJson = (fa: FetchArgs) => {
    if (isJsonLikeBody(fa.body)) {
      fa.headers = { ...(fa.headers || {}), "Content-Type": "application/json" };
    }
    return fa;
  };

  if (typeof req !== "string") {
    if (AUTH_SKIP_REAUTH.has(cleanPath)) {
      req.headers = { ...(req.headers || {}), "x-skip-auth": "1" };
    }
    req = ensureJson(req);
  }

  let result: RawResult = await rawBaseQuery(req, api, extra);

  if (result.error?.status === 401 && !AUTH_SKIP_REAUTH.has(cleanPath)) {
    // Refresh dene
    const refreshRes = await rawBaseQuery(
      {
        url: "/auth/token/refresh",
        method: "POST",
        headers: { "x-skip-auth": "1", Accept: "application/json" },
      },
      api,
      extra,
    );

    if (!refreshRes.error) {
      const access_token = (refreshRes.data as { access_token?: string } | undefined)?.access_token;
      if (access_token) tokenStore.set(access_token);

      let retry: AnyArgs = compatAdjustArgs(args);
      if (typeof retry !== "string") {
        if (AUTH_SKIP_REAUTH.has(cleanPath)) {
          retry.headers = { ...(retry.headers || {}), "x-skip-auth": "1" };
        }
        retry = ensureJson(retry);
      }
      result = await rawBaseQuery(retry, api, extra);
    } else {
      tokenStore.set(null);
    }
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: "metahubApi", // İstersen "ensotekApi" yapabiliriz
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
  tagTypes: metahubTags,
});

export { rawBaseQuery };
