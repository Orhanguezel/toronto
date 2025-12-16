-- =========================
-- 010_catalog_schema.sql
-- CATEGORIES + CATEGORY_I18N
-- SUB_CATEGORIES + SUB_CATEGORY_I18N
-- Base + i18n pattern (products/product_i18n yapısı ile uyumlu)
-- =========================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Eski tabloları güvenli şekilde düşür
DROP TABLE IF EXISTS sub_category_i18n;
DROP TABLE IF EXISTS sub_categories;
DROP TABLE IF EXISTS category_i18n;
DROP TABLE IF EXISTS categories;

-- =========================
-- CATEGORIES (BASE TABLO – DİL BAĞIMSIZ)
-- =========================
CREATE TABLE IF NOT EXISTS categories (
  id               CHAR(36)      NOT NULL,

  -- Modül / alan anahtarı (product, sparepart, blog, news, slider, references, about, services, library, vb.)
  module_key       VARCHAR(64)   NOT NULL DEFAULT 'general',

  -- Tekil storage pattern (şema ile bire bir)
  image_url        LONGTEXT      DEFAULT NULL,
  storage_asset_id CHAR(36)      DEFAULT NULL,

  -- İstersen burada dil bağımsız alt metin kullanabilirsin
  -- Not: Locale bazlı alt metin için category_i18n.alt alanı da mevcut
  alt              VARCHAR(255)  DEFAULT NULL,

  icon             VARCHAR(255)  DEFAULT NULL,

  is_active        TINYINT(1)    NOT NULL DEFAULT 1,
  is_featured      TINYINT(1)    NOT NULL DEFAULT 0,
  display_order    INT(11)       NOT NULL DEFAULT 0,

  created_at       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),

  KEY categories_active_idx         (is_active),
  KEY categories_order_idx          (display_order),
  KEY categories_storage_asset_idx  (storage_asset_id),
  KEY categories_module_idx         (module_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================
-- CATEGORY I18N (LOCALE BAZLI ALANLAR)
-- =========================
CREATE TABLE IF NOT EXISTS category_i18n (
  category_id      CHAR(36)     NOT NULL,
  locale           VARCHAR(8)   NOT NULL DEFAULT 'tr',

  -- Zorunlu alanlar – her locale için name + slug olmalı
  name             VARCHAR(255) NOT NULL,
  slug             VARCHAR(255) NOT NULL,

  -- Opsiyonel açıklama
  description      TEXT         DEFAULT NULL,

  -- Opsiyonel, locale bazlı alt metin
  alt              VARCHAR(255) DEFAULT NULL,

  created_at       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  -- Her kategori + locale kombinasyonu tekil
  PRIMARY KEY (category_id, locale),

  -- Aynı locale içinde slug tekil (TR/EN gibi her dilde kendi slug uzayı)
  UNIQUE KEY category_i18n_locale_slug_uq (locale, slug),

  KEY category_i18n_locale_idx (locale),

  CONSTRAINT fk_category_i18n_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================
-- SUB CATEGORIES (BASE TABLO – DİL BAĞIMSIZ)
-- =========================
CREATE TABLE IF NOT EXISTS sub_categories (
  id               CHAR(36)      NOT NULL,
  category_id      CHAR(36)      NOT NULL,

  -- Tekil storage pattern (şema ile bire bir)
  image_url        LONGTEXT      DEFAULT NULL,
  storage_asset_id CHAR(36)      DEFAULT NULL,
  alt              VARCHAR(255)  DEFAULT NULL,

  icon             VARCHAR(100)  DEFAULT NULL,

  is_active        TINYINT(1)    NOT NULL DEFAULT 1,
  is_featured      TINYINT(1)    NOT NULL DEFAULT 0,
  display_order    INT(11)       NOT NULL DEFAULT 0,

  created_at       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),

  KEY sub_categories_category_id_idx     (category_id),
  KEY sub_categories_active_idx          (is_active),
  KEY sub_categories_order_idx           (display_order),
  KEY sub_categories_storage_asset_idx   (storage_asset_id),

  CONSTRAINT fk_sub_categories_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================
-- SUB CATEGORY I18N (LOCALE BAZLI ALANLAR)
-- =========================
CREATE TABLE IF NOT EXISTS sub_category_i18n (
  sub_category_id  CHAR(36)     NOT NULL,
  locale           VARCHAR(8)   NOT NULL DEFAULT 'tr',

  name             VARCHAR(255) NOT NULL,
  slug             VARCHAR(255) NOT NULL,

  description      TEXT         DEFAULT NULL,
  alt              VARCHAR(255) DEFAULT NULL,

  created_at       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  -- Her alt kategori + locale kombinasyonu tekil
  PRIMARY KEY (sub_category_id, locale),

  -- Aynı locale içinde slug tekil
  UNIQUE KEY sub_category_i18n_locale_slug_uq (locale, slug),

  KEY sub_category_i18n_locale_idx (locale),

  CONSTRAINT fk_sub_category_i18n_sub_category
    FOREIGN KEY (sub_category_id) REFERENCES sub_categories(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
