// =============================================================
// FILE: src/integrations/types/admin/product_admin.types.ts
// Admin Products (CRUD + Images)
// =============================================================

import type {
  ProductDto,
  ProductSpecifications,
  BoolLike,
} from "./product.types";

export type AdminProductDto = ProductDto;

/* --------- Admin list / query tipleri --------- */

export type AdminProductListQueryParams = {
  q?: string;
  category_id?: string;
  sub_category_id?: string;
  locale?: string;
  is_active?: BoolLike;
  limit?: number;
  offset?: number;
  sort?: "price" | "rating" | "created_at";
  order?: "asc" | "desc";
};

export type AdminProductListResponse = {
  items: AdminProductDto[];
  total: number;
};

// ⬇⬇⬇ BURAYI DÜZELTTİK
export type AdminGetProductParams = {
  id: string;
  locale?: string; // ürün detayı için admin tarafında locale seçilebiliyor
};

/* --------- Create / Update payloadları --------- */

export type AdminProductCreatePayload = {
  id?: string;

  locale?: string; // boş ise backend "tr" ile dolduracak
  title: string;
  slug: string;
  price: number;
  description?: string | null;

  category_id: string;
  sub_category_id?: string | null;

  image_url?: string | null;
  alt?: string | null;
  images?: string[];

  storage_asset_id?: string | null;
  storage_image_ids?: string[];

  is_active?: BoolLike;
  is_featured?: BoolLike;

  tags?: string[];

  specifications?: ProductSpecifications;

  product_code?: string | null;
  stock_quantity?: number;
  rating?: number;
  review_count?: number;

  meta_title?: string | null;
  meta_description?: string | null;
};

export type AdminProductUpdatePayload = Partial<AdminProductCreatePayload>;

/* --------- Images payload --------- */

export type AdminProductSetImagesPayload = {
  cover_id?: string | null;
  image_ids: string[];
  alt?: string | null;
};
