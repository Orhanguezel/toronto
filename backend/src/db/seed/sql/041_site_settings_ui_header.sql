-- =============================================================
-- 041_site_settings_ui_header.sql  (Header UI metinleri)
-- =============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

/* 
  Key: ui_header
  Value: JSON_OBJECT(...) – header offcanvas'ta kullanılan tüm metinler
*/

INSERT INTO site_settings (id, `key`, locale, `value`, created_at, updated_at) VALUES
(
  UUID(),
  'ui_header',
  'tr',
  JSON_OBJECT(
    'language_label',      'Dil',
    'login',               'Giriş Yap',
    'register',            'Kayıt Ol',
    'search_placeholder',  'Arama...',
    'search_aria',         'Ara',
    'contact_info_title',  'İletişim Bilgileri',
    'call_aria',           'Ara',
    'email_aria',          'E-posta',
    'close_aria',          'Kapat',
    'open_menu_aria',      'Menüyü Aç',
    'open_sidebar_aria',   'Yan Menüyü Aç'
  ),
  NOW(3),
  NOW(3)
),
(
  UUID(),
  'ui_header',
  'en',
  JSON_OBJECT(
    'language_label',      'Language',
    'login',               'Login',
    'register',            'Register',
    'search_placeholder',  'Search...',
    'search_aria',         'Search',
    'contact_info_title',  'Contact Info',
    'call_aria',           'Call',
    'email_aria',          'Email',
    'close_aria',          'Close',
    'open_menu_aria',      'Open Menu',
    'open_sidebar_aria',   'Open Sidebar'
  ),
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `value`    = VALUES(`value`),
  updated_at = VALUES(updated_at);

-- İstersen TR → DE otomatik kopya (başlangıçta TR ile doldursun)
INSERT INTO site_settings (id, `key`, locale, `value`, created_at, updated_at)
SELECT UUID(), s.`key`, 'de', s.`value`, NOW(3), NOW(3)
FROM site_settings s
WHERE s.locale = 'tr'
  AND s.`key` = 'ui_header'
  AND NOT EXISTS (
    SELECT 1
    FROM site_settings t
    WHERE t.`key` = s.`key`
      AND t.locale = 'de'
  );
