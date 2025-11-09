import { baseApi } from "@/integrations/baseApi";
import type {
  ReferenceView,
  ReferenceListQuery,
  ListResponse,
  ReferenceImageListItem,
} from "@/integrations/endpoints/types/references";

function getTotal(meta: any): number {
  try {
    const v = meta?.response?.headers?.get?.("x-total-count");
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  } catch { return 0; }
}

export const referencesPublicApi = baseApi.injectEndpoints({
  endpoints: (b) => ({

    listReferencesPublic: b.query<ListResponse<ReferenceView>, ReferenceListQuery | void>({
      query: (q) => ({
        url: "/references",
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

    getReferencePublicById: b.query<ReferenceView, { id: string }>({
      query: ({ id }) => ({ url: `/references/${encodeURIComponent(id)}` }),
      providesTags: (_r, _e, a) => [{ type: "references" as const, id: a.id }],
    }),

    getReferencePublicBySlug: b.query<ReferenceView, { slug: string }>({
      query: ({ slug }) => ({ url: `/references/by-slug/${encodeURIComponent(slug)}` }),
      providesTags: (_r, _e, a) => [{ type: "references" as const, id: `slug:${a.slug}` }],
    }),

    listReferenceImagesPublic: b.query<ReferenceImageListItem[], { referenceId: string }>({
      query: ({ referenceId }) => ({ url: `/references/${encodeURIComponent(referenceId)}/images` }),
      providesTags: (_r, _e, a) => [{ type: "reference_images" as const, id: a.referenceId }],
    }),

  }),
});

export const {
  useListReferencesPublicQuery,
  useLazyListReferencesPublicQuery,
  useGetReferencePublicByIdQuery,
  useLazyGetReferencePublicByIdQuery,
  useGetReferencePublicBySlugQuery,
  useLazyGetReferencePublicBySlugQuery,
  useListReferenceImagesPublicQuery,
  useLazyListReferenceImagesPublicQuery,
} = referencesPublicApi as any;
