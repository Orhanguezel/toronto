// =============================================================
// FILE: src/integrations/rtk/endpoints/admin/footer_sections_admin.endpoints.ts
// Ensotek – Admin Footer Sections RTK endpoints
// =============================================================

import { baseApi } from "../../baseApi";
import type {
  ApiFooterSection,
  FooterSectionDto,
  FooterSectionListQueryParams,
  FooterSectionListResult,
  FooterSectionCreatePayload,
  FooterSectionUpdatePayload,
} from "@/integrations/types/footer_sections.types";

const asStr = (v: unknown): string =>
  typeof v === "string" ? v : String(v ?? "");

const isTrue = (v: unknown): boolean =>
  v === true || v === 1 || v === "1" || v === "true";

const normalizeFooterSection = (r: ApiFooterSection): FooterSectionDto => ({
  id: asStr(r.id),
  is_active: isTrue(r.is_active),
  display_order: typeof r.display_order === "number" ? r.display_order : 0,
  created_at: asStr(r.created_at),
  updated_at: asStr(r.updated_at),
  title: r.title ?? "",
  slug: r.slug ?? "",
  description: r.description ?? null,
  locale: r.locale_resolved ?? null,
});

export const footerSectionsAdminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * GET /admin/footer_sections
     * Query: FooterSectionListQueryParams
     * Response: body -> ApiFooterSection[], header -> x-total-count
     */
    listFooterSectionsAdmin: build.query<
      FooterSectionListResult,
      FooterSectionListQueryParams | void
    >({
      query: (params?: FooterSectionListQueryParams) => ({
        url: "/admin/footer_sections",
        method: "GET",
        params,
      }),
      transformResponse: (
        response: ApiFooterSection[],
        meta,
      ): FooterSectionListResult => {
        const items = (response || []).map(normalizeFooterSection);
        const header = meta?.response?.headers.get("x-total-count");
        const total = header != null ? Number(header) || items.length : items.length;
        return { items, total };
      },
    }),

    /**
     * GET /admin/footer_sections/:id
     */
    getFooterSectionAdmin: build.query<FooterSectionDto, string>({
      query: (id) => ({
        url: `/admin/footer_sections/${encodeURIComponent(id)}`,
        method: "GET",
      }),
      transformResponse: (response: ApiFooterSection) =>
        normalizeFooterSection(response),
    }),

    /**
     * GET /admin/footer_sections/by-slug/:slug
     */
    getFooterSectionBySlugAdmin: build.query<FooterSectionDto, string>({
      query: (slug) => ({
        url: `/admin/footer_sections/by-slug/${encodeURIComponent(slug)}`,
        method: "GET",
      }),
      transformResponse: (response: ApiFooterSection) =>
        normalizeFooterSection(response),
    }),

    /**
     * POST /admin/footer_sections
     */
    createFooterSectionAdmin: build.mutation<
      FooterSectionDto,
      FooterSectionCreatePayload
    >({
      query: (body) => ({
        url: "/admin/footer_sections",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiFooterSection) =>
        normalizeFooterSection(response),
    }),

    /**
     * PATCH /admin/footer_sections/:id
     */
    updateFooterSectionAdmin: build.mutation<
      FooterSectionDto,
      { id: string; data: FooterSectionUpdatePayload }
    >({
      query: ({ id, data }) => ({
        url: `/admin/footer_sections/${encodeURIComponent(id)}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: ApiFooterSection) =>
        normalizeFooterSection(response),
    }),

    /**
     * DELETE /admin/footer_sections/:id
     */
    deleteFooterSectionAdmin: build.mutation<void, string>({
      query: (id) => ({
        url: `/admin/footer_sections/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useListFooterSectionsAdminQuery,
  useGetFooterSectionAdminQuery,
  useGetFooterSectionBySlugAdminQuery,
  useCreateFooterSectionAdminMutation,
  useUpdateFooterSectionAdminMutation,
  useDeleteFooterSectionAdminMutation,
} = footerSectionsAdminApi;
