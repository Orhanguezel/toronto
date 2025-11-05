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
] as const;

export type ApiTag = typeof tags[number];
