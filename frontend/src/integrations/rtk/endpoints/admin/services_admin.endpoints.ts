// =============================================================
// FILE: src/integrations/rtk/endpoints/admin/services_admin.endpoints.ts
// Ensotek – Admin Services (Hizmetler) RTK Endpoints
// =============================================================

import { baseApi } from "../../baseApi";
import type {
  ApiServiceBase,
  ApiServiceAdmin,
  ApiServiceImage,
  ServiceDto,
  ServiceImageDto,
  ServiceListAdminQueryParams,
  ServiceListResult,
  ServiceCreatePayload,
  ServiceUpdatePayload,
  ServiceImageCreatePayload,
  ServiceImageUpdatePayload,
} from "@/integrations/types/services.types";

const normalizeService = (
  row: ApiServiceBase & { featured_image_url?: string | null },
): ServiceDto => ({
  id: row.id,
  type: row.type,
  category_id: row.category_id,
  sub_category_id: row.sub_category_id,
  featured: row.featured === 1,
  is_active: row.is_active === 1,
  display_order: row.display_order,

  featured_image: row.featured_image,
  image_url: row.image_url,
  image_asset_id: row.image_asset_id,

  // Admin endpoint'lerde featured_image_url gelmeyebilir; yine de opsiyonel
  featured_image_url:
    typeof row.featured_image_url !== "undefined"
      ? row.featured_image_url
      : undefined,

  // tip spesifik alanlar
  area: row.area,
  duration: row.duration,
  maintenance: row.maintenance,
  season: row.season,
  soil_type: row.soil_type,
  thickness: row.thickness,
  equipment: row.equipment,

  created_at: row.created_at,
  updated_at: row.updated_at,

  slug: row.slug,
  name: row.name,
  description: row.description,
  material: row.material,
  price: row.price,
  includes: row.includes,
  warranty: row.warranty,
  image_alt: row.image_alt,

  tags: row.tags,
  meta_title: row.meta_title,
  meta_description: row.meta_description,
  meta_keywords: row.meta_keywords,

  locale_resolved: row.locale_resolved,
});

const normalizeServiceImage = (row: ApiServiceImage): ServiceImageDto => ({
  id: row.id,
  service_id: row.service_id,
  image_asset_id: row.image_asset_id,
  image_url: row.image_url,
  is_active: row.is_active === 1,
  display_order: row.display_order,
  created_at: row.created_at,
  updated_at: row.updated_at,
  title: row.title,
  alt: row.alt,
  caption: row.caption,
  locale_resolved: row.locale_resolved,
});

export const servicesAdminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /* ---------------------------------------------------------
     * GET /admin/services
     * Admin liste – x-total-count header'lı
     * --------------------------------------------------------- */
    listServicesAdmin: build.query<
      ServiceListResult,
      ServiceListAdminQueryParams | void
    >({
      query: (params) => ({
        url: "/admin/services",
        method: "GET",
        params: params ?? {},
        credentials: "include",
      }),
      transformResponse: (response: ApiServiceAdmin[], meta) => {
        const items = Array.isArray(response)
          ? response.map((row) => normalizeService(row))
          : [];

        const totalHeader = meta?.response?.headers.get("x-total-count");
        const totalFromHeader = totalHeader ? Number(totalHeader) : Number.NaN;
        const total = Number.isFinite(totalFromHeader)
          ? totalFromHeader
          : items.length;

        return { items, total };
      },
    }),

    /* ---------------------------------------------------------
     * GET /admin/services/:id
     *  - locale opsiyonel query param
     * --------------------------------------------------------- */
    getServiceAdmin: build.query<
      ServiceDto,
      { id: string; locale?: string }
    >({
      query: ({ id, locale }) => ({
        url: `/admin/services/${encodeURIComponent(id)}`,
        method: "GET",
        credentials: "include",
        params: locale ? { locale } : undefined,
      }),
      transformResponse: (resp: ApiServiceAdmin) => normalizeService(resp),
    }),

    /* ---------------------------------------------------------
     * GET /admin/services/by-slug/:slug
     * (İstersen sonra buna da locale ekleriz)
     * --------------------------------------------------------- */
    getServiceBySlugAdmin: build.query<ServiceDto, string>({
      query: (slug) => ({
        url: `/admin/services/by-slug/${encodeURIComponent(slug)}`,
        method: "GET",
        credentials: "include",
      }),
      transformResponse: (resp: ApiServiceAdmin) => normalizeService(resp),
    }),

    /* ---------------------------------------------------------
     * POST /admin/services
     * --------------------------------------------------------- */
    createServiceAdmin: build.mutation<ServiceDto, ServiceCreatePayload>({
      query: (body) => ({
        url: "/admin/services",
        method: "POST",
        body,
        credentials: "include",
      }),
      transformResponse: (resp: ApiServiceAdmin) => normalizeService(resp),
    }),

    /* ---------------------------------------------------------
     * PATCH /admin/services/:id
     * --------------------------------------------------------- */
    updateServiceAdmin: build.mutation<
      ServiceDto,
      { id: string; patch: ServiceUpdatePayload }
    >({
      query: ({ id, patch }) => ({
        url: `/admin/services/${encodeURIComponent(id)}`,
        method: "PATCH",
        body: patch,
        credentials: "include",
      }),
      transformResponse: (resp: ApiServiceAdmin) => normalizeService(resp),
    }),

    /* ---------------------------------------------------------
     * DELETE /admin/services/:id
     * 204 No Content
     * --------------------------------------------------------- */
    deleteServiceAdmin: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/admin/services/${encodeURIComponent(id)}`,
        method: "DELETE",
        credentials: "include",
      }),
    }),

    /* ---------------------------------------------------------
     * REORDER: POST /admin/services/reorder
     *  - Categories'deki pattern ile aynı
     *  - Body: { items: [{ id, display_order }, ...] }
     * --------------------------------------------------------- */
    reorderServicesAdmin: build.mutation<
      void,
      { items: { id: string; display_order: number }[] }
    >({
      query: (body) => ({
        url: "/admin/services/reorder",
        method: "POST",
        body,
        credentials: "include",
      }),
    }),

    /* ---------------------------------------------------------
     * GALLERY – LIST: GET /admin/services/:id/images
     * --------------------------------------------------------- */
    listServiceImagesAdmin: build.query<ServiceImageDto[], string>({
      query: (serviceId) => ({
        url: `/admin/services/${encodeURIComponent(serviceId)}/images`,
        method: "GET",
        credentials: "include",
      }),
      transformResponse: (response: ApiServiceImage[]) =>
        Array.isArray(response)
          ? response.map((row) => normalizeServiceImage(row))
          : [],
    }),

    /* ---------------------------------------------------------
     * GALLERY – CREATE: POST /admin/services/:id/images
     * Backend: liste döndürüyor (ilgili service'ın tüm image'ları)
     * --------------------------------------------------------- */
    createServiceImageAdmin: build.mutation<
      ServiceImageDto[],
      { serviceId: string; payload: ServiceImageCreatePayload }
    >({
      query: ({ serviceId, payload }) => ({
        url: `/admin/services/${encodeURIComponent(serviceId)}/images`,
        method: "POST",
        body: payload,
        credentials: "include",
      }),
      transformResponse: (response: ApiServiceImage[]) =>
        Array.isArray(response)
          ? response.map((row) => normalizeServiceImage(row))
          : [],
    }),

    /* ---------------------------------------------------------
     * GALLERY – UPDATE: PATCH /admin/services/:id/images/:imageId
     * Yine liste döner
     * --------------------------------------------------------- */
    updateServiceImageAdmin: build.mutation<
      ServiceImageDto[],
      { serviceId: string; imageId: string; patch: ServiceImageUpdatePayload }
    >({
      query: ({ serviceId, imageId, patch }) => ({
        url: `/admin/services/${encodeURIComponent(
          serviceId,
        )}/images/${encodeURIComponent(imageId)}`,
        method: "PATCH",
        body: patch,
        credentials: "include",
      }),
      transformResponse: (response: ApiServiceImage[]) =>
        Array.isArray(response)
          ? response.map((row) => normalizeServiceImage(row))
          : [],
    }),

    /* ---------------------------------------------------------
     * GALLERY – DELETE: DELETE /admin/services/:id/images/:imageId
     * Silme sonrası güncel liste döner
     * --------------------------------------------------------- */
    deleteServiceImageAdmin: build.mutation<
      ServiceImageDto[],
      { serviceId: string; imageId: string }
    >({
      query: ({ serviceId, imageId }) => ({
        url: `/admin/services/${encodeURIComponent(
          serviceId,
        )}/images/${encodeURIComponent(imageId)}`,
        method: "DELETE",
        credentials: "include",
      }),
      transformResponse: (response: ApiServiceImage[]) =>
        Array.isArray(response)
          ? response.map((row) => normalizeServiceImage(row))
          : [],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListServicesAdminQuery,
  useGetServiceAdminQuery,
  useGetServiceBySlugAdminQuery,
  useCreateServiceAdminMutation,
  useUpdateServiceAdminMutation,
  useDeleteServiceAdminMutation,
  useReorderServicesAdminMutation,      // 🔹 burada export edildi
  useListServiceImagesAdminQuery,
  useCreateServiceImageAdminMutation,
  useUpdateServiceImageAdminMutation,
  useDeleteServiceImageAdminMutation,
  useLazyListServicesAdminQuery, 
} = servicesAdminApi;
