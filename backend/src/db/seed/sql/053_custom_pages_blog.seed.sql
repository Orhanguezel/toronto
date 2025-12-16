-- =============================================================
-- FILE: 053_custom_pages_blog.seed.sql
-- Blog sayfaları (BLOG modülü) – custom_pages + custom_pages_i18n
-- 011_catalog_categories.sql & 012_catalog_subcategories.sql ile uyumlu
-- =============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

/* KATEGORİ ID’LERİ */
SET @CAT_BLOG_GENERAL := 'aaaa3001-1111-4111-8111-aaaaaaaa3001'; -- GENEL BLOG YAZILARI
SET @CAT_BLOG_TECH    := 'aaaa3002-1111-4111-8111-aaaaaaaa3002'; -- TEKNİK YAZILAR

/* ALT KATEGORİLER (012) */
SET @SUB_BLOG_MAINT   := 'bbbb3001-1111-4111-8111-bbbbbbbb3001'; -- Bakım Rehberleri
SET @SUB_BLOG_DESIGN  := 'bbbb3002-1111-4111-8111-bbbbbbbb3002'; -- Tasarım Önerileri
SET @SUB_BLOG_TECH_G  := 'bbbb3101-1111-4111-8111-bbbbbbbb3101'; -- Teknik Rehberler

/* SABİT PAGE ID’LERİ */
SET @BLOG_MAINT_1     := '33330001-3333-4333-8333-333333330001';
SET @BLOG_DESIGN_1    := '33330002-3333-4333-8333-333333330002';
SET @BLOG_TECH_1      := '33331001-3333-4333-8333-333333331001';

/* ÖRNEK FEATURED IMAGE */
SET @BLOG_IMG_1 := 'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&h=600&q=80';

-- =============================================================
-- PARENT INSERT: custom_pages
--  - featured_image parent tabloda (lokalsiz)
-- =============================================================
INSERT INTO `custom_pages`
  (`id`, `is_published`, `display_order`,
   `featured_image`, `featured_image_asset_id`,
   `category_id`, `sub_category_id`,
   `created_at`, `updated_at`)
VALUES
  (
    @BLOG_MAINT_1,
    1,
    201,
    @BLOG_IMG_1,
    NULL,
    @CAT_BLOG_GENERAL,
    @SUB_BLOG_MAINT,
    NOW(3),
    NOW(3)
  ),
  (
    @BLOG_DESIGN_1,
    1,
    202,
    @BLOG_IMG_1,
    NULL,
    @CAT_BLOG_GENERAL,
    @SUB_BLOG_DESIGN,
    NOW(3),
    NOW(3)
  ),
  (
    @BLOG_TECH_1,
    1,
    203,
    @BLOG_IMG_1,
    NULL,
    @CAT_BLOG_TECH,
    @SUB_BLOG_TECH_G,
    NOW(3),
    NOW(3)
  )
ON DUPLICATE KEY UPDATE
  `is_published`            = VALUES(`is_published`),
  `display_order`           = VALUES(`display_order`),
  `featured_image`          = VALUES(`featured_image`),
  `featured_image_asset_id` = VALUES(`featured_image_asset_id`),
  `category_id`             = VALUES(`category_id`),
  `sub_category_id`         = VALUES(`sub_category_id`),
  `updated_at`              = VALUES(`updated_at`);

-- =============================================================
-- I18N – BLOG_MAINT_1 (Bakım rehberi)
--  - content: LONGTEXT JSON_VALID => JSON string basıyoruz
-- =============================================================
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
  @BLOG_MAINT_1,
  'tr',
  'Su Soğutma Kulelerinde Periyodik Bakım',
  'su-sogutma-kulelerinde-periyodik-bakim',
  '{\"html\":\"<p>Su soğutma kulelerinizin verimli ve uzun ömürlü çalışması için düzenli bakım yapılması kritik öneme sahiptir.</p>\"}',
  'Su soğutma kulelerinin verimli ve uzun ömürlü çalışması için periyodik bakım adımlarını anlatan rehberin özeti.',
  'Endüstriyel bakım ve mühendislik görseli',
  'Su Soğutma Kulelerinde Periyodik Bakım | Ensotek',
  'Su soğutma kulelerinde periyodik bakım adımlarını anlatan rehber.',
  'ensotek,blog,bakim,periyodik bakım,su sogutma kuleleri',
  NOW(3),
  NOW(3)
),
-- EN
(
  UUID(),
  @BLOG_MAINT_1,
  'en',
  'Periodic Maintenance for Water Cooling Towers',
  'periodic-maintenance-water-cooling-towers',
  '{\"html\":\"<p>Regular maintenance is critical to ensure efficient and long-lasting operation of your water cooling towers.</p>\"}',
  'Summary of the guide on periodic maintenance steps for water cooling towers.',
  'Industrial maintenance and engineering image',
  'Periodic Maintenance for Water Cooling Towers | Ensotek',
  'A guide to periodic maintenance steps for water cooling towers.',
  'ensotek,blog,maintenance,periodic maintenance,water cooling towers',
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

-- =============================================================
-- I18N – BLOG_DESIGN_1 (Tasarım önerileri)
-- =============================================================
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
  @BLOG_DESIGN_1,
  'tr',
  'Endüstriyel Tesisler için Soğutma Kulesi Yerleşimi',
  'endustriyel-tesisler-icin-sogutma-kulesi-yerlesimi',
  '{\"html\":\"<p>Tesis yerleşimi doğru planlandığında, su soğutma kulelerinin verimi ve bakım kolaylığı önemli ölçüde artar.</p>\"}',
  'Endüstriyel tesislerde su soğutma kulelerinin doğru konumlandırılması için tasarım önerilerinin kısa özeti.',
  'Endüstriyel bakım ve mühendislik görseli',
  'Endüstriyel Tesisler için Soğutma Kulesi Yerleşimi | Ensotek',
  'Su soğutma kulelerinin endüstriyel tesis yerleşiminde konumlandırılması için tasarım önerileri.',
  'ensotek,blog,tesis yerlesimi,tasarim onerileri,su sogutma kuleleri',
  NOW(3),
  NOW(3)
),
-- EN
(
  UUID(),
  @BLOG_DESIGN_1,
  'en',
  'Cooling Tower Layout for Industrial Plants',
  'cooling-tower-layout-industrial-plants',
  '{\"html\":\"<p>When plant layout is planned correctly, the efficiency and maintainability of water cooling towers increase significantly.</p>\"}',
  'Short summary on design tips for positioning water cooling towers in industrial plant layouts.',
  'Industrial maintenance and engineering image',
  'Cooling Tower Layout for Industrial Plants | Ensotek',
  'Design tips for positioning water cooling towers in industrial plant layouts.',
  'ensotek,blog,plant layout,design tips,water cooling towers',
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

-- =============================================================
-- I18N – BLOG_TECH_1 (Teknik rehber)
-- =============================================================
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
  @BLOG_TECH_1,
  'tr',
  'FRP Soğutma Kulelerinde Isı Transferi Temelleri',
  'frp-sogutma-kulelerinde-isi-transferi-temelleri',
  '{\"html\":\"<p>FRP su soğutma kulelerinde ısı transferi; hava debisi, dolgu tipi ve su dağıtım sistemine bağlıdır.</p>\"}',
  'FRP su soğutma kulelerinde ısı transferini etkileyen temel parametreleri özetleyen teknik yazı özeti.',
  'Endüstriyel bakım ve mühendislik görseli',
  'FRP Soğutma Kulelerinde Isı Transferi Temelleri | Ensotek',
  'FRP su soğutma kulelerinde ısı transferinin temel prensiplerini anlatan teknik yazı.',
  'ensotek,blog,frp,isi transferi,teknik rehber,su sogutma kuleleri',
  NOW(3),
  NOW(3)
),
-- EN
(
  UUID(),
  @BLOG_TECH_1,
  'en',
  'Basics of Heat Transfer in FRP Cooling Towers',
  'basics-heat-transfer-frp-cooling-towers',
  '{\"html\":\"<p>Heat transfer in FRP water cooling towers depends on air flow, fill type and water distribution system.</p>\"}',
  'Technical summary of key parameters affecting heat transfer in FRP water cooling towers.',
  'Industrial maintenance and engineering image',
  'Basics of Heat Transfer in FRP Cooling Towers | Ensotek',
  'Technical article explaining fundamental principles of heat transfer in FRP water cooling towers.',
  'ensotek,blog,frp,heat transfer,technical guide,water cooling towers',
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
