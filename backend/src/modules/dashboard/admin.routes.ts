// ===================================================================
// FILE: src/modules/dashboard/admin.routes.ts
// Ensotek – Admin Dashboard Routes (Admin)
// ===================================================================

import type { FastifyInstance } from "fastify";
import { requireAuth } from "@/common/middleware/auth";
import { getDashboardSummaryAdmin } from "./admin.controller";

const BASE = "/dashboard";

export async function registerDashboardAdmin(app: FastifyInstance) {
  // GET /api/admin/dashboard/summary
  app.get(
    `${BASE}/summary`,
    { preHandler: [requireAuth] },
    getDashboardSummaryAdmin,
  );
}
