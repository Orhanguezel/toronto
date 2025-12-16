-- =============================================================
-- 049-2_site_settings_ui_references.sql  (References UI metinleri)
-- site_settings.key = 'ui_references'
-- =============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

INSERT INTO site_settings (id, `key`, locale, `value`, created_at, updated_at)
VALUES
-- -------------------------------------------------------------
-- TR
-- -------------------------------------------------------------
(
  UUID(),
  'ui_references',
  'tr',
  JSON_OBJECT(
    -- Sayfa başlığı (Banner + page title)
    'ui_references_page_title',   'Referanslarımız',

    -- Home section başlığı (slider başlığı)
    'ui_references_title',        'Referanslarımız',

    -- Section subtitle (Ensotek Referanslar / Referanslarımız)
    'ui_references_subprefix',    'Ensotek',
    'ui_references_sublabel',     'Referanslar',

    -- Sayfa intro metni
    'ui_references_page_intro',
      'Yurt içi ve yurt dışında tamamladığımız projelerden seçili referanslarımız.',

    -- CTA / link text (home slider butonu)
    'ui_references_view_all',     'Tüm Referanslar',

    -- Slider ok metinleri
    'ui_references_prev',         'Önceki',
    'ui_references_next',         'Sonraki',

    -- Tab metinleri (liste sayfası)
    'ui_references_tab_all',      'Tümü',
    'ui_references_tab_other',    'Diğer Projeler',

    -- Boş state (liste sayfası)
    'ui_references_empty',
      'Şu anda görüntülenecek referans bulunmamaktadır.'
  ),
  NOW(3),
  NOW(3)
),
-- -------------------------------------------------------------
-- EN
-- -------------------------------------------------------------
(
  UUID(),
  'ui_references',
  'en',
  JSON_OBJECT(
    -- Page title (Banner + page title)
    'ui_references_page_title',   'Our References',

    -- Home section title (slider title)
    'ui_references_title',        'Our References',

    -- Section subtitle
    'ui_references_subprefix',    'Ensotek',
    'ui_references_sublabel',     'References',

    -- Page intro text
    'ui_references_page_intro',
      'Selected references from our completed projects in Turkey and abroad.',

    -- CTA / link text (home slider button)
    'ui_references_view_all',     'View all references',

    -- Slider arrows
    'ui_references_prev',         'Previous',
    'ui_references_next',         'Next',

    -- Tabs (list page)
    'ui_references_tab_all',      'All',
    'ui_references_tab_other',    'Other Projects',

    -- Empty state (list page)
    'ui_references_empty',
      'There are no references to display at the moment.'
  ),
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `value`    = VALUES(`value`),
  updated_at = VALUES(updated_at);

-- -------------------------------------------------------------
-- TR → DE otomatik kopya (Almanca özel çeviri gelene kadar)
-- -------------------------------------------------------------
INSERT INTO site_settings (id, `key`, locale, `value`, created_at, updated_at)
SELECT UUID(), s.`key`, 'de', s.`value`, NOW(3), NOW(3)
FROM site_settings s
WHERE s.locale = 'tr'
  AND s.`key` = 'ui_references'
  AND NOT EXISTS (
    SELECT 1
    FROM site_settings t
    WHERE t.`key` = s.`key`
      AND t.locale = 'de'
  );
