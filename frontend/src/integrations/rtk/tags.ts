// =============================================================
// FILE: src/integrations/rtk/tags.ts
// RTK Query cache/tag listesi (Ensotek modülleri)
// =============================================================

export const metahubTags = [
  "Auth", "User", "AdminUsers",
  "Profiles", "Profile",
  "UserRoles", "UserRole",
  "SiteSettings", "SiteSettingsBulk",
  "CustomPages", "CustomPageSlug", "CustomPage",
  "Faqs",
  "Services",
  "References",
  "MenuItems", "MenuItem", "MenuItemPublic",
  "Slider",
  "Categories",
  "SubCategories",
  "Contacts",
  "EmailTemplates",
  "FooterSections",
  "Library",
  "Mail",
  "Newsletter",
  "Notifications",
  "Products", "ProductFaqs", "ProductSpecs", "ProductReviews",
  "Reviews",
  "Support",
  "Storage",
  "DbAdmin",
  "Sliders",
  "AdminReferenceImages",
  "ReferenceImages",
  "AdminReferences",
  "EmailTemplate",
  "Notification",
  "Review",
  "Health",
  "ProductFAQs",
  "Offers",
  "CatalogRequest"

] as const;

export type MetahubTag = (typeof metahubTags)[number];
