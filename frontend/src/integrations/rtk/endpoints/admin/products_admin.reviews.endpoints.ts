// =============================================================
// FILE: src/integrations/rtk/endpoints/admin/product_reviews_admin.endpoints.ts
// Admin Product Reviews
// =============================================================

import { baseApi } from "../../baseApi";
import type {
  AdminProductReviewDto,
  AdminProductReviewListParams,
  AdminProductReviewCreatePayload,
  AdminProductReviewUpdatePayload,
} from "@/integrations/types/product_reviews_admin.types";

export const productReviewsAdminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // LIST (opsiyonel)
    listProductReviewsAdmin: build.query<
      AdminProductReviewDto[],
      AdminProductReviewListParams
    >({
      query: ({ productId, only_active, order }) => ({
        url: `/admin/products/${encodeURIComponent(productId)}/reviews`,
        method: "GET",
        params: {
          ...(only_active !== undefined ? { only_active } : {}),
          ...(order ? { order } : {}),
        },
      }),
    }),

    // CREATE
    createProductReviewAdmin: build.mutation<
      AdminProductReviewDto,
      { productId: string; payload: AdminProductReviewCreatePayload }
    >({
      query: ({ productId, payload }) => ({
        url: `/admin/products/${encodeURIComponent(productId)}/reviews`,
        method: "POST",
        body: payload,
      }),
    }),

    // UPDATE
    updateProductReviewAdmin: build.mutation<
      AdminProductReviewDto,
      { productId: string; reviewId: string; patch: AdminProductReviewUpdatePayload }
    >({
      query: ({ productId, reviewId, patch }) => ({
        url: `/admin/products/${encodeURIComponent(
          productId,
        )}/reviews/${encodeURIComponent(reviewId)}`,
        method: "PATCH",
        body: patch,
      }),
    }),

    // TOGGLE ACTIVE
    toggleProductReviewActiveAdmin: build.mutation<
      { ok: boolean },
      { productId: string; reviewId: string; is_active: boolean }
    >({
      query: ({ productId, reviewId, is_active }) => ({
        url: `/admin/products/${encodeURIComponent(
          productId,
        )}/reviews/${encodeURIComponent(reviewId)}/active`,
        method: "PATCH",
        body: { is_active },
      }),
    }),

    // DELETE
    deleteProductReviewAdmin: build.mutation<
      { ok: boolean },
      { productId: string; reviewId: string }
    >({
      query: ({ productId, reviewId }) => ({
        url: `/admin/products/${encodeURIComponent(
          productId,
        )}/reviews/${encodeURIComponent(reviewId)}`,
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useListProductReviewsAdminQuery,
  useCreateProductReviewAdminMutation,
  useUpdateProductReviewAdminMutation,
  useToggleProductReviewActiveAdminMutation,
  useDeleteProductReviewAdminMutation,
} = productReviewsAdminApi;
