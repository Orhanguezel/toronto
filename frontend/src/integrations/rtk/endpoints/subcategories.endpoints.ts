// =============================================================
// FILE: src/integrations/rtk/endpoints/subcategories.endpoints.ts
// Ensotek – PUBLIC SubCategories RTK endpoints
// =============================================================

import { baseApi } from "../baseApi";

import type {
  ApiSubCategory,
  SubCategoryDto,
  SubCategoryListQueryParams,
  SubCategorySlugQuery,
} from "../../types/subcategory.types";
import { normalizeSubCategory } from "../../types/subcategory.types";

export const subCategoriesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /* --------------------------------------------------------- */
    /*  PUBLIC: Liste                                            */
    /*  GET /sub-categories                                      */
    /* --------------------------------------------------------- */
    listSubCategories: build.query<
      SubCategoryDto[],
      SubCategoryListQueryParams | void
    >({
      query: (params) => {
        const qp: Record<string, any> | undefined = params
          ? { ...(params as SubCategoryListQueryParams) }
          : undefined;

        return {
          url: "/sub-categories",
          method: "GET",
          params: qp,
        };
      },
      transformResponse: (response: ApiSubCategory[]) =>
        Array.isArray(response) ? response.map(normalizeSubCategory) : [],
      providesTags: (result) =>
        result
          ? [
              ...result.map((r) => ({
                type: "SubCategories" as const,
                id: r.id,
              })),
              { type: "SubCategories" as const, id: "LIST" },
            ]
          : [{ type: "SubCategories" as const, id: "LIST" }],
    }),

    /* --------------------------------------------------------- */
    /*  PUBLIC: Tekil (ID)                                       */
    /*  GET /sub-categories/:id                                  */
    /* --------------------------------------------------------- */
    getSubCategoryById: build.query<SubCategoryDto, string>({
      query: (id) => ({
        url: `/sub-categories/${id}`,
        method: "GET",
      }),
      transformResponse: (response: ApiSubCategory) =>
        normalizeSubCategory(response),
      providesTags: (_res, _err, id) => [
        { type: "SubCategories" as const, id },
      ],
    }),

    /* --------------------------------------------------------- */
    /*  PUBLIC: Slug + opsiyonel category_id + locale            */
    /*  GET /sub-categories/by-slug/:slug                        */
    /* --------------------------------------------------------- */
    getSubCategoryBySlug: build.query<SubCategoryDto, SubCategorySlugQuery>({
      query: ({ slug, category_id, locale }) => ({
        url: `/sub-categories/by-slug/${slug}`,
        method: "GET",
        params: {
          category_id,
          locale,
        },
      }),
      transformResponse: (response: ApiSubCategory) =>
        normalizeSubCategory(response),
      providesTags: (res) =>
        res
          ? [{ type: "SubCategories" as const, id: res.id }]
          : [{ type: "SubCategories" as const, id: "SLUG" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListSubCategoriesQuery,
  useGetSubCategoryByIdQuery,
  useGetSubCategoryBySlugQuery,
} = subCategoriesApi;
