// =============================================================
// FILE: src/integrations/types/admin/product_reviews_admin.types.ts
// Admin Product Reviews
// =============================================================

import type { BoolLike } from "./product.types";

export type AdminProductReviewDto = {
  id: string;
  product_id: string;
  user_id: string | null;
  rating: number;
  comment: string | null;
  is_active: boolean;
  customer_name: string | null;
  review_date: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminProductReviewListParams = {
  productId: string;
  only_active?: BoolLike;
  order?: "asc" | "desc";
};

export type AdminProductReviewCreatePayload = {
  id?: string;
  user_id?: string | null;
  rating: number;
  comment?: string | null;
  is_active?: BoolLike;
  customer_name?: string | null;
  review_date?: string | null;
};

export type AdminProductReviewUpdatePayload = Partial<AdminProductReviewCreatePayload>;
