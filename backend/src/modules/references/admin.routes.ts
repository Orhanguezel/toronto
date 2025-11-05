import type { FastifyInstance } from "fastify";
import {
  listReferencesAdmin,
  getReferenceAdmin,
  getReferenceBySlugAdmin,
  createReferenceAdmin,
  updateReferenceAdmin,
  removeReferenceAdmin,

  listReferenceImagesAdmin,
  createReferenceImageAdmin,
  updateReferenceImageAdmin,
  removeReferenceImageAdmin,
} from "./admin.controller";

const BASE = "/references";

export async function registerReferencesAdmin(app: FastifyInstance) {
  // references
  app.get(`${BASE}`,               { config: { auth: true } }, listReferencesAdmin);
  app.get(`${BASE}/:id`,           { config: { auth: true } }, getReferenceAdmin);
  app.get(`${BASE}/by-slug/:slug`, { config: { auth: true } }, getReferenceBySlugAdmin);

  app.post(`${BASE}`,              { config: { auth: true } }, createReferenceAdmin);
  app.patch(`${BASE}/:id`,         { config: { auth: true } }, updateReferenceAdmin);
  app.delete(`${BASE}/:id`,        { config: { auth: true } }, removeReferenceAdmin);

  // gallery
  app.get(`${BASE}/:id/images`,             { config: { auth: true } }, listReferenceImagesAdmin);
  app.post(`${BASE}/:id/images`,            { config: { auth: true } }, createReferenceImageAdmin);
  app.patch(`${BASE}/:id/images/:imageId`,  { config: { auth: true } }, updateReferenceImageAdmin);
  app.delete(`${BASE}/:id/images/:imageId`, { config: { auth: true } }, removeReferenceImageAdmin);
}
