// =============================================================
// FILE: src/integrations/rtk/endpoints/admin/site_settings_admin.endpoints.ts
// Ensotek backend ile tam uyumlu RTK endpoints
// =============================================================

import { baseApi } from "@/integrations/rtk/baseApi";
import type {
  SiteSettingRow,
  SettingValue,
} from "@/integrations/types/site";

export type SiteSetting = SiteSettingRow;

// Listeleme parametreleri – backend'e göre uyumlu
export type ListParams = {
  q?: string;
  group?: string; // BE şu an kullanmıyor, ama FE'de varsa kırılmasın diye bıraktık
  keys?: string[];
  prefix?: string;
  limit?: number;
  offset?: number;
  sort?: "key" | "updated_at" | "created_at";
  order?: "asc" | "desc";
  locale?: string;
};

// POST için body – Ensotek BE: key + value
export type UpsertSettingBody = {
  key: string;
  value: SettingValue;
};

// Bulk upsert body
export type BulkUpsertBody = { items: UpsertSettingBody[] };

// ✅ Admin base path — Ensotek'te hyphen'li
// Tüm path'ler baseApi içinde /api prefix'i alacak → /api/admin/site-settings/...
const ADMIN_BASE = "/admin/site-settings";

// Ensotek'te rowToDto value'yu zaten parse ediyor, ekstra normalize yok
const norm = (s: SiteSettingRow): SiteSettingRow => s;

export const siteSettingsAdminApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    // GET /admin/site-settings/list
    listSiteSettingsAdmin: b.query<SiteSetting[], ListParams | void>({
      query: (params) => {
        if (!params) {
          return { url: `${ADMIN_BASE}/list` };
        }

        const { keys, sort, order, ...rest } = params;

        const keysParam =
          keys && keys.length ? keys.join(",") : undefined;

        const combinedOrder =
          sort && order
            ? `${sort}.${order}`
            : sort
              ? `${sort}.asc`
              : order
                ? `key.${order}`
                : undefined;

        return {
          url: `${ADMIN_BASE}/list`,
          params: {
            ...rest,
            keys: keysParam,
            order: combinedOrder,
          },
        };
      },
      transformResponse: (res: unknown): SiteSetting[] =>
        Array.isArray(res) ? (res as SiteSettingRow[]).map(norm) : [],
      providesTags: (result) =>
        result && result.length
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

    // GET /admin/site-settings/:key
    getSiteSettingAdminByKey: b.query<SiteSetting | null, string>({
      query: (key) => ({
        url: `${ADMIN_BASE}/${encodeURIComponent(key)}`,
      }),
      transformResponse: (res: unknown): SiteSetting | null =>
        res ? norm(res as SiteSettingRow) : null,
      providesTags: (_r, _e, key) => [{ type: "SiteSettings", id: key }],
    }),

    // POST /admin/site-settings  → yeni setting (tüm locale'lere kopya)
    createSiteSettingAdmin: b.mutation<SiteSetting, UpsertSettingBody>({
      query: (body) => ({
        url: ADMIN_BASE,
        method: "POST",
        body,
      }),
      transformResponse: (res: unknown): SiteSetting =>
        norm(res as SiteSettingRow),
      invalidatesTags: [{ type: "SiteSettings", id: "LIST" }],
    }),

    // PUT /admin/site-settings/:key  → sadece { value } bekliyor, { ok:true } döner
    updateSiteSettingAdmin: b.mutation<
      { ok: true },
      { key: string; value: SettingValue; locale?: string }
    >({
      query: ({ key, value, locale }) => ({
        url: `${ADMIN_BASE}/${encodeURIComponent(key)}`,
        method: "PUT",
        body: { value },
        params: locale ? { locale } : undefined,
      }),
      transformResponse: (): { ok: true } => ({ ok: true }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "SiteSettings", id: arg.key },
        { type: "SiteSettings", id: "LIST" },
      ],
    }),

    // DELETE /admin/site-settings/:key  → 204, body yok; biz FE'de {ok:true} kabul ediyoruz
    deleteSiteSettingAdmin: b.mutation<{ ok: true }, string>({
      query: (key) => ({
        url: `${ADMIN_BASE}/${encodeURIComponent(key)}`,
        method: "DELETE",
      }),
      transformResponse: (): { ok: true } => ({ ok: true }),
      invalidatesTags: (_r, _e, key) => [
        { type: "SiteSettings", id: key },
        { type: "SiteSettings", id: "LIST" },
      ],
    }),

    // POST /admin/site-settings/bulk-upsert
    bulkUpsertSiteSettingsAdmin: b.mutation<{ ok: true }, BulkUpsertBody>({
      query: (body) => ({
        url: `${ADMIN_BASE}/bulk-upsert`,
        method: "POST",
        body,
      }),
      transformResponse: (): { ok: true } => ({ ok: true }),
      invalidatesTags: [{ type: "SiteSettingsBulk", id: "LIST" }],
    }),
  }),
  overrideExisting: true,
});

export const {
  useListSiteSettingsAdminQuery,
  useGetSiteSettingAdminByKeyQuery,
  useCreateSiteSettingAdminMutation,
  useUpdateSiteSettingAdminMutation,
  useDeleteSiteSettingAdminMutation,
  useBulkUpsertSiteSettingsAdminMutation,
} = siteSettingsAdminApi;
