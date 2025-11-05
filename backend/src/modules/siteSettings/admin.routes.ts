// =============================================================
// FILE: src/modules/siteSettings/admin.routes.ts
// =============================================================
import type { FastifyInstance } from "fastify";
import {
  adminListSiteSettings,
  adminGetSiteSettingByKey,
  adminCreateSiteSetting,
  adminUpdateSiteSetting,
  adminBulkUpsertSiteSettings,
  adminDeleteManySiteSettings,
  adminDeleteSiteSetting,
} from "./admin.controller";

const BASE = "/admin/site_settings";

export async function registerSiteSettingsAdmin(app: FastifyInstance) {
  // Read (admin görünümü için istersen public GET'leri de kullanabilirsin)
  app.get(`${BASE}`,        { config: { auth: true } }, adminListSiteSettings);
  app.get(`${BASE}/:key`,   { config: { auth: true } }, adminGetSiteSettingByKey);

  // Write
  app.post(`${BASE}`,       { config: { auth: true } }, adminCreateSiteSetting);
  app.put(`${BASE}/:key`,   { config: { auth: true } }, adminUpdateSiteSetting);

  // Bulk upsert
  app.post(`${BASE}/bulk-upsert`, { config: { auth: true } }, adminBulkUpsertSiteSettings);

  // Delete (filtreli toplu silme + tek kayıt silme)
  app.delete(`${BASE}`,     { config: { auth: true } }, adminDeleteManySiteSettings);
  app.delete(`${BASE}/:key`,{ config: { auth: true } }, adminDeleteSiteSetting);
}
