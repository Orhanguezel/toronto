import type { FastifyInstance } from "fastify";
import {
  listProjectsAdmin,
  getProjectAdmin,
  getProjectBySlugAdmin,
  createProjectAdmin,
  updateProjectAdmin,
  removeProjectAdmin,

  listProjectImagesAdmin,
  createProjectImageAdmin,
  updateProjectImageAdmin,
  removeProjectImageAdmin,
} from "./admin.controller";

const BASE = "/projects";

export async function registerProjectAdmin(app: FastifyInstance) {
  // projects
  app.get(`${BASE}`,               { config: { auth: true } }, listProjectsAdmin);
  app.get(`${BASE}/:id`,           { config: { auth: true } }, getProjectAdmin);
  app.get(`${BASE}/by-slug/:slug`, { config: { auth: true } }, getProjectBySlugAdmin);

  app.post(`${BASE}`,              { config: { auth: true } }, createProjectAdmin);
  app.patch(`${BASE}/:id`,         { config: { auth: true } }, updateProjectAdmin);
  app.delete(`${BASE}/:id`,        { config: { auth: true } }, removeProjectAdmin);

  // gallery
  app.get(`${BASE}/:id/images`,                  { config: { auth: true } }, listProjectImagesAdmin);
  app.post(`${BASE}/:id/images`,                 { config: { auth: true } }, createProjectImageAdmin);
  app.patch(`${BASE}/:id/images/:imageId`,       { config: { auth: true } }, updateProjectImageAdmin);
  app.delete(`${BASE}/:id/images/:imageId`,      { config: { auth: true } }, removeProjectImageAdmin);
}
