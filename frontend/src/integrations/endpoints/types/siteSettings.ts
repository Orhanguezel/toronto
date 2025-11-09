// src/integrations/endpoints/types/siteSettings.ts

// =================== TYPES (tek kaynak) ===================
export type ContactInfo = {
  phones?: string[];
  email?: string;
  address?: string;
  whatsappNumber?: string;
};

export type Socials = Partial<
  Record<"instagram" | "facebook" | "youtube" | "linkedin" | "x", string>
>;

export type BusinessHour = { days: string; open: string; close: string };
export type BusinessHours = BusinessHour[];

export type SiteSettings = {
  contact_info?: ContactInfo;
  socials?: Socials;
  businessHours?: BusinessHours;
};

// Row (admin list/detail için)
export type SiteSettingRow = {
  id?: string;
  key: string;
  value: unknown;
  locale?: string;
  created_at?: string;
  updated_at?: string;
};

// Bulk-upsert item
export type SiteSettingUpsertItem = {
  key: string;
  value: unknown;
};
