// src/modules/auth/admin.routes.ts
import type { FastifyInstance } from "fastify";
import { makeAdminController } from "./admin.controller";
import { requireAuth } from "@/common/middleware/auth";

export async function registerUserAdmin(app: FastifyInstance) {
  const c = makeAdminController(app);

  const BASE = "/admin/users";

  app.get(`${BASE}`, { preHandler: [requireAuth] }, c.list);
  app.get(`${BASE}/:id`, { preHandler: [requireAuth] }, c.get);

  app.patch(`${BASE}/:id`, { preHandler: [requireAuth] }, c.update);
  app.post(`${BASE}/:id/active`, { preHandler: [requireAuth] }, c.setActive);
  app.post(`${BASE}/:id/roles`, { preHandler: [requireAuth] }, c.setRoles);

  app.delete(`${BASE}/:id`, { preHandler: [requireAuth] }, c.remove);
}