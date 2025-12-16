-- =============================================================
-- 043_site_settings_ui_common.sql  (Common UI metinleri)
-- Şimdilik: ui_banner (breadcrumb) + ui_contact (iletişim formu)
-- =============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- =============================================================
-- ui_banner : breadcrumb vb. ortak UI metinleri
-- =============================================================

INSERT INTO site_settings (id, `key`, locale, `value`, created_at, updated_at) VALUES
(
  UUID(),
  'ui_banner',
  'tr',
  JSON_OBJECT(
    'ui_breadcrumb_home', 'Ana Sayfa'
  ),
  NOW(3),
  NOW(3)
),
(
  UUID(),
  'ui_banner',
  'en',
  JSON_OBJECT(
    'ui_breadcrumb_home', 'Home'
  ),
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `value`    = VALUES(`value`),
  updated_at = VALUES(updated_at);

-- =============================================================
-- ui_contact : İletişim sayfası UI metinleri
-- UI_FALLBACK_EN.contact ile bire bir aynı key'ler
-- =============================================================

INSERT INTO site_settings (id, `key`, locale, `value`, created_at, updated_at) VALUES
(
  UUID(),
  'ui_contact',
  'tr',
  JSON_OBJECT(
    'ui_contact_subprefix',                  'İletişime',
    'ui_contact_sublabel',                   'geçin',
    'ui_contact_title_left',                 'Konuşalım',
    'ui_contact_tagline',                    '2009''dan beri işletmeleri büyütüyoruz, sizin için de yapalım!',
    'ui_contact_quick_email_placeholder',    'E-posta adresiniz',
    'ui_contact_form_title',                 'Danışmanlık talebi oluşturun',
    'ui_contact_first_name',                 'Adınız*',
    'ui_contact_last_name',                  'Soyadınız',
    'ui_contact_company',                    'Firma adı',
    'ui_contact_website',                    'Web sitesi',
    'ui_contact_phone',                      'Telefon numarası',
    'ui_contact_email',                      'E-posta*',
    'ui_contact_select_label',               'Hizmet türünü seçin',
    'ui_contact_service_cooling_towers',     'Soğutma Kuleleri',
    'ui_contact_service_maintenance',        'Bakım',
    'ui_contact_service_modernization',      'Modernizasyon',
    'ui_contact_service_other',              'Diğer',
    'ui_contact_terms_prefix',               'Şunları kabul ediyorum:',
    'ui_contact_terms',                      'Şartlar',
    'ui_contact_conditions',                 'Koşullar',
    'ui_contact_submit',                     'Talebi Gönder',
    'ui_contact_sending',                    'Gönderiliyor...',
    'ui_contact_success',                    'Teşekkürler! Mesajınız başarılı şekilde iletildi.',
    'ui_contact_error_generic',              'Gönderim başarısız oldu. Lütfen tekrar deneyin.'
  ),
  NOW(3),
  NOW(3)
),
(
  UUID(),
  'ui_contact',
  'en',
  JSON_OBJECT(
    'ui_contact_subprefix',                  'Get',
    'ui_contact_sublabel',                   'in touch',
    'ui_contact_title_left',                 'Let''s Talk',
    'ui_contact_tagline',                    'We''ve been growing businesses since 2009, let us do it for you!',
    'ui_contact_quick_email_placeholder',    'Enter Mail',
    'ui_contact_form_title',                 'Schedule a Consultation',
    'ui_contact_first_name',                 'First Name*',
    'ui_contact_last_name',                  'Last Name',
    'ui_contact_company',                    'Company Name',
    'ui_contact_website',                    'Website',
    'ui_contact_phone',                      'Phone Number',
    'ui_contact_email',                      'Email*',
    'ui_contact_select_label',               'Select the services',
    'ui_contact_service_cooling_towers',     'Cooling Towers',
    'ui_contact_service_maintenance',        'Maintenance',
    'ui_contact_service_modernization',      'Modernization',
    'ui_contact_service_other',              'Other',
    'ui_contact_terms_prefix',               'Accept Our',
    'ui_contact_terms',                      'Terms',
    'ui_contact_conditions',                 'Conditions',
    'ui_contact_submit',                     'Submit Query',
    'ui_contact_sending',                    'Sending...',
    'ui_contact_success',                    'Thanks! Your message has been sent.',
    'ui_contact_error_generic',              'Failed to send. Please try again.'
  ),
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `value`    = VALUES(`value`),
  updated_at = VALUES(updated_at);

-- =============================================================
-- TR → DE otomatik kopya (placeholder amaçlı)
-- ui_banner + ui_contact için
-- =============================================================

INSERT INTO site_settings (id, `key`, locale, `value`, created_at, updated_at)
SELECT UUID(), s.`key`, 'de', s.`value`, NOW(3), NOW(3)
FROM site_settings s
WHERE s.locale = 'tr'
  AND s.`key` IN ('ui_banner', 'ui_contact')
  AND NOT EXISTS (
    SELECT 1
    FROM site_settings t
    WHERE t.`key` = s.`key`
      AND t.locale = 'de'
  );
