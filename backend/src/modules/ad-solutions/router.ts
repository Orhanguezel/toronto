import type { FastifyInstance } from "fastify";
import {
  listAdSolutionsPublic,
  getAdSolutionPublic,
  getAdSolutionBySlugPublic,
  listAdSolutionImagesPublic,
} from "./controller";

const BASE = "/ad-solutions";

export async function registerAdSolutions(app: FastifyInstance) {
  app.get(`${BASE}`,               { config: { public: true } }, listAdSolutionsPublic);
  app.get(`${BASE}/:id`,           { config: { public: true } }, getAdSolutionPublic);
  app.get(`${BASE}/by-slug/:slug`, { config: { public: true } }, getAdSolutionBySlugPublic);

  // gallery (public)
  app.get(`${BASE}/:id/images`,    { config: { public: true } }, listAdSolutionImagesPublic);
}
