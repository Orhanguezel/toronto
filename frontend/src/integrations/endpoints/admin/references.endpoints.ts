// src/integrations/endpoints/admin/references.admin.endpoints.ts
import { baseApi } from '@/integrations/baseApi';

export type Reference = {
  id: string;
  name: string;
  logo_url: string;
  url?: string | null;
  order: number;
};

export const referencesAdminApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    list: b.query<Reference[], { q?: string } | void>({
      query: (p) =>
        p && Object.keys(p).length
          ? { url: '/admin/references', params: p }
          : { url: '/admin/references' },
      providesTags: ['References'] as const,
    }),

    create: b.mutation<{ id: string }, Omit<Reference, 'id'>>({
      query: (body) => ({ url: '/admin/references', method: 'POST', body }),
      invalidatesTags: ['References'] as const,
    }),

    update: b.mutation<{ ok: true }, { id: string } & Partial<Reference>>({
      query: ({ id, ...body }) => ({ url: `/admin/references/${id}`, method: 'PUT', body }),
      invalidatesTags: ['References'] as const,
    }),

    remove: b.mutation<{ ok: true }, { id: string }>({
      query: ({ id }) => ({ url: `/admin/references/${id}`, method: 'DELETE' }),
      invalidatesTags: ['References'] as const,
    }),
  }),
  overrideExisting: false,
});

// Hook'ları kullandığın kısa isimlerle export et
export const {
  useListQuery: useReferencesList,
  useCreateMutation: useCreateReference,
  useUpdateMutation: useUpdateReference,
  useRemoveMutation: useRemoveReference,
} = referencesAdminApi;
