-- =============================================================
-- 049-1_site_settings_ui_about.sql  (About + About Stats UI metinleri)
-- site_settings.key IN ('ui_about', 'ui_about_stats')
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
  'ui_about',
  'tr',
  JSON_OBJECT(
    -- Sayfa başlığı (Banner)
    'ui_about_page_title',      'Hakkımızda',

    -- Section subtitle
    'ui_about_subprefix',       'Ensotek',
    'ui_about_sublabel',        'Hakkımızda',

    -- Fallback başlık (home about section + page içi fallback)
    'ui_about_fallback_title',  'Ensotek Su Soğutma Kuleleri Hakkında',

    -- CTA / link text
    'ui_about_view_all',        'Tümünü Gör'
  ),
  NOW(3),
  NOW(3)
),
-- -------------------------------------------------------------
-- EN
-- -------------------------------------------------------------
(
  UUID(),
  'ui_about',
  'en',
  JSON_OBJECT(
    -- Page title (Banner)
    'ui_about_page_title',      'About Us',

    -- Section subtitle
    'ui_about_subprefix',       'Ensotek',
    'ui_about_sublabel',        'About',

    -- Fallback title (home about section + page content fallback)
    'ui_about_fallback_title',  'About Ensotek Water Cooling Towers',

    -- CTA / link text
    'ui_about_view_all',        'View all'
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
  AND s.`key` = 'ui_about'
  AND NOT EXISTS (
    SELECT 1
    FROM site_settings t
    WHERE t.`key` = s.`key`
      AND t.locale = 'de'
  );

-- =============================================================
-- ui_about_stats – Hakkımızda Sayaçları (AboutCounter.tsx)
-- site_settings.key = 'ui_about_stats'
-- =============================================================

INSERT INTO site_settings (id, `key`, locale, `value`, created_at, updated_at)
VALUES
-- -------------------------------------------------------------
-- TR
-- -------------------------------------------------------------
(
  UUID(),
  'ui_about_stats',
  'tr',
  JSON_OBJECT(
    -- Referanslar
    'ui_about_stats_refs_value',  '120',
    'ui_about_stats_refs_title',  'Sanayi referansımız',
    'ui_about_stats_refs_label',  'Referans müşteri & tesis',

    -- Projeler
    'ui_about_stats_projects_value', '250',
    'ui_about_stats_projects_title', 'Tamamlanan proje',
    'ui_about_stats_projects_label', 'Yurtiçi ve yurtdışı projeler',

    -- Yıllık tecrübe
    'ui_about_stats_years_value',  '20',
    'ui_about_stats_years_title',  'Yıllık tecrübe',
    'ui_about_stats_years_label',  'Su soğutma ve proses soğutma',

    -- Sonekler (sayı sonrası “k+” vs; şimdilik sadece “+”)
    'ui_about_stats_suffix_letter', '',
    'ui_about_stats_suffix_plus',   '+'
  ),
  NOW(3),
  NOW(3)
),
-- -------------------------------------------------------------
-- EN
-- -------------------------------------------------------------
(
  UUID(),
  'ui_about_stats',
  'en',
  JSON_OBJECT(
    -- References
    'ui_about_stats_refs_value',  '120',
    'ui_about_stats_refs_title',  'Industrial references',
    'ui_about_stats_refs_label',  'Reference customers & plants',

    -- Projects
    'ui_about_stats_projects_value', '250',
    'ui_about_stats_projects_title', 'Completed projects',
    'ui_about_stats_projects_label', 'Domestic and international projects',

    -- Years of experience
    'ui_about_stats_years_value',  '20',
    'ui_about_stats_years_title',  'Years of experience',
    'ui_about_stats_years_label',  'Cooling tower & process cooling',

    -- Suffixes
    'ui_about_stats_suffix_letter', '',
    'ui_about_stats_suffix_plus',   '+'
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
  AND s.`key` = 'ui_about_stats'
  AND NOT EXISTS (
    SELECT 1
    FROM site_settings t
    WHERE t.`key` = s.`key`
      AND t.locale = 'de'
  );
