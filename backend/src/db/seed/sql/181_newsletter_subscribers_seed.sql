-- 181_newsletter_subscribers_seed.sql
-- Newsletter subscribers seed

SET NAMES utf8mb4;
SET time_zone = '+00:00';

INSERT INTO `newsletter_subscribers`
(`id`, `email`, `is_verified`, `locale`, `meta`, `unsubscribed_at`, `created_at`, `updated_at`)
VALUES
-- 1) Aktif, doğrulanmış TR abonesi
(
  UUID(),
  'demo.tr.user@example.com',
  1,
  'tr',
  JSON_OBJECT(
    'source', 'seed',
    'tags', JSON_ARRAY('campaign', 'welcome'),
    'note', 'Örnek TR abonesi'
  ),
  NULL,
  '2025-01-05 10:00:00.000',
  '2025-01-05 10:00:00.000'
),

-- 2) Aktif, doğrulanmamış EN abonesi
(
  UUID(),
  'demo.en.user@example.com',
  0,
  'en',
  JSON_OBJECT(
    'source', 'seed',
    'tags', JSON_ARRAY('newsletter'),
    'note', 'Verification pending'
  ),
  NULL,
  '2025-01-06 11:30:00.000',
  '2025-01-06 11:30:00.000'
),

-- 3) Daha önce abone olup unsubscribe etmiş DE abonesi
(
  UUID(),
  'demo.de.user@example.com',
  1,
  'de',
  JSON_OBJECT(
    'source', 'seed',
    'tags', JSON_ARRAY('unsubscribed'),
    'note', 'Kullanıcı bülten aboneliğini iptal etti'
  ),
  '2025-01-10 15:45:00.000',
  '2025-01-03 09:00:00.000',
  '2025-01-10 15:45:00.000'
)
ON DUPLICATE KEY UPDATE
  `is_verified`     = VALUES(`is_verified`),
  `locale`          = VALUES(`locale`),
  `meta`            = VALUES(`meta`),
  `unsubscribed_at` = VALUES(`unsubscribed_at`),
  `updated_at`      = VALUES(`updated_at`);
