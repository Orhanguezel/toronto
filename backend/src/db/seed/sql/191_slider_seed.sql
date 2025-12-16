-- =============================================================
-- FILE: 191_slider_seed.sql
-- SEED: Ensotek – Su Soğutma Kuleleri Slider İçeriği (TR + EN)
-- Parent + i18n yapı – idempotent
-- =============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

-- =============================================================
-- 1) PARENT SLIDER KAYITLARI
--    (Her slide için tek parent; TR uuid'leri kullanılıyor)
-- =============================================================

INSERT INTO `slider`
(`uuid`,
 `image_url`,`image_asset_id`,
 `featured`,`is_active`,`display_order`,
 `created_at`,`updated_at`)
VALUES
-- slide-1 parent (Ana vurgu)
(
  '99990001-1111-4111-8111-999999990001',
  'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&h=600&q=80',
  NULL,
  1, 1, 1,
  '2024-01-20 00:00:00.000','2024-01-20 00:00:00.000'
),

-- slide-2 parent (Ürün tipleri)
(
  '99990002-1111-4111-8111-999999990002',
  'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&h=600&q=80',
  NULL,
  0, 1, 2,
  '2024-01-21 00:00:00.000','2024-01-21 00:00:00.000'
),

-- slide-3 parent (Projelendirme)
(
  '99990003-1111-4111-8111-999999990003',
  'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&h=600&q=80',
  NULL,
  0, 1, 3,
  '2024-01-22 00:00:00.000','2024-01-22 00:00:00.000'
),

-- slide-4 parent (Bakım / revizyon)
(
  '99990004-1111-4111-8111-999999990004',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&h=600&q=80',
  NULL,
  0, 1, 4,
  '2024-01-23 00:00:00.000','2024-01-23 00:00:00.000'
),

-- slide-5 parent (Otomasyon / SCADA)
(
  '99990005-1111-4111-8111-999999990005',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&h=600&q=80',
  NULL,
  0, 1, 5,
  '2024-01-24 00:00:00.000','2024-01-24 00:00:00.000'
)
ON DUPLICATE KEY UPDATE
  `image_url`      = VALUES(`image_url`),
  `image_asset_id` = VALUES(`image_asset_id`),
  `featured`       = VALUES(`featured`),
  `is_active`      = VALUES(`is_active`),
  `display_order`  = VALUES(`display_order`),
  `updated_at`     = VALUES(`updated_at`);

-- =============================================================
-- 2) I18N KAYITLARI (TR + EN)
--    slider_i18n: slider_id + locale bazlı metin alanları
-- =============================================================

INSERT INTO `slider_i18n`
(`slider_id`,`locale`,
 `name`,`slug`,`description`,
 `alt`,`button_text`,`button_link`)
VALUES
-- ============================================================
-- TR SLIDES
-- ============================================================

-- slide-1 TR (Ana vurgu)
(
  (SELECT `id` FROM `slider` WHERE `uuid` = '99990001-1111-4111-8111-999999990001'),
  'tr',
  'Endüstriyel Su Soğutma Kulelerinde Uzman Çözüm Ortağınız',
  'endustriyel-su-sogutma-kulelerinde-uzman-cozum-ortaginiz',
  'Enerji santralleri, endüstriyel tesisler ve ticari binalar için yüksek verimli su soğutma kulesi çözümleri sunuyoruz.',
  'Endüstriyel su soğutma kulesi çözümleri',
  'Teklif Al',
  'iletisim'
),

-- slide-2 TR (Ürün tipleri)
(
  (SELECT `id` FROM `slider` WHERE `uuid` = '99990002-1111-4111-8111-999999990002'),
  'tr',
  'Açık ve Kapalı Devre Su Soğutma Kuleleri',
  'acik-ve-kapali-devre-su-sogutma-kuleleri',
  'FRP, galvanizli çelik ve betonarme gövdeli su soğutma kuleleri ile prosesinize en uygun çözümü tasarlıyoruz.',
  'Açık / kapalı devre su soğutma kuleleri',
  'Çözümleri İncele',
  'cozumler/su-sogutma-kulesi'
),

-- slide-3 TR (Projelendirme)
(
  (SELECT `id` FROM `slider` WHERE `uuid` = '99990003-1111-4111-8111-999999990003'),
  'tr',
  'Keşif, Projelendirme ve Anahtar Teslim Montaj',
  'kesif-projelendirme-ve-anahtar-teslim-montaj',
  'Saha keşfi, ısı yükü hesapları, mekanik tasarım ve devreye alma süreçlerinin tamamını Ensotek mühendisliği ile yönetiyoruz.',
  'Su soğutma kulesi keşif ve projelendirme',
  'Keşif Talep Et',
  'hizmetler/kesif-projelendirme'
),

-- slide-4 TR (Bakım / revizyon)
(
  (SELECT `id` FROM `slider` WHERE `uuid` = '99990004-1111-4111-8111-999999990004'),
  'tr',
  'Periyodik Bakım ve Revizyon Hizmetleri',
  'periyodik-bakim-ve-revizyon-hizmetleri',
  'Mevcut su soğutma kuleleriniz için nozül, dolgu, fan ve mekanik aksam yenileme ile kapasite ve verimlilik iyileştirmeleri sağlıyoruz.',
  'Su soğutma kulesi bakım ve revizyon hizmetleri',
  'Bakım Planla',
  'hizmetler/bakim-revizyon'
),

-- slide-5 TR (Otomasyon / SCADA)
(
  (SELECT `id` FROM `slider` WHERE `uuid` = '99990005-1111-4111-8111-999999990005'),
  'tr',
  'Otomasyon, SCADA ve Uzaktan İzleme Çözümleri',
  'otomasyon-scada-ve-uzaktan-izleme-cozumleri',
  'Su soğutma kulelerinizi enerji tüketimi, debi, sıcaklık ve arıza durumlarına göre gerçek zamanlı izleyebileceğiniz otomasyon altyapısı kuruyoruz.',
  'Su soğutma kulesi otomasyon ve SCADA çözümleri',
  'Detaylı Bilgi Al',
  'hizmetler/otomasyon-scada'
),

-- ============================================================
-- EN SLIDES
-- ============================================================

-- slide-1 EN (Ana vurgu)
(
  (SELECT `id` FROM `slider` WHERE `uuid` = '99990001-1111-4111-8111-999999990001'),
  'en',
  'Your Expert Partner in Industrial Water Cooling Towers',
  'expert-partner-industrial-water-cooling-towers',
  'We deliver high-efficiency water cooling tower solutions for power plants, industrial facilities and commercial buildings.',
  'Industrial water cooling tower solutions',
  'Request a Quote',
  'iletisim'
),

-- slide-2 EN (Ürün tipleri)
(
  (SELECT `id` FROM `slider` WHERE `uuid` = '99990002-1111-4111-8111-999999990002'),
  'en',
  'Open and Closed Circuit Water Cooling Towers',
  'open-closed-circuit-water-cooling-towers',
  'We design the most suitable solution for your process with FRP, galvanized steel and reinforced concrete cooling tower options.',
  'Open / closed circuit water cooling towers',
  'Explore Solutions',
  'cozumler/su-sogutma-kulesi'
),

-- slide-3 EN (Projelendirme)
(
  (SELECT `id` FROM `slider` WHERE `uuid` = '99990003-1111-4111-8111-999999990003'),
  'en',
  'Site Survey, Engineering and Turnkey Installation',
  'site-survey-engineering-turnkey-installation',
  'We manage the entire process from on-site survey, thermal load calculations and mechanical design to commissioning with Ensotek engineering.',
  'Cooling tower site survey and engineering',
  'Request a Survey',
  'hizmetler/kesif-projelendirme'
),

-- slide-4 EN (Bakım / revizyon)
(
  (SELECT `id` FROM `slider` WHERE `uuid` = '99990004-1111-4111-8111-999999990004'),
  'en',
  'Periodic Maintenance and Retrofit Services',
  'periodic-maintenance-and-retrofit-services',
  'We improve capacity and efficiency of your existing cooling towers with nozzle, fill, fan and mechanical component upgrades.',
  'Cooling tower maintenance and retrofit services',
  'Plan Maintenance',
  'hizmetler/bakim-revizyon'
),

-- slide-5 EN (Otomasyon / SCADA)
(
  (SELECT `id` FROM `slider` WHERE `uuid` = '99990005-1111-4111-8111-999999990005'),
  'en',
  'Automation, SCADA and Remote Monitoring Solutions',
  'automation-scada-remote-monitoring-solutions',
  'We build automation infrastructures that enable real-time monitoring of energy consumption, flow, temperature and alarms for your cooling towers.',
  'Cooling tower automation and SCADA solutions',
  'Get Details',
  'hizmetler/otomasyon-scada'
)
ON DUPLICATE KEY UPDATE
  `name`        = VALUES(`name`),
  `slug`        = VALUES(`slug`),
  `description` = VALUES(`description`),
  `alt`         = VALUES(`alt`),
  `button_text` = VALUES(`button_text`),
  `button_link` = VALUES(`button_link`);

COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
