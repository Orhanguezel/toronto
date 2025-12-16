// =============================================================
// FILE: src/integrations/rtk/endpoints/admin/subcategories_admin.endpoints.ts
// Ensotek – ADMIN SubCategories RTK endpoints
// Kategoriler ile aynı i18n + RTK pattern
// =============================================================

import { baseApi } from "../../baseApi";

import type {
  ApiSubCategory,
  SubCategoryDto,
  SubCategoryAdminListQueryParams,
  SubCategoryCreatePayload,
  SubCategoryUpdatePayload,
  SubCategoryReorderItem,
  SubCategorySetImagePayload,
} from "../../../types/subcategory.types";
import { normalizeSubCategory } from "../../../types/subcategory.types";

/**
 * Query paramlarından undefined / boş stringleri temizlemek için
 * (Kategori endpoints ile bire bir aynı helper)
 */
const cleanParams = (
  params?: Record<string, unknown>,
): Record<string, string | number | boolean> | undefined => {
  if (!params) return undefined;
  const out: Record<string, string | number | boolean> = {};

  for (const [k, v] of Object.entries(params)) {
    if (
      v === undefined ||
      v === null ||
      v === "" ||
      (typeof v === "number" && Number.isNaN(v))
    ) {
      continue;
    }

    if (
      typeof v === "boolean" ||
      typeof v === "number" ||
      typeof v === "string"
    ) {
      out[k] = v;
    } else {
      out[k] = String(v);
    }
  }

  return Object.keys(out).length ? out : undefined;
};

export const subCategoriesAdminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /* --------------------------------------------------------- */
    /* LIST – GET /api/admin/sub-categories/list                 */
    /* --------------------------------------------------------- */
    listSubCategoriesAdmin: build.query<
      SubCategoryDto[],
      SubCategoryAdminListQueryParams | void
    >({
      query: (params) => ({
        url: "/admin/sub-categories/list",
        method: "GET",
        params: cleanParams(
          params as Record<string, unknown> | undefined,
        ),
      }),
      transformResponse: (response: ApiSubCategory[]) =>
        Array.isArray(response) ? response.map(normalizeSubCategory) : [],
    }),

    /* --------------------------------------------------------- */
    /* GET by id – /api/admin/sub-categories/:id?locale=xx       */
    /*  👉 i18n için kategori ile aynı pattern: { id, locale? }   */
    /* --------------------------------------------------------- */
    getSubCategoryAdmin: build.query<
      SubCategoryDto,
      { id: string; locale?: string }
    >({
      query: ({ id, locale }) => ({
        url: `/admin/sub-categories/${encodeURIComponent(id)}`,
        method: "GET",
        params: cleanParams(locale ? { locale } : undefined),
      }),
      transformResponse: (response: ApiSubCategory) =>
        normalizeSubCategory(response),
    }),

    /* --------------------------------------------------------- */
    /* (Opsiyonel) Slug ile – /admin/sub-categories/by-slug/:slug*/
    /* --------------------------------------------------------- */
    getSubCategoryBySlugAdmin: build.query<
      SubCategoryDto,
      { slug: string; category_id?: string }
    >({
      query: ({ slug, category_id }) => ({
        url: `/admin/sub-categories/by-slug/${encodeURIComponent(slug)}`,
        method: "GET",
        params: cleanParams(
          category_id ? { category_id } : undefined,
        ),
      }),
      transformResponse: (response: ApiSubCategory) =>
        normalizeSubCategory(response),
    }),

    /* --------------------------------------------------------- */
    /* CREATE – POST /api/admin/sub-categories                   */
    /* --------------------------------------------------------- */
    createSubCategoryAdmin: build.mutation<
      SubCategoryDto,
      SubCategoryCreatePayload
    >({
      query: (body) => ({
        url: "/admin/sub-categories",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiSubCategory) =>
        normalizeSubCategory(response),
    }),

    /* --------------------------------------------------------- */
    /* PATCH – /api/admin/sub-categories/:id                     */
    /*  Body: SubCategoryUpdatePayload (+ locale i18n alanları)  */
    /* --------------------------------------------------------- */
    updateSubCategoryAdmin: build.mutation<
      SubCategoryDto,
      { id: string; patch: SubCategoryUpdatePayload }
    >({
      query: ({ id, patch }) => ({
        url: `/admin/sub-categories/${encodeURIComponent(id)}`,
        method: "PATCH",
        body: patch,
      }),
      transformResponse: (response: ApiSubCategory) =>
        normalizeSubCategory(response),
    }),

    /* --------------------------------------------------------- */
    /* DELETE – /api/admin/sub-categories/:id                    */
    /* --------------------------------------------------------- */
    deleteSubCategoryAdmin: build.mutation<void, string>({
      query: (id) => ({
        url: `/admin/sub-categories/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
    }),

    /* --------------------------------------------------------- */
    /* REORDER – /api/admin/sub-categories/reorder               */
    /* Body: { items: [{id, display_order}, ...] }               */
    /* --------------------------------------------------------- */
    reorderSubCategoriesAdmin: build.mutation<
      { ok: boolean },
      { items: SubCategoryReorderItem[] }
    >({
      query: (payload) => ({
        url: "/admin/sub-categories/reorder",
        method: "POST",
        body: payload,
      }),
    }),

    /* --------------------------------------------------------- */
    /* TOGGLE ACTIVE – PATCH /api/admin/sub-categories/:id/active*/
    /* Body: { is_active: boolean }                              */
    /* --------------------------------------------------------- */
    toggleSubCategoryActiveAdmin: build.mutation<
      SubCategoryDto,
      { id: string; is_active: boolean }
    >({
      query: ({ id, is_active }) => ({
        url: `/admin/sub-categories/${encodeURIComponent(id)}/active`,
        method: "PATCH",
        body: { is_active },
      }),
      transformResponse: (response: ApiSubCategory) =>
        normalizeSubCategory(response),
    }),

    /* --------------------------------------------------------- */
    /* TOGGLE FEATURED – PATCH /admin/sub-categories/:id/featured*/
    /* Body: { is_featured: boolean }                            */
    /* --------------------------------------------------------- */
    toggleSubCategoryFeaturedAdmin: build.mutation<
      SubCategoryDto,
      { id: string; is_featured: boolean }
    >({
      query: ({ id, is_featured }) => ({
        url: `/admin/sub-categories/${encodeURIComponent(id)}/featured`,
        method: "PATCH",
        body: { is_featured },
      }),
      transformResponse: (response: ApiSubCategory) =>
        normalizeSubCategory(response),
    }),

    /* --------------------------------------------------------- */
    /* SET IMAGE – PATCH /api/admin/sub-categories/:id/image     */
    /* Body: { asset_id?: string|null, alt?: string|null }       */
    /*  👉 Kategori ile aynı payload imzası                      */
    /* --------------------------------------------------------- */
    setSubCategoryImageAdmin: build.mutation<
      SubCategoryDto,
      SubCategorySetImagePayload
    >({
      query: ({ id, asset_id, alt }) => ({
        url: `/admin/sub-categories/${encodeURIComponent(id)}/image`,
        method: "PATCH",
        body: {
          asset_id: asset_id ?? null,
          alt: alt ?? null,
        },
      }),
      transformResponse: (response: ApiSubCategory) =>
        normalizeSubCategory(response),
    }),
  }),

  overrideExisting: false,
});

export const {
  useListSubCategoriesAdminQuery,
  useLazyListSubCategoriesAdminQuery,
  useGetSubCategoryAdminQuery,
  useLazyGetSubCategoryAdminQuery,
  useGetSubCategoryBySlugAdminQuery,
  useCreateSubCategoryAdminMutation,
  useUpdateSubCategoryAdminMutation,
  useDeleteSubCategoryAdminMutation,
  useReorderSubCategoriesAdminMutation,
  useToggleSubCategoryActiveAdminMutation,
  useToggleSubCategoryFeaturedAdminMutation,
  useSetSubCategoryImageAdminMutation,
} = subCategoriesAdminApi;
