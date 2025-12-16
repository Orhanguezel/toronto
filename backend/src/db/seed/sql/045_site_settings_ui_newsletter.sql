-- =============================================================
-- 045_site_settings_ui_newsletter.sql  (Newsletter UI metinleri)
-- =============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

INSERT INTO site_settings (id, `key`, locale, `value`, created_at, updated_at)
VALUES
(
  UUID(),
  'ui_newsletter',
  'tr',
  JSON_OBJECT(
    'ui_newsletter_section_aria', 'Bülten aboneliği alanı',
    'ui_newsletter_title',        'Güncel kalın',
    'ui_newsletter_desc',         'Projelerimiz ve çözümlerimiz hakkında haberleri e-posta ile alın.',
    'ui_newsletter_placeholder',  'E-posta adresiniz',
    'ui_newsletter_email_aria',   'E-posta adresiniz',
    'ui_newsletter_cta',          'Bültene abone ol',
    'ui_newsletter_ok',           'Başarıyla abone oldunuz, teşekkürler!',
    'ui_newsletter_fail',         'Abonelik işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
  ),
  NOW(3),
  NOW(3)
),
(
  UUID(),
  'ui_newsletter',
  'en',
  JSON_OBJECT(
    'ui_newsletter_section_aria', 'Newsletter subscription section',
    'ui_newsletter_title',        'Stay updated',
    'ui_newsletter_desc',         'Receive news about our projects and solutions by email.',
    'ui_newsletter_placeholder',  'Your email address',
    'ui_newsletter_email_aria',   'Your email address',
    'ui_newsletter_cta',          'Subscribe to newsletter',
    'ui_newsletter_ok',           'You have been subscribed. Thank you!',
    'ui_newsletter_fail',         'An error occurred while subscribing. Please try again later.'
  ),
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `value`    = VALUES(`value`),
  updated_at = VALUES(updated_at);

-- TR → DE otomatik kopya (Almanca özel çeviriler gelene kadar)
INSERT INTO site_settings (id, `key`, locale, `value`, created_at, updated_at)
SELECT UUID(), s.`key`, 'de', s.`value`, NOW(3), NOW(3)
FROM site_settings s
WHERE s.locale = 'tr'
  AND s.`key` = 'ui_newsletter'
  AND NOT EXISTS (
    SELECT 1
    FROM site_settings t
    WHERE t.`key` = s.`key`
      AND t.locale = 'de'
  );
