// =============================================================
// FILE: src/integrations/types/offers.types.ts
// Ensotek – Offer Module Types (FE için sade modeller)
// =============================================================

export type OfferStatus =
    | "new"
    | "in_review"
    | "quoted"
    | "sent"
    | "accepted"
    | "rejected"
    | "cancelled";

export interface OfferFormData {
    [key: string]: any;
}

export interface OfferRow {
    id: string;
    offer_no: string | null;
    status: OfferStatus;

    locale: string | null;
    country_code: string | null;

    customer_name: string;
    company_name: string | null;
    email: string;
    phone: string | null;

    subject: string | null;
    message: string | null;

    product_id: string | null;

    /**
     * Backend bazı response’larda form_data’yı string olarak tutabilir (DB string).
     * Ayrıca repository getOfferById “form_data_parsed” (object) döndürüyor.
     * Bu yüzden FE tarafında esnek tutuyoruz.
     */
    form_data: OfferFormData | string | null;
    form_data_parsed?: OfferFormData | null;

    consent_marketing: number;
    consent_terms: number;

    currency: string;
    net_total: number | null;
    vat_rate: number | null;
    vat_total: number | null;
    shipping_total: number | null;
    gross_total: number | null;

    valid_until: string | null;

    admin_notes: string | null;

    pdf_url: string | null;
    pdf_asset_id: string | null;

    email_sent_at: string | null;

    created_at: string;
    updated_at: string;
}

export interface OfferListQuery {
    sort?: "created_at" | "updated_at";
    orderDir?: "asc" | "desc";
    offset?: number;
    limit?: number;

    status?: OfferStatus;
    locale?: string;
    country_code?: string;

    q?: string;
    email?: string;
    product_id?: string;

    created_from?: string;
    created_to?: string;
}

export interface OfferRequestPublic {
    locale?: string;
    country_code?: string;
    customer_name: string;
    company_name?: string | null;
    email: string;
    phone?: string | null;
    subject?: string | null;
    message?: string | null;
    product_id?: string | null;
    form_data?: Record<string, any>;
    consent_marketing?: boolean | number | string;
    consent_terms?: boolean | number | string;
}

export interface OfferAdminPayload extends OfferRequestPublic {
    status?: OfferStatus;

    currency?: string;
    net_total?: number | null;
    vat_rate?: number | null;
    vat_total?: number | null;
    shipping_total?: number | null;
    gross_total?: number | null;

    offer_no?: string | null;
    valid_until?: string | null;

    admin_notes?: string | null;

    pdf_url?: string | null;
    pdf_asset_id?: string | null;

    // read-only gibi düşün; backend set edecek
    email_sent_at?: string | null;
}
