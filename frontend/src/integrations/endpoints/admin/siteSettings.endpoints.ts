import { baseApi } from "@/integrations/baseApi";
import type {
  SiteSettings,
  SiteSettingRow,
  SiteSettingUpsertItem,
} from "@/integrations/endpoints/types/siteSettings";

/**
 * Admin uçları (backend: /admin/site-settings ...):
 *
 *  Aggregate (FE’nin ana kullandığı):
 *   - GET  /admin/site-settings        [&locale=xx]      → SiteSettings
 *   - PUT  /admin/site-settings        [&locale=xx] body → { ok: true } | SiteSettings
 *
 *  Granular (liste/tekil/bulk/delete):
 *   - GET    /admin/site-settings/list                      → SiteSettingRow[]
 *   - GET    /admin/site-settings/:key   [&locale=xx]       → SiteSettingRow
 *   - POST   /admin/site-settings        [&locale=xx] body: { key, value } → created/updated row
 *   - PUT    /admin/site-settings/:key   [&locale=xx] body: { value }      → upsert row
 *   - POST   /admin/site-settings/bulk-upsert [&locale=xx] body: { items: [{key,value}...] }
 *   - DELETE /admin/site-settings        [&locale=xx&key_in=a,b&prefix=p]  → 204
 *   - DELETE /admin/site-settings/:key   [&locale=xx]                      → 204
 */

type ListQuery = {
  q?: string;
  keys?: string;      // "a,b,c"
  prefix?: string;    // LIKE prefix%
  order?: string;     // "updated_at.desc" | "key.asc"
  limit?: number;
  offset?: number;
  locale?: string;    // filtrelemek istersen
};

export const siteSettingsAdminApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    // -------- Aggregate --------
    getAdminSettingsAggregate: b.query<SiteSettings, { locale?: string } | void>({
      query: (arg) => ({
        url: "/admin/site-settings",
        params: arg?.locale ? { locale: arg.locale } : undefined,
      }),
      providesTags: (_r) => [{ type: "site_settings" as const }],
    }),

    upsertAdminSettingsAggregate: b.mutation<{ ok: true } | SiteSettings, { body: SiteSettings; locale?: string }>({
      query: ({ body, locale }) => ({
        url: "/admin/site-settings",
        method: "PUT",
        body,
        params: locale ? { locale } : undefined,
      }),
      invalidatesTags: [{ type: "site_settings" as const }],
    }),

    // -------- Granular --------
    listAdminSiteSettings: b.query<SiteSettingRow[], ListQuery | void>({
  query: (q) => {
    const params: Record<string, any> | undefined = q ? { ...q } : undefined;
    return {
      url: "/admin/site-settings/list",
      params, // ✅ artık void değil, undefined veya object
    };
  },
  providesTags: (_r) => [{ type: "site_settings" as const }],
}),

    getAdminSiteSettingByKey: b.query<SiteSettingRow, { key: string; locale?: string }>({
      query: ({ key, locale }) => ({
        url: `/admin/site-settings/${encodeURIComponent(key)}`,
        params: locale ? { locale } : undefined,
      }),
      providesTags: (_r, _e, a) => [{ type: "site_settings" as const, id: a.key }],
    }),

    createAdminSiteSetting: b.mutation<SiteSettingRow, { key: string; value: unknown; locale?: string }>({
      query: ({ key, value, locale }) => ({
        url: "/admin/site-settings",
        method: "POST",
        body: { key, value },
        params: locale ? { locale } : undefined,
      }),
      invalidatesTags: [{ type: "site_settings" as const }],
    }),

    updateAdminSiteSettingByKey: b.mutation<SiteSettingRow, { key: string; value: unknown; locale?: string }>({
      query: ({ key, value, locale }) => ({
        url: `/admin/site-settings/${encodeURIComponent(key)}`,
        method: "PUT",
        body: { value },
        params: locale ? { locale } : undefined,
      }),
      invalidatesTags: (_r, _e, a) => [
        { type: "site_settings" as const },
        { type: "site_settings" as const, id: a.key },
      ],
    }),

    bulkUpsertAdminSiteSettings: b.mutation<SiteSettingRow[], { items: SiteSettingUpsertItem[]; locale?: string }>({
      query: ({ items, locale }) => ({
        url: "/admin/site-settings/bulk-upsert",
        method: "POST",
        body: { items },
        params: locale ? { locale } : undefined,
      }),
      invalidatesTags: [{ type: "site_settings" as const }],
    }),

    deleteManyAdminSiteSettings: b.mutation<{ ok: true } | void, { key_in?: string; prefix?: string; locale?: string; key?: string; ["key!"]?: string; id?: string; ["id!"]?: string }>({
      query: (params) => ({
        url: "/admin/site-settings",
        method: "DELETE",
        params,
      }),
      invalidatesTags: [{ type: "site_settings" as const }],
    }),

    deleteAdminSiteSettingByKey: b.mutation<void, { key: string; locale?: string }>({
      query: ({ key, locale }) => ({
        url: `/admin/site-settings/${encodeURIComponent(key)}`,
        method: "DELETE",
        params: locale ? { locale } : undefined,
      }),
      invalidatesTags: (_r, _e, a) => [
        { type: "site_settings" as const },
        { type: "site_settings" as const, id: a.key },
      ],
    }),
  }),
});

export const {
  // Aggregate
  useGetAdminSettingsAggregateQuery,
  useLazyGetAdminSettingsAggregateQuery,
  useUpsertAdminSettingsAggregateMutation,

  // Granular
  useListAdminSiteSettingsQuery,
  useLazyListAdminSiteSettingsQuery,
  useGetAdminSiteSettingByKeyQuery,
  useLazyGetAdminSiteSettingByKeyQuery,
  useCreateAdminSiteSettingMutation,
  useUpdateAdminSiteSettingByKeyMutation,
  useBulkUpsertAdminSiteSettingsMutation,
  useDeleteManyAdminSiteSettingsMutation,
  useDeleteAdminSiteSettingByKeyMutation,
} = siteSettingsAdminApi as any;
