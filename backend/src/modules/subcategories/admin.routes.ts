// =============================================================
// FILE: src/modules/subcategories/admin.routes.ts
// =============================================================
import type { FastifyInstance } from "fastify";
import { requireAuth } from "@/common/middleware/auth";
import { requireAdmin } from "@/common/middleware/roles";

import type {
  SubCategoryCreateInput,
  SubCategoryUpdateInput,
  SubCategorySetImageInput,
} from "./validation";

import {
  adminCreateSubCategory,
  adminPutSubCategory,
  adminPatchSubCategory,
  adminDeleteSubCategory,
  adminReorderSubCategories,
  adminToggleSubActive,
  adminToggleSubFeatured,
  adminSetSubCategoryImage,
  adminListSubCategories,
  adminGetSubCategoryById,
  adminGetSubCategoryBySlug,
  type AdminSubListQS,
} from "./admin.controller";

// idempotent guard (isteğe bağlı)
declare module "fastify" {
  interface FastifyInstance {
    subCategoriesAdminRoutesRegistered?: boolean;
  }
}

export async function registerSubCategoriesAdmin(app: FastifyInstance) {
  if (app.subCategoriesAdminRoutesRegistered) return;
  app.subCategoriesAdminRoutesRegistered = true;

  const BASE = "/sub-categories";

  // LIST (kategori patterniyle aynı: /list)
  app.get<{ Querystring: AdminSubListQS }>(
    `${BASE}/list`,
    { preHandler: [requireAuth, requireAdmin] },
    adminListSubCategories,
  );

  // READ (ID ile)
  app.get<{
    Params: { id: string };
    Querystring: { locale?: string };
  }>(
    `${BASE}/:id`,
    { preHandler: [requireAuth, requireAdmin] },
    adminGetSubCategoryById,
  );

  // READ (slug ile)
  app.get<{
    Params: { slug: string };
    Querystring: { category_id?: string; locale?: string };
  }>(
    `${BASE}/by-slug/:slug`,
    { preHandler: [requireAuth, requireAdmin] },
    adminGetSubCategoryBySlug,
  );

  // CREATE
  app.post<{ Body: SubCategoryCreateInput }>(
    `${BASE}`,
    { preHandler: [requireAuth, requireAdmin] },
    adminCreateSubCategory,
  );

  // PUT
  app.put<{
    Params: { id: string };
    Body: SubCategoryUpdateInput;
  }>(
    `${BASE}/:id`,
    { preHandler: [requireAuth, requireAdmin] },
    adminPutSubCategory,
  );

  // PATCH
  app.patch<{
    Params: { id: string };
    Body: SubCategoryUpdateInput;
  }>(
    `${BASE}/:id`,
    { preHandler: [requireAuth, requireAdmin] },
    adminPatchSubCategory,
  );

  // DELETE
  app.delete<{ Params: { id: string } }>(
    `${BASE}/:id`,
    { preHandler: [requireAuth, requireAdmin] },
    adminDeleteSubCategory,
  );

  // REORDER
  app.post<{
    Body: { items: Array<{ id: string; display_order: number }> };
  }>(
    `${BASE}/reorder`,
    { preHandler: [requireAuth, requireAdmin] },
    adminReorderSubCategories,
  );

  // TOGGLE ACTIVE
  app.patch<{
    Params: { id: string };
    Body: { is_active: boolean };
  }>(
    `${BASE}/:id/active`,
    { preHandler: [requireAuth, requireAdmin] },
    adminToggleSubActive,
  );

  // TOGGLE FEATURED
  app.patch<{
    Params: { id: string };
    Body: { is_featured: boolean };
  }>(
    `${BASE}/:id/featured`,
    { preHandler: [requireAuth, requireAdmin] },
    adminToggleSubFeatured,
  );

  // Image (asset_id + alt)
  app.patch<{
    Params: { id: string };
    Body: SubCategorySetImageInput;
  }>(
    `${BASE}/:id/image`,
    { preHandler: [requireAuth, requireAdmin] },
    adminSetSubCategoryImage,
  );
}
