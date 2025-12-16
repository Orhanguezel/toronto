-- =============================================================
-- 010_1_catalog_requests_schema.sql
-- Catalog Requests table
-- =============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `catalog_requests` (
  `id`                CHAR(36)      NOT NULL,

  `status`            ENUM('new','sent','failed','archived') NOT NULL DEFAULT 'new',

  `locale`            VARCHAR(10)   DEFAULT NULL,
  `country_code`      CHAR(2)       DEFAULT NULL,

  `customer_name`     VARCHAR(255)  NOT NULL,
  `company_name`      VARCHAR(255)  DEFAULT NULL,

  `email`             VARCHAR(255)  NOT NULL,
  `phone`             VARCHAR(50)   DEFAULT NULL,

  `message`           LONGTEXT      DEFAULT NULL,

  `consent_marketing` TINYINT(1)    NOT NULL DEFAULT 0,
  `consent_terms`     TINYINT(1)    NOT NULL DEFAULT 0,

  `admin_notes`       LONGTEXT      DEFAULT NULL,

  `email_sent_at`     DATETIME(3)   DEFAULT NULL,

  `created_at`        DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`        DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                     ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),

  KEY `catalog_requests_status_created_idx` (`status`, `created_at`),
  KEY `catalog_requests_email_idx` (`email`),
  KEY `catalog_requests_locale_idx` (`locale`),
  KEY `catalog_requests_country_idx` (`country_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
