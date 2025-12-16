// =============================================================
// FILE: src/integrations/rtk/endpoints/custom_pages.endpoints.ts
// Ensotek – Custom Pages Public RTK Endpoints
// Backend: src/modules/customPages/router.ts
// =============================================================

import { baseApi } from "../baseApi";
import type {
  ApiCustomPage,
  CustomPageDto,
  CustomPageListPublicQueryParams,
} from "@/integrations/types/custom_pages.types";
import { mapApiCustomPageToDto } from "@/integrations/types/custom_pages.types";

const getTotalFromHeaders = (
  responseHeaders: Headers | undefined,
  fallbackLength: number,
): number => {
  const headerValue =
    responseHeaders?.get("x-total-count") ??
    responseHeaders?.get("X-Total-Count");
  if (!headerValue) return fallbackLength;
  const n = Number(headerValue);
  return Number.isFinite(n) && n >= 0 ? n : fallbackLength;
};

type CustomPageBySlugArgs = {
  slug: string;
  locale?: string;
};

type GetCustomPagePublicArgs = {
  id: string;
  locale?: string;
};

export const customPagesPublicApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * GET /custom_pages
     * Public listeleme (blog, news, about vs.)
     */
    listCustomPagesPublic: build.query<
      { items: CustomPageDto[]; total: number },
      CustomPageListPublicQueryParams | void
    >({
      query: (params?: CustomPageListPublicQueryParams) => ({
        url: "/custom_pages",
        method: "GET",
        params,
      }),
      transformResponse: (response: ApiCustomPage[], meta) => {
        const total = getTotalFromHeaders(meta?.response?.headers, response.length);
        return {
          items: response.map(mapApiCustomPageToDto),
          total,
        };
      },
      providesTags: (result) =>
        result?.items?.length
          ? [
            ...result.items.map((p) => ({ type: "CustomPage" as const, id: p.id })),
            { type: "CustomPage" as const, id: "PUBLIC_LIST" },
          ]
          : [{ type: "CustomPage" as const, id: "PUBLIC_LIST" }],
    }),

    /**
     * GET /custom_pages/:id
     * Public tekil sayfa (id + optional locale)
     */
    getCustomPagePublic: build.query<CustomPageDto, GetCustomPagePublicArgs>({
      query: ({ id, locale }) => ({
        url: `/custom_pages/${encodeURIComponent(id)}`,
        method: "GET",
        params: locale ? { locale } : undefined,
      }),
      transformResponse: (response: ApiCustomPage) => mapApiCustomPageToDto(response),
      providesTags: (_result, _error, args) => [{ type: "CustomPage" as const, id: args.id }],
    }),

    /**
     * GET /custom_pages/by-slug/:slug
     * Public tekil sayfa (slug + optional locale ile)
     */
    getCustomPageBySlugPublic: build.query<CustomPageDto, CustomPageBySlugArgs>({
      query: ({ slug, locale }) => ({
        url: `/custom_pages/by-slug/${encodeURIComponent(slug)}`,
        method: "GET",
        params: locale ? { locale } : undefined,
      }),
      transformResponse: (response: ApiCustomPage) => mapApiCustomPageToDto(response),
      providesTags: (_result, _error, args) => [{ type: "CustomPageSlug" as const, id: args.slug }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListCustomPagesPublicQuery,
  useGetCustomPagePublicQuery,
  useLazyGetCustomPagePublicQuery,     // ✅ LAZY EXPORT
  useGetCustomPageBySlugPublicQuery,
  useLazyGetCustomPageBySlugPublicQuery,
} = customPagesPublicApi;
