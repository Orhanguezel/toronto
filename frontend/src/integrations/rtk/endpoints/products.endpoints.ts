// =============================================================
// FILE: src/integrations/rtk/endpoints/products.endpoints.ts
// Public Products + FAQ + Specs + Reviews
// =============================================================

import { baseApi } from "../baseApi";
import type {
  ProductDto,
  ProductListQueryParams,
  ProductListResponse,
  GetProductByIdOrSlugParams,
  GetProductBySlugParams,
  GetProductByIdParams,
  ProductFaqDto,
  ProductFaqListQueryParams,
  ProductSpecDto,
  ProductSpecListQueryParams,
  ProductReviewDto,
  ProductReviewListQueryParams,
} from "@/integrations/types/product.types";

export const productsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ---------- Products list ----------
    listProducts: build.query<
      ProductListResponse,
      ProductListQueryParams | void
    >({
      query: (params?: ProductListQueryParams) => ({
        url: "/products",
        method: "GET",
        params: params ?? undefined,
      }),
      transformResponse: (
        response: ProductDto[],
        meta,
      ): ProductListResponse => {
        const header =
          (meta as any)?.response?.headers?.get("x-total-count") ??
          (meta as any)?.response?.headers?.get("X-Total-Count");
        const items = response ?? [];
        const total = header ? Number(header) || items.length : items.length;
        return { items, total };
      },
      providesTags: (result) =>
        result?.items
          ? [
            { type: "Products" as const, id: "LIST" },
            ...result.items.map((p) => ({
              type: "Products" as const,
              id: p.id,
            })),
          ]
          : [{ type: "Products" as const, id: "LIST" }],
    }),

    // ---------- Detail (id veya slug) ----------
    getProductByIdOrSlug: build.query<
      ProductDto,
      GetProductByIdOrSlugParams
    >({
      query: ({ idOrSlug, ...params }) => ({
        url: `/products/${encodeURIComponent(idOrSlug)}`,
        method: "GET",
        params,
      }),
      providesTags: (_res, _err, arg) => {
        void _err;
        return [{ type: "Products" as const, id: arg.idOrSlug }];
      },
    }),

    getProductBySlug: build.query<ProductDto, GetProductBySlugParams>({
      query: ({ slug, ...params }) => ({
        url: `/products/by-slug/${encodeURIComponent(slug)}`,
        method: "GET",
        params,
      }),
      providesTags: (_res, _err, arg) => {
        void _err;
        return [{ type: "Products" as const, id: `slug:${arg.slug}` }];
      },
    }),

    getProductById: build.query<ProductDto, GetProductByIdParams>({
      query: ({ id, ...params }) => ({
        url: `/products/id/${encodeURIComponent(id)}`,
        method: "GET",
        params: Object.keys(params).length ? params : undefined,
      }),
      providesTags: (_res, _err, arg) => {
        void _err;
        return [{ type: "Products" as const, id: arg.id }];
      },
    }),

    // ---------- Public FAQ ----------
    listProductFaqs: build.query<
      ProductFaqDto[],
      ProductFaqListQueryParams | void
    >({
      query: (params?: ProductFaqListQueryParams) => ({
        url: "/product_faqs",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
            { type: "ProductFaqs" as const, id: "LIST" },
            ...result.map((f) => ({
              type: "ProductFaqs" as const,
              id: f.id,
            })),
          ]
          : [{ type: "ProductFaqs" as const, id: "LIST" }],
    }),

    // ---------- Public Specs ----------
    listProductSpecs: build.query<
      ProductSpecDto[],
      ProductSpecListQueryParams | void
    >({
      query: (params?: ProductSpecListQueryParams) => ({
        url: "/product_specs",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
            { type: "ProductSpecs" as const, id: "LIST" },
            ...result.map((s) => ({
              type: "ProductSpecs" as const,
              id: s.id,
            })),
          ]
          : [{ type: "ProductSpecs" as const, id: "LIST" }],
    }),

    // ---------- Public Reviews ----------
    listProductReviews: build.query<
      ProductReviewDto[],
      ProductReviewListQueryParams
    >({
      query: (params) => ({
        url: "/product_reviews",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
            { type: "ProductReviews" as const, id: "LIST" },
            ...result.map((r) => ({
              type: "ProductReviews" as const,
              id: r.id,
            })),
          ]
          : [{ type: "ProductReviews" as const, id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListProductsQuery,
  useGetProductByIdOrSlugQuery,
  useGetProductBySlugQuery,
  useGetProductByIdQuery,
  useListProductFaqsQuery,
  useListProductSpecsQuery,
  useListProductReviewsQuery,
} = productsApi;
