// =============================================================
// FILE: src/integrations/rtk/endpoints/admin/products_admin.endpoints.ts
// Admin Products (CRUD + Images + Category helpers)
// =============================================================

import { baseApi } from "../../baseApi";
import type {
  AdminProductDto,
  AdminProductListQueryParams,
  AdminProductListResponse,
  AdminGetProductParams,
  AdminProductCreatePayload,
  AdminProductUpdatePayload,
  AdminProductSetImagesPayload,
} from "@/integrations/types/product_admin.types"; // path sende böyleyse dokunma
import type { BoolLike } from "@/integrations/types/product.types";

/* ---------- Kategori / Alt Kategori tipleri ---------- */

export type AdminProductCategoryDto = {
  id: string;
  name: string;
  slug: string;
  locale: string;
  module_key?: string | null;
};

export type AdminProductSubCategoryDto = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  locale: string;
};

export type AdminProductCategoryListQueryParams = {
  module_key?: string;
  locale?: string;
  is_active?: BoolLike;
};

export type AdminProductSubCategoryListQueryParams = {
  category_id?: string;
  locale?: string;
  is_active?: BoolLike;
};

/* ---------- Reorder payload tipleri ---------- */

export type AdminProductsReorderItem = {
  id: string;
  order_num: number;
};

export type AdminProductsReorderPayload = {
  items: AdminProductsReorderItem[];
};

export const productsAdminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // -------- LIST --------
     listProductsAdmin: build.query<
      AdminProductListResponse,
      AdminProductListQueryParams | void
    >({
      query: (params?: AdminProductListQueryParams) => ({
        url: "/admin/products",
        method: "GET",
        params,
      }),
      transformResponse: (
        response: AdminProductDto[],
        meta,
      ): AdminProductListResponse => {
        const items = response ?? [];
        const header =
          (meta as any)?.response?.headers?.get?.("x-total-count") ??
          (meta as any)?.response?.headers?.get?.("X-Total-Count");
        const total = header ? Number(header) || items.length : items.length;
        return { items, total };
      },
    }),

    // -------- DETAIL --------
    getProductAdmin: build.query<AdminProductDto, AdminGetProductParams>({
      query: ({ id, locale }) => ({
        url: `/admin/products/${encodeURIComponent(id)}`,
        method: "GET",
        // backend destekliyorsa ?locale=en
        params: locale ? { locale } : undefined,
      }),
    }),

    // -------- CREATE --------
    createProductAdmin: build.mutation<
      AdminProductDto,
      AdminProductCreatePayload
    >({
      query: (body) => ({
        url: "/admin/products",
        method: "POST",
        body,
      }),
    }),

    // -------- UPDATE --------
    updateProductAdmin: build.mutation<
      AdminProductDto,
      { id: string; patch: AdminProductUpdatePayload }
    >({
      query: ({ id, patch }) => ({
        url: `/admin/products/${encodeURIComponent(id)}`,
        method: "PATCH",
        body: patch,
      }),
    }),

    
    // -------- DELETE --------
    deleteProductAdmin: build.mutation<{ ok?: boolean }, { id: string }>({
      query: ({ id }) => ({
        url: `/admin/products/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
    }),

    // -------- IMAGES (SET) --------
    setProductImagesAdmin: build.mutation<
      AdminProductDto,
      { id: string; payload: AdminProductSetImagesPayload }
    >({
      query: ({ id, payload }) => ({
        url: `/admin/products/${encodeURIComponent(id)}/images`,
        method: "PUT",
        body: payload,
      }),
    }),

    // -------- REORDER (drag & drop sıralama) --------
    reorderProductsAdmin: build.mutation<
      { ok: boolean },
      AdminProductsReorderPayload
    >({
      query: (body) => ({
        url: "/admin/products/reorder",
        method: "POST",
        body,
      }),
    }),

    // -------- CATEGORY HELPERS --------
    listProductCategoriesAdmin: build.query<
      AdminProductCategoryDto[],
      AdminProductCategoryListQueryParams | void
    >({
      query: (params?: AdminProductCategoryListQueryParams) => ({
        url: "/admin/products/categories",
        method: "GET",
        params,
      }),
    }),

    listProductSubcategoriesAdmin: build.query<
      AdminProductSubCategoryDto[],
      AdminProductSubCategoryListQueryParams | void
    >({
      query: (params?: AdminProductSubCategoryListQueryParams) => ({
        url: "/admin/products/subcategories",
        method: "GET",
        params,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useListProductsAdminQuery,
  useGetProductAdminQuery,
  useCreateProductAdminMutation,
  useUpdateProductAdminMutation,
  useDeleteProductAdminMutation,
  useSetProductImagesAdminMutation,
  useListProductCategoriesAdminQuery,
  useListProductSubcategoriesAdminQuery,
  // ⬇ drag & drop sıralama kaydetmek için
  useReorderProductsAdminMutation,
} = productsAdminApi;
