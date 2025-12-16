// =============================================================
// FILE: src/integrations/rtk/endpoints/admin/dashboard_admin.endpoints.ts
// Ensotek – Admin Dashboard Summary Endpoint
// =============================================================

import { baseApi } from "../../baseApi";
import type { DashboardSummaryDto } from "@/integrations/types/dashboard.types";

export const dashboardAdminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * GET /admin/dashboard/summary
     *
     * Backend sözleşmesi (örnek):
     *  {
     *    items: [
     *      { key: "products", label: "Ürünler", count: 42 },
     *      { key: "categories", label: "Kategoriler", count: 8 },
     *      ...
     *    ]
     *  }
     */
    getDashboardSummaryAdmin: build.query<DashboardSummaryDto, void>({
      query: () => ({
        url: "/admin/dashboard/summary",
        method: "GET",
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useGetDashboardSummaryAdminQuery } = dashboardAdminApi;
