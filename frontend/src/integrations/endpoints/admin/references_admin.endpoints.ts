import { baseApi } from "@/integrations/baseApi";
import type {
  ReferenceView,
  ReferenceListQuery,
  ListResponse,
  UpsertReferenceBody,
  PatchReferenceBody,
  ReferenceImageListItem,
  UpsertReferenceImageBody,
  PatchReferenceImageBody,
} from "@/integrations/endpoints/types/references";

function getTotal(meta: any): number {
  try {
    const v = meta?.response?.headers?.get?.("x-total-count");
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  } catch { return 0; }
}

export const referencesAdminApi = baseApi.injectEndpoints({
  endpoints: (b) => ({

    // ------------- references -------------
    listReferencesAdmin: b.query<ListResponse<ReferenceView>, ReferenceListQuery | void>({
      query: (q) => ({
        url: "/admin/references",
        params: q ? { ...q } : undefined,
      }),
      transformResponse: (items: ReferenceView[], meta) => ({
        items,
        total: getTotal(meta),
      }),
      providesTags: (r) => [
        { type: "references" as const },
        ...(r?.items?.map?.((x) => ({ type: "references" as const, id: x.id })) ?? []),
      ],
    }),

    getReferenceAdminById: b.query<ReferenceView, { id: string }>({
      query: ({ id }) => ({ url: `/admin/references/${encodeURIComponent(id)}` }),
      providesTags: (_r, _e, a) => [{ type: "references" as const, id: a.id }],
    }),

    getReferenceAdminBySlug: b.query<ReferenceView, { slug: string }>({
      query: ({ slug }) => ({ url: `/admin/references/by-slug/${encodeURIComponent(slug)}` }),
      providesTags: (_r, _e, a) => [{ type: "references" as const, id: `slug:${a.slug}` }],
    }),

    createReferenceAdmin: b.mutation<ReferenceView, { body: UpsertReferenceBody }>({
      query: ({ body }) => ({
        url: "/admin/references",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "references" as const }],
    }),

    updateReferenceAdmin: b.mutation<ReferenceView, { id: string; body: PatchReferenceBody }>({
      query: ({ id, body }) => ({
        url: `/admin/references/${encodeURIComponent(id)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, a) => [
        { type: "references" as const },
        { type: "references" as const, id: a.id },
      ],
    }),

    removeReferenceAdmin: b.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/admin/references/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, a) => [
        { type: "references" as const },
        { type: "references" as const, id: a.id },
      ],
    }),

    // ------------- gallery -------------
    listReferenceImagesAdmin: b.query<ReferenceImageListItem[], { referenceId: string }>({
      query: ({ referenceId }) => ({
        url: `/admin/references/${encodeURIComponent(referenceId)}/images`,
      }),
      providesTags: (_r, _e, a) => [{ type: "reference_images" as const, id: a.referenceId }],
    }),

    createReferenceImageAdmin: b.mutation<ReferenceImageListItem[], { referenceId: string; body: UpsertReferenceImageBody }>({
      query: ({ referenceId, body }) => ({
        url: `/admin/references/${encodeURIComponent(referenceId)}/images`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, a) => [
        { type: "reference_images" as const, id: a.referenceId },
        { type: "references" as const, id: a.referenceId },
      ],
    }),

    updateReferenceImageAdmin: b.mutation<ReferenceImageListItem[], { referenceId: string; imageId: string; body: PatchReferenceImageBody }>({
      query: ({ referenceId, imageId, body }) => ({
        url: `/admin/references/${encodeURIComponent(referenceId)}/images/${encodeURIComponent(imageId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, a) => [
        { type: "reference_images" as const, id: a.referenceId },
        { type: "references" as const, id: a.referenceId },
      ],
    }),

    removeReferenceImageAdmin: b.mutation<void, { referenceId: string; imageId: string }>({
      query: ({ referenceId, imageId }) => ({
        url: `/admin/references/${encodeURIComponent(referenceId)}/images/${encodeURIComponent(imageId)}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, a) => [
        { type: "reference_images" as const, id: a.referenceId },
        { type: "references" as const, id: a.referenceId },
      ],
    }),

  }),
});

export const {
  useListReferencesAdminQuery,
  useLazyListReferencesAdminQuery,
  useGetReferenceAdminByIdQuery,
  useLazyGetReferenceAdminByIdQuery,
  useGetReferenceAdminBySlugQuery,
  useLazyGetReferenceAdminBySlugQuery,
  useCreateReferenceAdminMutation,
  useUpdateReferenceAdminMutation,
  useRemoveReferenceAdminMutation,

  useListReferenceImagesAdminQuery,
  useLazyListReferenceImagesAdminQuery,
  useCreateReferenceImageAdminMutation,
  useUpdateReferenceImageAdminMutation,
  useRemoveReferenceImageAdminMutation,
} = referencesAdminApi as any;
