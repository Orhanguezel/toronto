-- 180_newsletter_subscribers_schema.sql
-- Newsletter subscribers schema (Ensotek pattern)

SET NAMES utf8mb4;
SET time_zone = '+00:00';

DROP TABLE IF EXISTS `newsletter_subscribers`;

CREATE TABLE `newsletter_subscribers` (
  `id`              CHAR(36)      NOT NULL,
  `email`           VARCHAR(255)  NOT NULL,

  `is_verified`     TINYINT(1)    NOT NULL DEFAULT 0,          -- Drizzle: boolean
  `locale`          VARCHAR(10)   DEFAULT NULL,                -- örn: 'tr', 'en', 'de-DE'

  `meta`            LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL
                    DEFAULT '{}'
                    CHECK (json_valid(`meta`)),                -- JSON string (object) beklenir

  `unsubscribed_at` DATETIME(3)   DEFAULT NULL,                -- NULL -> aktif abone

  `created_at`      DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`      DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                    ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),

  UNIQUE KEY `ux_newsletter_email` (`email`),

  KEY `newsletter_verified_idx` (`is_verified`),
  KEY `newsletter_locale_idx`   (`locale`),
  KEY `newsletter_unsub_idx`    (`unsubscribed_at`),
  KEY `newsletter_created_idx`  (`created_at`),
  KEY `newsletter_updated_idx`  (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
