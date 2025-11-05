import { baseApi } from "@/integrations/baseApi";
import { routes } from "@/integrations/routes";

export type ProjTr = { locale: string; title: string; summary?: string; body?: string; metaTitle?: string; metaDesc?: string };
export type SvcTr  = { locale: string; title: string; body?: string; faq_json?: { q: string; a: string }[] };
export type AdTr   = { locale: string; title: string; body?: string };

export const i18nAdminApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    // Projects
    getProjectTranslations: b.query<ProjTr[], { id: string }>({
      query: ({ id }) => ({ url: routes.admin.projects.translations(id) }),
      providesTags: ["Projects"],
    }),
    upsertProjectTranslation: b.mutation<{ ok: true }, { id: string; locale: string; data: Omit<ProjTr, "locale"> }>({
      query: ({ id, locale, data }) => ({
        url: routes.admin.projects.translation(id, locale),
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Projects"],
    }),

    // Services
    getServiceTranslations: b.query<SvcTr[], { id: string }>({
      query: ({ id }) => ({ url: routes.admin.services.translations(id) }),
      providesTags: ["Services"],
    }),
    upsertServiceTranslation: b.mutation<{ ok: true }, { id: string; locale: string; data: Omit<SvcTr, "locale"> }>({
      query: ({ id, locale, data }) => ({
        url: routes.admin.services.translation(id, locale),
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Services"],
    }),

    // Ad Solutions
    getAdTranslations: b.query<AdTr[], { id: string }>({
      query: ({ id }) => ({ url: routes.admin.adSolutions.translations(id) }),
      providesTags: ["AdSolutions"],
    }),
    upsertAdTranslation: b.mutation<{ ok: true }, { id: string; locale: string; data: Omit<AdTr, "locale"> }>({
      query: ({ id, locale, data }) => ({
        url: routes.admin.adSolutions.translation(id, locale),
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["AdSolutions"],
    }),
  }),
});

export const {
  useGetProjectTranslationsQuery,
  useUpsertProjectTranslationMutation,
  useGetServiceTranslationsQuery,
  useUpsertServiceTranslationMutation,
  useGetAdTranslationsQuery,
  useUpsertAdTranslationMutation,
} = i18nAdminApi;
