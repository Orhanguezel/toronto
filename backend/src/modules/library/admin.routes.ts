// src/modules/library/admin.routes.ts
// =============================================================

import type { FastifyInstance } from "fastify";
import {
  listLibraryAdmin,
  getLibraryAdmin,
  getLibraryBySlugAdmin,
  createLibraryAdmin,
  updateLibraryAdmin,
  removeLibraryAdmin,
  listLibraryImagesAdmin,
  createLibraryImageAdmin,
  updateLibraryImageAdmin,
  removeLibraryImageAdmin,
  listLibraryFilesAdmin,
  createLibraryFileAdmin,
  updateLibraryFileAdmin,
  removeLibraryFileAdmin,
} from "./admin.controller";

const BASE = "/library";

export async function registerLibraryAdmin(app: FastifyInstance) {
  // library
  app.get(
    `${BASE}`,
    { config: { auth: true, admin: true } },
    listLibraryAdmin,
  );
  app.get(
    `${BASE}/:id`,
    { config: { auth: true, admin: true } },
    getLibraryAdmin,
  );
  app.get(
    `${BASE}/by-slug/:slug`,
    { config: { auth: true, admin: true } },
    getLibraryBySlugAdmin,
  );

  app.post(
    `${BASE}`,
    { config: { auth: true, admin: true } },
    createLibraryAdmin,
  );
  app.patch(
    `${BASE}/:id`,
    { config: { auth: true, admin: true } },
    updateLibraryAdmin,
  );
  app.delete(
    `${BASE}/:id`,
    { config: { auth: true, admin: true } },
    removeLibraryAdmin,
  );

  // images
  app.get(
    `${BASE}/:id/images`,
    { config: { auth: true, admin: true } },
    listLibraryImagesAdmin,
  );
  app.post(
    `${BASE}/:id/images`,
    { config: { auth: true, admin: true } },
    createLibraryImageAdmin,
  );
  app.patch(
    `${BASE}/:id/images/:imageId`,
    { config: { auth: true, admin: true } },
    updateLibraryImageAdmin,
  );
  app.delete(
    `${BASE}/:id/images/:imageId`,
    { config: { auth: true, admin: true } },
    removeLibraryImageAdmin,
  );

  // files
  app.get(
    `${BASE}/:id/files`,
    { config: { auth: true, admin: true } },
    listLibraryFilesAdmin,
  );
  app.post(
    `${BASE}/:id/files`,
    { config: { auth: true, admin: true } },
    createLibraryFileAdmin,
  );
  app.patch(
    `${BASE}/:id/files/:fileId`,
    { config: { auth: true, admin: true } },
    updateLibraryFileAdmin,
  );
  app.delete(
    `${BASE}/:id/files/:fileId`,
    { config: { auth: true, admin: true } },
    removeLibraryFileAdmin,
  );
}
