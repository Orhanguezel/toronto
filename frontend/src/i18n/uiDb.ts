// src/i18n/uiDb.ts
"use client";

import { useGetSiteSettingByKeyQuery } from "@/integrations/rtk/endpoints/site_settings.endpoints";
import type { SupportedLocale } from "@/types/common";
import { useResolvedLocale } from "@/i18n/locale";
import { useUIStrings, UI_KEYS, type UIKey } from "./ui";

// DB tarafında kullanacağın section key'leri (site_settings.key)
export type UiSectionKey =
  | "ui_header"
  | "ui_home"
  | "ui_footer"
  | "ui_services"
  | "ui_banner"
  | "ui_hero"
  | "ui_contact"
  | "ui_about"
  | "ui_about_stats"
  | "ui_pricing"
  | "ui_testimonials"
  | "ui_faq"
  | "ui_features"
  | "ui_cta"
  | "ui_blog"
  | "ui_dashboard"
  | "ui_auth"
  | "ui_newsletter"
  | "ui_library"
  | "ui_feedback"
  | "ui_references"
  | "ui_news"
  | "ui_products"
  | "ui_spareparts"
  | "ui_faqs"
  | "ui_team"
  | "ui_offer"
  | "ui_catalog"
  | "ui_portfolio"
  ;

// Hangi section hangi UI_KEYS grubunu kullanacak?
const SECTION_UI_KEYS_MAP: Record<UiSectionKey, readonly UIKey[]> = {
  ui_header: UI_KEYS.header,
  ui_home: UI_KEYS.hero, // istersen hero+services+news vs ile genişletebilirsin
  ui_footer: UI_KEYS.footer,
  ui_services: UI_KEYS.services,
  ui_banner: UI_KEYS.banner,
  ui_hero: UI_KEYS.hero,
  ui_contact: UI_KEYS.contact,
  ui_about: UI_KEYS.about,
  ui_about_stats: UI_KEYS.about_stats,
  ui_team: UI_KEYS.team,
  ui_faqs: UI_KEYS.faqs,
  ui_pricing: [], // şimdilik boş, ileride eklenebilir
  ui_testimonials: UI_KEYS.feedback,
  ui_faq: [], // ileride FAQ key'leri tanımlarsan buraya
  ui_features: [], // ileride feature key'leri tanımlarsan buraya
  ui_cta: [], // şimdilik boş
  ui_blog: UI_KEYS.news,
  ui_dashboard: [],
  ui_auth: UI_KEYS.auth,
  ui_newsletter: UI_KEYS.newsletter,
  ui_library: UI_KEYS.library,
  ui_feedback: UI_KEYS.feedback,
  ui_references: UI_KEYS.references,
  ui_news: UI_KEYS.news,
  ui_products: UI_KEYS.products,
  ui_spareparts: UI_KEYS.spareparts,
  ui_offer: UI_KEYS.offer,
  ui_catalog: UI_KEYS.catalog,
  ui_portfolio: UI_KEYS.portfolio,
};

type UiSectionResult = {
  ui: (key: string, hardFallback?: string) => string;
  raw: Record<string, unknown>;
  locale: SupportedLocale;
};

/**
 * useUiSection:
 *   - section: site_settings.key (ör: "ui_header")
 *   - localeOverride: zorunlu değil, verilmezse useResolvedLocale() kullanılır
 *
 * Önce section JSON'unu (ui_header gibi) okur -> (DB override)
 * Sonra useUIStrings ile i18n + UI_FALLBACK_EN zincirini uygular
 * En sonda hardFallback string'ini kullanır.
 */
export function useUiSection(
  section: UiSectionKey,
  localeOverride?: SupportedLocale
): UiSectionResult {
  const locale = useResolvedLocale(localeOverride);

  // 1) DB'den section JSON'unu çek
  const { data: uiSetting } = useGetSiteSettingByKeyQuery({
    key: section,
    locale,
  });

  // 2) Bu section için kullanılacak UI key listesi
  const keys = SECTION_UI_KEYS_MAP[section] ?? [];

  // 3) i18n zinciri (settings.label → en → tr → UI_FALLBACK_EN)
  const { t: tInner } = useUIStrings(keys as readonly UIKey[], locale);
  const t = (key: string): string => tInner(key as any);

  // 4) DB JSON normalize et (sadece düz object bekliyoruz)
  const json: Record<string, unknown> =
    uiSetting?.value &&
      typeof uiSetting.value === "object" &&
      !Array.isArray(uiSetting.value)
      ? (uiSetting.value as Record<string, unknown>)
      : {};

  /**
   * Öncelik sırası:
   *   1. DB JSON (uiSetting.value[key] string ise)
   *   2. i18n (t(key)) → ama sadece key string'inin aynısı değilse
   *   3. hardFallback parametresi
   */
  const ui = (key: string, hardFallback = ""): string => {
    const raw = json[key];

    // 1) DB JSON override
    if (typeof raw === "string" && raw.trim()) {
      return raw;
    }

    // 2) i18n fallback
    const fromI18n = t(key).trim();
    // eğer i18n gerçekten bir çeviri döndürüyorsa ve
    // sadece "menu_empty" gibi key'in kendisi değilse kullan
    if (fromI18n && fromI18n !== key) {
      return fromI18n;
    }

    // 3) En son hard-coded fallback
    return hardFallback;
  };

  return { ui, raw: json, locale };
}
