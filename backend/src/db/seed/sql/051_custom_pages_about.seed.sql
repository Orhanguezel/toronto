-- =============================================================
-- FILE: 051_custom_pages_about.seed.sql
-- Ensotek Kurumsal Sayfaları (Misyon / Vizyon / Hakkımızda)
-- categories + sub_categories ile ilişkili
-- 011_catalog_categories.sql & 012_catalog_subcategories.sql ile uyumlu
-- =============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

-- -------------------------------------------------------------
-- SABİT ID’LER (parent)
-- -------------------------------------------------------------

-- 1) Misyonumuz / Our Mission
SET @PAGE_MISSION := '11111111-2222-3333-4444-555555555571';

-- 2) Vizyonumuz / Our Vision
SET @PAGE_VISION  := '11111111-2222-3333-4444-555555555572';

-- 3) Ensotek Su Soğutma Kuleleri / Ensotek Water Cooling Towers
SET @PAGE_ABOUT   := '11111111-2222-3333-4444-555555555573';

-- -------------------------------------------------------------
-- SABİT KATEGORİ ID’LERİ (011 & 012 ile uyumlu)
-- -------------------------------------------------------------

-- ABOUT ana kategori: KURUMSAL
SET @CAT_ABOUT_ROOT   := 'aaaa7001-1111-4111-8111-aaaaaaaa7001';

-- ALT KATEGORİLER (012_catalog_subcategories.sql)
SET @SUB_ABOUT_PAGE   := 'bbbb7001-1111-4111-8111-bbbbbbbb7001'; -- Hakkımızda
SET @SUB_MISSION_VIZ  := 'bbbb7002-1111-4111-8111-bbbbbbbb7002'; -- Misyon & Vizyon

-- -------------------------------------------------------------
-- PARENT INSERT (custom_pages) – kategori bağlarıyla
-- -------------------------------------------------------------

INSERT INTO `custom_pages`
  (`id`, `is_published`, `display_order`,
   `featured_image`, `featured_image_asset_id`,
   `category_id`, `sub_category_id`,
   `created_at`, `updated_at`)
VALUES
  (
    @PAGE_MISSION,
    1,
    10,
    'https://res.cloudinary.com/dbozv7wqd/image/upload/v1757875082/uploads/ensotek/about-images/russia-cooling-tower-1757875080869-645546842.webp',
    NULL,
    @CAT_ABOUT_ROOT,
    @SUB_MISSION_VIZ,
    NOW(3),
    NOW(3)
  ),
  (
    @PAGE_VISION,
    1,
    20,
    'https://res.cloudinary.com/dbozv7wqd/image/upload/v1757875102/uploads/ensotek/about-images/sogutma-kuleleri-cerkezkoy-1757875101328-515216727.webp',
    NULL,
    @CAT_ABOUT_ROOT,
    @SUB_MISSION_VIZ,
    NOW(3),
    NOW(3)
  ),
  (
    @PAGE_ABOUT,
    1,
    30,
    'https://res.cloudinary.com/dbozv7wqd/image/upload/v1752786288/uploads/metahub/about-images/closed-circuit-water-cooling-towers1-1752786287184-840184158.webp',
    NULL,
    @CAT_ABOUT_ROOT,
    @SUB_ABOUT_PAGE,
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

-- -------------------------------------------------------------
-- I18N INSERT – MİSYONUMUZ / OUR MISSION
-- -------------------------------------------------------------

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
  @PAGE_MISSION,
  'tr',
  'Misyonumuz',
  'misyonumuz',
  JSON_OBJECT(
    'html',
    CONCAT(
      '<p>Sektördeki yenilikleri ve gelişmeleri yakından takip ederek, müşterilerimizin beklentilerine ve ihtiyaçlarına en uygun, verimli ve ekonomik çözümleri sunmayı amaçlıyoruz.</p>',
      '<p>Hem Türkiye''de hem de dünyada, su soğutma kuleleri denince akla gelen lider firmalardan biri olmayı hedefliyoruz.</p>'
    )
  ),
  'Ensotek''in sektörde yenilikçi, verimli ve ekonomik su soğutma kuleleri çözümleri sunma hedefini tanımlar.',
  'Misyonumuz - Ensotek Su Soğutma Kuleleri',
  'Misyonumuz | Ensotek Su Soğutma Kuleleri',
  'Sektördeki yenilikleri takip ederek su soğutma kulelerinde en iyi çözümleri sunmayı hedefleyen Ensotek''in misyonu.',
  'ensotek,misyon,su sogutma kuleleri,frp',
  NOW(3),
  NOW(3)
),
-- EN
(
  UUID(),
  @PAGE_MISSION,
  'en',
  'Our Mission',
  'our-mission',
  JSON_OBJECT(
    'html',
    CONCAT(
      '<p>Our mission is to closely follow innovations and developments in the sector, providing our customers with efficient and economical solutions that best suit their needs and expectations.</p>',
      '<p>We aim to be one of the leading companies in Turkey and worldwide when it comes to water cooling towers.</p>'
    )
  ),
  'Describes Ensotek''s mission to provide efficient and economical water cooling tower solutions worldwide.',
  'Our Mission - Ensotek Water Cooling Towers',
  'Our Mission | Ensotek Water Cooling Towers',
  'Ensotek''s mission is to follow innovations and provide efficient, economical water cooling tower solutions tailored to customer needs.',
  'ensotek,mission,water cooling towers,frp',
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `title`               = VALUES(`title`),
  `slug`                = VALUES(`slug`),
  `content`             = VALUES(`content`),
  `summary`             = VALUES(`summary`),
  `featured_image_alt`  = VALUES(`featured_image_alt`),
  `meta_title`          = VALUES(`meta_title`),
  `meta_description`    = VALUES(`meta_description`),
  `tags`                = VALUES(`tags`),
  `updated_at`          = VALUES(`updated_at`);

-- -------------------------------------------------------------
-- I18N INSERT – VİZYONUMUZ / OUR VISION
-- -------------------------------------------------------------

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
  @PAGE_VISION,
  'tr',
  'Vizyonumuz',
  'vizyonumuz',
  JSON_OBJECT(
    'html',
    '<p>Vizyonumuz, müşteri memnuniyetini ön planda tutarak, kaliteli, verimli ve sürdürülebilir su soğutma kuleleri ve hizmetleri sunmak; ulusal ve uluslararası pazarda tercih edilen, güvenilir ve öncü bir marka olmaktır.</p>'
  ),
  'Ensotek''in vizyonu, sürdürülebilir ve kaliteli su soğutma kuleleri ile güvenilir ve öncü bir marka olmaktır.',
  'Vizyonumuz - Ensotek Su Soğutma Kuleleri',
  'Vizyonumuz | Ensotek Su Soğutma Kuleleri',
  'Müşteri memnuniyetini merkeze alarak, kaliteli ve sürdürülebilir su soğutma kuleleri sunmayı hedefleyen Ensotek''in vizyonu.',
  'ensotek,vizyon,surdurulebilir,su sogutma kuleleri',
  NOW(3),
  NOW(3)
),
-- EN
(
  UUID(),
  @PAGE_VISION,
  'en',
  'Our Vision',
  'our-vision',
  JSON_OBJECT(
    'html',
    '<p>Our vision is to prioritize customer satisfaction by providing high quality, efficient and sustainable water cooling towers and services; and to become a reliable and leading brand in both national and international markets.</p>'
  ),
  'Ensotek''s vision is to be a reliable, leading brand with high quality and sustainable water cooling tower solutions.',
  'Our Vision - Ensotek Water Cooling Towers',
  'Our Vision | Ensotek Water Cooling Towers',
  'Ensotek''s vision is to provide high quality, efficient and sustainable water cooling towers and become a trusted global brand.',
  'ensotek,vision,sustainable,water cooling towers',
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `title`               = VALUES(`title`),
  `slug`                = VALUES(`slug`),
  `content`             = VALUES(`content`),
  `summary`             = VALUES(`summary`),
  `featured_image_alt`  = VALUES(`featured_image_alt`),
  `meta_title`          = VALUES(`meta_title`),
  `meta_description`    = VALUES(`meta_description`),
  `tags`                = VALUES(`tags`),
  `updated_at`          = VALUES(`updated_at`);

-- -------------------------------------------------------------
-- I18N INSERT – ENSOTEK SU SOĞUTMA KULELERİ / ABOUT ENSOTEK
-- -------------------------------------------------------------

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
  @PAGE_ABOUT,
  'tr',
  'Ensotek Su Soğutma Kuleleri',
  'ensotek-su-sogutma-kuleleri',
  JSON_OBJECT(
    'html',
    CONCAT(
      '<p>Ensotek, 40 yıllık deneyimiyle İstanbul Merkez Ofis ve Ankara Fabrikası''nda uzman kadrosu ile su soğutma kuleleri alanında hizmet vermektedir. ',
      'Firmamız, Türkiye''nin en büyük su soğutma kulesi üretim tesisine sahiptir.</p>',
      '<p>Cam elyaf takviyeli polyester (FRP) malzemeden, korozyona dayanıklı, boyasız, uzun ömürlü, bakımı kolay ve düşük yatırım/işletme maliyetli açık ve kapalı devre su soğutma kuleleri üretmekteyiz.</p>',
      '<p>Hem yurt içinde hem de yurt dışında binlerce projede başarılı çözümler ürettik. En iyi reklamın ürünün kendisi olduğu prensibiyle, müşterilerimizin tekrar tekrar bizi tercih etmesini ve her seferinde memnun kalmasını hedefliyoruz.</p>',
      '<p>Ar-Ge faaliyetlerimiz ve müşteri geri bildirimleriyle ürünlerimizi sürekli geliştiriyor, Türkiye içinde ve dışında örnek bir firma konumunda yer alıyoruz. ',
      'Ensotek, CTI (Cooling Technology Institute) ve SOSIAD üyesidir; üretim sistemimiz ISO-9001:2015 ile belgelenmiştir ve ürünlerimiz CE belgelidir.</p>'
    )
  ),
  'Ensotek''in 40 yıllık deneyimi, FRP su soğutma kuleleri üretimi ve ulusal/uluslararası projelerdeki lider konumu özetlenir.',
  'Ensotek su soğutma kuleleri üretim tesisi',
  'Ensotek Su Soğutma Kuleleri | 40 Yıllık Deneyim',
  'Ensotek, 40 yıllık deneyimi ve Türkiye''nin en büyük su soğutma kulesi üretim tesisiyle FRP açık ve kapalı devre soğutma kuleleri sunan sektör lideridir.',
  'ensotek,hakkimizda,frp,su sogutma kuleleri,uretim tesisi',
  NOW(3),
  NOW(3)
),
-- EN
(
  UUID(),
  @PAGE_ABOUT,
  'en',
  'Ensotek Water Cooling Towers',
  'ensotek-water-cooling-towers',
  JSON_OBJECT(
    'html',
    CONCAT(
      '<p>Ensotek serves its customers from its Istanbul Headquarters and Ankara Factory with an expert team and over 40 years of experience in water cooling towers. ',
      'Our company owns the largest water cooling tower production facility in Turkey.</p>',
      '<p>Ensotek manufactures open and closed circuit water cooling towers made from Fiberglass Reinforced Polyester (FRP), which are corrosion resistant, long-lasting, easy to maintain and offer low investment and operating costs.</p>',
      '<p>We have delivered successful solutions in thousands of projects both in Turkey and abroad. ',
      'With the principle that the best advertisement is the product itself, we aim for our customers to work with us repeatedly and be satisfied every time.</p>',
      '<p>Through continuous R&amp;D activities and customer feedback, we keep improving our products and have become an exemplary company in Turkey and worldwide. ',
      'Ensotek is a member of CTI (Cooling Technology Institute) and SOSIAD; our production system is certified with ISO-9001:2015 and our products are CE marked.</p>'
    )
  ),
  'Summarizes Ensotek''s 40 years of experience, FRP water cooling tower production and leading position in global projects.',
  'Ensotek water cooling tower production facility',
  'Ensotek Water Cooling Towers | 40 Years of Experience',
  'Ensotek is the sector leader with Turkey''s largest water cooling tower production facility, delivering FRP open and closed circuit cooling towers for projects worldwide.',
  'ensotek,about us,frp,water cooling towers,production facility',
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `title`               = VALUES(`title`),
  `slug`                = VALUES(`slug`),
  `content`             = VALUES(`content`),
  `summary`             = VALUES(`summary`),
  `featured_image_alt`  = VALUES(`featured_image_alt`),
  `meta_title`          = VALUES(`meta_title`),
  `meta_description`    = VALUES(`meta_description`),
  `tags`                = VALUES(`tags`),
  `updated_at`          = VALUES(`updated_at`);

COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
