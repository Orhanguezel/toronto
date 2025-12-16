-- 171_footer_sections_seed.sql
-- Seed for footer_sections + footer_sections_i18n (tr, en)

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ============================================================
-- 1) PARENT KAYITLAR (footer_sections)
-- ============================================================

INSERT INTO `footer_sections`
(`id`, `is_active`, `display_order`, `created_at`, `updated_at`)
VALUES
-- Hızlı Erişim
('59583ef1-0ba1-4c7c-b806-84fd204b52b9',
  1, 0, '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),

-- Kurumsal
('f942a930-6743-4ecc-b4b3-1fd6b77f9d77',
  1, 1, '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000')
ON DUPLICATE KEY UPDATE
  `is_active`     = VALUES(`is_active`),
  `display_order` = VALUES(`display_order`),
  `updated_at`    = VALUES(`updated_at`);

-- ============================================================
-- 2) I18N KAYITLAR (footer_sections_i18n) – locale: 'tr'
-- ============================================================

INSERT INTO `footer_sections_i18n`
(`id`, `section_id`, `locale`, `title`, `slug`, `description`, `created_at`, `updated_at`)
VALUES
-- Hızlı Erişim (tr)
('69583ef1-0ba1-4c7c-b806-84fd204b52b9',
 '59583ef1-0ba1-4c7c-b806-84fd204b52b9',
 'tr',
 'Hızlı Erişim',
 'hizli-erisim',
 'Sık kullanılan sayfalara hızlı erişim bağlantıları.',
 '2024-01-01 00:00:00.000',
 '2024-01-01 00:00:00.000'),

-- Kurumsal (tr)
('f942a930-6743-4ecc-b4b3-1fd6b77f9d78',
 'f942a930-6743-4ecc-b4b3-1fd6b77f9d77',
 'tr',
 'Kurumsal',
 'kurumsal',
 'Şirket ve yasal bilgilere ait bağlantılar.',
 '2024-01-01 00:00:00.000',
 '2024-01-01 00:00:00.000')
ON DUPLICATE KEY UPDATE
  `title`       = VALUES(`title`),
  `slug`        = VALUES(`slug`),
  `description` = VALUES(`description`),
  `updated_at`  = VALUES(`updated_at`);

-- ============================================================
-- 3) I18N KAYITLAR (footer_sections_i18n) – locale: 'en'
-- ============================================================

INSERT INTO `footer_sections_i18n`
(`id`, `section_id`, `locale`, `title`, `slug`, `description`, `created_at`, `updated_at`)
VALUES
-- Quick Access (en) – Hızlı Erişim
('09583ef1-0ba1-4c7c-b806-84fd204b52b9',
 '59583ef1-0ba1-4c7c-b806-84fd204b52b9',
 'en',
 'Quick Access',
 'quick-access',
 'Quick links to the most frequently used pages.',
 '2024-01-01 00:00:00.000',
 '2024-01-01 00:00:00.000'),

-- Corporate (en) – Kurumsal
('e942a930-6743-4ecc-b4b3-1fd6b77f9d77',
 'f942a930-6743-4ecc-b4b3-1fd6b77f9d77',
 'en',
 'Corporate',
 'corporate',
 'Links about the company, legal pages and corporate information.',
 '2024-01-01 00:00:00.000',
 '2024-01-01 00:00:00.000')
ON DUPLICATE KEY UPDATE
  `title`       = VALUES(`title`),
  `slug`        = VALUES(`slug`),
  `description` = VALUES(`description`),
  `updated_at`  = VALUES(`updated_at`);
