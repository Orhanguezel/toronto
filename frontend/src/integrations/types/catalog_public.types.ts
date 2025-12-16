// =============================================================
// FILE: src/integrations/types/catalog_public.types.ts
// Ensotek – Public Catalog Request Types
// =============================================================

export type BoolLike = boolean | 0 | 1 | "0" | "1" | "true" | "false";

export type CreateCatalogRequestPublicBody = {
    locale?: string;
    country_code?: string; // backend upper-case transform ediyor

    customer_name: string;
    company_name?: string | null;

    email: string;
    phone?: string | null;

    message?: string | null;

    consent_marketing?: BoolLike;
    consent_terms: BoolLike; // zorunlu
};

/**
 * Public POST response:
 * Controller: reply.send(row ?? { id })
 * Normalde row döner (CatalogRequestDto)
 */
export type CatalogRequestStatus = "new" | "sent" | "failed" | "archived";

export type CatalogRequestDto = {
    id: string;

    status: CatalogRequestStatus;

    locale: string | null;
    country_code: string | null;

    customer_name: string;
    company_name: string | null;

    email: string;
    phone: string | null;

    message: string | null;

    consent_marketing: number; // tinyint
    consent_terms: number; // tinyint

    admin_notes: string | null;

    email_sent_at: string | null; // ISO
    created_at: string; // ISO
    updated_at: string; // ISO
};

export type CreateCatalogRequestPublicResponse = CatalogRequestDto | { id: string };
