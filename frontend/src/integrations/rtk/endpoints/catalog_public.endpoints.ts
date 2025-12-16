// =============================================================
// FILE: src/integrations/rtk/endpoints/public/catalog_public.endpoints.ts
// Ensotek – Public Catalog Requests (RTK Query)
// =============================================================

import { baseApi } from "@/integrations/rtk/baseApi";
import type {
    CreateCatalogRequestPublicBody,
    CreateCatalogRequestPublicResponse,
} from "@/integrations/types/catalog_public.types";

const BASE = "catalog-requests";

export const catalogPublicApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        /**
         * POST /catalog-requests
         * - creates request
         * - notifies admin (mail + notification)
         * - DOES NOT send customer mail
         */
        createCatalogRequestPublic: build.mutation<
            CreateCatalogRequestPublicResponse,
            CreateCatalogRequestPublicBody
        >({
            query: (body) => ({
                url: `${BASE}`,
                method: "POST",
                body,
            }),
        }),
    }),
});

export const { useCreateCatalogRequestPublicMutation } = catalogPublicApi;
