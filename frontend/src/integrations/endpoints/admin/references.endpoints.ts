import { baseApi } from '@/integrations/baseApi';

type Reference = { id: string; name: string; logo_url: string; url?: string | null; order: number };

enum Tags { References = 'references' }

export const referencesAdminApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    list: b.query<Reference[], { q?: string }>({
      query: (p) => ({ url: '/admin/references', params: p }),
      providesTags: [Tags.References],
    }),
    create: b.mutation<{ id: string }, Omit<Reference, 'id'>>({
      query: (body) => ({ url: '/admin/references', method: 'POST', body }),
      invalidatesTags: [Tags.References],
    }),
    update: b.mutation<{ ok: true }, { id: string } & Partial<Reference>>({
      query: ({ id, ...body }) => ({ url: `/admin/references/${id}`, method: 'PUT', body }),
      invalidatesTags: [Tags.References],
    }),
    remove: b.mutation<{ ok: true }, { id: string }>({
      query: ({ id }) => ({ url: `/admin/references/${id}`, method: 'DELETE' }),
      invalidatesTags: [Tags.References],
    }),
  }),
});

export const { useListQuery: useReferencesList, useCreateMutation: useCreateReference, useUpdateMutation: useUpdateReference, useRemoveMutation: useRemoveReference } = referencesAdminApi as any;