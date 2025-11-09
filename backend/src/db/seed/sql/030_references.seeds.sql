-- =============================================================
-- 030_references.sql  (schema + parent seeds)
-- =============================================================

/* ================= TABLE: references ================= */
CREATE TABLE IF NOT EXISTS `references` (
  id                      CHAR(36)     NOT NULL,
  is_published            TINYINT(1)   NOT NULL DEFAULT 0,
  is_featured             TINYINT(1)   NOT NULL DEFAULT 0,
  display_order           INT          NOT NULL DEFAULT 0,

  featured_image          VARCHAR(500) DEFAULT NULL,
  featured_image_asset_id CHAR(36)     DEFAULT NULL,

  website_url             VARCHAR(500) DEFAULT NULL,

  created_at              DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at              DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),
  KEY references_created_idx (created_at),
  KEY references_updated_idx (updated_at),
  KEY references_published_idx (is_published),
  KEY references_featured_idx (is_featured),
  KEY references_display_order_idx (display_order),
  KEY references_featured_asset_idx (featured_image_asset_id),
  CONSTRAINT fk_references_featured_asset
    FOREIGN KEY (featured_image_asset_id) REFERENCES storage_assets(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* ================= TABLE: references_i18n ================= */
CREATE TABLE IF NOT EXISTS `references_i18n` (
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
  UNIQUE KEY ux_references_i18n_locale_slug (locale, slug),
  KEY references_i18n_locale_idx (locale),
  KEY references_i18n_slug_idx (slug),
  CONSTRAINT fk_references_i18n_parent
    FOREIGN KEY (reference_id) REFERENCES `references`(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* ================= SEED: Parent satırlar ================= */

-- Toronto Ajans
SET @REF_TORONTO_ID := (
  SELECT r.id
  FROM `references` r
  JOIN `references_i18n` i ON i.reference_id=r.id AND i.locale='tr'
  WHERE i.slug='toronto-ajans' LIMIT 1
);
SET @REF_TORONTO_ID := COALESCE(@REF_TORONTO_ID, UUID());

INSERT INTO `references`
(id, is_published, is_featured, display_order, featured_image, featured_image_asset_id, website_url, created_at, updated_at)
VALUES
(@REF_TORONTO_ID, 1, 1, 10, NULL, @ASSET_HERO_ID, 'https://guzelwebdesign.com', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
 is_published=VALUES(is_published),
 is_featured=VALUES(is_featured),
 display_order=VALUES(display_order),
 featured_image=VALUES(featured_image),
 featured_image_asset_id=VALUES(featured_image_asset_id),
 website_url=VALUES(website_url),
 updated_at=VALUES(updated_at);

-- E-Ticaret Platformu
SET @REF_ECOM_ID := (
  SELECT r.id
  FROM `references` r
  JOIN `references_i18n` i ON i.reference_id=r.id AND i.locale='tr'
  WHERE i.slug='e-ticaret-platformu' LIMIT 1
);
SET @REF_ECOM_ID := COALESCE(@REF_ECOM_ID, UUID());

INSERT INTO `references`
(id, is_published, is_featured, display_order, featured_image, featured_image_asset_id, website_url, created_at, updated_at)
VALUES
(@REF_ECOM_ID, 1, 0, 20, NULL, @ASSET_REF1_ID, 'https://example.com/ecommerce', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
 is_published=VALUES(is_published),
 is_featured=VALUES(is_featured),
 display_order=VALUES(display_order),
 featured_image=VALUES(featured_image),
 featured_image_asset_id=VALUES(featured_image_asset_id),
 website_url=VALUES(website_url),
 updated_at=VALUES(updated_at);
