-- =============================================================
-- 040_site_settings.sql  (çok dilli site ayarları - Ensotek)
-- =============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================================
-- TABLE
-- id (CHAR(36)), key (VARCHAR(100)), locale (VARCHAR(8)), value (TEXT),
-- created_at/updated_at, UNIQUE(key,locale)
-- =============================================================
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id`         CHAR(36)      NOT NULL,
  `key`        VARCHAR(100)  NOT NULL,
  `locale`     VARCHAR(8)    NOT NULL,
  `value`      TEXT          NOT NULL,
  `created_at` DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_settings_key_locale_uq` (`key`, `locale`),
  KEY `site_settings_key_idx` (`key`),
  KEY `site_settings_locale_idx` (`locale`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- GENEL: Uygulama dilleri (app_locales)
-- value TEXT => JSON string olarak saklanır
-- =============================================================
INSERT INTO `site_settings` (`id`, `key`, `locale`, `value`, `created_at`, `updated_at`) VALUES
(UUID(), 'app_locales', 'tr', CAST(JSON_ARRAY('tr','en') AS CHAR), NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  `value`      = VALUES(`value`),
  `updated_at` = VALUES(`updated_at`);

-- =============================================================
-- SEED: TR
-- =============================================================

INSERT INTO `site_settings` (`id`, `key`, `locale`, `value`, `created_at`, `updated_at`) VALUES
(
  UUID(),
  'contact_info',
  'tr',
  CAST(JSON_OBJECT(
    'companyName','Ensotek Enerji Sistemleri',
    'phones',JSON_ARRAY('+90 212 000 00 00', '+49 152 000 0000'),
    'email','info@ensotek.com',
    'address','Ensotek Plaza, Büyükdere Cd. No:10, Şişli / İstanbul',
    'addressSecondary','Ofis: Musterstr. 10, 10115 Berlin, Almanya',
    'whatsappNumber','+49 152 000 0000',
    'taxOffice','Şişli VD',
    'taxNumber','1234567890',
    'website','https://ensotek.de'
  ) AS CHAR),
  NOW(3),
  NOW(3)
),
(UUID(), 'catalog_pdf_url', 'tr', 'https://example.com/path/to/ensotek_catalog.pdf', NOW(3), NOW(3)),
(UUID(), 'catalog_pdf_filename', 'tr', 'ensotek-catalog.pdf', NOW(3), NOW(3)),

-- Admin mail hedefleri (virgül/; ayrılabilir)
(UUID(), 'catalog_admin_email', 'tr', 'admin@ensotek.de', NOW(3), NOW(3)),

-- Site title (email template paramları için)
(UUID(), 'site_title', 'tr', 'Ensotek', NOW(3), NOW(3)),

(UUID(), 'socials', 'tr', CAST(JSON_OBJECT(
  'instagram','https://instagram.com/ensotek',
  'facebook','https://facebook.com/ensotek',
  'youtube','https://youtube.com/@ensotek',
  'linkedin','https://linkedin.com/company/ensotek',
  'x','https://x.com/ensotek',
  'tiktok','https://www.tiktok.com/@ensotek'
) AS CHAR), NOW(3), NOW(3)),

(UUID(), 'company_profile', 'tr', CAST(JSON_OBJECT(
  'headline','Ensotek ile Akıllı Enerji ve Otomasyon Çözümleri',
  'subline','Endüstriyel tesisler, restoranlar ve ticari işletmeler için uçtan uca otomasyon ve enerji verimliliği çözümleri sunuyoruz.',
  'body','Ensotek Enerji Sistemleri; proje tasarımı, saha keşfi, kurulum, devreye alma ve bakım süreçlerinin tamamını tek çatı altında toplayan entegre bir teknoloji partneridir. IoT tabanlı uzaktan izleme, enerji tüketim analizi ve özel raporlama panelleriyle işletmenizin operasyonlarını dijitalleştirmenize yardımcı olur.'
) AS CHAR), NOW(3), NOW(3)),

(UUID(), 'company_brand', 'tr', CAST(JSON_OBJECT(
  'name','Ensotek Enerji Sistemleri',
  'shortName','ENSOTEK',
  'website','https://ensotek.de',
  'logo',JSON_OBJECT(
    'url','https://res.cloudinary.com/dbozv7wqd/image/upload/v1753707610/uploads/ensotek/company-images/logo-1753707609976-31353110.webp',
    'width',160,
    'height',60
  ),
  'images',JSON_ARRAY(
    JSON_OBJECT(
      'type','logo',
      'url','https://res.cloudinary.com/dbozv7wqd/image/upload/v1753707610/uploads/ensotek/company-images/logo-1753707609976-31353110.webp'
    )
  )
) AS CHAR), NOW(3), NOW(3)),

-- Opsiyonel: Eski yaklaşım ile uyumluluk için bırakıldı (ARTIK KULLANILMAYACAK)
(UUID(), 'catalog_admin_user_ids', 'tr', CAST(JSON_ARRAY() AS CHAR), NOW(3), NOW(3))

ON DUPLICATE KEY UPDATE
  `value`      = VALUES(`value`),
  `updated_at` = VALUES(`updated_at`);

-- =============================================================
-- SEED: EN (minimum)
-- =============================================================
INSERT INTO `site_settings` (`id`, `key`, `locale`, `value`, `created_at`, `updated_at`) VALUES
(UUID(), 'catalog_pdf_url', 'en', 'https://example.com/path/to/ensotek_catalog.pdf', NOW(3), NOW(3)),
(UUID(), 'catalog_pdf_filename', 'en', 'ensotek-catalog.pdf', NOW(3), NOW(3)),
(UUID(), 'contact_info', 'en', CAST(JSON_OBJECT(
  'companyName','Ensotek Energy Systems',
  'phones',JSON_ARRAY('+49 152 000 0000', '+90 212 000 00 00'),
  'email','hello@ensotek.com',
  'address','Ensotek Office, Musterstr. 10, 10115 Berlin, Germany',
  'addressSecondary','HQ: Ensotek Plaza, Büyükdere Ave. No:10, Sisli / Istanbul',
  'whatsappNumber','+49 152 000 0000',
  'taxOffice','Sisli Tax Office',
  'taxNumber','1234567890',
  'website','https://ensotek.de'
) AS CHAR), NOW(3), NOW(3)),
(UUID(), 'socials', 'en', CAST(JSON_OBJECT(
  'instagram','https://instagram.com/ensotek',
  'facebook','https://facebook.com/ensotek',
  'youtube','https://youtube.com/@ensotek',
  'linkedin','https://linkedin.com/company/ensotek',
  'x','https://x.com/ensotek',
  'tiktok','https://www.tiktok.com/@ensotek'
) AS CHAR), NOW(3), NOW(3)),
(UUID(), 'company_brand', 'en', CAST(JSON_OBJECT(
  'name','Ensotek Energy Systems',
  'shortName','ENSOTEK',
  'website','https://ensotek.de',
  'logo',JSON_OBJECT(
    'url','https://res.cloudinary.com/dbozv7wqd/image/upload/v1753707610/uploads/ensotek/company-images/logo-1753707609976-31353110.webp',
    'width',160,
    'height',60
  ),
  'images',JSON_ARRAY(
    JSON_OBJECT(
      'type','logo',
      'url','https://res.cloudinary.com/dbozv7wqd/image/upload/v1753707610/uploads/ensotek/company-images/logo-1753707609976-31353110.webp'
    )
  )
) AS CHAR), NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  `value`      = VALUES(`value`),
  `updated_at` = VALUES(`updated_at`);

-- =============================================================
-- OPSİYONEL: DE (örnek)
-- =============================================================
INSERT INTO `site_settings` (`id`, `key`, `locale`, `value`, `created_at`, `updated_at`) VALUES
(UUID(), 'contact_info', 'de', CAST(JSON_OBJECT(
  'companyName','Ensotek Energiesysteme',
  'phones',JSON_ARRAY('+49 152 000 0000'),
  'email','hallo@ensotek.com',
  'address','Musterstr. 10, 10115 Berlin, Deutschland',
  'whatsappNumber','+49 152 000 0000',
  'website','https://ensotek.de'
) AS CHAR), NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  `value`      = VALUES(`value`),
  `updated_at` = VALUES(`updated_at`);

-- =============================================================
-- TEKNİK: Storage (TR)
-- =============================================================
INSERT INTO `site_settings` (`id`, `key`, `locale`, `value`, `created_at`, `updated_at`) VALUES
(UUID(), 'storage_driver',           'tr', 'cloudinary', NOW(3), NOW(3)),
(UUID(), 'storage_local_root',       'tr', '',          NOW(3), NOW(3)),
(UUID(), 'storage_local_base_url',   'tr', '/uploads',  NOW(3), NOW(3)),
(UUID(), 'cloudinary_cloud_name',    'tr', '',          NOW(3), NOW(3)),
(UUID(), 'cloudinary_api_key',       'tr', '',          NOW(3), NOW(3)),
(UUID(), 'cloudinary_api_secret',    'tr', '',          NOW(3), NOW(3)),
(UUID(), 'cloudinary_folder',        'tr', 'uploads',   NOW(3), NOW(3)),
(UUID(), 'cloudinary_unsigned_preset','tr','',         NOW(3), NOW(3)),
(UUID(), 'storage_cdn_public_base',  'tr', '',          NOW(3), NOW(3)),
(UUID(), 'storage_public_api_base',  'tr', '',          NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  `value`      = VALUES(`value`),
  `updated_at` = VALUES(`updated_at`);

-- =============================================================
-- TEKNİK: SMTP (TR)
-- =============================================================
INSERT INTO `site_settings` (`id`, `key`, `locale`, `value`, `created_at`, `updated_at`) VALUES
(UUID(), 'smtp_host',       'tr', '',      NOW(3), NOW(3)),
(UUID(), 'smtp_port',       'tr', '465',   NOW(3), NOW(3)),
(UUID(), 'smtp_username',   'tr', '',      NOW(3), NOW(3)),
(UUID(), 'smtp_password',   'tr', '',      NOW(3), NOW(3)),
(UUID(), 'smtp_from_email', 'tr', '',      NOW(3), NOW(3)),
(UUID(), 'smtp_from_name',  'tr', 'Ensotek', NOW(3), NOW(3)),
(UUID(), 'smtp_ssl',        'tr', 'true',  NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  `value`      = VALUES(`value`),
  `updated_at` = VALUES(`updated_at`);

-- =============================================================
-- TEKNİK: Google OAuth (TR)
-- =============================================================
INSERT INTO `site_settings` (`id`, `key`, `locale`, `value`, `created_at`, `updated_at`) VALUES
(UUID(), 'google_client_id',     'tr', '', NOW(3), NOW(3)),
(UUID(), 'google_client_secret', 'tr', '', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  `value`      = VALUES(`value`),
  `updated_at` = VALUES(`updated_at`);

-- =============================================================
-- OTOMATİK KOPYA: TR → EN / TR → DE (eksik key'leri tamamlar)
-- =============================================================
INSERT INTO `site_settings` (`id`, `key`, `locale`, `value`, `created_at`, `updated_at`)
SELECT UUID(), s.`key`, 'en', s.`value`, NOW(3), NOW(3)
FROM `site_settings` s
WHERE s.`locale` = 'tr'
  AND NOT EXISTS (
    SELECT 1 FROM `site_settings` t
    WHERE t.`key` = s.`key` AND t.`locale` = 'en'
  );

INSERT INTO `site_settings` (`id`, `key`, `locale`, `value`, `created_at`, `updated_at`)
SELECT UUID(), s.`key`, 'de', s.`value`, NOW(3), NOW(3)
FROM `site_settings` s
WHERE s.`locale` = 'tr'
  AND NOT EXISTS (
    SELECT 1 FROM `site_settings` t
    WHERE t.`key` = s.`key` AND t.`locale` = 'de'
  );

SET FOREIGN_KEY_CHECKS = 1;
