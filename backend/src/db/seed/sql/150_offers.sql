-- 150_offers.sql
SET NAMES utf8mb4;
SET time_zone = '+00:00';

DROP TABLE IF EXISTS `offers`;
DROP TABLE IF EXISTS `offer_number_counters`;

-- =============================================================
-- TABLO: offer_number_counters
-- Teklif numarası sıralayıcı: ENS-YYYY-0001 formatı için gereklidir
-- =============================================================
CREATE TABLE IF NOT EXISTS `offer_number_counters` (
  `year` INT NOT NULL,
  `last_seq` INT NOT NULL,
  `prefix` VARCHAR(20) NOT NULL DEFAULT 'ENS',
  PRIMARY KEY (`year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- TABLO: offers
-- =============================================================
CREATE TABLE IF NOT EXISTS `offers` (
  `id`               CHAR(36)      NOT NULL,

  `offer_no`         VARCHAR(100)  DEFAULT NULL,
  `status`           VARCHAR(32)   NOT NULL DEFAULT 'new',

  `locale`           VARCHAR(10)   DEFAULT NULL,
  `country_code`     VARCHAR(2)    DEFAULT NULL,

  `customer_name`    VARCHAR(255)  NOT NULL,
  `company_name`     VARCHAR(255)  DEFAULT NULL,
  `email`            VARCHAR(255)  NOT NULL,
  `phone`            VARCHAR(50)   DEFAULT NULL,

  `subject`          VARCHAR(255)  DEFAULT NULL,
  `message`          LONGTEXT      DEFAULT NULL,

  `product_id`       CHAR(36)      DEFAULT NULL,

  `form_data`        LONGTEXT      DEFAULT NULL,

  `consent_marketing` TINYINT(1)   NOT NULL DEFAULT 0,
  `consent_terms`     TINYINT(1)   NOT NULL DEFAULT 0,

  `currency`         VARCHAR(10)   NOT NULL DEFAULT 'EUR',
  `net_total`        DECIMAL(12,2) DEFAULT NULL,
  `vat_rate`         DECIMAL(5,2)  DEFAULT NULL,   -- Örn: 19.00 (%)
  `vat_total`        DECIMAL(12,2) DEFAULT NULL,
  `shipping_total`   DECIMAL(12,2) DEFAULT NULL,
  `gross_total`      DECIMAL(12,2) DEFAULT NULL,

  `valid_until`      DATETIME(3)   DEFAULT NULL,

  `admin_notes`      LONGTEXT      DEFAULT NULL,

  `pdf_url`          VARCHAR(500)  DEFAULT NULL,
  `pdf_asset_id`     CHAR(36)      DEFAULT NULL,

  `email_sent_at`    DATETIME(3)   DEFAULT NULL,

  `created_at`       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                      ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),

  KEY `offers_status_created_idx` (`status`, `created_at`),
  KEY `offers_email_idx`          (`email`),
  KEY `offers_product_idx`        (`product_id`),
  KEY `offers_offer_no_idx`       (`offer_no`),
  KEY `offers_locale_idx`         (`locale`),
  KEY `offers_country_idx`        (`country_code`),

  CONSTRAINT `fk_offers_product`
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
