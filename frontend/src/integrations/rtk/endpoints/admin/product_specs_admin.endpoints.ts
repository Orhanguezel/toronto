// =============================================================
// FILE: src/integrations/rtk/endpoints/admin/product_specs_admin.endpoints.ts
// Admin Product Specs
// =============================================================

import { baseApi } from "../../baseApi";
import type {
  AdminProductSpecDto,
  AdminProductSpecListParams,
  AdminProductSpecCreatePayload,
  AdminProductSpecUpdatePayload,
  AdminProductSpecReplacePayload,
} from "@/integrations/types/product_specs_admin.types";

export const productSpecsAdminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ---------- LIST ----------
    listProductSpecsAdmin: build.query<
      AdminProductSpecDto[],
      AdminProductSpecListParams
    >({
      query: ({ productId, locale }) => ({
        url: `/admin/products/${encodeURIComponent(productId)}/specs`,
        method: "GET",
        params: locale ? { locale } : undefined,
      }),
    }),

    // ---------- CREATE ----------
    createProductSpecAdmin: build.mutation<
      AdminProductSpecDto,
      { productId: string; payload: AdminProductSpecCreatePayload }
    >({
      query: ({ productId, payload }) => ({
        url: `/admin/products/${encodeURIComponent(productId)}/specs`,
        method: "POST",
        // locale hem body'de hem query'de olabilir; backend query.locale'i baz alıyor
        params: payload.locale ? { locale: payload.locale } : undefined,
        body: payload,
      }),
    }),

    // ---------- UPDATE ----------
    updateProductSpecAdmin: build.mutation<
      AdminProductSpecDto,
      {
        productId: string;
        specId: string;
        patch: AdminProductSpecUpdatePayload;
      }
    >({
      query: ({ productId, specId, patch }) => ({
        url: `/admin/products/${encodeURIComponent(
          productId,
        )}/specs/${encodeURIComponent(specId)}`,
        method: "PATCH",
        body: patch,
      }),
    }),

    // ---------- DELETE ----------
    deleteProductSpecAdmin: build.mutation<
      { ok: boolean },
      { productId: string; specId: string }
    >({
      query: ({ productId, specId }) => ({
        url: `/admin/products/${encodeURIComponent(
          productId,
        )}/specs/${encodeURIComponent(specId)}`,
        method: "DELETE",
      }),
    }),

    // ---------- REPLACE (PUT /specs) ----------
    // - locale: query string'de
    // - body: { items: AdminProductSpecCreatePayload[] }
    replaceProductSpecsAdmin: build.mutation<
      AdminProductSpecDto[],
      {
        productId: string;
        locale: string;
        payload: AdminProductSpecReplacePayload;
      }
    >({
      query: ({ productId, locale, payload }) => ({
        url: `/admin/products/${encodeURIComponent(productId)}/specs`,
        method: "PUT",
        params: locale ? { locale } : undefined,
        body: payload, // { items }
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useListProductSpecsAdminQuery,
  useCreateProductSpecAdminMutation,
  useUpdateProductSpecAdminMutation,
  useDeleteProductSpecAdminMutation,
  useReplaceProductSpecsAdminMutation,
} = productSpecsAdminApi;
