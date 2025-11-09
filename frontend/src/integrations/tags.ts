// src/integrations/tags.ts

export const tags = [
  "SiteSettings",
  "Projects",
  "ProjectsFilters",   // bazı modüller bunu kullanıyor
  "Services",
  "AdSolutions",
  "References",
  "Auth",
  "Users",
  "site_settings",
  "reference_images","references", 
  "references",
  "storage_folders",
  "storage_assets",
] as const;

export type ApiTag = typeof tags[number];
