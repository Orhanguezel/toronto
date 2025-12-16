-- =============================================================
-- FILE: 061_reviews_custom_pages.seed.sql
-- custom_pages için örnek review seed’leri (TR / EN)
-- =============================================================

START TRANSACTION;

-- -------------------------------------------------------------
-- VARSAYIM: 051 & 053 seed dosyalarındaki PAGE ID’LERİ
-- AYNI ID’LERLE MEVCUT.
-- Tekrar SET etmekte sakınca yok.
-- -------------------------------------------------------------

-- ABOUT / KURUMSAL
SET @PAGE_MISSION := '11111111-2222-3333-4444-555555555571';
SET @PAGE_VISION  := '11111111-2222-3333-4444-555555555572';
SET @PAGE_ABOUT   := '11111111-2222-3333-4444-555555555573';

-- BLOG
SET @BLOG_MAINT_1 := '33330001-3333-4333-8333-333333330001';

-- =============================================================
-- REVIEW ID’LERİ (sabit, okunabilir olsun)
-- =============================================================
SET @REV_MISSION_TR := '44440001-4444-4444-8444-444444440001';
SET @REV_MISSION_EN := '44440002-4444-4444-8444-444444440002';

SET @REV_ABOUT_TR   := '44440003-4444-4444-8444-444444440003';
SET @REV_ABOUT_EN   := '44440004-4444-4444-8444-444444440004';

SET @REV_BLOG_TR    := '44440005-4444-4444-8444-444444440005';

-- -------------------------------------------------------------
-- REVIEWS (parent) insert
-- target_type: 'custom_page'
-- -------------------------------------------------------------
INSERT INTO `reviews`
  (`id`, `target_type`, `target_id`,
   `name`, `email`,
   `rating`, `is_active`, `is_approved`, `display_order`,
   `likes_count`, `dislikes_count`, `helpful_count`,
   `submitted_locale`,
   `created_at`, `updated_at`)
VALUES
  -- Misyonumuz için TR kullanıcı yorumu
  (
    @REV_MISSION_TR,
    'custom_page',
    @PAGE_MISSION,
    'Ahmet Yılmaz',
    'ahmet@example.com',
    5,
    1,  -- aktif
    1,  -- admin onaylı
    10, -- display_order
    3,  -- likes
    0,  -- dislikes
    3,  -- helpful_count (başlangıçta likes ile aynı)
    'tr',
    NOW(3),
    NOW(3)
  ),
  -- Our Mission için EN kullanıcı yorumu
  (
    @REV_MISSION_EN,
    'custom_page',
    @PAGE_MISSION,
    'John Doe',
    'john.doe@example.com',
    4,
    1,
    1,
    20,
    1,  -- likes
    0,  -- dislikes
    1,  -- helpful_count
    'en',
    NOW(3),
    NOW(3)
  ),
  -- Ensotek Hakkında TR yorumu
  (
    @REV_ABOUT_TR,
    'custom_page',
    @PAGE_ABOUT,
    'Mehmet Kara',
    'mehmet.kara@example.com',
    5,
    1,
    1,
    30,
    5,  -- likes
    0,  -- dislikes
    5,  -- helpful_count
    'tr',
    NOW(3),
    NOW(3)
  ),
  -- Ensotek About EN yorumu
  (
    @REV_ABOUT_EN,
    'custom_page',
    @PAGE_ABOUT,
    'Emily Smith',
    'emily.smith@example.com',
    5,
    1,
    1,
    40,
    2,  -- likes
    0,  -- dislikes
    2,  -- helpful_count
    'en',
    NOW(3),
    NOW(3)
  ),
  -- Blog bakım rehberi için TR yorumu
  (
    @REV_BLOG_TR,
    'custom_page',
    @BLOG_MAINT_1,
    'Serkan Demir',
    'serkan.demir@example.com',
    4,
    1,
    1,
    50,
    0,  -- likes
    0,  -- dislikes
    0,  -- helpful_count
    'tr',
    NOW(3),
    NOW(3)
  )
ON DUPLICATE KEY UPDATE
  `target_type`      = VALUES(`target_type`),
  `target_id`        = VALUES(`target_id`),
  `name`             = VALUES(`name`),
  `email`            = VALUES(`email`),
  `rating`           = VALUES(`rating`),
  `is_active`        = VALUES(`is_active`),
  `is_approved`      = VALUES(`is_approved`),
  `display_order`    = VALUES(`display_order`),
  `likes_count`      = VALUES(`likes_count`),
  `dislikes_count`   = VALUES(`dislikes_count`),
  `helpful_count`    = VALUES(`helpful_count`),
  `submitted_locale` = VALUES(`submitted_locale`),
  `updated_at`       = VALUES(`updated_at`);

-- -------------------------------------------------------------
-- REVIEW I18N INSERT
-- - Kullanıcı hangi dilde bıraktıysa o locale zorunlu.
-- - Admin isterse diğer locale’leri de doldurabilir.
-- -------------------------------------------------------------

INSERT INTO `review_i18n`
  (`id`, `review_id`, `locale`,
   `title`, `comment`, `admin_reply`,
   `created_at`, `updated_at`)
VALUES
  -- ============================
  -- REV_MISSION_TR (TR + EN)
  -- ============================
  -- TR (kullanıcı orijinal yorumu)
  (
    UUID(),
    @REV_MISSION_TR,
    'tr',
    'Misyon metni çok net ve anlaşılır',
    'Ensotek''in misyon açıklaması, sektöre bakışını ve müşteri odaklı yaklaşımını çok net şekilde ortaya koyuyor.',
    NULL,
    NOW(3),
    NOW(3)
  ),
  -- EN (admin çevirisi)
  (
    UUID(),
    @REV_MISSION_TR,
    'en',
    'Clear and well-defined mission',
    'The mission statement clearly reflects Ensotek''s customer-oriented approach and position in the market.',
    'Translated from the original Turkish review.',
    NOW(3),
    NOW(3)
  ),

  -- ============================
  -- REV_MISSION_EN (EN + TR)
  -- ============================
  -- EN (orijinal)
  (
    UUID(),
    @REV_MISSION_EN,
    'en',
    'Strong customer-oriented mission',
    'I really like how Ensotek puts customer satisfaction and efficiency at the center of its mission.',
    NULL,
    NOW(3),
    NOW(3)
  ),
  -- TR (admin çevirisi)
  (
    UUID(),
    @REV_MISSION_EN,
    'tr',
    'Müşteri odaklı güçlü bir misyon',
    'Ensotek''in müşteri memnuniyeti ve verimliliği merkeze alan misyon yaklaşımını beğendim.',
    'İngilizce yorumun Türkçe çevirisidir.',
    NOW(3),
    NOW(3)
  ),

  -- ============================
  -- REV_ABOUT_TR (TR)
  -- ============================
  (
    UUID(),
    @REV_ABOUT_TR,
    'tr',
    '40 yıllık deneyimi hissettiriyor',
    'Hakkımızda sayfasındaki bilgiler, firmanın sektörde ne kadar köklü ve tecrübeli olduğunu çok iyi anlatıyor.',
    NULL,
    NOW(3),
    NOW(3)
  ),

  -- ============================
  -- REV_ABOUT_EN (EN)
  -- ============================
  (
    UUID(),
    @REV_ABOUT_EN,
    'en',
    'Impressive background',
    'The about page gives a very clear picture of Ensotek''s long-term experience and strong reference projects.',
    NULL,
    NOW(3),
    NOW(3)
  ),

  -- ============================
  -- REV_BLOG_TR (TR)
  -- ============================
  (
    UUID(),
    @REV_BLOG_TR,
    'tr',
    'Bakım rehberi çok faydalı',
    'Periyodik bakım yazısı, sahadaki ekibimiz için kontrol listesi gibi kullanabileceğimiz pratik bilgiler içeriyor.',
    NULL,
    NOW(3),
    NOW(3)
  )
ON DUPLICATE KEY UPDATE
  `title`       = VALUES(`title`),
  `comment`     = VALUES(`comment`),
  `admin_reply` = VALUES(`admin_reply`),
  `updated_at`  = VALUES(`updated_at`);

COMMIT;
