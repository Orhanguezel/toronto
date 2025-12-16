// =============================================================
// FILE: src/integrations/rtk/endpoints/contacts.endpoints.ts
// Public contact form – POST /contacts
// =============================================================

import { baseApi } from "@/integrations/rtk/baseApi";
import type {
  ContactDto,
  Contact,
  ContactCreatePayload,
} from "@/integrations/types/contacts.types";
import { normalizeContact } from "@/integrations/types/contacts.types";

export const contactsPublicApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * PUBLIC: Contact form gönderimi
     * POST /contacts
     */
    createContactPublic: build.mutation<Contact, ContactCreatePayload>({
      query: (body) => ({
        url: "/contacts",
        method: "POST",
        body,
      }),
      transformResponse: (dto: ContactDto) => normalizeContact(dto),
    }),
  }),
  overrideExisting: false,
});

export const { useCreateContactPublicMutation } = contactsPublicApi;
