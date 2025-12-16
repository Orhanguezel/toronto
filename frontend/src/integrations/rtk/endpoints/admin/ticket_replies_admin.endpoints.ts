// =============================================================
// FILE: src/integrations/rtk/endpoints/admin/ticket_replies_admin.endpoints.ts
// Admin – Ticket Replies RTK Endpoints
// Backend: src/modules/support/admin.routes.ts (REPLIES_BASE)
// =============================================================

import { baseApi } from "../../baseApi";
import type {
  TicketReplyDto,
  TicketReplyAdminCreatePayload,
} from "@/integrations/types/support.types";

export const ticketRepliesAdminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // GET /admin/ticket_replies/by-ticket/:ticketId
    listTicketRepliesAdmin: build.query<TicketReplyDto[], string>({
      query: (ticketId) => ({
        url: `/admin/ticket_replies/by-ticket/${encodeURIComponent(
          ticketId,
        )}`,
        method: "GET",
      }),
    }),

    // POST /admin/ticket_replies
    createTicketReplyAdmin: build.mutation<
      TicketReplyDto,
      TicketReplyAdminCreatePayload
    >({
      query: (body) => ({
        url: "/admin/ticket_replies",
        method: "POST",
        body,
      }),
    }),

    // DELETE /admin/ticket_replies/:id
    deleteTicketReplyAdmin: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/admin/ticket_replies/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useListTicketRepliesAdminQuery,
  useCreateTicketReplyAdminMutation,
  useDeleteTicketReplyAdminMutation,
} = ticketRepliesAdminApi;
