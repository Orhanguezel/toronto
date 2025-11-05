import { baseApi } from '@/integrations/baseApi';
export const contactAdminApi = baseApi.injectEndpoints({
  endpoints: (b)=> ({
    list: b.query<{ items:any[]; total:number; page:number; pageSize:number }, { page?:number; pageSize?:number }>({
      query: (p) => ({ url: '/admin/contact-messages', params: p })
    }),
    handle: b.mutation<{ ok:true }, { id:string }>({ query: ({ id }) => ({ url: `/admin/contact-messages/${id}/handle`, method: 'POST' }) })
  })
});
export const { useListQuery: useContactList, useHandleMutation: useContactHandle } = contactAdminApi as any;