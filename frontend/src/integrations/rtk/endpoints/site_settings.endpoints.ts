// src/integrations/rtk/endpoints/site_settings.endpoints.ts

import { baseApi } from "../baseApi";

// Value can be string | number | boolean | object | array
export type JsonLike =
  | string
  | number
  | boolean
  | null
  | { [k: string]: JsonLike }
  | JsonLike[];

export type SiteSetting = {
  key: string;
  locale?: string;
  value: JsonLike;
  updated_at?: string;
};

export type ListSiteSettingsArgs = {
  prefix?: string;
  locale?: string;
  keys?: string[];
};

export type GetSiteSettingByKeyArgs = {
  key: string;
  locale?: string;
};

// BE may return value as JSON-string. Normalize to JsonLike.
const tryParse = <T = unknown>(x: unknown): T => {
  if (typeof x === "string") {
    const s = x.trim();
    if (
      (s.startsWith("{") && s.endsWith("}")) ||
      (s.startsWith("[") && s.endsWith("]"))
    ) {
      try {
        return JSON.parse(s) as T;
      } catch {
        /* ignore */
      }
    }
    if (s === "true") return true as unknown as T;
    if (s === "false") return false as unknown as T;
    if (!Number.isNaN(Number(s)) && s !== "")
      return Number(s) as unknown as T;
  }
  return x as T;
};

export const siteSettingsApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    // PUBLIC: liste (prefix/keys + locale ile)
    listSiteSettings: b.query<SiteSetting[], ListSiteSettingsArgs | void>({
      query: (arg) => {
        const params: Record<string, string> = {};

        if (arg?.prefix) params.prefix = arg.prefix;
        if (arg?.locale) params.locale = arg.locale;
        if (arg?.keys && arg.keys.length) {
          // BE tarafı key_in bekliyor (comma-separated)
          params.key_in = arg.keys.join(",");
        }

        return {
          url: "/site_settings",
          params: Object.keys(params).length ? params : undefined,
        };
      },
      transformResponse: (res: unknown): SiteSetting[] => {
        const arr = Array.isArray(res)
          ? (res as Array<{
              key: string;
              locale?: string;
              value: unknown;
              updated_at?: string;
            }>)
          : [];
        return arr.map((r) => ({
          key: r.key,
          locale: r.locale,
          value: tryParse<JsonLike>(r.value),
          updated_at: r.updated_at,
        }));
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((s) => ({
                type: "SiteSettings" as const,
                id: s.key,
              })),
              { type: "SiteSettings" as const, id: "LIST" },
            ]
          : [{ type: "SiteSettings" as const, id: "LIST" }],
      keepUnusedDataFor: 60,
    }),

    // PUBLIC: tek key (locale-aware)
    getSiteSettingByKey: b.query<
      SiteSetting | null,
      GetSiteSettingByKeyArgs
    >({
      query: ({ key, locale }) => ({
        url: `/site_settings/${encodeURIComponent(key)}`,
        params: locale ? { locale } : undefined,
      }),
      transformResponse: (res: unknown): SiteSetting | null => {
        if (!res || typeof res !== "object") return null;
        const r = res as {
          key?: string;
          locale?: string;
          value?: unknown;
          updated_at?: string;
        };
        if (!r.key) return null;
        return {
          key: r.key,
          locale: r.locale,
          value: tryParse<JsonLike>(r.value),
          updated_at: r.updated_at,
        };
      },
      providesTags: (_r, _e, arg) => [
        { type: "SiteSettings", id: arg.key },
      ],
    }),

    // NOT: Bu public PUT/POST uçları şu an BE router.ts'de yok olabilir;
    // projede kullanmıyorsan silinebilir. Şimdilik bırakıyorum.

    upsertSiteSetting: b.mutation<
      SiteSetting,
      { key: string; value: JsonLike }
    >({
      query: (body) => ({
        url: "/site_settings",
        method: "PUT",
        body,
      }),
      transformResponse: (res: unknown): SiteSetting => {
        const r = res as {
          key: string;
          locale?: string;
          value: unknown;
          updated_at?: string;
        };
        return {
          key: r.key,
          locale: r.locale,
          value: tryParse<JsonLike>(r.value),
          updated_at: r.updated_at,
        };
      },
      invalidatesTags: (_r, _e, arg) => [
        { type: "SiteSettings", id: arg.key },
        { type: "SiteSettings", id: "LIST" },
      ],
    }),

    upsertManySiteSettings: b.mutation<
      SiteSetting[],
      Array<{ key: string; value: JsonLike }>
    >({
      query: (body) => ({
        url: "/site_settings/bulk",
        method: "PUT",
        body: { items: body },
      }),
      transformResponse: (res: unknown): SiteSetting[] => {
        const arr = Array.isArray(res)
          ? (res as Array<{
              key: string;
              locale?: string;
              value: unknown;
              updated_at?: string;
            }>)
          : [];
        return arr.map((r) => ({
          key: r.key,
          locale: r.locale,
          value: tryParse<JsonLike>(r.value),
          updated_at: r.updated_at,
        }));
      },
      invalidatesTags: (_r, _e, items) => [
        ...items.map((i) => ({
          type: "SiteSettings" as const,
          id: i.key,
        })),
        { type: "SiteSettings" as const, id: "LIST" },
      ],
    }),

    deleteSiteSetting: b.mutation<{ ok: true }, string>({
      query: (key) => ({
        url: `/site_settings/${encodeURIComponent(key)}`,
        method: "DELETE",
      }),
      transformResponse: (): { ok: true } => ({ ok: true }),
      invalidatesTags: (_r, _e, key) => [
        { type: "SiteSettings", id: key },
        { type: "SiteSettings", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useListSiteSettingsQuery,
  useGetSiteSettingByKeyQuery,
  useUpsertSiteSettingMutation,
  useUpsertManySiteSettingsMutation,
  useDeleteSiteSettingMutation,
} = siteSettingsApi;
