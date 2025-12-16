// =============================================================
// FILE: src/integrations/rtk/endpoints/categories.endpoints.ts
// Ensotek – Public Kategori RTK Endpoints
// Base URL: /api (baseApi üzerinden)
// =============================================================

import { baseApi } from "../baseApi";
import type {
  CategoryDto,
  CategoryPublicListQueryParams,
} from "@/integrations/types/category.types";

const cleanParams = (
  params?: Record<string, unknown>,
): Record<string, unknown> | undefined => {
  if (!params) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    out[k] = v;
  }
  return Object.keys(out).length ? out : undefined;
};

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /* --------------------------------------------------------- */
    /* LIST – GET /api/categories                                */
    /* (public listCategories controller'ı)                      */
    /* --------------------------------------------------------- */
    listCategories: build.query<
      CategoryDto[],
      CategoryPublicListQueryParams | void
    >({
      query: (params) => ({
        url: "/categories",
        method: "GET",
        params: cleanParams(params as Record<string, unknown> | undefined),
      }),
    }),

    /* --------------------------------------------------------- */
    /* GET BY ID – GET /api/categories/:id                       */
    /* --------------------------------------------------------- */
    getCategoryById: build.query<CategoryDto, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "GET",
      }),
    }),

    /* --------------------------------------------------------- */
    /* GET BY SLUG – GET /api/categories/by-slug/:slug           */
    /* Query: locale?, module_key?                               */
    /* --------------------------------------------------------- */
    getCategoryBySlug: build.query<
      CategoryDto,
      { slug: string; locale?: string; module_key?: string }
    >({
      query: ({ slug, locale, module_key }) => ({
        url: `/categories/by-slug/${encodeURIComponent(slug)}`,
        method: "GET",
        params: cleanParams({ locale, module_key }),
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useListCategoriesQuery,
  useLazyListCategoriesQuery,
  useGetCategoryByIdQuery,
  useLazyGetCategoryByIdQuery,
  useGetCategoryBySlugQuery,
  useLazyGetCategoryBySlugQuery,
} = categoriesApi;
