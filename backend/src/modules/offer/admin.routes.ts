// =============================================================
// FILE: src/modules/offer/admin.routes.ts
// Ensotek – Offer Module Admin Routes
//   - Auth + Admin guard
// =============================================================

import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { requireAuth } from "@/common/middleware/auth";
import { requireAdmin } from "@/common/middleware/roles";

import {
  listOffersAdmin,
  getOfferAdmin,
  createOfferAdmin,
  updateOfferAdmin,
  removeOfferAdmin,

  // ✅ yeni
  generateOfferPdfAdmin,
  sendOfferEmailAdmin,

  // eski (kalsın)
  sendOfferAdmin,
} from "./admin.controller";

const BASE = "/offers";

export async function registerOfferAdmin(app: FastifyInstance) {
  const adminGuard = async (req: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(req, reply);
    if (reply.sent) return;
    await requireAdmin(req, reply);
  };

  app.get(
    `${BASE}`,
    { preHandler: adminGuard, config: { auth: true, admin: true } },
    listOffersAdmin,
  );

  app.get(
    `${BASE}/:id`,
    { preHandler: adminGuard, config: { auth: true, admin: true } },
    getOfferAdmin,
  );

  app.post(
    `${BASE}`,
    { preHandler: adminGuard, config: { auth: true, admin: true } },
    createOfferAdmin,
  );

  app.patch(
    `${BASE}/:id`,
    { preHandler: adminGuard, config: { auth: true, admin: true } },
    updateOfferAdmin,
  );

  app.delete(
    `${BASE}/:id`,
    { preHandler: adminGuard, config: { auth: true, admin: true } },
    removeOfferAdmin,
  );

  // ✅ YENİ: sadece PDF üret
  app.post(
    `${BASE}/:id/pdf`,
    { preHandler: adminGuard, config: { auth: true, admin: true } },
    generateOfferPdfAdmin,
  );

  // ✅ YENİ: sadece email gönder
  app.post(
    `${BASE}/:id/email`,
    { preHandler: adminGuard, config: { auth: true, admin: true } },
    sendOfferEmailAdmin,
  );

  // eski: PDF üret + mail gönder
  app.post(
    `${BASE}/:id/send`,
    { preHandler: adminGuard, config: { auth: true, admin: true } },
    sendOfferAdmin,
  );
}
