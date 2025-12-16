// =============================================================
// FILE: src/integrations/types/support.types.ts
// Support Ticket & Replies – Shared DTO + Payload Types
// =============================================================

export type SupportTicketStatus =
  | "open"
  | "in_progress"
  | "waiting_response"
  | "closed";

export type SupportTicketPriority = "low" | "medium" | "high" | "urgent";

// --- Ticket DTO ---

export interface SupportTicketDto {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string

  // Admin tarafında göstermek için opsiyonel alanlar
  user_display_name?: string | null;
  user_email?: string | null;
}

// --- List query / response ---

export interface SupportTicketListQueryParams {
  user_id?: string;
  status?: SupportTicketStatus;
  priority?: SupportTicketPriority;
  q?: string;
  limit?: number;
  offset?: number;
  sort?: "created_at" | "updated_at";
  order?: "asc" | "desc";
}

export interface SupportTicketListResponse {
  items: SupportTicketDto[];
  total: number;
}

// --- Create / Update payloads ---

export interface SupportTicketCreatePayload {
  user_id: string;
  subject: string;
  message: string;
  priority?: SupportTicketPriority;
}

export interface SupportTicketUpdatePayload {
  subject?: string;
  message?: string;
  status?: SupportTicketStatus;
  priority?: SupportTicketPriority;
}

// --- Replies DTO / payloads ---

export interface TicketReplyDto {
  id: string;
  ticket_id: string;
  user_id: string | null;
  message: string;
  is_admin: boolean;
  created_at: string; // ISO datetime string
}

/**
 * Public reply create payload
 * Backend şeması: createReplyBodySchema
 *  - ticket_id: uuid
 *  - user_id?: uuid | null
 *  - message: string
 *  - is_admin?: boolean (ama controller rol'e göre override ediyor)
 */
export interface TicketReplyCreatePayload {
  ticket_id: string;
  user_id?: string | null;
  message: string;
  // is_admin istemciden gönderilse bile backend admin/user'a göre set ediyor
  is_admin?: boolean;
}

/**
 * Admin reply create payload
 * Backend şeması: adminCreateReplyBodySchema
 *  - ticket_id: uuid
 *  - user_id?: uuid | null
 *  - message: string
 */
export interface TicketReplyAdminCreatePayload {
  ticket_id: string;
  user_id?: string | null;
  message: string;
}

// --- Admin alias'lar (semantic clarity için) ---

export type AdminSupportTicketDto = SupportTicketDto;
export type AdminSupportTicketListQueryParams = SupportTicketListQueryParams;
export type AdminSupportTicketListResponse = SupportTicketListResponse;

export type AdminTicketReplyDto = TicketReplyDto;
