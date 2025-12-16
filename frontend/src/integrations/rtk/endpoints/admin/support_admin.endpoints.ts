// =============================================================
// FILE: src/integrations/rtk/endpoints/admin/support_admin.endpoints.ts
// Ensotek – Admin Support Tickets (RTK Query)
// Backend: src/modules/support/admin.routes.ts
// =============================================================

import { baseApi } from "@/integrations/rtk/baseApi";

import type {
  AdminSupportTicketDto,
  AdminSupportTicketListQueryParams,
  AdminSupportTicketListResponse,
  SupportTicketUpdatePayload,
} from "@/integrations/types/support.types";

// -------------------- Arg tipleri --------------------

type GetTicketArgs = { id: string };

type UpdateTicketArgs = {
  id: string;
  patch: SupportTicketUpdatePayload;
};

type DeleteTicketArgs = { id: string };

/**
 * Backend:
 *  POST /admin/support_tickets/:id/:action
 *  action ∈ ["close","reopen"]  (adminActionSchema)
 */
type ToggleTicketArgs = {
  id: string;
  action: "close" | "reopen";
};

// =============================================================
// RTK endpoints
// =============================================================

export const supportAdminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // -------- Ticket list (admin) --------
    // GET /admin/support_tickets
    listSupportTicketsAdmin: builder.query<
      AdminSupportTicketListResponse,
      AdminSupportTicketListQueryParams | undefined
    >({
      query: (params) => ({
        url: "/admin/support_tickets",
        method: "GET",
        params: params ?? undefined,
      }),
      transformResponse: (
        response: AdminSupportTicketDto[],
        meta,
      ): AdminSupportTicketListResponse => {
        const items = response ?? [];
        const header =
          (meta as any)?.response?.headers?.get?.("x-total-count") ??
          (meta as any)?.response?.headers?.get?.("X-Total-Count");
        const total = header ? Number(header) || items.length : items.length;
        return { items, total };
      },
    }),

    // -------- Ticket detail (admin) --------
    // GET /admin/support_tickets/:id
    getSupportTicketAdmin: builder.query<AdminSupportTicketDto, GetTicketArgs>({
      query: ({ id }) => ({
        url: `/admin/support_tickets/${encodeURIComponent(id)}`,
        method: "GET",
      }),
    }),

    // -------- Ticket update (admin) --------
    // PATCH /admin/support_tickets/:id
    updateSupportTicketAdmin: builder.mutation<
      AdminSupportTicketDto,
      UpdateTicketArgs
    >({
      query: ({ id, patch }) => ({
        url: `/admin/support_tickets/${encodeURIComponent(id)}`,
        method: "PATCH",
        body: patch,
      }),
    }),

    // -------- Ticket delete (admin) --------
    // DELETE /admin/support_tickets/:id
    deleteSupportTicketAdmin: builder.mutation<void, DeleteTicketArgs>({
      query: ({ id }) => ({
        url: `/admin/support_tickets/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
    }),

    // -------- Ticket status toggle (admin) --------
    // POST /admin/support_tickets/:id/:action
    //   action = "close" | "reopen"
    toggleSupportTicketAdmin: builder.mutation<
      AdminSupportTicketDto,
      ToggleTicketArgs
    >({
      query: ({ id, action }) => ({
        url: `/admin/support_tickets/${encodeURIComponent(
          id,
        )}/${encodeURIComponent(action)}`,
        method: "POST",
      }),
    }),
  }),
  overrideExisting: true,
});

// =============================================================
// Hooks
// =============================================================

export const {
  useListSupportTicketsAdminQuery,
  useGetSupportTicketAdminQuery,
  useUpdateSupportTicketAdminMutation,
  useDeleteSupportTicketAdminMutation,
  useToggleSupportTicketAdminMutation,
} = supportAdminApi;
