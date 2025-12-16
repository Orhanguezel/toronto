// src/modules/siteSettings/admin.routes.ts

import type { FastifyInstance } from "fastify";
import {
  adminGetSettingsAggregate,
  adminUpsertSettingsAggregate,
  // (opsiyonel) granular uçlar:
  adminListSiteSettings,
  adminGetSiteSettingByKey,
  adminCreateSiteSetting,
  adminUpdateSiteSetting,
  adminBulkUpsertSiteSettings,
  adminDeleteManySiteSettings,
  adminDeleteSiteSetting,
} from "./admin.controller";

const BASE = "/site-settings"; // hyphen

export async function registerSiteSettingsAdmin(app: FastifyInstance) {
  // FE'nin kullandığı aggregate uçlar:
  app.get(`${BASE}`, { config: { auth: true } }, adminGetSettingsAggregate);
  app.put(`${BASE}`, { config: { auth: true } }, adminUpsertSettingsAggregate);

  // Granular uçlar:
  app.get(`${BASE}/list`, { config: { auth: true } }, adminListSiteSettings);
  app.get(`${BASE}/:key`, { config: { auth: true } }, adminGetSiteSettingByKey);
  app.post(`${BASE}`, { config: { auth: true } }, adminCreateSiteSetting);
  app.put(`${BASE}/:key`, { config: { auth: true } }, adminUpdateSiteSetting);
  app.post(
    `${BASE}/bulk-upsert`,
    { config: { auth: true } },
    adminBulkUpsertSiteSettings,
  );
  app.delete(`${BASE}`, { config: { auth: true } }, adminDeleteManySiteSettings);
  app.delete(
    `${BASE}/:key`,
    { config: { auth: true } },
    adminDeleteSiteSetting,
  );

  // Geriye dönük eski underscore path’i de yönlendir:
  const LEGACY = "/admin/site_settings";
  app.get(LEGACY, { config: { auth: true } }, adminGetSettingsAggregate);
  app.put(LEGACY, { config: { auth: true } }, adminUpsertSettingsAggregate);
}
