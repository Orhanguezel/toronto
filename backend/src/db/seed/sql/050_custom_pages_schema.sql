-- =============================================================
-- FILE: 050_custom_pages.sql
-- Custom Pages (parent + i18n) – category/sub_category bağlı
-- Ensotek çok dilli yapı ile uyumlu
-- =============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

/* Eski tabloları temizle (varsa) */
DROP TABLE IF EXISTS `custom_pages_i18n`;
DROP TABLE IF EXISTS `custom_page_i18n`; -- legacy isim
DROP TABLE IF EXISTS `custom_pages`;

-- =============================================================
-- PARENT TABLO: custom_pages
--  - Sadece lokalsiz alanlar (publish, görsel, kategori, timestamps)
-- =============================================================
CREATE TABLE IF NOT EXISTS `custom_pages` (
  `id`                       CHAR(36)      NOT NULL,
  `is_published`             TINYINT(1)    NOT NULL DEFAULT 0,

  -- Liste sıralaması için
  `display_order`            INT           NOT NULL DEFAULT 0,

  `featured_image`           VARCHAR(500)  DEFAULT NULL,
  `featured_image_asset_id`  CHAR(36)      DEFAULT NULL,

  -- 🔗 Kategori ilişkileri (opsiyonel)
  `category_id`              CHAR(36)      DEFAULT NULL,
  `sub_category_id`          CHAR(36)      DEFAULT NULL,

  `created_at`               DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`               DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                         ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),

  KEY `custom_pages_published_idx`        (`is_published`),
  KEY `custom_pages_display_order_idx`    (`display_order`),
  KEY `custom_pages_asset_idx`            (`featured_image_asset_id`),
  KEY `custom_pages_created_idx`          (`created_at`),
  KEY `custom_pages_updated_idx`          (`updated_at`),
  KEY `custom_pages_category_id_idx`      (`category_id`),
  KEY `custom_pages_sub_category_id_idx`  (`sub_category_id`),

  CONSTRAINT `fk_custom_pages_category`
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  CONSTRAINT `fk_custom_pages_sub_category`
    FOREIGN KEY (`sub_category_id`) REFERENCES `sub_categories` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- I18N TABLO: custom_pages_i18n
--  - Her satır: (page_id + locale) için title/slug/content/meta/summary/tags
--  - product_i18n / category_i18n pattern’i ile aynı mantık
-- =============================================================
CREATE TABLE IF NOT EXISTS `custom_pages_i18n` (
  `id`                  CHAR(36)      NOT NULL,
  `page_id`             CHAR(36)      NOT NULL,
  `locale`              VARCHAR(10)   NOT NULL,

  `title`               VARCHAR(255)  NOT NULL,
  `slug`                VARCHAR(255)  NOT NULL,

  -- JSON-string: {"html": "..."}
  `content`             LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL
                        CHECK (JSON_VALID(`content`)),

  -- Kısa özet (liste ve meta için)
  `summary`             VARCHAR(1000) DEFAULT NULL,

  `featured_image_alt`  VARCHAR(255)  DEFAULT NULL,
  `meta_title`          VARCHAR(255)  DEFAULT NULL,
  `meta_description`    VARCHAR(500)  DEFAULT NULL,

  -- Virgülle ayrılmış tag listesi (örn: "ensotek,su soğutma kuleleri,frp")
  `tags`                VARCHAR(1000) DEFAULT NULL,

  `created_at`          DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`          DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                         ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),

  -- Her page + locale tekil (product_i18n ile aynı mantık)
  UNIQUE KEY `ux_custom_pages_i18n_parent_locale` (`page_id`, `locale`),

  -- Aynı locale içinde slug tekil (category_i18n / product_i18n pattern’i)
  UNIQUE KEY `ux_custom_pages_i18n_locale_slug`   (`locale`, `slug`),

  KEY `custom_pages_i18n_page_idx`   (`page_id`),
  KEY `custom_pages_i18n_locale_idx` (`locale`),
  KEY `custom_pages_i18n_slug_idx`   (`slug`),

  CONSTRAINT `fk_custom_pages_i18n_page`
    FOREIGN KEY (`page_id`) REFERENCES `custom_pages` (`id`)
    ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
