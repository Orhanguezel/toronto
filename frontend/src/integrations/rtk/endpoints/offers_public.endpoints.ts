// =============================================================
// FILE: src/integrations/rtk/endpoints/offers_public.endpoints.ts
// Ensotek – PUBLIC Offers API (Teklif Talebi Gönderme)
//   - POST /offers → OfferRequestPublic
// =============================================================

import { baseApi } from "../baseApi";
import type {
    OfferRequestPublic,
    OfferRow,
} from "@/integrations/types/offers.types";

export const offersApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        // PUBLIC – Teklif talebi oluşturma
        createOfferPublic: build.mutation<OfferRow, OfferRequestPublic>({
            query: (body) => ({
                url: "/offers",
                method: "POST",
                body,
            }),
        }),
    }),
    overrideExisting: false,
});

export const { useCreateOfferPublicMutation } = offersApi;
