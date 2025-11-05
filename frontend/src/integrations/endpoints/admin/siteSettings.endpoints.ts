import { baseApi } from "@/integrations/baseApi";

type ContactInfo = { phones?: string[]; email?: string; address?: string; whatsappNumber?: string };
type Socials = Partial<Record<"instagram" | "facebook" | "youtube" | "linkedin" | "x", string>>;
type BusinessHours = { days: string; open: string; close: string }[];

export type SiteSettings = {
  contact_info?: ContactInfo;
  socials?: Socials;
  businessHours?: BusinessHours;
};

export const siteSettingsAdminApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    get: b.query<SiteSettings, void>({
      query: () => ({ url: "/admin/site-settings" }),
    }),
    update: b.mutation<{ ok: true }, SiteSettings>({
      query: (body) => ({ url: "/admin/site-settings", method: "PUT", body }),
    }),
  }),
});

export const {
  useGetQuery: useAdminSettings,
  useUpdateMutation: useUpdateAdminSettings,
} = siteSettingsAdminApi as any;
