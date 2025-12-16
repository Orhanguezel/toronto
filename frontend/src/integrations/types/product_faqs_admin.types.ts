// =============================================================
// FILE: src/integrations/types/product_faqs_admin.types.ts
// Admin Product FAQs
// =============================================================

export type AdminProductFaqDto = {
  id: string;
  product_id: string;
  locale: string;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminProductFaqListParams = {
  productId: string;
  locale?: string;
  // backend: only_active?: string | number | boolean
  // (adminListProductFaqs içinde toBool ile parse ediliyor)
  only_active?: string | number | boolean;
};

export type AdminProductFaqCreatePayload = {
  id?: string;
  /**
   * CREATE için opsiyonel locale;
   * REPLACE için locale query param’dan okunur.
   */
  locale?: string;
  question: string;
  answer: string;
  display_order?: number;
  is_active?: boolean;
};

export type AdminProductFaqUpdatePayload =
  Partial<AdminProductFaqCreatePayload>;

/**
 * Replace payload:
 *  - items: ilgili locale için tek kaynak array
 *    (locale her zaman query parametrelerinden okunur)
 */
export type AdminProductFaqReplacePayload = {
  items: AdminProductFaqCreatePayload[];
};
