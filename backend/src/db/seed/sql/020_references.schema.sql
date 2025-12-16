-- =============================================================
-- 020_references.schema.sql  (schema)
-- =============================================================

-- ================= CLEANUP =================
DROP TABLE IF EXISTS `references_i18n`;
DROP TABLE IF EXISTS `references`;

-- ================= TABLE: references =================
-- Drizzle şeması ile bire bir:
--  - featured_image_asset_id: CHAR(36), FK YOK, sadece INDEX
--  - category_id, sub_category_id: CHAR(36), NULL + FK -> categories / sub_categories

CREATE TABLE `references` (
  id                      CHAR(36)     NOT NULL,
  is_published            TINYINT(1)   NOT NULL DEFAULT 0,
  is_featured             TINYINT(1)   NOT NULL DEFAULT 0,
  display_order           INT          NOT NULL DEFAULT 0,

  featured_image          VARCHAR(500) DEFAULT NULL,
  featured_image_asset_id CHAR(36)     DEFAULT NULL,

  website_url             VARCHAR(500) DEFAULT NULL,

  -- Kategori bağları (opsiyonel)
  category_id             CHAR(36)     DEFAULT NULL,
  sub_category_id         CHAR(36)     DEFAULT NULL,

  created_at              DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at              DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),

  KEY references_created_idx         (created_at),
  KEY references_updated_idx         (updated_at),
  KEY references_published_idx       (is_published),
  KEY references_featured_idx        (is_featured),
  KEY references_display_order_idx   (display_order),
  KEY references_featured_asset_idx  (featured_image_asset_id),

  KEY references_category_id_idx     (category_id),
  KEY references_sub_category_id_idx (sub_category_id),

  CONSTRAINT fk_references_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE SET NULL ON UPDATE CASCADE,

  CONSTRAINT fk_references_sub_category
    FOREIGN KEY (sub_category_id) REFERENCES sub_categories(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================= TABLE: references_i18n =================
-- Drizzle longtext customType ile uyumlu:
--  - summary: LONGTEXT NULL
--  - content: LONGTEXT NOT NULL

CREATE TABLE `references_i18n` (
  id                 CHAR(36)     NOT NULL,
  reference_id       CHAR(36)     NOT NULL,
  locale             VARCHAR(10)  NOT NULL,

  title              VARCHAR(255) NOT NULL,
  slug               VARCHAR(255) NOT NULL,

  summary            LONGTEXT     DEFAULT NULL,
  content            LONGTEXT     NOT NULL,

  featured_image_alt VARCHAR(255) DEFAULT NULL,
  meta_title         VARCHAR(255) DEFAULT NULL,
  meta_description   VARCHAR(500) DEFAULT NULL,

  created_at         DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at         DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),

  UNIQUE KEY ux_references_i18n_parent_locale (reference_id, locale),
  UNIQUE KEY ux_references_i18n_locale_slug   (locale, slug),
  KEY references_i18n_locale_idx              (locale),
  KEY references_i18n_slug_idx                (slug),

  CONSTRAINT fk_references_i18n_parent
    FOREIGN KEY (reference_id) REFERENCES `references`(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
