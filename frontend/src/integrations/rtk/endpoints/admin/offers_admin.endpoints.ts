// =============================================================
// FILE: src/integrations/rtk/endpoints/admin/offers_admin.endpoints.ts
// ADMIN – Offer CRUD + PDF + EMAIL (ayrı)
// =============================================================

import { baseApi } from "../../baseApi";
import type { OfferAdminPayload, OfferListQuery, OfferRow } from "@/integrations/types/offers.types";

export const offersAdminApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        // LIST
        listOffersAdmin: build.query<OfferRow[], OfferListQuery | void>({
            query: (params?: OfferListQuery) => ({
                url: "admin/offers",
                method: "GET",
                params,
            }),
            providesTags: ["Offers"],
        }),

        // DETAIL
        getOfferAdmin: build.query<OfferRow, string>({
            query: (id) => ({
                url: `admin/offers/${id}`,
                method: "GET",
            }),
            providesTags: (r, e, id) => [{ type: "Offers", id }],
        }),

        // CREATE
        createOfferAdmin: build.mutation<OfferRow, OfferAdminPayload>({
            query: (body) => ({
                url: `admin/offers`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["Offers"],
        }),

        // UPDATE (PATCH)
        updateOfferAdmin: build.mutation<OfferRow, { id: string; body: Partial<OfferAdminPayload> }>({
            query: ({ id, body }) => ({
                url: `admin/offers/${id}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: (r, e, { id }) => [{ type: "Offers", id }],
        }),

        // DELETE
        removeOfferAdmin: build.mutation<{ success: boolean }, string>({
            query: (id) => ({
                url: `admin/offers/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Offers"],
        }),

        // ✅ PDF GENERATE (sadece pdf üretir + offer.pdf_url günceller)
        generateOfferPdfAdmin: build.mutation<OfferRow, { id: string }>({
            query: ({ id }) => ({
                url: `admin/offers/${id}/pdf`,
                method: "POST",
            }),
            invalidatesTags: (r, e, { id }) => [{ type: "Offers", id }, "Offers"],
        }),

        // ✅ EMAIL SEND (sadece email gönderir; pdf_url var olmalı)
        sendOfferEmailAdmin: build.mutation<OfferRow, { id: string }>({
            query: ({ id }) => ({
                url: `admin/offers/${id}/email`,
                method: "POST",
            }),
            invalidatesTags: (r, e, { id }) => [{ type: "Offers", id }, "Offers"],
        }),
    }),
});

export const {
    useListOffersAdminQuery,
    useLazyGetOfferAdminQuery,
    useGetOfferAdminQuery,
    useCreateOfferAdminMutation,
    useUpdateOfferAdminMutation,
    useRemoveOfferAdminMutation,

    // ✅ yeni hook’lar
    useGenerateOfferPdfAdminMutation,
    useSendOfferEmailAdminMutation,
} = offersAdminApi;
