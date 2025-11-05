import type { FastifyInstance } from "fastify";
import {
  listProjectsPublic,
  getProjectPublic,
  getProjectBySlugPublic,
  listProjectImagesPublic,
} from "./controller";

const BASE = "/projects";

export async function registerProject(app: FastifyInstance) {
  app.get(`${BASE}`,               { config: { public: true } }, listProjectsPublic);
  app.get(`${BASE}/:id`,           { config: { public: true } }, getProjectPublic);
  app.get(`${BASE}/by-slug/:slug`, { config: { public: true } }, getProjectBySlugPublic);

  // gallery (public)
  app.get(`${BASE}/:id/images`,    { config: { public: true } }, listProjectImagesPublic);
}
