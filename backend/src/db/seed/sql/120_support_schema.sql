-- 120_support_schema.sql
-- SUPPORT MODULE SCHEMA (idempotent & self-contained)

SET NAMES utf8mb4;
SET time_zone = '+00:00';

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `ticket_replies`;
DROP TABLE IF EXISTS `support_tickets`;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `support_tickets` (
  `id`         CHAR(36) NOT NULL,
  `user_id`    CHAR(36) NOT NULL,
  `subject`    VARCHAR(255) NOT NULL,
  `message`    LONGTEXT NOT NULL,
  `status`     ENUM('open','in_progress','waiting_response','closed') NOT NULL DEFAULT 'open',
  `priority`   ENUM('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_support_tickets_user`     (`user_id`),
  KEY `idx_support_tickets_created`  (`created_at`),
  KEY `idx_support_tickets_updated`  (`updated_at`),
  KEY `idx_support_tickets_status`   (`status`),
  KEY `idx_support_tickets_priority` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ticket_replies` (
  `id`         CHAR(36) NOT NULL,
  `ticket_id`  CHAR(36) NOT NULL,
  `user_id`    CHAR(36) DEFAULT NULL,
  `message`    LONGTEXT NOT NULL,
  `is_admin`   TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_ticket_replies_ticket`  (`ticket_id`),
  KEY `idx_ticket_replies_created` (`created_at`),
  CONSTRAINT `fk_ticket_replies_ticket`
    FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
