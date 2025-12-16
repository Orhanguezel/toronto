-- 121_support_seed.sql
-- SUPPORT MODULE SEED (idempotent, enum normalize staging)

SET NAMES utf8mb4;
SET time_zone = '+00:00';

START TRANSACTION;

-- 1) Staging tablo (ENUM yok) — InnoDB kullanıyoruz (TEXT/LONGTEXT destekler)
DROP TEMPORARY TABLE IF EXISTS tmp_support_tickets;

CREATE TEMPORARY TABLE tmp_support_tickets (
  `id`         CHAR(36)     NOT NULL,
  `user_id`    CHAR(36)     NOT NULL,
  `subject`    VARCHAR(255) NOT NULL,
  `message`    LONGTEXT     NOT NULL,
  `status`     VARCHAR(32)  NULL,
  `priority`   VARCHAR(32)  NULL,
  `created_at` DATETIME(3)  NOT NULL,
  `updated_at` DATETIME(3)  NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- 2) Dump aynen (boş status/priority dahil)
INSERT INTO `tmp_support_tickets`
(`id`,`user_id`,`subject`,`message`,`status`,`priority`,`created_at`,`updated_at`) VALUES
('ebea761f-8dbe-42ff-9805-2a8c552d9388','7129bc31-88dc-42da-ab80-415a21f2ea9a','qweqweqwe','asdasdsa','open','urgent','2025-10-13 17:02:16','2025-10-13 17:02:16'),
('f20fa9f8-5d93-463a-bf7b-60449fa5dfa4','7129bc31-88dc-42da-ab80-415a21f2ea9a','Rast','RASt','', 'medium','2025-10-15 14:50:50','2025-10-15 14:55:56');

-- 3) Normalize + idempotent upsert
INSERT INTO `support_tickets`
(`id`,`user_id`,`subject`,`message`,`status`,`priority`,`created_at`,`updated_at`)
SELECT
  t.id,
  t.user_id,
  t.subject,
  t.message,
  CASE
    WHEN t.status IN ('open','in_progress','waiting_response','closed') THEN t.status
    ELSE 'open'
  END AS status,
  CASE
    WHEN t.priority IN ('low','medium','high','urgent') THEN t.priority
    ELSE 'medium'
  END AS priority,
  t.created_at,
  t.updated_at
FROM `tmp_support_tickets` t
ON DUPLICATE KEY UPDATE
  `user_id`    = VALUES(`user_id`),
  `subject`    = VALUES(`subject`),
  `message`    = VALUES(`message`),
  `status`     = VALUES(`status`),
  `priority`   = VALUES(`priority`),
  `updated_at` = VALUES(`updated_at`);

DROP TEMPORARY TABLE IF EXISTS tmp_support_tickets;

-- Replies (idempotent)
-- ÖNEMLİ: ticket_id'ler yukarıda oluşturulan gerçek ticket id’leri ile eşleşmeli,
-- yoksa fk_ticket_replies_ticket constraint patlar.
INSERT INTO `ticket_replies`
(`id`,`ticket_id`,`user_id`,`message`,`is_admin`,`created_at`) VALUES
  -- 1. reply → ilk ticket
  ('e76247c0-95dc-4295-8661-3d6b901e4950',
   'ebea761f-8dbe-42ff-9805-2a8c552d9388',
   '7129bc31-88dc-42da-ab80-415a21f2ea9a',
   'rdgdfgdfgdfgdfgdfgdfgdfg',
   1,
   '2025-10-13 15:33:27'),
  -- 2. reply → ikinci ticket
  ('ff93ce04-575c-4c7a-9cbd-b7aec9b9c88b',
   'f20fa9f8-5d93-463a-bf7b-60449fa5dfa4',
   '7129bc31-88dc-42da-ab80-415a21f2ea9a',
   'asd',
   1,
   '2025-10-15 14:23:24')
ON DUPLICATE KEY UPDATE
  `message`    = VALUES(`message`),
  `is_admin`   = VALUES(`is_admin`),
  `created_at` = VALUES(`created_at`);

COMMIT;
