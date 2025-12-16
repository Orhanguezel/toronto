// =============================================================
// FILE: src/modules/references/admin.routes.ts
// =============================================================
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { requireAuth } from "@/common/middleware/auth";
import { requireAdmin } from "@/common/middleware/roles";

import {
  listReferencesAdmin,
  getReferenceAdmin,
  getReferenceBySlugAdmin,
  createReferenceAdmin,
  updateReferenceAdmin,
  removeReferenceAdmin,
} from "./admin.controller";

const BASE = "/references";

export async function registerReferencesAdmin(app: FastifyInstance) {
  const adminGuard = async (req: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(req, reply);
    if (reply.sent) return;
    await requireAdmin(req, reply);
  };

  app.get(
    `${BASE}`,
    { preHandler: adminGuard, config: { auth: true, admin: true } },
    listReferencesAdmin,
  );
  app.get(
    `${BASE}/:id`,
    { preHandler: adminGuard, config: { auth: true, admin: true } },
    getReferenceAdmin,
  );
  app.get(
    `${BASE}/by-slug/:slug`,
    { preHandler: adminGuard, config: { auth: true, admin: true } },
    getReferenceBySlugAdmin,
  );

  app.post(
    `${BASE}`,
    { preHandler: adminGuard, config: { auth: true, admin: true } },
    createReferenceAdmin,
  );
  app.patch(
    `${BASE}/:id`,
    { preHandler: adminGuard, config: { auth: true, admin: true } },
    updateReferenceAdmin,
  );
  app.delete(
    `${BASE}/:id`,
    { preHandler: adminGuard, config: { auth: true, admin: true } },
    removeReferenceAdmin,
  );
}
