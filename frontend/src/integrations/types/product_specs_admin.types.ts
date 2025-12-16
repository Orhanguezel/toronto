// =============================================================
// FILE: src/integrations/types/product_specs_admin.types.ts
// Admin Product Specs
// =============================================================

import type { ProductSpecCategory } from "./product.types";

export type AdminProductSpecDto = {
  id: string;
  product_id: string;
  locale: string;
  name: string;
  value: string;
  category: ProductSpecCategory;
  order_num: number;
  created_at: string;
  updated_at: string;
};

export type AdminProductSpecListParams = {
  productId: string;
  locale?: string;
};

export type AdminProductSpecCreatePayload = {
  id?: string;
  /**
   * CREATE için opsiyonel locale;
   * REPLACE sırasında locale query paramından gelir.
   */
  locale?: string;
  name: string;
  value: string;
  category?: ProductSpecCategory;
  order_num?: number;
};

export type AdminProductSpecUpdatePayload =
  Partial<AdminProductSpecCreatePayload>;

/**
 * Replace payload:
 *  - items: ilgili product + locale için tek kaynak array
 *    (locale her zaman query parametrelerinden okunur)
 */
export type AdminProductSpecReplacePayload = {
  items: AdminProductSpecCreatePayload[];
};
