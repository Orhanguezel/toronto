-- =============================================================
-- 049_site_settings_ui_hero.sql
-- Ensotek – UI Hero (site_settings.ui_hero)
-- =============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- -------------------------------------------------------------
-- TR
-- -------------------------------------------------------------
INSERT INTO site_settings (id, `key`, locale, `value`, created_at, updated_at)
VALUES
(
  UUID(),
  'ui_hero',
  'tr',
  JSON_OBJECT(
    -- Üst küçük etiket
    'ui_hero_kicker_prefix', 'Ensotek',
    'ui_hero_kicker_brand',  'Mühendislik',

    -- Hero başlık & açıklama fallback
    'ui_hero_title_fallback',
      'Endüstriyel su soğutma kulelerinde uzman çözüm ortağınız',
    'ui_hero_desc_fallback',
      'Enerji santralleri, endüstriyel tesisler ve ticari binalar için yüksek verimli su soğutma kulesi tasarım, imalat, montaj ve devreye alma hizmetleri sunuyoruz.',

    -- CTA
    'ui_hero_cta', 'Teklif Al',

    -- Slider navigation
    'ui_hero_prev', 'Önceki görsel',
    'ui_hero_next', 'Sonraki görsel'
  ),
  NOW(3),
  NOW(3)
),
-- -------------------------------------------------------------
-- EN
-- -------------------------------------------------------------
(
  UUID(),
  'ui_hero',
  'en',
  JSON_OBJECT(
    'ui_hero_kicker_prefix', 'Ensotek',
    'ui_hero_kicker_brand',  'Engineering',

    'ui_hero_title_fallback',
      'Your expert partner in industrial cooling tower solutions',
    'ui_hero_desc_fallback',
      'We design, manufacture and commission high-efficiency cooling tower systems for power plants, industrial facilities and commercial buildings.',

    'ui_hero_cta', 'Request a quote',

    'ui_hero_prev', 'Previous slide',
    'ui_hero_next', 'Next slide'
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
  AND s.`key` = 'ui_hero'
  AND NOT EXISTS (
    SELECT 1
    FROM site_settings t
    WHERE t.`key` = s.`key`
      AND t.locale = 'de'
  );
