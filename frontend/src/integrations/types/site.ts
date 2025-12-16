// =============================================================
// FILE: src/integrations/types/site.ts
// Ensotek uyumlu tipler
// =============================================================

export type ValueType = "string" | "number" | "boolean" | "json";

// Backend'den gelen value tipi (JSON parse edilmiş)
export type SettingValue =
  | string
  | number
  | boolean
  | Record<string, unknown>
  | Array<unknown>
  | null;

// 🔹 Ensotek: site_settings tablosu için kanonik satır tipi
export type SiteSettingRow = {
  id?: string;
  key: string;
  locale?: string; // controller bazı uçlarda locale dönüyor
  value: SettingValue;
  created_at?: string;
  updated_at?: string;
};

// Diğer tablolar (topbar, email templates vs) aynı kalsın
export type TopbarSettingRow = {
  id: string;
  is_active: boolean | 0 | 1;
  message: string;
  coupon_code?: string | null;
  link_url?: string | null;
  link_text?: string | null;
  show_ticker?: boolean | 0 | 1;
  created_at?: string;
  updated_at?: string;
};

export type EmailTemplateRow = {
  id: string;
  template_key: string;
  template_name: string;
  subject: string;
  content: string; // HTML
  variables: string[];
  is_active: boolean | 0 | 1;
  created_at?: string;
  updated_at?: string;
};

// =============================================================
// NOTE: Aşağıdaki SiteSettings tipi ürün/payments odaklı eski projeden.
// Ensotek backend'in current aggregate'ı (contact_info, socials, businessHours)
// ile birebir bağlı değil; ama diğer modüller kullanıyorsa dursun.
// İstersen bunu da Ensotek'e özel yeniden tasarlarız.
// =============================================================
export type SiteSettings = {
  site_title: string;
  site_description: string;
  seo_products_title?: string;
  seo_products_description?: string;
  seo_categories_title?: string;
  seo_categories_description?: string;
  seo_blog_title?: string;
  seo_blog_description?: string;
  seo_contact_title?: string;
  seo_contact_description?: string;

  min_balance_limit: number;
  whatsapp_number: string;
  guest_order_enabled: boolean;
  maintenance_mode: boolean;
  maintenance_message: string;
  theme_mode: "user_choice" | "dark_only" | "light_only";
  light_logo: string;
  dark_logo: string;
  favicon_url: string;
  custom_header_code: string;
  custom_footer_code: string;

  smtp_host: string;
  smtp_port: number;
  smtp_ssl: boolean;
  smtp_username: string;
  smtp_password: string;
  smtp_from_email: string;
  smtp_from_name: string;

  contact_email?: string;

  paytr_enabled: boolean;
  paytr_merchant_id: string;
  paytr_merchant_key: string;
  paytr_merchant_salt: string;
  paytr_test_mode: boolean;
  paytr_commission: number;
  paytr_havale_enabled: boolean;
  paytr_havale_commission: number;

  shopier_enabled: boolean;
  shopier_client_id: string;
  shopier_client_secret: string;
  shopier_commission: number;

  papara_enabled: boolean;
  papara_api_key: string;

  bank_transfer_enabled: boolean;
  bank_account_info: string;

  google_analytics_id: string;
  facebook_pixel_id: string;

  telegram_bot_token: string;
  telegram_chat_id: string;
  new_order_telegram: boolean;
  new_ticket_telegram: boolean;
  deposit_approved_telegram: boolean;
  new_payment_request_telegram: boolean;
  new_deposit_request_telegram?: boolean;
  telegram_template_new_order?: string;
  telegram_template_new_payment_request?: string;
  telegram_template_new_ticket?: string;
  telegram_template_deposit_approved?: string;
  telegram_template_new_deposit_request?: string;
  discord_webhook_url: string;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  linkedin_url: string;

  google_client_id: string;
  google_client_secret: string;

  cloudinary_cloud_name: string;
  cloudinary_api_key: string;
  cloudinary_api_secret: string;
  cloudinary_folder: string;
  cloudinary_unsigned_preset: string;

  default_currency: string;
  available_currencies: string[];
  currency_rates: { TRY: number; USD: number; EUR: number };
  auto_update_rates: boolean;

  payment_methods?: {
    wallet_enabled?: boolean;
    havale_enabled?: boolean;
    havale_iban?: string;
    havale_account_holder?: string;
    havale_bank_name?: string;
    eft_enabled?: boolean;
    eft_iban?: string;
    eft_account_holder?: string;
    eft_bank_name?: string;
  };

  footer_company_name?: string;
  footer_description?: string;
  footer_copyright?: string;
  footer_email?: string;
  footer_phone?: string;
  footer_address?: string;
};
