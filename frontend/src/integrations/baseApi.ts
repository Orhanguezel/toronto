// src/integrations/baseApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { tags } from "@/integrations/tags";

// Client locale helper (cookie > navigator > env)
function getClientLocale(): string {
  if (typeof document !== "undefined") {
    const m = document.cookie?.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
    if (m?.[1]) return decodeURIComponent(m[1]).split("-")[0];
  }
  if (typeof navigator !== "undefined" && navigator.language) {
    return navigator.language.split("-")[0];
  }
  return process.env.DEFAULT_LOCALE || "tr";
}

const baseUrl =
  (typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL
    : process.env.API_BASE_URL) ??
  process.env.NEXT_PUBLIC_API_URL ??
  "";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl.replace(/\/+$/, ""),
    // Cookie tabanlı auth (access_token / refresh_token) için:
    credentials: "include",
    prepareHeaders: (headers) => {
      headers.set("Accept", "application/json");
      const loc = getClientLocale();
      if (loc) {
        headers.set("Accept-Language", loc);
        headers.set("X-Locale", loc);
      }
      // Bearer taşımak istersen (opsiyonel): burada ekleyebilirsin.
      return headers;
    },
  }),
  tagTypes: tags, // "SiteSettings" | "Projects" | ... | "Auth" | "Users"
  endpoints: () => ({}),
});
