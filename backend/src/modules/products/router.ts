// =============================================================
// FILE: src/modules/products/routes.ts
// =============================================================
import type { FastifyInstance } from "fastify";
import {
  listProducts,
  getProductByIdOrSlug,
  getProductById,
  getProductBySlug,
  // Public lists
  listProductFaqs,
  listProductSpecs,
  listProductReviews,
} from "./controller";

export async function registerProducts(app: FastifyInstance) {
  // Products: list + detail
  app.get(
    "/products",
    { config: { public: true } },
    listProducts,
  );
  app.get(
    "/products/:idOrSlug",
    { config: { public: true } },
    getProductByIdOrSlug,
  );
  app.get(
    "/products/by-slug/:slug",
    { config: { public: true } },
    getProductBySlug,
  );
  app.get(
    "/products/id/:id",
    { config: { public: true } },
    getProductById,
  );

  // Public auxiliary lists
  app.get(
    "/product_faqs",
    { config: { public: true } },
    listProductFaqs,
  );
  app.get(
    "/product_specs",
    { config: { public: true } },
    listProductSpecs,
  );
  app.get(
    "/product_reviews",
    { config: { public: true } },
    listProductReviews,
  );
}
