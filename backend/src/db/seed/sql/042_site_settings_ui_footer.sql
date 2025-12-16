-- =============================================================
-- 042_site_settings_ui_footer.sql  (Footer UI metinleri)
-- =============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

/*
  Key: ui_footer
  Value: JSON_OBJECT(...) – footer bileşenlerinde kullanılan sabit UI metinleri
  NOT: Link başlıkları (About, Blog, vs.) artık menu_items / footer_sections'tan gelecek.
*/

INSERT INTO site_settings (id, `key`, locale, `value`, created_at, updated_at) VALUES
(
  UUID(),
  'ui_footer',
  'tr',
  JSON_OBJECT(
    -- Sütun başlıkları
    'company_title',        'Şirket',
    'services',             'Hizmetlerimiz',
    'explore',              'Keşfet',
    'contact',              'İletişim',

    -- Contact alanı ARIA metinleri
    'phone_aria',           'Telefon ile ara',
    'email_aria',           'E-posta gönder',

    -- Menü durum metinleri (RTK / menu_items için)
    'menu_loading',         'Bağlantılar yükleniyor...',
    'menu_empty',           'Bağlantı tanımlı değil',

    -- Copyright
    'copyright_prefix',     '',
    'copyright_suffix',     'Tüm hakları saklıdır.'
  ),
  NOW(3),
  NOW(3)
),
(
  UUID(),
  'ui_footer',
  'en',
  JSON_OBJECT(
    -- Column titles
    'company_title',        'Company',
    'services',             'Services',
    'explore',              'Explore',
    'contact',              'Contact',

    -- Contact ARIA texts
    'phone_aria',           'Call by phone',
    'email_aria',           'Send email',

    -- Menu status texts (RTK / menu_items)
    'menu_loading',         'Loading links...',
    'menu_empty',           'No links defined',

    -- Copyright
    'copyright_prefix',     '',
    'copyright_suffix',     'All rights reserved.'
  ),
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `value`    = VALUES(`value`),
  updated_at = VALUES(updated_at);

-- TR → DE otomatik kopya (başlangıç için TR ile doldursun)
INSERT INTO site_settings (id, `key`, locale, `value`, created_at, updated_at)
SELECT UUID(), s.`key`, 'de', s.`value`, NOW(3), NOW(3)
FROM site_settings s
WHERE s.locale = 'tr'
  AND s.`key` = 'ui_footer'
  AND NOT EXISTS (
    SELECT 1
    FROM site_settings t
    WHERE t.`key` = s.`key`
      AND t.locale = 'de'
  );
