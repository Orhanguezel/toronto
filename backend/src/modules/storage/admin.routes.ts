import type { FastifyInstance } from "fastify";
import {
  adminListAssets,
  adminGetAsset,
  adminGetAssetMerged,
  adminCreateAsset,
  adminPatchAsset,
  adminPatchAssetI18n,
  adminDeleteAsset,
  adminBulkDelete,
  adminListFolders,
} from "./admin.controller";

const BASE = "/storage";

export async function registerStorageAdmin(app: FastifyInstance) {
  // assets
  app.get(`${BASE}/assets`,               { config: { auth: true } }, adminListAssets);
  app.get(`${BASE}/assets/:id`,           { config: { auth: true } }, adminGetAsset);
  app.get(`${BASE}/assets/:id/merged`,    { config: { auth: true } }, adminGetAssetMerged);

  app.post(`${BASE}/assets`,              { config: { auth: true } }, adminCreateAsset);
  app.patch(`${BASE}/assets/:id`,         { config: { auth: true } }, adminPatchAsset);
  app.patch(`${BASE}/assets/:id/i18n`,    { config: { auth: true } }, adminPatchAssetI18n);
  app.delete(`${BASE}/assets/:id`,        { config: { auth: true } }, adminDeleteAsset);
  app.post(`${BASE}/assets/bulk-delete`,  { config: { auth: true } }, adminBulkDelete);

  // helpers
  app.get(`${BASE}/folders`,              { config: { auth: true } }, adminListFolders);
}
