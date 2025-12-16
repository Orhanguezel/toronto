// src/i18n/ui.ts

import { useMemo } from "react";
import { useListSiteSettingsQuery } from "@/integrations/rtk/endpoints/site_settings.endpoints";
import type { SupportedLocale, TranslatedLabel } from "@/types/common";

/**
 * Tüm UI yazıları için tek noktadan EN fallback.
 * Yeni bir sayfanın anahtarlarını buna ALT ALTA ekleyin.
 */
export const UI_FALLBACK_EN = {
  // ===== CONTACT =====
  ui_contact_subprefix: "Get",
  ui_contact_sublabel: "in touch",
  ui_contact_title_left: "Let's Talk",
  ui_contact_tagline:
    "We've been growing businesses since 2009, let us do it for you!",
  ui_contact_quick_email_placeholder: "Enter Mail",
  ui_contact_form_title: "Schedule a Consultation",
  ui_contact_first_name: "First Name*",
  ui_contact_last_name: "Last Name",
  ui_contact_company: "Company Name",
  ui_contact_website: "Website",
  ui_contact_phone: "Phone Number",
  ui_contact_email: "Email*",
  ui_contact_select_label: "Select the services",
  ui_contact_service_cooling_towers: "Cooling Towers",
  ui_contact_service_maintenance: "Maintenance",
  ui_contact_service_modernization: "Modernization",
  ui_contact_service_other: "Other",
  ui_contact_terms_prefix: "Accept Our",
  ui_contact_terms: "Terms",
  ui_contact_conditions: "Conditions",
  ui_contact_submit: "Submit Query",
  ui_contact_sending: "Sending...",
  ui_contact_success: "Thanks! Your message has been sent.",
  ui_contact_error_generic: "Failed to send. Please try again.",

  // ===== ABOUT =====
  ui_about_subprefix: "About",
  ui_about_sublabel: "us",
  ui_about_view_all: "View All",
  ui_about_fallback_title: "About Us",

  // ===== ABOUT STATS =====
  ui_about_stats_refs_title: "Industrial references",
  ui_about_stats_projects_title: "Completed projects",
  ui_about_stats_years_title: "Years of experience",

  // ===== SERVICES =====
  ui_services_subprefix: "What",
  ui_services_sublabel: "we do",
  ui_services_title: "Our Services",
  ui_services_placeholder_title: "Service",
  ui_services_placeholder_summary:
    "Our SEO Services will get you a high-ranking placement in search results.",
  ui_services_details_aria: "details",

  // === HERO ===
  ui_hero_kicker_prefix: "Welcome to",
  ui_hero_kicker_brand: "Ensotek Cooling Towers",
  ui_hero_title_fallback: "Pioneering cooling tower engineering.",
  ui_hero_desc_fallback:
    "We design, build, modernize and maintain cooling towers with 40+ years of know-how.",
  ui_hero_cta: "Get a Quote",
  ui_hero_prev: "Previous slide",
  ui_hero_next: "Next slide",

  // === BANNER / BREADCRUMB ===
  ui_breadcrumb_home: "Home",

  // === FEEDBACK ===
  ui_feedback_subprefix: "customer",
  ui_feedback_sublabel: "feedback",
  ui_feedback_title: "Our customers feedback about us",
  ui_feedback_paragraph:
    "Real stories from real customers. Testimonials are fetched from our backend and rotate automatically.",
  ui_feedback_prev: "Previous testimonial",
  ui_feedback_next: "Next testimonial",
  ui_feedback_role_customer: "Customer",

  // REFERENCES
  ui_references_subprefix: "Featured",
  ui_references_sublabel: "References",
  ui_references_title: "Companies we work with",
  ui_references_view_all: "View All",

  // NEWS
  ui_news_subprefix: "News",
  ui_news_sublabel: "Posts",
  ui_news_title_prefix: "Latest",
  ui_news_title_mark: "News",
  ui_news_read_more: "Read more",
  ui_news_read_more_aria: "read more",
  ui_news_view_all: "View All News",
  ui_news_untitled: "Untitled",
  ui_news_sample_one: "Sample news one",
  ui_news_sample_two: "Sample news two",

  // ===== FOOTER =====
  ui_footer_company: "COMPANY",
  ui_footer_about: "About",
  ui_footer_blog: "Blog",
  ui_footer_resources: "Resources",
  ui_footer_free_tools: "Free SEO Tools",
  ui_footer_contact_us: "Contact Us",

  ui_footer_services: "Services",
  ui_footer_service_seo: "Search Engine Optimization",
  ui_footer_service_ppc: "PPC Management Services",
  ui_footer_service_smm: "Social Media Management",
  ui_footer_service_link_building: "Link Building Services",
  ui_footer_service_cro: "Conversion Optimization",

  ui_footer_explore: "Explore",
  ui_footer_account: "Account",
  ui_footer_privacy: "Privacy Policy",
  ui_footer_affiliate: "Affiliate Program",
  ui_footer_product_design: "Product Design",
  ui_footer_web_design: "Web Design Services",

  ui_footer_contact: "Contact",
  ui_footer_phone_aria: "Phone",
  ui_footer_email_aria: "Email",

  ui_footer_copyright_prefix: "Copyright",
  ui_footer_copyright_suffix: "All Rights Reserved.",

  // ===== HEADER =====
  ui_header_nav_home: "Home",
  ui_header_nav_about: "About",
  ui_header_nav_services: "Services",
  ui_header_nav_product: "Product",
  ui_header_nav_sparepart: "Spare Part",
  ui_header_nav_references: "References",
  ui_header_nav_library: "Library",
  ui_header_nav_news: "News",
  ui_header_nav_contact: "Contact",
  ui_header_cta: "Let's Talk",
  ui_header_open_menu: "Open Menu",
  ui_header_open_sidebar: "Open Sidebar",

  // NEW (Offcanvas & header yardımcı metinleri)
  ui_header_close: "Close",
  ui_header_language: "Language",
  ui_header_auth: "Login",
  ui_header_register: "Register",
  ui_header_search_placeholder: "What are you searching for?",
  ui_header_search: "Search",
  ui_header_contact_info: "Contact Info",
  ui_header_call: "Call",
  ui_header_email: "Email",

  // ===== LIBRARY =====
  ui_library_subprefix: "featured",
  ui_library_sublabel: "library",
  ui_library_title_prefix: "Explore our",
  ui_library_title_mark: "Library",
  ui_library_view_detail: "View detail",
  ui_library_view_detail_aria: "view detail",
  ui_library_view_all: "View All",
  ui_library_untitled: "Untitled",
  ui_library_sample_one: "Sample library one",
  ui_library_sample_two: "Sample library two",

  // ===== NEWSLETTER =====
  ui_newsletter_title: "Join Our Newsletter",
  ui_newsletter_desc:
    "Get product updates and articles once or twice a month. No spam.",
  ui_newsletter_cta: "Subscribe",
  ui_newsletter_ok: "Thanks! Please check your inbox.",
  ui_newsletter_fail: "Something went wrong. Please try again.",
  ui_newsletter_placeholder: "Your email address",
  ui_newsletter_section_aria: "newsletter section",
  ui_newsletter_email_aria: "email",

  // ===== AUTH =====
  ui_auth_title: "Sign In",
  ui_auth_lead: "Sign in to your account or create a new one.",
  ui_auth_register_link: "Create an account",
  ui_auth_email_label: "Email",
  ui_auth_email_placeholder: "example@ensotek.com",
  ui_auth_password_label: "Password",
  ui_auth_password_placeholder: "Your password",
  ui_auth_remember_me: "Remember me",
  ui_auth_submit: "Sign In",
  ui_auth_loading: "Signing in...",
  ui_auth_or: "or",
  ui_auth_google_button: "Continue with Google",
  ui_auth_google_loading: "Redirecting to Google...",
  ui_auth_error_required: "Email and password are required.",
  ui_auth_error_google_generic: "An error occurred while starting Google auth.",

  // ===== PRODUCTS =====
  ui_products_kicker_prefix: "Ensotek",
  ui_products_kicker_label: "Our Products",
  ui_products_title_prefix: "Cooling",
  ui_products_title_mark: "Towers",
  ui_products_read_more: "View details",
  ui_products_read_more_aria: "view product details",
  ui_products_price_label: "Starting from",
  ui_products_view_all: "All products",
  ui_products_empty: "There are no products to display at the moment.",

  // ===== SPARE PARTS =====
  ui_spareparts_kicker_prefix: "Ensotek",
  ui_spareparts_kicker_label: "Spare Parts",
  ui_spareparts_title_prefix: "Cooling",
  ui_spareparts_title_mark: "Tower Spare Parts",
  ui_spareparts_read_more: "View details",
  ui_spareparts_read_more_aria: "view spare part details",
  ui_spareparts_price_label: "Starting from",
  ui_spareparts_view_all: "All spare parts",
  ui_spareparts_empty: "There are no spare parts to display at the moment.",

  // ===== FAQS =====
  ui_faqs_page_title: "FAQs",

  // ===== TEAM =====
  ui_team_page_title: "Our Team",

  // ===== OFFER =====
  ui_offer_page_title: "Offer",

  // ===== CATALOG =====
  ui_catalog_page_title: "Catalog",

  // ===== PORTFOLIO =====
  ui_portfolio_title: "Portfolio",
  ui_portfolio_lead: "Selected work and case studies.",
  ui_portfolio_aria: "Portfolio",
  ui_portfolio_loading: "Loading…",

} as const;

export type UIKey = keyof typeof UI_FALLBACK_EN;

/** Sayfa bazlı key grupları */
export const UI_KEYS = {
  contact: [
    "ui_contact_subprefix",
    "ui_contact_sublabel",
    "ui_contact_title_left",
    "ui_contact_tagline",
    "ui_contact_quick_email_placeholder",
    "ui_contact_form_title",
    "ui_contact_first_name",
    "ui_contact_last_name",
    "ui_contact_company",
    "ui_contact_website",
    "ui_contact_phone",
    "ui_contact_email",
    "ui_contact_select_label",
    "ui_contact_service_cooling_towers",
    "ui_contact_service_maintenance",
    "ui_contact_service_modernization",
    "ui_contact_service_other",
    "ui_contact_terms_prefix",
    "ui_contact_terms",
    "ui_contact_conditions",
    "ui_contact_submit",
    "ui_contact_sending",
    "ui_contact_success",
    "ui_contact_error_generic",
  ] as const,

  about: [
    "ui_about_subprefix",
    "ui_about_sublabel",
    "ui_about_view_all",
    "ui_about_fallback_title",
  ] as const,

  services: [
    "ui_services_subprefix",
    "ui_services_sublabel",
    "ui_services_title",
    "ui_services_placeholder_title",
    "ui_services_placeholder_summary",
    "ui_services_details_aria",
  ] as const,

  hero: [
    "ui_hero_kicker_prefix",
    "ui_hero_kicker_brand",
    "ui_hero_title_fallback",
    "ui_hero_desc_fallback",
    "ui_hero_cta",
    "ui_hero_prev",
    "ui_hero_next",
  ] as const,

  banner: ["ui_breadcrumb_home"] as const,

  feedback: [
    "ui_feedback_subprefix",
    "ui_feedback_sublabel",
    "ui_feedback_title",
    "ui_feedback_paragraph",
    "ui_feedback_prev",
    "ui_feedback_next",
    "ui_feedback_role_customer",
  ] as const,

  references: [
    "ui_references_subprefix",
    "ui_references_sublabel",
    "ui_references_title",
    "ui_references_view_all",
  ] as const,

  news: [
    "ui_news_subprefix",
    "ui_news_sublabel",
    "ui_news_title_prefix",
    "ui_news_title_mark",
    "ui_news_read_more",
    "ui_news_read_more_aria",
    "ui_news_view_all",
    "ui_news_untitled",
    "ui_news_sample_one",
    "ui_news_sample_two",
  ] as const,

  footer: [
    "ui_footer_company",
    "ui_footer_about",
    "ui_footer_blog",
    "ui_footer_resources",
    "ui_footer_free_tools",
    "ui_footer_contact_us",

    "ui_footer_services",
    "ui_footer_service_seo",
    "ui_footer_service_ppc",
    "ui_footer_service_smm",
    "ui_footer_service_link_building",
    "ui_footer_service_cro",

    "ui_footer_explore",
    "ui_footer_account",
    "ui_footer_privacy",
    "ui_footer_affiliate",
    "ui_footer_product_design",
    "ui_footer_web_design",

    "ui_footer_contact",
    "ui_footer_phone_aria",
    "ui_footer_email_aria",

    "ui_footer_copyright_prefix",
    "ui_footer_copyright_suffix",
  ] as const,

  header: [
    "ui_header_nav_home",
    "ui_header_nav_about",
    "ui_header_nav_services",
    "ui_header_nav_product",
    "ui_header_nav_sparepart",
    "ui_header_nav_references",
    "ui_header_nav_library",
    "ui_header_nav_news",
    "ui_header_nav_contact",
    "ui_header_cta",
    "ui_header_open_menu",
    "ui_header_open_sidebar",
    "ui_header_close",
    "ui_header_language",
    "ui_header_auth",
    "ui_header_register",
    "ui_header_search_placeholder",
    "ui_header_search",
    "ui_header_contact_info",
    "ui_header_call",
    "ui_header_email",
  ] as const,

  library: [
    "ui_library_subprefix",
    "ui_library_sublabel",
    "ui_library_title_prefix",
    "ui_library_title_mark",
    "ui_library_view_detail",
    "ui_library_view_detail_aria",
    "ui_library_view_all",
    "ui_library_untitled",
    "ui_library_sample_one",
    "ui_library_sample_two",
  ] as const,

  newsletter: [
    "ui_newsletter_title",
    "ui_newsletter_desc",
    "ui_newsletter_cta",
    "ui_newsletter_ok",
    "ui_newsletter_fail",
    "ui_newsletter_placeholder",
    "ui_newsletter_section_aria",
    "ui_newsletter_email_aria",
  ] as const,

  auth: [
    "ui_auth_title",
    "ui_auth_lead",
    "ui_auth_register_link",
    "ui_auth_email_label",
    "ui_auth_email_placeholder",
    "ui_auth_password_label",
    "ui_auth_password_placeholder",
    "ui_auth_remember_me",
    "ui_auth_submit",
    "ui_auth_loading",
    "ui_auth_or",
    "ui_auth_google_button",
    "ui_auth_google_loading",
    "ui_auth_error_required",
    "ui_auth_error_google_generic",
  ] as const,

  products: [
    "ui_products_kicker_prefix",
    "ui_products_kicker_label",
    "ui_products_title_prefix",
    "ui_products_title_mark",
    "ui_products_read_more",
    "ui_products_read_more_aria",
    "ui_products_price_label",
    "ui_products_view_all",
    "ui_products_empty",
  ] as const,

  spareparts: [
    "ui_spareparts_kicker_prefix",
    "ui_spareparts_kicker_label",
    "ui_spareparts_title_prefix",
    "ui_spareparts_title_mark",
    "ui_spareparts_read_more",
    "ui_spareparts_read_more_aria",
    "ui_spareparts_price_label",
    "ui_spareparts_view_all",
    "ui_spareparts_empty",
  ] as const,
  team: [
    "ui_team_page_title",
  ] as const,
  faqs: [
    "ui_faqs_page_title",
  ] as const,
  about_stats: [
    "ui_about_stats_refs_title",
    "ui_about_stats_projects_title",
    "ui_about_stats_years_title",
  ] as const,
  offer: [
    "ui_offer_page_title",
  ] as const,
  catalog: [
    "ui_catalog_page_title",
  ] as const,
  portfolio: [
    "ui_portfolio_title",
    "ui_portfolio_lead",
    "ui_portfolio_aria",
    "ui_portfolio_loading",
  ] as const,
} as const;

type KeysArray = readonly UIKey[];

// Settings tarafında beklenen minimal shape
type SettingsValueRecord = {
  label?: TranslatedLabel;
  // gerektiğinde başka alanlar eklenebilir
  [k: string]: unknown;
};

/**
 * Settings -> label (çok dilli) + EN fallback zinciri:
 *   locale → en → tr → ilk değer → EN_FALLBACK
 *
 * Artık useSettingsMap yerine RTK Query (listSiteSettings) kullanıyor.
 */
export function useUIStrings<T extends KeysArray>(
  keys: T,
  locale?: SupportedLocale
) {
  // RTK ile backend'den ilgili key'leri çekiyoruz
  const keysForQuery = useMemo(
    () => keys.map((k) => k as string),
    [keys]
  );

  const { data } = useListSiteSettingsQuery(
    keysForQuery.length
      ? {
        keys: keysForQuery,
        locale,
      }
      : undefined
  );

  // data -> map[key] = { label: TranslatedLabel }
  const map = useMemo(() => {
    const out: Record<string, SettingsValueRecord> = {};

    if (!data) return out;

    for (const item of data) {
      const key = item.key;
      let value = item.value as any;

      // value STRING ise -> basit durumda EN label olarak sar
      if (typeof value === "string") {
        value = {
          label: {
            en: value,
          } as TranslatedLabel,
        };
      } else if (value && typeof value === "object") {
        // { label: {...} } formu
        if ("label" in value) {
          // olduğu gibi bırak
        } else {
          // direkt { en: "...", tr: "..." } gibi ise label olarak sar
          value = {
            label: value as TranslatedLabel,
          };
        }
      } else {
        value = {};
      }

      out[key] = value;
    }

    return out;
  }, [data]);

  function t<K extends T[number]>(key: K): string {
    const raw = map?.[key as string];
    const label = (raw?.label || {}) as TranslatedLabel;

    const val =
      (locale && label[locale]) ||
      label?.en ||
      label?.tr ||
      (Object.values(label || {})[0] as string) ||
      UI_FALLBACK_EN[key];

    const s = (typeof val === "string" ? val : "").trim();
    return s || UI_FALLBACK_EN[key] || String(key);
  }

  return { t, map };
}
