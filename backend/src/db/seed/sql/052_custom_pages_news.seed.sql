-- =============================================================
-- FILE: 052_custom_pages_news.seed.sql
-- Haber sayfaları (NEWS modülü) – custom_pages + custom_pages_i18n
-- 011_catalog_categories.sql & 012_catalog_subcategories.sql ile uyumlu
-- =============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

/* KATEGORİ ID’LERİ (011 & 012 ile hizalı) */
SET @CAT_NEWS_GENERAL  := 'aaaa2001-1111-4111-8111-aaaaaaaa2001'; -- GENEL HABERLER
SET @CAT_NEWS_DUYS    := 'aaaa2003-1111-4111-8111-aaaaaaaa2003'; -- DUYURULAR
SET @CAT_NEWS_PRESS   := 'aaaa2004-1111-4111-8111-aaaaaaaa2004'; -- BASINDA ENSOTEK

-- ALT KATEGORİLER (012_catalog_subcategories.sql)
SET @SUB_NEWS_GENERAL_ANN  := 'bbbb2001-1111-4111-8111-bbbbbbbb2001'; -- Duyurular (genel)
SET @SUB_NEWS_PRESS_ONLINE := 'bbbb2302-1111-4111-8111-bbbbbbbb2302'; -- Online Haberler

/* SABİT PAGE ID’LERİ */
SET @NEWS_ANNOUNCE_1 := '22220001-2222-4222-8222-222222220001';
SET @NEWS_ANNOUNCE_2 := '22220002-2222-4222-8222-222222220002';
SET @NEWS_PRESS_1    := '22221001-2222-4222-8222-222222221001';

/* ÖRNEK GÖRSELLER */
SET @IMG_NEWS_LAUNCH :=
  'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&h=600&q=80';
SET @IMG_NEWS_MAINT :=
  'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&h=600&q=80';
SET @IMG_NEWS_PRESS :=
  'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&h=600&q=80';

/* PARENT INSERT */
INSERT INTO `custom_pages`
  (`id`, `is_published`, `display_order`,
   `featured_image`, `featured_image_asset_id`,
   `category_id`, `sub_category_id`,
   `created_at`, `updated_at`)
VALUES
  -- Genel duyuru
  (
    @NEWS_ANNOUNCE_1,
    1,
    101,
    @IMG_NEWS_LAUNCH,
    NULL,
    @CAT_NEWS_GENERAL,
    @SUB_NEWS_GENERAL_ANN,
    NOW(3),
    NOW(3)
  ),
  -- Bakım/servis duyurusu
  (
    @NEWS_ANNOUNCE_2,
    1,
    102,
    @IMG_NEWS_MAINT,
    NULL,
    @CAT_NEWS_DUYS,
    'bbbb2202-1111-4111-8111-bbbbbbbb2202', -- Bakım / Servis Duyuruları
    NOW(3),
    NOW(3)
  ),
  -- Basında biz – online haber
  (
    @NEWS_PRESS_1,
    1,
    103,
    @IMG_NEWS_PRESS,
    NULL,
    @CAT_NEWS_PRESS,
    @SUB_NEWS_PRESS_ONLINE,
    NOW(3),
    NOW(3)
  )
ON DUPLICATE KEY UPDATE
  `is_published`    = VALUES(`is_published`),
  `display_order`   = VALUES(`display_order`),
  `category_id`     = VALUES(`category_id`),
  `sub_category_id` = VALUES(`sub_category_id`),
  `featured_image`  = VALUES(`featured_image`),
  `updated_at`      = VALUES(`updated_at`);

/* I18N – NEWS_ANNOUNCE_1 */
INSERT INTO `custom_pages_i18n`
  (`id`, `page_id`, `locale`,
   `title`, `slug`, `content`,
   `summary`,
   `featured_image_alt`, `meta_title`, `meta_description`,
   `tags`,
   `created_at`, `updated_at`)
VALUES
-- TR
(
  UUID(),
  @NEWS_ANNOUNCE_1,
  'tr',
  'Yeni Proje Lansmanı',
  'yeni-proje-lansmani',
  JSON_OBJECT(
    'html',
    '<p>Ensotek olarak yeni su soğutma kulesi projemizin lansmanını duyurmaktan mutluluk duyuyoruz.</p>'
  ),
  'Ensotek''in yeni su soğutma kulesi projesinin lansmanına ilişkin kısa duyuru.',
  'Yeni proje lansmanı için endüstriyel tesis görseli',
  'Yeni Proje Lansmanı | Ensotek',
  'Ensotek''in yeni su soğutma kulesi projesi hakkında duyuru.',
  'ensotek,yeni proje,lansman,haber,su sogutma kuleleri',
  NOW(3),
  NOW(3)
),
-- EN
(
  UUID(),
  @NEWS_ANNOUNCE_1,
  'en',
  'New Project Launch',
  'new-project-launch',
  JSON_OBJECT(
    'html',
    '<p>We are pleased to announce the launch of our new water cooling tower project.</p>'
  ),
  'Short announcement about the launch of Ensotek''s new water cooling tower project.',
  'Industrial facility image for new project launch',
  'New Project Launch | Ensotek',
  'Announcement of Ensotek''s new water cooling tower project.',
  'ensotek,new project,launch,news,water cooling towers',
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `title`              = VALUES(`title`),
  `slug`               = VALUES(`slug`),
  `content`            = VALUES(`content`),
  `summary`            = VALUES(`summary`),
  `featured_image_alt` = VALUES(`featured_image_alt`),
  `meta_title`         = VALUES(`meta_title`),
  `meta_description`   = VALUES(`meta_description`),
  `tags`               = VALUES(`tags`),
  `updated_at`         = VALUES(`updated_at`);

/* I18N – NEWS_ANNOUNCE_2 (Bakım / Servis) */
INSERT INTO `custom_pages_i18n`
  (`id`, `page_id`, `locale`,
   `title`, `slug`, `content`,
   `summary`,
   `featured_image_alt`, `meta_title`, `meta_description`,
   `tags`,
   `created_at`, `updated_at`)
VALUES
-- TR
(
  UUID(),
  @NEWS_ANNOUNCE_2,
  'tr',
  'Bakım Çalışması Duyurusu',
  'bakim-calismasi-duyurusu',
  JSON_OBJECT(
    'html',
    '<p>Planlı bakım çalışmaları nedeniyle bazı tesislerimizde kısa süreli servis kesintileri yaşanabilir.</p>'
  ),
  'Planlı bakım çalışmaları nedeniyle yaşanabilecek kısa süreli servis kesintileri hakkında bilgilendirme.',
  'Endüstriyel bakım çalışması görseli',
  'Bakım Çalışması Duyurusu | Ensotek',
  'Ensotek tesislerinde planlı bakım çalışmaları hakkında duyuru.',
  'ensotek,bakim,servis,duyuru,planli kesinti',
  NOW(3),
  NOW(3)
),
-- EN
(
  UUID(),
  @NEWS_ANNOUNCE_2,
  'en',
  'Maintenance Notice',
  'maintenance-notice',
  JSON_OBJECT(
    'html',
    '<p>Due to scheduled maintenance, some of our facilities may experience short service interruptions.</p>'
  ),
  'Information about possible short service interruptions due to scheduled maintenance.',
  'Industrial maintenance notice illustration',
  'Maintenance Notice | Ensotek',
  'Announcement about scheduled maintenance in Ensotek facilities.',
  'ensotek,maintenance,service,notice,planned downtime',
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `title`              = VALUES(`title`),
  `slug`               = VALUES(`slug`),
  `content`            = VALUES(`content`),
  `summary`            = VALUES(`summary`),
  `featured_image_alt` = VALUES(`featured_image_alt`),
  `meta_title`         = VALUES(`meta_title`),
  `meta_description`   = VALUES(`meta_description`),
  `tags`               = VALUES(`tags`),
  `updated_at`         = VALUES(`updated_at`);

/* I18N – NEWS_PRESS_1 (Basında Biz) */
INSERT INTO `custom_pages_i18n`
  (`id`, `page_id`, `locale`,
   `title`, `slug`, `content`,
   `summary`,
   `featured_image_alt`, `meta_title`, `meta_description`,
   `tags`,
   `created_at`, `updated_at`)
VALUES
-- TR
(
  UUID(),
  @NEWS_PRESS_1,
  'tr',
  'Ensotek Basında',
  'ensotek-basinda',
  JSON_OBJECT(
    'html',
    '<p>Ensotek''in su soğutma kuleleri, sektörel bir dergide detaylı bir makale ile yer aldı.</p>'
  ),
  'Ensotek su soğutma kulelerinin sektörel bir dergide yayımlanan makale ile basında yer almasına dair kısa özet.',
  'Basın haberi ve dergi sayfası görseli',
  'Ensotek Basında | Ensotek',
  'Ensotek hakkında yayınlanan basın haberi.',
  'ensotek,basinda biz,haber,dergi,makale,su sogutma kuleleri',
  NOW(3),
  NOW(3)
),
-- EN
(
  UUID(),
  @NEWS_PRESS_1,
  'en',
  'Ensotek in the Press',
  'ensotek-in-the-press',
  JSON_OBJECT(
    'html',
    '<p>Ensotek''s water cooling towers were featured in an in-depth article in a sectoral magazine.</p>'
  ),
  'Short overview of the press coverage featuring Ensotek''s water cooling towers in a sectoral magazine.',
  'Press article and magazine page image',
  'Ensotek in the Press | Ensotek',
  'Press coverage about Ensotek water cooling towers.',
  'ensotek,in the press,press coverage,sector magazine,water cooling towers',
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `title`              = VALUES(`title`),
  `slug`               = VALUES(`slug`),
  `content`            = VALUES(`content`),
  `summary`            = VALUES(`summary`),
  `featured_image_alt` = VALUES(`featured_image_alt`),
  `meta_title`         = VALUES(`meta_title`),
  `meta_description`   = VALUES(`meta_description`),
  `tags`               = VALUES(`tags`),
  `updated_at`         = VALUES(`updated_at`);

COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
