import type { FastifyInstance } from "fastify";
import {
  listAdSolutionsAdmin,
  getAdSolutionAdmin,
  getAdSolutionBySlugAdmin,
  createAdSolutionAdmin,
  updateAdSolutionAdmin,
  removeAdSolutionAdmin,

  listAdSolutionImagesAdmin,
  createAdSolutionImageAdmin,
  updateAdSolutionImageAdmin,
  removeAdSolutionImageAdmin,
} from "./admin.controller";

const BASE = "/ad-solutions";

export async function registerAdSolutionsAdmin(app: FastifyInstance) {
  // entity
  app.get(`${BASE}`,               { config: { auth: true } }, listAdSolutionsAdmin);
  app.get(`${BASE}/:id`,           { config: { auth: true } }, getAdSolutionAdmin);
  app.get(`${BASE}/by-slug/:slug`, { config: { auth: true } }, getAdSolutionBySlugAdmin);

  app.post(`${BASE}`,              { config: { auth: true } }, createAdSolutionAdmin);
  app.patch(`${BASE}/:id`,         { config: { auth: true } }, updateAdSolutionAdmin);
  app.delete(`${BASE}/:id`,        { config: { auth: true } }, removeAdSolutionAdmin);

  // gallery
  app.get(`${BASE}/:id/images`,             { config: { auth: true } }, listAdSolutionImagesAdmin);
  app.post(`${BASE}/:id/images`,            { config: { auth: true } }, createAdSolutionImageAdmin);
  app.patch(`${BASE}/:id/images/:imageId`,  { config: { auth: true } }, updateAdSolutionImageAdmin);
  app.delete(`${BASE}/:id/images/:imageId`, { config: { auth: true } }, removeAdSolutionImageAdmin);
}
