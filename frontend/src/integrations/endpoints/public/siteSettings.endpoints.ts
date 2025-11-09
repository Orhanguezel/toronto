import { baseApi } from "@/integrations/baseApi";
import type {
  SiteSettings,
  SiteSettingRow,
} from "@/integrations/endpoints/types/siteSettings";

/**
 * Public tarafta iki uç var:
 *  - GET /site_settings?key_in=... [&locale=xx] → dizi (row) döner → objeye çeviriyoruz
 *  - GET /site_settings/:key [&locale=xx] → tek satır döner
 */

const KEY_IN = "contact_info,socials,businessHours";

function rowsToAggregate(rows: SiteSettingRow[]): SiteSettings {
  const out: Record<string, unknown> = {};
  for (const r of rows || []) out[r.key] = r.value;

  // güvenli defaultlar
  if (!("contact_info" in out)) out.contact_info = {};
  if (!("socials" in out)) out.socials = {};
  if (!("businessHours" in out)) out.businessHours = [];

  return out as SiteSettings;
}

export const siteSettingsPublicApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    // Aggregate okuma (tek çağrıda tüm temel anahtarlar)
    getSiteSettingsPublic: b.query<SiteSettings, { locale?: string } | void>({
      query: (arg) => ({
        url: "/site_settings",
        params: { key_in: KEY_IN, ...(arg?.locale ? { locale: arg.locale } : {}) },
      }),
      transformResponse: (rows: SiteSettingRow[]) => rowsToAggregate(rows),
      providesTags: (_r) => [{ type: "site_settings" as const }],
    }),

    // Tek key okuma (gerektiğinde)
    getSiteSettingByKeyPublic: b.query<SiteSettingRow, { key: string; locale?: string }>({
      query: ({ key, locale }) => ({
        url: `/site_settings/${encodeURIComponent(key)}`,
        params: locale ? { locale } : undefined,
      }),
      providesTags: (_r, _e, a) => [{ type: "site_settings" as const, id: a.key }],
    }),
  }),
});

export const {
  useGetSiteSettingsPublicQuery,
  useLazyGetSiteSettingsPublicQuery,
  useGetSiteSettingByKeyPublicQuery,
} = siteSettingsPublicApi as any;
