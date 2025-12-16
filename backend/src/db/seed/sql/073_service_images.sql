

-- =============================================================
-- 073_service_images.sql
-- Ensotek Services için gallery görselleri (TR / EN)
-- =============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

START TRANSACTION;

-- -------------------------------------------------------------
-- İLGİLİ SERVICE ID'LERİNİ SLUG ÜZERİNDEN BUL (TR)
-- -------------------------------------------------------------

-- 1) Bakım ve Onarım
SET @SRV_MAINT_ID := (
  SELECT s.id
  FROM services s
  JOIN services_i18n i
    ON i.service_id = s.id
   AND i.locale = 'tr'
  WHERE i.slug = 'bakim-ve-onarim'
  LIMIT 1
);

-- 2) Modernizasyon
SET @SRV_MOD_ID := (
  SELECT s.id
  FROM services s
  JOIN services_i18n i
    ON i.service_id = s.id
   AND i.locale = 'tr'
  WHERE i.slug = 'modernizasyon'
  LIMIT 1
);

-- 3) Yedek Parçalar ve Bileşenler
SET @SRV_SPARE_ID := (
  SELECT s.id
  FROM services s
  JOIN services_i18n i
    ON i.service_id = s.id
   AND i.locale = 'tr'
  WHERE i.slug = 'yedek-parcalar-ve-bilesenler'
  LIMIT 1
);

-- 4) Uygulamalar ve Referanslar
SET @SRV_APPREF_ID := (
  SELECT s.id
  FROM services s
  JOIN services_i18n i
    ON i.service_id = s.id
   AND i.locale = 'tr'
  WHERE i.slug = 'uygulamalar-ve-referanslar'
  LIMIT 1
);

-- 5) Mühendislik Desteği
SET @SRV_ENGSUP_ID := (
  SELECT s.id
  FROM services s
  JOIN services_i18n i
    ON i.service_id = s.id
   AND i.locale = 'tr'
  WHERE i.slug = 'muhendislik-destegi'
  LIMIT 1
);

-- 6) Üretim
SET @SRV_PROD_ID := (
  SELECT s.id
  FROM services s
  JOIN services_i18n i
    ON i.service_id = s.id
   AND i.locale = 'tr'
  WHERE i.slug = 'uretim'
  LIMIT 1
);


-- =============================================================
-- Helper: main image insert macro mantığı (her hizmet için)
-- =============================================================

-- 1) Bakım ve Onarım
SET @SRVIMG_MAINT_MAIN_ID := (
  SELECT si.id
  FROM service_images si
  WHERE si.service_id = @SRV_MAINT_ID
    AND si.display_order = 1
  LIMIT 1
);
SET @SRVIMG_MAINT_MAIN_ID := COALESCE(@SRVIMG_MAINT_MAIN_ID, UUID());

INSERT INTO `service_images`
(`id`,
 `service_id`,
 `image_asset_id`,
 `image_url`,
 `is_active`,
 `display_order`,
 `created_at`,
 `updated_at`)
SELECT
  @SRVIMG_MAINT_MAIN_ID,
  @SRV_MAINT_ID,
  NULL,
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
  1,
  1,
  '2024-01-01 00:00:00.000',
  '2024-01-01 00:00:00.000'
FROM DUAL
WHERE @SRV_MAINT_ID IS NOT NULL
ON DUPLICATE KEY UPDATE
  `service_id`     = VALUES(`service_id`),
  `image_asset_id` = VALUES(`image_asset_id`),
  `image_url`      = VALUES(`image_url`),
  `is_active`      = VALUES(`is_active`),
  `display_order`  = VALUES(`display_order`),
  `updated_at`     = VALUES(`updated_at`);

-- I18N TR
INSERT INTO `service_images_i18n`
(`id`,
 `image_id`,
 `locale`,
 `title`,
 `alt`,
 `caption`,
 `created_at`,
 `updated_at`)
SELECT
  UUID(),
  @SRVIMG_MAINT_MAIN_ID,
  'tr',
  'Bakım ve onarım hizmeti görseli',
  'Soğutma kulesi bakım ve onarım hizmeti',
  'Endüstriyel soğutma kulesi bakım sahası',
  NOW(3),
  NOW(3)
FROM DUAL
WHERE @SRV_MAINT_ID IS NOT NULL
ON DUPLICATE KEY UPDATE
  `title`      = VALUES(`title`),
  `alt`        = VALUES(`alt`),
  `caption`    = VALUES(`caption`),
  `updated_at` = VALUES(`updated_at`);

-- I18N EN
INSERT INTO `service_images_i18n`
(`id`,
 `image_id`,
 `locale`,
 `title`,
 `alt`,
 `caption`,
 `created_at`,
 `updated_at`)
SELECT
  UUID(),
  @SRVIMG_MAINT_MAIN_ID,
  'en',
  'Maintenance & repair main image',
  'Cooling tower maintenance and repair service',
  'Industrial cooling tower maintenance site',
  NOW(3),
  NOW(3)
FROM DUAL
WHERE @SRV_MAINT_ID IS NOT NULL
ON DUPLICATE KEY UPDATE
  `title`      = VALUES(`title`),
  `alt`        = VALUES(`alt`),
  `caption`    = VALUES(`caption`),
  `updated_at` = VALUES(`updated_at`);


-- 2) Modernizasyon
SET @SRVIMG_MOD_MAIN_ID := (
  SELECT si.id
  FROM service_images si
  WHERE si.service_id = @SRV_MOD_ID
    AND si.display_order = 1
  LIMIT 1
);
SET @SRVIMG_MOD_MAIN_ID := COALESCE(@SRVIMG_MOD_MAIN_ID, UUID());

INSERT INTO `service_images`
(`id`,
 `service_id`,
 `image_asset_id`,
 `image_url`,
 `is_active`,
 `display_order`,
 `created_at`,
 `updated_at`)
SELECT
  @SRVIMG_MOD_MAIN_ID,
  @SRV_MOD_ID,
  NULL,
  'https://images.unsplash.com/photo-1582719478250-cc72c2b3c9e8?w=800&h=600&fit=crop',
  1,
  1,
  '2024-01-01 00:00:00.000',
  '2024-01-01 00:00:00.000'
FROM DUAL
WHERE @SRV_MOD_ID IS NOT NULL
ON DUPLICATE KEY UPDATE
  `service_id`     = VALUES(`service_id`),
  `image_asset_id` = VALUES(`image_asset_id`),
  `image_url`      = VALUES(`image_url`),
  `is_active`      = VALUES(`is_active`),
  `display_order`  = VALUES(`display_order`),
  `updated_at`     = VALUES(`updated_at`);

INSERT INTO `service_images_i18n`
(`id`,`image_id`,`locale`,`title`,`alt`,`caption`,`created_at`,`updated_at`)
SELECT
  UUID(),
  @SRVIMG_MOD_MAIN_ID,
  'tr',
  'Modernizasyon hizmeti görseli',
  'Modernize edilmiş soğutma kuleleri',
  'Modernizasyon sonrası yenilenmiş soğutma sistemi',
  NOW(3),
  NOW(3)
FROM DUAL
WHERE @SRV_MOD_ID IS NOT NULL
ON DUPLICATE KEY UPDATE
  `title`      = VALUES(`title`),
  `alt`        = VALUES(`alt`),
  `caption`    = VALUES(`caption`),
  `updated_at` = VALUES(`updated_at`);

INSERT INTO `service_images_i18n`
(`id`,`image_id`,`locale`,`title`,`alt`,`caption`,`created_at`,`updated_at`)
SELECT
  UUID(),
  @SRVIMG_MOD_MAIN_ID,
  'en',
  'Modernization main image',
  'Modernized cooling towers',
  'Cooling system upgraded with modernization',
  NOW(3),
  NOW(3)
FROM DUAL
WHERE @SRV_MOD_ID IS NOT NULL
ON DUPLICATE KEY UPDATE
  `title`      = VALUES(`title`),
  `alt`        = VALUES(`alt`),
  `caption`    = VALUES(`caption`),
  `updated_at` = VALUES(`updated_at`);


-- 3) Yedek Parçalar ve Bileşenler
SET @SRVIMG_SPARE_MAIN_ID := (
  SELECT si.id
  FROM service_images si
  WHERE si.service_id = @SRV_SPARE_ID
    AND si.display_order = 1
  LIMIT 1
);
SET @SRVIMG_SPARE_MAIN_ID := COALESCE(@SRVIMG_SPARE_MAIN_ID, UUID());

INSERT INTO `service_images`
(`id`,`service_id`,`image_asset_id`,`image_url`,`is_active`,`display_order`,`created_at`,`updated_at`)
SELECT
  @SRVIMG_SPARE_MAIN_ID,
  @SRV_SPARE_ID,
  NULL,
  'https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=800&h=600&fit=crop',
  1,
  1,
  '2024-01-01 00:00:00.000',
  '2024-01-01 00:00:00.000'
FROM DUAL
WHERE @SRV_SPARE_ID IS NOT NULL
ON DUPLICATE KEY UPDATE
  `service_id`     = VALUES(`service_id`),
  `image_asset_id` = VALUES(`image_asset_id`),
  `image_url`      = VALUES(`image_url`),
  `is_active`      = VALUES(`is_active`),
  `display_order`  = VALUES(`display_order`),
  `updated_at`     = VALUES(`updated_at`);

INSERT INTO `service_images_i18n`
(`id`,`image_id`,`locale`,`title`,`alt`,`caption`,`created_at`,`updated_at`)
SELECT
  UUID(),
  @SRVIMG_SPARE_MAIN_ID,
  'tr',
  'Yedek parça ve bileşen görseli',
  'Soğutma kulesi yedek parça bileşenleri',
  'Farklı soğutma kulesi yedek parça ve bileşenleri',
  NOW(3),
  NOW(3)
FROM DUAL
WHERE @SRV_SPARE_ID IS NOT NULL
ON DUPLICATE KEY UPDATE
  `title`      = VALUES(`title`),
  `alt`        = VALUES(`alt`),
  `caption`    = VALUES(`caption`),
  `updated_at` = VALUES(`updated_at`);

INSERT INTO `service_images_i18n`
(`id`,`image_id`,`locale`,`title`,`alt`,`caption`,`created_at`,`updated_at`)
SELECT
  UUID(),
  @SRVIMG_SPARE_MAIN_ID,
  'en',
  'Spare parts & components image',
  'Cooling tower spare parts and components',
  'Various spare parts and components for cooling towers',
  NOW(3),
  NOW(3)
FROM DUAL
WHERE @SRV_SPARE_ID IS NOT NULL
ON DUPLICATE KEY UPDATE
  `title`      = VALUES(`title`),
  `alt`        = VALUES(`alt`),
  `caption`    = VALUES(`caption`),
  `updated_at` = VALUES(`updated_at`);


-- 4) Uygulamalar ve Referanslar
SET @SRVIMG_APPREF_MAIN_ID := (
  SELECT si.id
  FROM service_images si
  WHERE si.service_id = @SRV_APPREF_ID
    AND si.display_order = 1
  LIMIT 1
);
SET @SRVIMG_APPREF_MAIN_ID := COALESCE(@SRVIMG_APPREF_MAIN_ID, UUID());

INSERT INTO `service_images`
(`id`,`service_id`,`image_asset_id`,`image_url`,`is_active`,`display_order`,`created_at`,`updated_at`)
SELECT
  @SRVIMG_APPREF_MAIN_ID,
  @SRV_APPREF_ID,
  NULL,
  'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop',
  1,
  1,
  '2024-01-01 00:00:00.000',
  '2024-01-01 00:00:00.000'
FROM DUAL
WHERE @SRV_APPREF_ID IS NOT NULL
ON DUPLICATE KEY UPDATE
  `service_id`     = VALUES(`service_id`),
  `image_asset_id` = VALUES(`image_asset_id`),
  `image_url`      = VALUES(`image_url`),
  `is_active`      = VALUES(`is_active`),
  `display_order`  = VALUES(`display_order`),
  `updated_at`     = VALUES(`updated_at`);

INSERT INTO `service_images_i18n`
(`id`,`image_id`,`locale`,`title`,`alt`,`caption`,`created_at`,`updated_at`)
SELECT
  UUID(),
  @SRVIMG_APPREF_MAIN_ID,
  'tr',
  'Uygulama ve referans görseli',
  'Ensotek uygulama ve referans projeleri',
  'Farklı endüstriyel tesislerde Ensotek soğutma kulesi uygulamaları',
  NOW(3),
  NOW(3)
FROM DUAL
WHERE @SRV_APPREF_ID IS NOT NULL
ON DUPLICATE KEY UPDATE
  `title`      = VALUES(`title`),
  `alt`        = VALUES(`alt`),
  `caption`    = VALUES(`caption`),
  `updated_at` = VALUES(`updated_at`);

INSERT INTO `service_images_i18n`
(`id`,`image_id`,`locale`,`title`,`alt`,`caption`,`created_at`,`updated_at`)
SELECT
  UUID(),
  @SRVIMG_APPREF_MAIN_ID,
  'en',
  'Applications & references image',
  'Ensotek application and reference projects',
  'Cooling tower applications in various industrial plants',
  NOW(3),
  NOW(3)
FROM DUAL
WHERE @SRV_APPREF_ID IS NOT NULL
ON DUPLICATE KEY UPDATE
  `title`      = VALUES(`title`),
  `alt`        = VALUES(`alt`),
  `caption`    = VALUES(`caption`),
  `updated_at` = VALUES(`updated_at`);


-- 5) Mühendislik Desteği
SET @SRVIMG_ENGSUP_MAIN_ID := (
  SELECT si.id
  FROM service_images si
  WHERE si.service_id = @SRV_ENGSUP_ID
    AND si.display_order = 1
  LIMIT 1
);
SET @SRVIMG_ENGSUP_MAIN_ID := COALESCE(@SRVIMG_ENGSUP_MAIN_ID, UUID());

INSERT INTO `service_images`
(`id`,`service_id`,`image_asset_id`,`image_url`,`is_active`,`display_order`,`created_at`,`updated_at`)
SELECT
  @SRVIMG_ENGSUP_MAIN_ID,
  @SRV_ENGSUP_ID,
  NULL,
  'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=600&fit=crop',
  1,
  1,
  '2024-01-01 00:00:00.000',
  '2024-01-01 00:00:00.000'
FROM DUAL
WHERE @SRV_ENGSUP_ID IS NOT NULL
ON DUPLICATE KEY UPDATE
  `service_id`     = VALUES(`service_id`),
  `image_asset_id` = VALUES(`image_asset_id`),
  `image_url`      = VALUES(`image_url`),
  `is_active`      = VALUES(`is_active`),
  `display_order`  = VALUES(`display_order`),
  `updated_at`     = VALUES(`updated_at`);

INSERT INTO `service_images_i18n`
(`id`,`image_id`,`locale`,`title`,`alt`,`caption`,`created_at`,`updated_at`)
SELECT
  UUID(),
  @SRVIMG_ENGSUP_MAIN_ID,
  'tr',
  'Mühendislik desteği görseli',
  'Soğutma kuleleri için mühendislik destek ekibi',
  'Ensotek mühendislik destek ekibi ile proje planlama ve analiz',
  NOW(3),
  NOW(3)
FROM DUAL
WHERE @SRV_ENGSUP_ID IS NOT NULL
ON DUPLICATE KEY UPDATE
  `title`      = VALUES(`title`),
  `alt`        = VALUES(`alt`),
  `caption`    = VALUES(`caption`),
  `updated_at` = VALUES(`updated_at`);

INSERT INTO `service_images_i18n`
(`id`,`image_id`,`locale`,`title`,`alt`,`caption`,`created_at`,`updated_at`)
SELECT
  UUID(),
  @SRVIMG_ENGSUP_MAIN_ID,
  'en',
  'Engineering support image',
  'Engineering support team for cooling towers',
  'Ensotek engineering support team for project planning and analysis',
  NOW(3),
  NOW(3)
FROM DUAL
WHERE @SRV_ENGSUP_ID IS NOT NULL
ON DUPLICATE KEY UPDATE
  `title`      = VALUES(`title`),
  `alt`        = VALUES(`alt`),
  `caption`    = VALUES(`caption`),
  `updated_at` = VALUES(`updated_at`);


-- 6) Üretim
SET @SRVIMG_PROD_MAIN_ID := (
  SELECT si.id
  FROM service_images si
  WHERE si.service_id = @SRV_PROD_ID
    AND si.display_order = 1
  LIMIT 1
);
SET @SRVIMG_PROD_MAIN_ID := COALESCE(@SRVIMG_PROD_MAIN_ID, UUID());

INSERT INTO `service_images`
(`id`,`service_id`,`image_asset_id`,`image_url`,`is_active`,`display_order`,`created_at`,`updated_at`)
SELECT
  @SRVIMG_PROD_MAIN_ID,
  @SRV_PROD_ID,
  NULL,
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
  1,
  1,
  '2024-01-01 00:00:00.000',
  '2024-01-01 00:00:00.000'
FROM DUAL
WHERE @SRV_PROD_ID IS NOT NULL
ON DUPLICATE KEY UPDATE
  `service_id`     = VALUES(`service_id`),
  `image_asset_id` = VALUES(`image_asset_id`),
  `image_url`      = VALUES(`image_url`),
  `is_active`      = VALUES(`is_active`),
  `display_order`  = VALUES(`display_order`),
  `updated_at`     = VALUES(`updated_at`);

INSERT INTO `service_images_i18n`
(`id`,`image_id`,`locale`,`title`,`alt`,`caption`,`created_at`,`updated_at`)
SELECT
  UUID(),
  @SRVIMG_PROD_MAIN_ID,
  'tr',
  'Üretim hizmeti görseli',
  'Endüstriyel FRP soğutma kulesi üretimi',
  'Ensotek tesislerinde FRP soğutma kulesi üretim hattı',
  NOW(3),
  NOW(3)
FROM DUAL
WHERE @SRV_PROD_ID IS NOT NULL
ON DUPLICATE KEY UPDATE
  `title`      = VALUES(`title`),
  `alt`        = VALUES(`alt`),
  `caption`    = VALUES(`caption`),
  `updated_at` = VALUES(`updated_at`);

INSERT INTO `service_images_i18n`
(`id`,`image_id`,`locale`,`title`,`alt`,`caption`,`created_at`,`updated_at`)
SELECT
  UUID(),
  @SRVIMG_PROD_MAIN_ID,
  'en',
  'Production service image',
  'Industrial FRP cooling tower production',
  'FRP cooling tower production line at Ensotek facilities',
  NOW(3),
  NOW(3)
FROM DUAL
WHERE @SRV_PROD_ID IS NOT NULL
ON DUPLICATE KEY UPDATE
  `title`      = VALUES(`title`),
  `alt`        = VALUES(`alt`),
  `caption`    = VALUES(`caption`),
  `updated_at` = VALUES(`updated_at`);

COMMIT;
