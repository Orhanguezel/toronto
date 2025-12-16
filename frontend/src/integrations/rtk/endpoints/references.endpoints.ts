// =============================================================
// FILE: src/integrations/rtk/endpoints/references.endpoints.ts
// Ensotek – References (public API) – LOCALE AWARE
// =============================================================

import { baseApi } from "../baseApi";
import type {
  ReferenceDto,
  ReferenceImageDto,
  ReferenceListQueryParams,
  ReferenceListResponse,
} from "@/integrations/types/references.types";

const serializeListQuery = (
  q?: ReferenceListQueryParams,
): Record<string, any> => {
  if (!q) return {};
  const {
    order,
    sort,
    orderDir,
    limit,
    offset,
    // public endpoint'te is_published zorunlu değil ama gönderilirse de sorun olmaz
    is_published,
    is_featured,
    q: search,
    slug,
    select,
    category_id,
    sub_category_id,
    module_key,
    has_website,
    locale,
  } = q;

  const params: Record<string, any> = {};

  if (order) params.order = order;
  if (sort) params.sort = sort;
  if (orderDir) params.orderDir = orderDir;
  if (typeof limit === "number") params.limit = limit;
  if (typeof offset === "number") params.offset = offset;

  if (typeof is_published !== "undefined") params.is_published = is_published;
  if (typeof is_featured !== "undefined") params.is_featured = is_featured;

  if (search) params.q = search;
  if (slug) params.slug = slug;
  if (select) params.select = select;
  if (category_id) params.category_id = category_id;
  if (sub_category_id) params.sub_category_id = sub_category_id;
  if (module_key) params.module_key = module_key;
  if (typeof has_website !== "undefined") params.has_website = has_website;
  if (locale) params.locale = locale;

  return params;
};

export const referencesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /* -------------------- LIST (public) -------------------- */
    listReferences: build.query<
      ReferenceListResponse,
      ReferenceListQueryParams | void
    >({
      query: (params?: ReferenceListQueryParams) => ({
        url: "/references",
        method: "GET",
        params: serializeListQuery(params),
      }),
      transformResponse: (
        response: ReferenceDto[],
        meta,
      ): ReferenceListResponse => {
        const totalHeader =
          (meta as any)?.response?.headers?.get("x-total-count") ?? "0";
        const total = Number(totalHeader) || (response?.length ?? 0);
        return { items: response ?? [], total };
      },
      providesTags: (result) =>
        result?.items
          ? [
            { type: "References", id: "LIST" },
            ...result.items.map((r: ReferenceDto) => ({
              type: "References" as const,
              id: r.id,
            })),
          ]
          : [{ type: "References", id: "LIST" }],
    }),

    /* -------------------- GET BY ID (public, locale-aware) -- */
    getReferenceById: build.query<
      ReferenceDto,
      { id: string; locale?: string } | string
    >({
      query: (arg) => {
        const id = typeof arg === "string" ? arg : arg.id;
        const locale =
          typeof arg === "object" && arg !== null && "locale" in arg
            ? (arg as { locale?: string }).locale
            : undefined;

        return {
          url: `/references/${encodeURIComponent(id)}`,
          method: "GET",
          params: locale ? { locale } : undefined,
        };
      },
      providesTags: (_res, _err, arg) => {
        const id = typeof arg === "string" ? arg : arg.id;
        return [{ type: "References", id }];
      },
    }),

    /* -------------------- GET BY SLUG (public, locale-aware) */
    getReferenceBySlug: build.query<
      ReferenceDto,
      { slug: string; locale?: string } | string
    >({
      query: (arg) => {
        const slug = typeof arg === "string" ? arg : arg.slug;
        const locale =
          typeof arg === "object" && arg !== null && "locale" in arg
            ? (arg as { locale?: string }).locale
            : undefined;

        return {
          url: `/references/by-slug/${encodeURIComponent(slug)}`,
          method: "GET",
          params: locale ? { locale } : undefined,
        };
      },
      providesTags: (res) =>
        res?.id ? [{ type: "References", id: res.id }] : [],
    }),

    /* -------------------- LIST IMAGES (public) -------------- */
    listReferenceImages: build.query<ReferenceImageDto[], string>({
      query: (referenceId) => ({
        url: `/references/${encodeURIComponent(referenceId)}/images`,
        method: "GET",
      }),
      providesTags: (_res, _err, referenceId) => [
        { type: "ReferenceImages", id: referenceId },
      ],
    }),
  }),

  overrideExisting: false,
});

export const {
  useListReferencesQuery,
  useGetReferenceByIdQuery,
  useGetReferenceBySlugQuery,
  useListReferenceImagesQuery,
} = referencesApi;
