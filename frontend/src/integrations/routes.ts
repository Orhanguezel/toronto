// Tek kaynak: tüm public + admin endpoint path’leri
export const routes = {
  site: {
    settings: "/site-settings",
    flagEval: (key: string, locale: string) =>
      `/admin/flags/eval?key=${encodeURIComponent(key)}&locale=${encodeURIComponent(locale)}`,
  },

  // PUBLIC

  auth: {
    v1: {
      base: "/auth/v1",
      signup: "/auth/v1/signup",
      token: "/auth/v1/token",
      refresh: "/auth/v1/token/refresh",
      google: "/auth/v1/google",
      googleStart: "/auth/v1/google/start",
      user: "/auth/v1/user",
      status: "/auth/v1/status",
      logout: "/auth/v1/logout",
      googleCallback: "/auth/v1/google/callback", // (genelde frontend’de direkt çağrılmaz)
    },
  },

  projects: {
    list: "/projects",
    byId: (id: string) => `/projects/${id}`,
    bySlug: (slug: string) => `/projects/by-slug/${encodeURIComponent(slug)}`,
    slugs: "/projects?select=slug",
    categories: "/projects/categories",
    tags: "/projects/tags",
  },
  services: {
    list: "/services",
    byId: (id: string) => `/services/${id}`,
    bySlug: (slug: string) => `/services/by-slug/${encodeURIComponent(slug)}`,
  },
  adSolutions: {
    list: "/ad-solutions",
    byId: (id: string) => `/ad-solutions/${id}`,
    bySlug: (slug: string) => `/ad-solutions/by-slug/${encodeURIComponent(slug)}`,
  },
  references: {
    list: "/references",
    byId: (id: string) => `/references/${id}`,
    bySlug: (slug: string) => `/references/by-slug/${encodeURIComponent(slug)}`,
  },

  // ADMIN
  admin: {
    users: {
      base: "/admin/users",
      byId: (id: string) => `/admin/users/${id}`,
      active: (id: string) => `/admin/users/${id}/active`,
      roles: (id: string) => `/admin/users/${id}/roles`,
    },
    projects: {
      list: "/admin/projects",
      byId: (id: string) => `/admin/projects/${id}`,
      translations: (id: string) => `/admin/projects/${id}/translations`,
      translation: (id: string, locale: string) => `/admin/projects/${id}/translations/${locale}`,
      taxonomy: (id: string) => `/admin/projects/${id}/taxonomy`,
    },
    services: {
      list: "/admin/services",
      byId: (id: string) => `/admin/services/${id}`,
      translations: (id: string) => `/admin/services/${id}/translations`,
      translation: (id: string, locale: string) => `/admin/services/${id}/translations/${locale}`,
    },
    adSolutions: {
      list: "/admin/ad-solutions",
      byId: (id: string) => `/admin/ad-solutions/${id}`,
      translations: (id: string) => `/admin/ad-solutions/${id}/translations`,
      translation: (id: string, locale: string) => `/admin/ad-solutions/${id}/translations/${locale}`,
    },
    taxonomy: {
      categories: "/admin/categories",
      tags: "/admin/tags",
    },
  },
} as const;
