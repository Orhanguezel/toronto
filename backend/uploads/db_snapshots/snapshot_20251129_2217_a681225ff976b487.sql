-- Simple SQL dump generated at 2025-11-29T21:17:53.044Z

CREATE DATABASE IF NOT EXISTS `ensotek` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `ensotek`;



-- ----------------------------
-- Table structure for `custom_pages`
-- ----------------------------
DROP TABLE IF EXISTS `custom_pages`;
CREATE TABLE `custom_pages` (
  `id` char(36) NOT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT 0,
  `featured_image` varchar(500) DEFAULT NULL,
  `featured_image_asset_id` char(36) DEFAULT NULL,
  `category_id` char(36) DEFAULT NULL,
  `sub_category_id` char(36) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `custom_pages_published_idx` (`is_published`),
  KEY `custom_pages_asset_idx` (`featured_image_asset_id`),
  KEY `custom_pages_created_idx` (`created_at`),
  KEY `custom_pages_updated_idx` (`updated_at`),
  KEY `custom_pages_category_id_idx` (`category_id`),
  KEY `custom_pages_sub_category_id_idx` (`sub_category_id`),
  CONSTRAINT `fk_custom_pages_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_custom_pages_sub_category` FOREIGN KEY (`sub_category_id`) REFERENCES `sub_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `custom_pages`
-- ----------------------------
INSERT INTO `custom_pages` (`id`, `is_published`, `featured_image`, `featured_image_asset_id`, `category_id`, `sub_category_id`, `created_at`, `updated_at`) VALUES 
('11111111-2222-3333-4444-555555555571', 1, 'https://res.cloudinary.com/dbozv7wqd/image/upload/v1757875082/uploads/ensotek/about-images/russia-cooling-tower-1757875080869-645546842.webp', NULL, 'aaaa7001-1111-4111-8111-aaaaaaaa7001', 'bbbb7002-1111-4111-8111-bbbbbbbb7002', '2025-11-29 02:12:27.219', '2025-11-29 02:12:27.219'),
('11111111-2222-3333-4444-555555555572', 1, 'https://res.cloudinary.com/dbozv7wqd/image/upload/v1757875102/uploads/ensotek/about-images/sogutma-kuleleri-cerkezkoy-1757875101328-515216727.webp', NULL, 'aaaa7001-1111-4111-8111-aaaaaaaa7001', 'bbbb7002-1111-4111-8111-bbbbbbbb7002', '2025-11-29 02:12:27.219', '2025-11-29 02:12:27.219'),
('11111111-2222-3333-4444-555555555573', 1, 'https://res.cloudinary.com/dbozv7wqd/image/upload/v1752786288/uploads/metahub/about-images/closed-circuit-water-cooling-towers1-1752786287184-840184158.webp', NULL, 'aaaa7001-1111-4111-8111-aaaaaaaa7001', 'bbbb7001-1111-4111-8111-bbbbbbbb7001', '2025-11-29 02:12:27.219', '2025-11-29 02:12:27.219'),
('22220001-2222-4222-8222-222222220001', 1, NULL, NULL, 'aaaa2001-1111-4111-8111-aaaaaaaa2001', 'bbbb2001-1111-4111-8111-bbbbbbbb2001', '2025-11-29 02:12:27.265', '2025-11-29 02:12:27.265'),
('22220002-2222-4222-8222-222222220002', 1, NULL, NULL, 'aaaa2003-1111-4111-8111-aaaaaaaa2003', 'bbbb2202-1111-4111-8111-bbbbbbbb2202', '2025-11-29 02:12:27.265', '2025-11-29 02:12:27.265'),
('22221001-2222-4222-8222-222222221001', 1, NULL, NULL, 'aaaa2004-1111-4111-8111-aaaaaaaa2004', 'bbbb2302-1111-4111-8111-bbbbbbbb2302', '2025-11-29 02:12:27.265', '2025-11-29 02:12:27.265'),
('33330001-3333-4333-8333-333333330001', 1, NULL, NULL, 'aaaa3001-1111-4111-8111-aaaaaaaa3001', 'bbbb3001-1111-4111-8111-bbbbbbbb3001', '2025-11-29 02:12:27.303', '2025-11-29 02:12:27.303'),
('33330002-3333-4333-8333-333333330002', 1, NULL, NULL, 'aaaa3001-1111-4111-8111-aaaaaaaa3001', 'bbbb3002-1111-4111-8111-bbbbbbbb3002', '2025-11-29 02:12:27.303', '2025-11-29 02:12:27.303'),
('33331001-3333-4333-8333-333333331001', 1, NULL, NULL, 'aaaa3002-1111-4111-8111-aaaaaaaa3002', 'bbbb3101-1111-4111-8111-bbbbbbbb3101', '2025-11-29 02:12:27.303', '2025-11-29 02:12:27.303');


-- ----------------------------
-- Table structure for `references_i18n`
-- ----------------------------
DROP TABLE IF EXISTS `references_i18n`;
CREATE TABLE `references_i18n` (
  `id` char(36) NOT NULL,
  `reference_id` char(36) NOT NULL,
  `locale` varchar(10) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `summary` longtext DEFAULT NULL,
  `content` longtext NOT NULL,
  `featured_image_alt` varchar(255) DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` varchar(500) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_references_i18n_parent_locale` (`reference_id`,`locale`),
  UNIQUE KEY `ux_references_i18n_locale_slug` (`locale`,`slug`),
  KEY `references_i18n_locale_idx` (`locale`),
  KEY `references_i18n_slug_idx` (`slug`),
  CONSTRAINT `fk_references_i18n_parent` FOREIGN KEY (`reference_id`) REFERENCES `references` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `references_i18n`
-- ----------------------------
INSERT INTO `references_i18n` (`id`, `reference_id`, `locale`, `title`, `slug`, `summary`, `content`, `featured_image_alt`, `meta_title`, `meta_description`, `created_at`, `updated_at`) VALUES 
('da123ac7-ccc8-11f0-93f3-e66132d9aac8', 'da0e6c14-ccc8-11f0-93f3-e66132d9aac8', 'tr', 'Toronto Ajans', 'toronto-ajans', 'Yaratıcı hizmetler ve reklam çözümleri.', '{\"html\": \"<p>Toronto; ürün, marka ve kampanyalar için yaratıcı çözümler sunar.</p>\"}', 'Kapak görseli', 'Toronto Ajans', 'Yaratıcı hizmetler ve reklam çözümleri.', '2025-11-29 02:12:26.776', '2025-11-29 02:12:26.776'),
('da144207-ccc8-11f0-93f3-e66132d9aac8', 'da0f1f31-ccc8-11f0-93f3-e66132d9aac8', 'tr', 'E-Ticaret Platformu', 'e-ticaret-platformu', 'Ürün yönetimi, ödeme ve kargo entegrasyonları.', '{\"html\": \"<p>Ölçeklenebilir altyapı ile hızlı e-ticaret.</p>\"}', 'Ürün görseli', 'E-Ticaret Platformu', 'Ölçeklenebilir e-ticaret altyapısı.', '2025-11-29 02:12:26.789', '2025-11-29 02:12:26.789'),
('da15ebd5-ccc8-11f0-93f3-e66132d9aac8', 'da0e6c14-ccc8-11f0-93f3-e66132d9aac8', 'en', 'Toronto Agency', 'toronto-agency', 'Creative services and ad solutions.', '{\"html\": \"<p>Toronto delivers creative solutions for products, brands and campaigns.</p>\"}', 'Cover image', 'Toronto Agency', 'Creative services and ad solutions.', '2025-11-29 02:12:26.800', '2025-11-29 02:12:26.800'),
('da16eaa8-ccc8-11f0-93f3-e66132d9aac8', 'da0f1f31-ccc8-11f0-93f3-e66132d9aac8', 'en', 'E-commerce Platform', 'ecommerce-platform', 'Product management, payments and shipments.', '{\"html\": \"<p>Fast e-commerce on scalable infra.</p>\"}', 'Product image', 'E-commerce Platform', 'Scalable e-commerce platform.', '2025-11-29 02:12:26.807', '2025-11-29 02:12:26.807');


-- ----------------------------
-- Table structure for `library_images`
-- ----------------------------
DROP TABLE IF EXISTS `library_images`;
CREATE TABLE `library_images` (
  `id` char(36) NOT NULL,
  `library_id` char(36) NOT NULL,
  `asset_id` char(36) NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `thumb_url` varchar(500) DEFAULT NULL,
  `webp_url` varchar(500) DEFAULT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `library_images_library_idx` (`library_id`),
  KEY `library_images_asset_idx` (`asset_id`),
  KEY `library_images_active_idx` (`is_active`),
  KEY `library_images_order_idx` (`display_order`),
  CONSTRAINT `fk_library_images_asset` FOREIGN KEY (`asset_id`) REFERENCES `storage_assets` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_library_images_parent` FOREIGN KEY (`library_id`) REFERENCES `library` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- ----------------------------
-- Table structure for `site_settings`
-- ----------------------------
DROP TABLE IF EXISTS `site_settings`;
CREATE TABLE `site_settings` (
  `id` char(36) NOT NULL,
  `key` varchar(100) NOT NULL,
  `locale` varchar(8) NOT NULL,
  `value` text NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_settings_key_locale_uq` (`key`,`locale`),
  KEY `site_settings_key_idx` (`key`),
  KEY `site_settings_locale_idx` (`locale`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `site_settings`
-- ----------------------------
INSERT INTO `site_settings` (`id`, `key`, `locale`, `value`, `created_at`, `updated_at`) VALUES 
('da3343c5-ccc8-11f0-93f3-e66132d9aac8', 'app_locales', 'tr', '[\"tr\", \"en\"]', '2025-11-29 02:12:26.993', '2025-11-29 02:12:26.993'),
('da336fa4-ccc8-11f0-93f3-e66132d9aac8', 'contact_info', 'tr', '{\"companyName\": \"Ensotek Enerji Sistemleri\", \"phones\": [\"+90 212 000 00 00\", \"+49 152 000 0000\"], \"email\": \"info@ensotek.com\", \"address\": \"Ensotek Plaza, Büyükdere Cd. No:10, Şişli / İstanbul\", \"addressSecondary\": \"Ofis: Musterstr. 10, 10115 Berlin, Almanya\", \"whatsappNumber\": \"+49 152 000 0000\", \"taxOffice\": \"Şişli VD\", \"taxNumber\": \"1234567890\"}', '2025-11-29 02:12:26.994', '2025-11-29 02:12:26.994'),
('da33be9b-ccc8-11f0-93f3-e66132d9aac8', 'socials', 'tr', '{\"instagram\": \"https://instagram.com/ensotek\", \"facebook\": \"https://facebook.com/ensotek\", \"youtube\": \"https://youtube.com/@ensotek\", \"linkedin\": \"https://linkedin.com/company/ensotek\", \"x\": \"https://x.com/ensotek\", \"tiktok\": \"https://www.tiktok.com/@ensotek\"}', '2025-11-29 02:12:26.996', '2025-11-29 02:12:26.996'),
('da33f77e-ccc8-11f0-93f3-e66132d9aac8', 'businessHours', 'tr', '[{\"day\": \"Pazartesi\", \"open\": \"09:00\", \"close\": \"18:00\", \"isClosed\": false}, {\"day\": \"Salı\", \"open\": \"09:00\", \"close\": \"18:00\", \"isClosed\": false}, {\"day\": \"Çarşamba\", \"open\": \"09:00\", \"close\": \"18:00\", \"isClosed\": false}, {\"day\": \"Perşembe\", \"open\": \"09:00\", \"close\": \"18:00\", \"isClosed\": false}, {\"day\": \"Cuma\", \"open\": \"09:00\", \"close\": \"18:00\", \"isClosed\": false}, {\"day\": \"Cumartesi\", \"open\": \"10:00\", \"close\": \"16:00\", \"isClosed\": false}, {\"day\": \"Pazar\", \"open\": null, \"close\": null, \"isClosed\": true}]', '2025-11-29 02:12:26.998', '2025-11-29 02:12:26.998'),
('da342d16-ccc8-11f0-93f3-e66132d9aac8', 'company_profile', 'tr', '{\"headline\": \"Ensotek ile Akıllı Enerji ve Otomasyon Çözümleri\", \"subline\": \"Endüstriyel tesisler, restoranlar ve ticari işletmeler için uçtan uca otomasyon ve enerji verimliliği çözümleri sunuyoruz.\", \"body\": \"Ensotek Enerji Sistemleri; proje tasarımı, saha keşfi, kurulum, devreye alma ve bakım süreçlerinin tamamını tek çatı altında toplayan entegre bir teknoloji partneridir. IoT tabanlı uzaktan izleme, enerjİ tüketim analizi ve özel raporlama panelleriyle işletmenizin operasyonlarını dijitalleştirmenize yardımcı olur.\"}', '2025-11-29 02:12:26.999', '2025-11-29 02:12:26.999'),
('da34597d-ccc8-11f0-93f3-e66132d9aac8', 'contact_info', 'en', '{\"companyName\": \"Ensotek Energy Systems\", \"phones\": [\"+49 152 000 0000\", \"+90 212 000 00 00\"], \"email\": \"hello@ensotek.com\", \"address\": \"Ensotek Office, Musterstr. 10, 10115 Berlin, Germany\", \"addressSecondary\": \"HQ: Ensotek Plaza, Büyükdere Ave. No:10, Sisli / Istanbul\", \"whatsappNumber\": \"+49 152 000 0000\", \"taxOffice\": \"Sisli Tax Office\", \"taxNumber\": \"1234567890\"}', '2025-11-29 02:12:27.000', '2025-11-29 02:12:27.000'),
('da356321-ccc8-11f0-93f3-e66132d9aac8', 'socials', 'en', '{\"instagram\": \"https://instagram.com/ensotek\", \"facebook\": \"https://facebook.com/ensotek\", \"youtube\": \"https://youtube.com/@ensotek\", \"linkedin\": \"https://linkedin.com/company/ensotek\", \"x\": \"https://x.com/ensotek\", \"tiktok\": \"https://www.tiktok.com/@ensotek\"}', '2025-11-29 02:12:27.007', '2025-11-29 02:12:27.007'),
('da367b0a-ccc8-11f0-93f3-e66132d9aac8', 'businessHours', 'en', '[{\"day\": \"Monday\", \"open\": \"09:00\", \"close\": \"18:00\", \"isClosed\": false}, {\"day\": \"Tuesday\", \"open\": \"09:00\", \"close\": \"18:00\", \"isClosed\": false}, {\"day\": \"Wednesday\", \"open\": \"09:00\", \"close\": \"18:00\", \"isClosed\": false}, {\"day\": \"Thursday\", \"open\": \"09:00\", \"close\": \"18:00\", \"isClosed\": false}, {\"day\": \"Friday\", \"open\": \"09:00\", \"close\": \"18:00\", \"isClosed\": false}, {\"day\": \"Saturday\", \"open\": \"10:00\", \"close\": \"16:00\", \"isClosed\": false}, {\"day\": \"Sunday\", \"open\": null, \"close\": null, \"isClosed\": true}]', '2025-11-29 02:12:27.014', '2025-11-29 02:12:27.014'),
('da378277-ccc8-11f0-93f3-e66132d9aac8', 'company_profile', 'en', '{\"headline\": \"Smart Energy & Automation with Ensotek\", \"subline\": \"We provide end-to-end automation and energy efficiency solutions for industrial facilities, restaurants, and commercial businesses.\", \"body\": \"Ensotek Energy Systems is an integrated technology partner covering project design, on-site inspection, installation, commissioning, and maintenance. With IoT-based remote monitoring, energy consumption analytics, and custom reporting dashboards, we help you digitalize your operations and optimize your energy usage.\"}', '2025-11-29 02:12:27.021', '2025-11-29 02:12:27.021'),
('da38914a-ccc8-11f0-93f3-e66132d9aac8', 'contact_info', 'de', '{\"companyName\": \"Ensotek Energiesysteme\", \"phones\": [\"+49 152 000 0000\"], \"email\": \"hallo@ensotek.com\", \"address\": \"Musterstr. 10, 10115 Berlin, Deutschland\", \"whatsappNumber\": \"+49 152 000 0000\"}', '2025-11-29 02:12:27.028', '2025-11-29 02:12:27.028'),
('da38c437-ccc8-11f0-93f3-e66132d9aac8', 'storage_driver', 'tr', 'cloudinary', '2025-11-29 02:12:27.029', '2025-11-29 02:12:27.029'),
('da38c6bc-ccc8-11f0-93f3-e66132d9aac8', 'storage_local_root', 'tr', '', '2025-11-29 02:12:27.029', '2025-11-29 02:12:27.029'),
('da38c7b9-ccc8-11f0-93f3-e66132d9aac8', 'storage_local_base_url', 'tr', '/uploads', '2025-11-29 02:12:27.029', '2025-11-29 02:12:27.029'),
('da38c85c-ccc8-11f0-93f3-e66132d9aac8', 'cloudinary_cloud_name', 'tr', '', '2025-11-29 02:12:27.029', '2025-11-29 02:12:27.029'),
('da38c8ef-ccc8-11f0-93f3-e66132d9aac8', 'cloudinary_api_key', 'tr', '', '2025-11-29 02:12:27.029', '2025-11-29 02:12:27.029'),
('da38c979-ccc8-11f0-93f3-e66132d9aac8', 'cloudinary_api_secret', 'tr', '', '2025-11-29 02:12:27.029', '2025-11-29 02:12:27.029'),
('da38c9f8-ccc8-11f0-93f3-e66132d9aac8', 'cloudinary_folder', 'tr', 'uploads', '2025-11-29 02:12:27.029', '2025-11-29 02:12:27.029'),
('da38ca7b-ccc8-11f0-93f3-e66132d9aac8', 'cloudinary_unsigned_preset', 'tr', '', '2025-11-29 02:12:27.029', '2025-11-29 02:12:27.029'),
('da38caf7-ccc8-11f0-93f3-e66132d9aac8', 'storage_cdn_public_base', 'tr', '', '2025-11-29 02:12:27.029', '2025-11-29 02:12:27.029'),
('da38cba0-ccc8-11f0-93f3-e66132d9aac8', 'storage_public_api_base', 'tr', '', '2025-11-29 02:12:27.029', '2025-11-29 02:12:27.029'),
('da38f71e-ccc8-11f0-93f3-e66132d9aac8', 'smtp_host', 'tr', '', '2025-11-29 02:12:27.031', '2025-11-29 02:12:27.031'),
('da38f9b2-ccc8-11f0-93f3-e66132d9aac8', 'smtp_port', 'tr', '465', '2025-11-29 02:12:27.031', '2025-11-29 02:12:27.031'),
('da38fb45-ccc8-11f0-93f3-e66132d9aac8', 'smtp_username', 'tr', '', '2025-11-29 02:12:27.031', '2025-11-29 02:12:27.031'),
('da38fc82-ccc8-11f0-93f3-e66132d9aac8', 'smtp_password', 'tr', '', '2025-11-29 02:12:27.031', '2025-11-29 02:12:27.031'),
('da38fd62-ccc8-11f0-93f3-e66132d9aac8', 'smtp_from_email', 'tr', '', '2025-11-29 02:12:27.031', '2025-11-29 02:12:27.031'),
('da38fe4b-ccc8-11f0-93f3-e66132d9aac8', 'smtp_from_name', 'tr', 'Ensotek', '2025-11-29 02:12:27.031', '2025-11-29 02:12:27.031'),
('da38ff2b-ccc8-11f0-93f3-e66132d9aac8', 'smtp_ssl', 'tr', 'true', '2025-11-29 02:12:27.031', '2025-11-29 02:12:27.031'),
('da392311-ccc8-11f0-93f3-e66132d9aac8', 'google_client_id', 'tr', '', '2025-11-29 02:12:27.032', '2025-11-29 02:12:27.032'),
('da39263a-ccc8-11f0-93f3-e66132d9aac8', 'google_client_secret', 'tr', '', '2025-11-29 02:12:27.032', '2025-11-29 02:12:27.032'),
('da396b23-ccc8-11f0-93f3-e66132d9aac8', 'app_locales', 'en', '[\"tr\", \"en\"]', '2025-11-29 02:12:27.033', '2025-11-29 02:12:27.033'),
('da397081-ccc8-11f0-93f3-e66132d9aac8', 'storage_driver', 'en', 'cloudinary', '2025-11-29 02:12:27.033', '2025-11-29 02:12:27.033'),
('da397175-ccc8-11f0-93f3-e66132d9aac8', 'storage_local_root', 'en', '', '2025-11-29 02:12:27.033', '2025-11-29 02:12:27.033'),
('da39725a-ccc8-11f0-93f3-e66132d9aac8', 'storage_local_base_url', 'en', '/uploads', '2025-11-29 02:12:27.033', '2025-11-29 02:12:27.033'),
('da39730d-ccc8-11f0-93f3-e66132d9aac8', 'cloudinary_cloud_name', 'en', '', '2025-11-29 02:12:27.033', '2025-11-29 02:12:27.033'),
('da3973c8-ccc8-11f0-93f3-e66132d9aac8', 'cloudinary_api_key', 'en', '', '2025-11-29 02:12:27.033', '2025-11-29 02:12:27.033'),
('da397474-ccc8-11f0-93f3-e66132d9aac8', 'cloudinary_api_secret', 'en', '', '2025-11-29 02:12:27.033', '2025-11-29 02:12:27.033'),
('da397526-ccc8-11f0-93f3-e66132d9aac8', 'cloudinary_folder', 'en', 'uploads', '2025-11-29 02:12:27.033', '2025-11-29 02:12:27.033'),
('da3975ef-ccc8-11f0-93f3-e66132d9aac8', 'cloudinary_unsigned_preset', 'en', '', '2025-11-29 02:12:27.033', '2025-11-29 02:12:27.033'),
('da3976bb-ccc8-11f0-93f3-e66132d9aac8', 'storage_cdn_public_base', 'en', '', '2025-11-29 02:12:27.033', '2025-11-29 02:12:27.033'),
('da39778f-ccc8-11f0-93f3-e66132d9aac8', 'storage_public_api_base', 'en', '', '2025-11-29 02:12:27.033', '2025-11-29 02:12:27.033'),
('da397842-ccc8-11f0-93f3-e66132d9aac8', 'smtp_host', 'en', '', '2025-11-29 02:12:27.033', '2025-11-29 02:12:27.033'),
('da3978e7-ccc8-11f0-93f3-e66132d9aac8', 'smtp_port', 'en', '465', '2025-11-29 02:12:27.033', '2025-11-29 02:12:27.033'),
('da3979ae-ccc8-11f0-93f3-e66132d9aac8', 'smtp_username', 'en', '', '2025-11-29 02:12:27.033', '2025-11-29 02:12:27.033'),
('da397a60-ccc8-11f0-93f3-e66132d9aac8', 'smtp_password', 'en', '', '2025-11-29 02:12:27.033', '2025-11-29 02:12:27.033'),
('da397b17-ccc8-11f0-93f3-e66132d9aac8', 'smtp_from_email', 'en', '', '2025-11-29 02:12:27.033', '2025-11-29 02:12:27.033'),
('da397bbb-ccc8-11f0-93f3-e66132d9aac8', 'smtp_from_name', 'en', 'Ensotek', '2025-11-29 02:12:27.033', '2025-11-29 02:12:27.033'),
('da397c73-ccc8-11f0-93f3-e66132d9aac8', 'smtp_ssl', 'en', 'true', '2025-11-29 02:12:27.033', '2025-11-29 02:12:27.033'),
('da397d1d-ccc8-11f0-93f3-e66132d9aac8', 'google_client_id', 'en', '', '2025-11-29 02:12:27.033', '2025-11-29 02:12:27.033'),
('da397df8-ccc8-11f0-93f3-e66132d9aac8', 'google_client_secret', 'en', '', '2025-11-29 02:12:27.033', '2025-11-29 02:12:27.033'),
('da39d125-ccc8-11f0-93f3-e66132d9aac8', 'app_locales', 'de', '[\"tr\", \"en\"]', '2025-11-29 02:12:27.036', '2025-11-29 02:12:27.036'),
('da39d36f-ccc8-11f0-93f3-e66132d9aac8', 'socials', 'de', '{\"instagram\": \"https://instagram.com/ensotek\", \"facebook\": \"https://facebook.com/ensotek\", \"youtube\": \"https://youtube.com/@ensotek\", \"linkedin\": \"https://linkedin.com/company/ensotek\", \"x\": \"https://x.com/ensotek\", \"tiktok\": \"https://www.tiktok.com/@ensotek\"}', '2025-11-29 02:12:27.036', '2025-11-29 02:12:27.036'),
('da39d3f9-ccc8-11f0-93f3-e66132d9aac8', 'businessHours', 'de', '[{\"day\": \"Pazartesi\", \"open\": \"09:00\", \"close\": \"18:00\", \"isClosed\": false}, {\"day\": \"Salı\", \"open\": \"09:00\", \"close\": \"18:00\", \"isClosed\": false}, {\"day\": \"Çarşamba\", \"open\": \"09:00\", \"close\": \"18:00\", \"isClosed\": false}, {\"day\": \"Perşembe\", \"open\": \"09:00\", \"close\": \"18:00\", \"isClosed\": false}, {\"day\": \"Cuma\", \"open\": \"09:00\", \"close\": \"18:00\", \"isClosed\": false}, {\"day\": \"Cumartesi\", \"open\": \"10:00\", \"close\": \"16:00\", \"isClosed\": false}, {\"day\": \"Pazar\", \"open\": null, \"close\": null, \"isClosed\": true}]', '2025-11-29 02:12:27.036', '2025-11-29 02:12:27.036'),
('da39d45e-ccc8-11f0-93f3-e66132d9aac8', 'company_profile', 'de', '{\"headline\": \"Ensotek ile Akıllı Enerji ve Otomasyon Çözümleri\", \"subline\": \"Endüstriyel tesisler, restoranlar ve ticari işletmeler için uçtan uca otomasyon ve enerji verimliliği çözümleri sunuyoruz.\", \"body\": \"Ensotek Enerji Sistemleri; proje tasarımı, saha keşfi, kurulum, devreye alma ve bakım süreçlerinin tamamını tek çatı altında toplayan entegre bir teknoloji partneridir. IoT tabanlı uzaktan izleme, enerjİ tüketim analizi ve özel raporlama panelleriyle işletmenizin operasyonlarını dijitalleştirmenize yardımcı olur.\"}', '2025-11-29 02:12:27.036', '2025-11-29 02:12:27.036'),
('da39d500-ccc8-11f0-93f3-e66132d9aac8', 'storage_driver', 'de', 'cloudinary', '2025-11-29 02:12:27.036', '2025-11-29 02:12:27.036'),
('da39d566-ccc8-11f0-93f3-e66132d9aac8', 'storage_local_root', 'de', '', '2025-11-29 02:12:27.036', '2025-11-29 02:12:27.036'),
('da39d5cc-ccc8-11f0-93f3-e66132d9aac8', 'storage_local_base_url', 'de', '/uploads', '2025-11-29 02:12:27.036', '2025-11-29 02:12:27.036'),
('da39d628-ccc8-11f0-93f3-e66132d9aac8', 'cloudinary_cloud_name', 'de', '', '2025-11-29 02:12:27.036', '2025-11-29 02:12:27.036'),
('da39d687-ccc8-11f0-93f3-e66132d9aac8', 'cloudinary_api_key', 'de', '', '2025-11-29 02:12:27.036', '2025-11-29 02:12:27.036'),
('da39d6dd-ccc8-11f0-93f3-e66132d9aac8', 'cloudinary_api_secret', 'de', '', '2025-11-29 02:12:27.036', '2025-11-29 02:12:27.036'),
('da39d731-ccc8-11f0-93f3-e66132d9aac8', 'cloudinary_folder', 'de', 'uploads', '2025-11-29 02:12:27.036', '2025-11-29 02:12:27.036'),
('da39d790-ccc8-11f0-93f3-e66132d9aac8', 'cloudinary_unsigned_preset', 'de', '', '2025-11-29 02:12:27.036', '2025-11-29 02:12:27.036'),
('da39d7f0-ccc8-11f0-93f3-e66132d9aac8', 'storage_cdn_public_base', 'de', '', '2025-11-29 02:12:27.036', '2025-11-29 02:12:27.036'),
('da39d852-ccc8-11f0-93f3-e66132d9aac8', 'storage_public_api_base', 'de', '', '2025-11-29 02:12:27.036', '2025-11-29 02:12:27.036'),
('da39d8aa-ccc8-11f0-93f3-e66132d9aac8', 'smtp_host', 'de', '', '2025-11-29 02:12:27.036', '2025-11-29 02:12:27.036'),
('da39d8fa-ccc8-11f0-93f3-e66132d9aac8', 'smtp_port', 'de', '465', '2025-11-29 02:12:27.036', '2025-11-29 02:12:27.036'),
('da39d959-ccc8-11f0-93f3-e66132d9aac8', 'smtp_username', 'de', '', '2025-11-29 02:12:27.036', '2025-11-29 02:12:27.036'),
('da39d9b3-ccc8-11f0-93f3-e66132d9aac8', 'smtp_password', 'de', '', '2025-11-29 02:12:27.036', '2025-11-29 02:12:27.036'),
('da39da0c-ccc8-11f0-93f3-e66132d9aac8', 'smtp_from_email', 'de', '', '2025-11-29 02:12:27.036', '2025-11-29 02:12:27.036'),
('da39da5e-ccc8-11f0-93f3-e66132d9aac8', 'smtp_from_name', 'de', 'Ensotek', '2025-11-29 02:12:27.036', '2025-11-29 02:12:27.036'),
('da39dab5-ccc8-11f0-93f3-e66132d9aac8', 'smtp_ssl', 'de', 'true', '2025-11-29 02:12:27.036', '2025-11-29 02:12:27.036'),
('da39db0b-ccc8-11f0-93f3-e66132d9aac8', 'google_client_id', 'de', '', '2025-11-29 02:12:27.036', '2025-11-29 02:12:27.036'),
('da39db70-ccc8-11f0-93f3-e66132d9aac8', 'google_client_secret', 'de', '', '2025-11-29 02:12:27.036', '2025-11-29 02:12:27.036');


-- ----------------------------
-- Table structure for `reviews`
-- ----------------------------
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` char(36) NOT NULL,
  `target_type` varchar(50) NOT NULL,
  `target_id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `rating` tinyint(4) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_approved` tinyint(1) NOT NULL DEFAULT 0,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `likes_count` int(11) NOT NULL DEFAULT 0,
  `dislikes_count` int(11) NOT NULL DEFAULT 0,
  `submitted_locale` varchar(8) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `reviews_target_idx` (`target_type`,`target_id`),
  KEY `reviews_rating_idx` (`rating`),
  KEY `reviews_active_idx` (`is_active`),
  KEY `reviews_approved_idx` (`is_approved`),
  KEY `reviews_display_order_idx` (`display_order`),
  KEY `reviews_created_idx` (`created_at`),
  KEY `reviews_updated_idx` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `reviews`
-- ----------------------------
INSERT INTO `reviews` (`id`, `target_type`, `target_id`, `name`, `email`, `rating`, `is_active`, `is_approved`, `display_order`, `likes_count`, `dislikes_count`, `submitted_locale`, `created_at`, `updated_at`) VALUES 
('44440001-4444-4444-8444-444444440001', 'custom_page', '11111111-2222-3333-4444-555555555571', 'Ahmet Yılmaz', 'ahmet@example.com', 5, 1, 1, 10, 3, 0, 'tr', '2025-11-29 02:12:27.464', '2025-11-29 02:12:27.464'),
('44440002-4444-4444-8444-444444440002', 'custom_page', '11111111-2222-3333-4444-555555555571', 'John Doe', 'john.doe@example.com', 4, 1, 1, 20, 1, 0, 'en', '2025-11-29 02:12:27.464', '2025-11-29 02:12:27.464'),
('44440003-4444-4444-8444-444444440003', 'custom_page', '11111111-2222-3333-4444-555555555573', 'Mehmet Kara', 'mehmet.kara@example.com', 5, 1, 1, 30, 5, 0, 'tr', '2025-11-29 02:12:27.464', '2025-11-29 02:12:27.464'),
('44440004-4444-4444-8444-444444440004', 'custom_page', '11111111-2222-3333-4444-555555555573', 'Emily Smith', 'emily.smith@example.com', 5, 1, 1, 40, 2, 0, 'en', '2025-11-29 02:12:27.464', '2025-11-29 02:12:27.464'),
('44440005-4444-4444-8444-444444440005', 'custom_page', '33330001-3333-4333-8333-333333330001', 'Serkan Demir', 'serkan.demir@example.com', 4, 1, 1, 50, 0, 0, 'tr', '2025-11-29 02:12:27.464', '2025-11-29 02:12:27.464');


-- ----------------------------
-- Table structure for `storage_assets`
-- ----------------------------
DROP TABLE IF EXISTS `storage_assets`;
CREATE TABLE `storage_assets` (
  `id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `bucket` varchar(64) NOT NULL,
  `path` varchar(512) NOT NULL,
  `folder` varchar(255) DEFAULT NULL,
  `mime` varchar(127) NOT NULL,
  `size` bigint(20) unsigned NOT NULL,
  `width` int(10) unsigned DEFAULT NULL,
  `height` int(10) unsigned DEFAULT NULL,
  `url` text DEFAULT NULL,
  `hash` varchar(64) DEFAULT NULL,
  `provider` varchar(16) NOT NULL DEFAULT 'cloudinary',
  `provider_public_id` varchar(255) DEFAULT NULL,
  `provider_resource_type` varchar(16) DEFAULT NULL,
  `provider_format` varchar(32) DEFAULT NULL,
  `provider_version` int(10) unsigned DEFAULT NULL,
  `etag` varchar(64) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_bucket_path` (`bucket`,`path`),
  KEY `idx_storage_bucket` (`bucket`),
  KEY `idx_storage_folder` (`folder`),
  KEY `idx_storage_created` (`created_at`),
  KEY `idx_provider_pubid` (`provider_public_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `storage_assets`
-- ----------------------------
INSERT INTO `storage_assets` (`id`, `user_id`, `name`, `bucket`, `path`, `folder`, `mime`, `size`, `width`, `height`, `url`, `hash`, `provider`, `provider_public_id`, `provider_resource_type`, `provider_format`, `provider_version`, `etag`, `metadata`, `created_at`, `updated_at`) VALUES 
('d9eaf21c-ccc8-11f0-93f3-e66132d9aac8', NULL, 'hero.jpg', 'public', 'references/hero.jpg', 'references', 'image/jpeg', 245120, NULL, NULL, NULL, NULL, 'cloudinary', 'references/hero', 'image', 'jpg', 1, NULL, NULL, '2025-11-29 02:12:26.520', '2025-11-29 02:12:26.520'),
('d9eb20a7-ccc8-11f0-93f3-e66132d9aac8', NULL, 'ref1.jpg', 'public', 'references/ref1.jpg', 'references', 'image/jpeg', 180300, NULL, NULL, NULL, NULL, 'cloudinary', 'references/ref1', 'image', 'jpg', 1, NULL, NULL, '2025-11-29 02:12:26.521', '2025-11-29 02:12:26.521'),
('d9eb50d2-ccc8-11f0-93f3-e66132d9aac8', NULL, 'ref2.jpg', 'public', 'references/ref2.jpg', 'references', 'image/jpeg', 171550, NULL, NULL, NULL, NULL, 'cloudinary', 'references/ref2', 'image', 'jpg', 1, NULL, NULL, '2025-11-29 02:12:26.522', '2025-11-29 02:12:26.522'),
('d9eb8892-ccc8-11f0-93f3-e66132d9aac8', NULL, 'g1a.jpg', 'public', 'references/g1a.jpg', 'references', 'image/jpeg', 200000, NULL, NULL, NULL, NULL, 'cloudinary', 'references/g1a', 'image', 'jpg', 1, NULL, NULL, '2025-11-29 02:12:26.523', '2025-11-29 02:12:26.523'),
('d9ebc2e3-ccc8-11f0-93f3-e66132d9aac8', NULL, 'g1b.jpg', 'public', 'references/g1b.jpg', 'references', 'image/jpeg', 210000, NULL, NULL, NULL, NULL, 'cloudinary', 'references/g1b', 'image', 'jpg', 1, NULL, NULL, '2025-11-29 02:12:26.525', '2025-11-29 02:12:26.525'),
('d9ec19da-ccc8-11f0-93f3-e66132d9aac8', NULL, 'g2a.jpg', 'public', 'references/g2a.jpg', 'references', 'image/jpeg', 205000, NULL, NULL, NULL, NULL, 'cloudinary', 'references/g2a', 'image', 'jpg', 1, NULL, NULL, '2025-11-29 02:12:26.527', '2025-11-29 02:12:26.527');


-- ----------------------------
-- Table structure for `custom_pages_i18n`
-- ----------------------------
DROP TABLE IF EXISTS `custom_pages_i18n`;
CREATE TABLE `custom_pages_i18n` (
  `id` char(36) NOT NULL,
  `page_id` char(36) NOT NULL,
  `locale` varchar(8) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`content`)),
  `featured_image_alt` varchar(255) DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` varchar(500) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_custom_pages_i18n_parent_locale` (`page_id`,`locale`),
  UNIQUE KEY `ux_custom_pages_i18n_slug_locale` (`slug`,`locale`),
  KEY `custom_pages_i18n_page_idx` (`page_id`),
  KEY `custom_pages_i18n_locale_idx` (`locale`),
  CONSTRAINT `fk_custom_pages_i18n_page` FOREIGN KEY (`page_id`) REFERENCES `custom_pages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `custom_pages_i18n`
-- ----------------------------
INSERT INTO `custom_pages_i18n` (`id`, `page_id`, `locale`, `title`, `slug`, `content`, `featured_image_alt`, `meta_title`, `meta_description`, `created_at`, `updated_at`) VALUES 
('da56d81c-ccc8-11f0-93f3-e66132d9aac8', '11111111-2222-3333-4444-555555555571', 'tr', 'Misyonumuz', 'misyonumuz', '{\"html\": \"<p>Sektördeki yenilikleri ve gelişmeleri yakından takip ederek, müşterilerimizin beklentilerine ve ihtiyaçlarına en uygun, verimli ve ekonomik çözümleri sunmayı amaçlıyoruz.</p><p>Hem Türkiye\'de hem de dünyada, su soğutma kuleleri denince akla gelen lider firmalardan biri olmayı hedefliyoruz.</p>\"}', 'Misyonumuz - Ensotek Su Soğutma Kuleleri', 'Misyonumuz | Ensotek Su Soğutma Kuleleri', 'Sektördeki yenilikleri takip ederek su soğutma kulelerinde en iyi çözümleri sunmayı hedefleyen Ensotek\'in misyonu.', '2025-11-29 02:12:27.223', '2025-11-29 02:12:27.223'),
('da56e5b9-ccc8-11f0-93f3-e66132d9aac8', '11111111-2222-3333-4444-555555555571', 'en', 'Our Mission', 'our-mission', '{\"html\": \"<p>Our mission is to closely follow innovations and developments in the sector, providing our customers with efficient and economical solutions that best suit their needs and expectations.</p><p>We aim to be one of the leading companies in Turkey and worldwide when it comes to water cooling towers.</p>\"}', 'Our Mission - Ensotek Water Cooling Towers', 'Our Mission | Ensotek Water Cooling Towers', 'Ensotek\'s mission is to follow innovations and provide efficient, economical water cooling tower solutions tailored to customer needs.', '2025-11-29 02:12:27.223', '2025-11-29 02:12:27.223'),
('da5854aa-ccc8-11f0-93f3-e66132d9aac8', '11111111-2222-3333-4444-555555555572', 'tr', 'Vizyonumuz', 'vizyonumuz', '{\"html\": \"<p>Vizyonumuz, müşteri memnuniyetini ön planda tutarak, kaliteli, verimli ve sürdürülebilir su soğutma kuleleri ve hizmetleri sunmak; ulusal ve uluslararası pazarda tercih edilen, güvenilir ve öncü bir marka olmaktır.</p>\"}', 'Vizyonumuz - Ensotek Su Soğutma Kuleleri', 'Vizyonumuz | Ensotek Su Soğutma Kuleleri', 'Müşteri memnuniyetini merkeze alarak, kaliteli ve sürdürülebilir su soğutma kuleleri sunmayı hedefleyen Ensotek\'in vizyonu.', '2025-11-29 02:12:27.235', '2025-11-29 02:12:27.235'),
('da58610a-ccc8-11f0-93f3-e66132d9aac8', '11111111-2222-3333-4444-555555555572', 'en', 'Our Vision', 'our-vision', '{\"html\": \"<p>Our vision is to prioritize customer satisfaction by providing high quality, efficient and sustainable water cooling towers and services; and to become a reliable and leading brand in both national and international markets.</p>\"}', 'Our Vision - Ensotek Water Cooling Towers', 'Our Vision | Ensotek Water Cooling Towers', 'Ensotek\'s vision is to provide high quality, efficient and sustainable water cooling towers and become a trusted global brand.', '2025-11-29 02:12:27.235', '2025-11-29 02:12:27.235'),
('da58c652-ccc8-11f0-93f3-e66132d9aac8', '11111111-2222-3333-4444-555555555573', 'tr', 'Ensotek Su Soğutma Kuleleri', 'ensotek-su-sogutma-kuleleri', '{\"html\": \"<p>Ensotek, 40 yıllık deneyimiyle İstanbul Merkez Ofis ve Ankara Fabrikası\'nda uzman kadrosu ile su soğutma kuleleri alanında hizmet vermektedir. Firmamız, Türkiye\'nin en büyük su soğutma kulesi üretim tesisine sahiptir.</p><p>Cam elyaf takviyeli polyester (FRP) malzemeden, korozyona dayanıklı, boyasız, uzun ömürlü, bakımı kolay ve düşük yatırım/işletme maliyetli açık ve kapalı devre su soğutma kuleleri üretmekteyiz.</p><p>Hem yurt içinde hem de yurt dışında binlerce projede başarılı çözümler ürettik. En iyi reklamın ürünün kendisi olduğu prensibiyle, müşterilerimizin tekrar tekrar bizi tercih etmesini ve her seferinde memnun kalmasını hedefliyoruz.</p><p>Ar-Ge faaliyetlerimiz ve müşteri geri bildirimleriyle ürünlerimizi sürekli geliştiriyor, Türkiye içinde ve dışında örnek bir firma konumunda yer alıyoruz. Ensotek, CTI (Cooling Technology Institute) ve SOSIAD üyesidir; üretim sistemimiz ISO-9001:2015 ile belgelenmiştir ve ürünlerimiz CE belgelidir.</p>\"}', 'Ensotek su soğutma kuleleri üretim tesisi', 'Ensotek Su Soğutma Kuleleri | 40 Yıllık Deneyim', 'Ensotek, 40 yıllık deneyimi ve Türkiye\'nin en büyük su soğutma kulesi üretim tesisiyle FRP açık ve kapalı devre soğutma kuleleri sunan sektör lideridir.', '2025-11-29 02:12:27.238', '2025-11-29 02:12:27.238'),
('da58db55-ccc8-11f0-93f3-e66132d9aac8', '11111111-2222-3333-4444-555555555573', 'en', 'Ensotek Water Cooling Towers', 'ensotek-water-cooling-towers', '{\"html\": \"<p>Ensotek serves its customers from its Istanbul Headquarters and Ankara Factory with an expert team and over 40 years of experience in water cooling towers. Our company owns the largest water cooling tower production facility in Turkey.</p><p>Ensotek manufactures open and closed circuit water cooling towers made from Fiberglass Reinforced Polyester (FRP), which are corrosion resistant, long-lasting, easy to maintain and offer low investment and operating costs.</p><p>We have delivered successful solutions in thousands of projects both in Turkey and abroad. With the principle that the best advertisement is the product itself, we aim for our customers to work with us repeatedly and be satisfied every time.</p><p>Through continuous R&amp;D activities and customer feedback, we keep improving our products and have become an exemplary company in Turkey and worldwide. Ensotek is a member of CTI (Cooling Technology Institute) and SOSIAD; our production system is certified with ISO-9001:2015 and our products are CE marked.</p>\"}', 'Ensotek water cooling tower production facility', 'Ensotek Water Cooling Towers | 40 Years of Experience', 'Ensotek is the sector leader with Turkey\'s largest water cooling tower production facility, delivering FRP open and closed circuit cooling towers for projects worldwide.', '2025-11-29 02:12:27.238', '2025-11-29 02:12:27.238'),
('da5e09fc-ccc8-11f0-93f3-e66132d9aac8', '22220001-2222-4222-8222-222222220001', 'tr', 'Yeni Proje Lansmanı', 'yeni-proje-lansmani', '{\"html\": \"<p>Ensotek olarak yeni su soğutma kulesi projemizin lansmanını duyurmaktan mutluluk duyuyoruz.</p>\"}', NULL, 'Yeni Proje Lansmanı | Ensotek', 'Ensotek\'in yeni su soğutma kulesi projesi hakkında duyuru.', '2025-11-29 02:12:27.268', '2025-11-29 02:12:27.268'),
('da5e25fc-ccc8-11f0-93f3-e66132d9aac8', '22220001-2222-4222-8222-222222220001', 'en', 'New Project Launch', 'new-project-launch', '{\"html\": \"<p>We are pleased to announce the launch of our new water cooling tower project.</p>\"}', NULL, 'New Project Launch | Ensotek', 'Announcement of Ensotek\'s new water cooling tower project.', '2025-11-29 02:12:27.268', '2025-11-29 02:12:27.268'),
('da5f8958-ccc8-11f0-93f3-e66132d9aac8', '22220002-2222-4222-8222-222222220002', 'tr', 'Bakım Çalışması Duyurusu', 'bakim-calismasi-duyurusu', '{\"html\": \"<p>Planlı bakım çalışmaları nedeniyle bazı tesislerimizde kısa süreli servis kesintileri yaşanabilir.</p>\"}', NULL, 'Bakım Çalışması Duyurusu | Ensotek', 'Ensotek tesislerinde planlı bakım çalışmaları hakkında duyuru.', '2025-11-29 02:12:27.283', '2025-11-29 02:12:27.283'),
('da5f9291-ccc8-11f0-93f3-e66132d9aac8', '22220002-2222-4222-8222-222222220002', 'en', 'Maintenance Notice', 'maintenance-notice', '{\"html\": \"<p>Due to scheduled maintenance, some of our facilities may experience short service interruptions.</p>\"}', NULL, 'Maintenance Notice | Ensotek', 'Announcement about scheduled maintenance in Ensotek facilities.', '2025-11-29 02:12:27.283', '2025-11-29 02:12:27.283'),
('da5fe4ba-ccc8-11f0-93f3-e66132d9aac8', '22221001-2222-4222-8222-222222221001', 'tr', 'Ensotek Basında', 'ensotek-basinda', '{\"html\": \"<p>Ensotek\'in su soğutma kuleleri, sektörel bir dergide detaylı bir makale ile yer aldı.</p>\"}', NULL, 'Ensotek Basında | Ensotek', 'Ensotek hakkında yayınlanan basın haberi.', '2025-11-29 02:12:27.285', '2025-11-29 02:12:27.285'),
('da5feb91-ccc8-11f0-93f3-e66132d9aac8', '22221001-2222-4222-8222-222222221001', 'en', 'Ensotek in the Press', 'ensotek-in-the-press', '{\"html\": \"<p>Ensotek\'s water cooling towers were featured in an in-depth article in a sectoral magazine.</p>\"}', NULL, 'Ensotek in the Press | Ensotek', 'Press coverage about Ensotek water cooling towers.', '2025-11-29 02:12:27.285', '2025-11-29 02:12:27.285'),
('da62af70-ccc8-11f0-93f3-e66132d9aac8', '33330001-3333-4333-8333-333333330001', 'tr', 'Su Soğutma Kulelerinde Periyodik Bakım', 'su-sogutma-kulelerinde-periyodik-bakim', '{\"html\": \"<p>Su soğutma kulelerinizin verimli ve uzun ömürlü çalışması için düzenli bakım yapılması kritik öneme sahiptir.</p>\"}', NULL, 'Su Soğutma Kulelerinde Periyodik Bakım | Ensotek', 'Su soğutma kulelerinde periyodik bakım adımlarını anlatan rehber.', '2025-11-29 02:12:27.304', '2025-11-29 02:12:27.304'),
('da62b443-ccc8-11f0-93f3-e66132d9aac8', '33330001-3333-4333-8333-333333330001', 'en', 'Periodic Maintenance for Water Cooling Towers', 'periodic-maintenance-water-cooling-towers', '{\"html\": \"<p>Regular maintenance is critical to ensure efficient and long-lasting operation of your water cooling towers.</p>\"}', NULL, 'Periodic Maintenance for Water Cooling Towers | Ensotek', 'A guide to periodic maintenance steps for water cooling towers.', '2025-11-29 02:12:27.304', '2025-11-29 02:12:27.304'),
('da62ee8f-ccc8-11f0-93f3-e66132d9aac8', '33330002-3333-4333-8333-333333330002', 'tr', 'Endüstriyel Tesisler için Soğutma Kulesi Yerleşimi', 'endustriyel-tesisler-icin-sogutma-kulesi-yerlesimi', '{\"html\": \"<p>Tesis yerleşimi doğru planlandığında, su soğutma kulelerinin verimi ve bakım kolaylığı önemli ölçüde artar.</p>\"}', NULL, 'Endüstriyel Tesisler için Soğutma Kulesi Yerleşimi | Ensotek', 'Su soğutma kulelerinin endüstriyel tesis yerleşiminde konumlandırılması için tasarım önerileri.', '2025-11-29 02:12:27.305', '2025-11-29 02:12:27.305'),
('da62f429-ccc8-11f0-93f3-e66132d9aac8', '33330002-3333-4333-8333-333333330002', 'en', 'Cooling Tower Layout for Industrial Plants', 'cooling-tower-layout-industrial-plants', '{\"html\": \"<p>When plant layout is planned correctly, the efficiency and maintainability of water cooling towers increase significantly.</p>\"}', NULL, 'Cooling Tower Layout for Industrial Plants | Ensotek', 'Design tips for positioning water cooling towers in industrial plant layouts.', '2025-11-29 02:12:27.305', '2025-11-29 02:12:27.305'),
('da632851-ccc8-11f0-93f3-e66132d9aac8', '33331001-3333-4333-8333-333333331001', 'tr', 'FRP Soğutma Kulelerinde Isı Transferi Temelleri', 'frp-sogutma-kulelerinde-isi-transferi-temelleri', '{\"html\": \"<p>FRP su soğutma kulelerinde ısı transferi; hava debisi, dolgu tipi ve su dağıtım sistemine bağlıdır.</p>\"}', NULL, 'FRP Soğutma Kulelerinde Isı Transferi Temelleri | Ensotek', 'FRP su soğutma kulelerinde ısı transferinin temel prensiplerini anlatan teknik yazı.', '2025-11-29 02:12:27.307', '2025-11-29 02:12:27.307'),
('da6335d9-ccc8-11f0-93f3-e66132d9aac8', '33331001-3333-4333-8333-333333331001', 'en', 'Basics of Heat Transfer in FRP Cooling Towers', 'basics-heat-transfer-frp-cooling-towers', '{\"html\": \"<p>Heat transfer in FRP water cooling towers depends on air flow, fill type and water distribution system.</p>\"}', NULL, 'Basics of Heat Transfer in FRP Cooling Towers | Ensotek', 'Technical article explaining fundamental principles of heat transfer in FRP cooling towers.', '2025-11-29 02:12:27.307', '2025-11-29 02:12:27.307');


-- ----------------------------
-- Table structure for `support_tickets`
-- ----------------------------
DROP TABLE IF EXISTS `support_tickets`;
CREATE TABLE `support_tickets` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` longtext NOT NULL,
  `status` enum('open','in_progress','waiting_response','closed') NOT NULL DEFAULT 'open',
  `priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `idx_support_tickets_user` (`user_id`),
  KEY `idx_support_tickets_created` (`created_at`),
  KEY `idx_support_tickets_updated` (`updated_at`),
  KEY `idx_support_tickets_status` (`status`),
  KEY `idx_support_tickets_priority` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `support_tickets`
-- ----------------------------
INSERT INTO `support_tickets` (`id`, `user_id`, `subject`, `message`, `status`, `priority`, `created_at`, `updated_at`) VALUES 
('10c9b25a-91ef-4711-84a9-af7118d61d15', '19a2bc26-63d1-43ad-ab56-d7f3c3719a34', 'hhh', 'hhghfh', 'open', 'high', '2025-10-13 15:41:10.000', '2025-10-13 15:41:10.000'),
('1b483b05-a8e0-48bd-8233-792863d26973', '19a2bc26-63d1-43ad-ab56-d7f3c3719a34', 'jhkhjk', 'kkk4545', 'open', 'medium', '2025-10-13 15:49:56.000', '2025-10-13 17:00:18.000'),
('22c8d700-a5b8-4395-b1ce-1aba42495add', '19a2bc26-63d1-43ad-ab56-d7f3c3719a34', 'vay', 'asdfsf', 'open', 'urgent', '2025-10-13 15:33:19.000', '2025-10-13 15:33:19.000'),
('3cefc270-a8a9-43bc-82c1-996f6b0c1526', '7129bc31-88dc-42da-ab80-415a21f2ea9a', 'sdfsdf', 'sdfsdfsdfsdf', 'open', 'high', '2025-10-13 17:02:22.000', '2025-10-13 17:02:22.000'),
('48beb30b-bbd2-44e9-a595-048f2632af20', '7129bc31-88dc-42da-ab80-415a21f2ea9a', 'Yahahhahasdasd', 'sdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdfsdlfsdkflsdf', 'open', 'high', '2025-10-13 15:45:08.000', '2025-10-13 15:45:08.000'),
('534148b8-7462-422e-93d7-430cc2fdf6a1', '19a2bc26-63d1-43ad-ab56-d7f3c3719a34', 'zıortapoz', 'necmi naber', 'open', 'medium', '2025-10-13 15:39:01.000', '2025-10-13 15:39:01.000'),
('8040c380-9855-4a97-8581-b64f7b32936c', '4a8fb7f7-0668-4429-9309-fe88ac90eed2', 'Sipariş', 'Ne zaman gelicek', 'open', 'medium', '2025-10-13 20:23:48.000', '2025-10-13 20:23:48.000'),
('8e741f22-84fd-4186-a626-f7e6ac4e7680', '19a2bc26-63d1-43ad-ab56-d7f3c3719a34', 'hqqqqqqqqq', '213123123', 'open', 'medium', '2025-10-13 15:43:58.000', '2025-10-13 15:43:58.000'),
('8f83c5b7-5cbb-4d7e-8262-2b89c5415e6d', '7129bc31-88dc-42da-ab80-415a21f2ea9a', 'jklj', 'jlkjkljkl', 'closed', 'medium', '2025-10-13 17:02:39.000', '2025-10-15 14:23:24.000'),
('951808b7-632b-4f6f-b2ff-a55f06ad19f9', '19a2bc26-63d1-43ad-ab56-d7f3c3719a34', 'fgfgfg', 'fgfgf', 'open', 'high', '2025-10-13 15:17:40.000', '2025-10-13 15:17:40.000'),
('952f0b54-c62e-4284-96fd-f3c968339cff', '7129bc31-88dc-42da-ab80-415a21f2ea9a', '67', '6666', 'open', 'medium', '2025-10-13 15:44:36.000', '2025-10-13 15:44:36.000'),
('96fe7c2e-36df-4d38-933b-ad6df54a47eb', '19a2bc26-63d1-43ad-ab56-d7f3c3719a34', 'jjjjjjj', 'eeeeeeeeeeee', 'open', 'low', '2025-10-13 15:42:39.000', '2025-10-13 15:42:39.000'),
('a2f05a24-ac0b-4b59-a322-9864cc5e5364', '0ac37a5c-a8be-4d25-b853-1e5c9574c1b3', 'Sipariş Hk', 'qweqweqweqwe', 'closed', 'high', '2025-10-13 12:55:00.000', '2025-10-13 12:55:48.000'),
('a894ffcf-28cb-4609-9021-b381e559a5f2', '19a2bc26-63d1-43ad-ab56-d7f3c3719a34', 'ghghg', 'fghfghfgh', 'open', 'low', '2025-10-13 15:37:19.000', '2025-10-13 15:37:19.000'),
('abebedb2-eefb-4d8f-a3bc-bb7e5b96a8aa', '19a2bc26-63d1-43ad-ab56-d7f3c3719a34', 'sordum', 'çiçeğe', 'open', 'medium', '2025-10-13 15:31:05.000', '2025-10-13 15:31:05.000'),
('c742d0ad-3f07-466b-ac1e-2cf34b84941a', '7129bc31-88dc-42da-ab80-415a21f2ea9a', 'Zaza', 'Zaza zaza', 'open', 'high', '2025-10-15 14:43:45.000', '2025-10-15 14:43:45.000'),
('ded743a6-7618-430c-bffb-e4db49dc6247', '4a8fb7f7-0668-4429-9309-fe88ac90eed2', 'Rast Gelsin İşin', 'qweqwewqe', 'open', 'medium', '2025-10-15 14:54:04.000', '2025-10-15 14:54:40.000'),
('df786c2d-5668-4688-88ad-952a3eebc812', '19a2bc26-63d1-43ad-ab56-d7f3c3719a34', 'eee', 'sdfsd', 'open', 'high', '2025-10-13 15:25:49.000', '2025-10-13 15:25:49.000'),
('dff55daa-ff67-401e-ba81-9513e2fbb164', '7129bc31-88dc-42da-ab80-415a21f2ea9a', 'df', 'dfdsfsdf', 'closed', 'medium', '2025-10-06 22:28:30.000', '2025-10-13 12:55:58.000'),
('e1b24422-8042-4897-a2e5-ff8dfb20ba3b', '7129bc31-88dc-42da-ab80-415a21f2ea9a', 'sdfsdf', 'sdfsdfsdf', 'open', 'high', '2025-10-13 17:02:29.000', '2025-10-13 17:02:29.000'),
('eb07b91d-d727-40a0-9dcd-55321578d0ab', 'd279bb9d-797d-4972-a8bd-a77a40caba91', 'Zübüşmatik', 'Petmatik', 'open', 'medium', '2025-10-14 08:08:53.000', '2025-10-14 08:08:53.000'),
('ebea761f-8dbe-42ff-9805-2a8c552d9388', '7129bc31-88dc-42da-ab80-415a21f2ea9a', 'qweqweqwe', 'asdasdsa', 'open', 'urgent', '2025-10-13 17:02:16.000', '2025-10-13 17:02:16.000'),
('f20fa9f8-5d93-463a-bf7b-60449fa5dfa4', '7129bc31-88dc-42da-ab80-415a21f2ea9a', 'Rast', 'RASt', 'open', 'medium', '2025-10-15 14:50:50.000', '2025-10-15 14:55:56.000');


-- ----------------------------
-- Table structure for `faqs`
-- ----------------------------
DROP TABLE IF EXISTS `faqs`;
CREATE TABLE `faqs` (
  `id` char(36) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `faqs_active_idx` (`is_active`),
  KEY `faqs_order_idx` (`display_order`),
  KEY `faqs_created_idx` (`created_at`),
  KEY `faqs_updated_idx` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `faqs`
-- ----------------------------
INSERT INTO `faqs` (`id`, `is_active`, `display_order`, `created_at`, `updated_at`) VALUES 
('11111111-1111-1111-1111-111111111111', 1, 1, '2024-01-01 00:00:00.000', '2025-11-29 02:43:56.421'),
('22222222-2222-2222-2222-222222222222', 1, 2, '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
('33333333-3333-3333-3333-333333333333', 1, 3, '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
('44444444-4444-4444-4444-444444444444', 1, 4, '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
('55555555-5555-5555-5555-555555555555', 1, 5, '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
('66666666-6666-6666-6666-666666666666', 1, 6, '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000');


-- ----------------------------
-- Table structure for `library`
-- ----------------------------
DROP TABLE IF EXISTS `library`;
CREATE TABLE `library` (
  `id` char(36) NOT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `tags_json` longtext DEFAULT NULL,
  `category_id` char(36) DEFAULT NULL,
  `sub_category_id` char(36) DEFAULT NULL,
  `author` varchar(255) DEFAULT NULL,
  `views` int(11) NOT NULL DEFAULT 0,
  `download_count` int(11) NOT NULL DEFAULT 0,
  `published_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `library_created_idx` (`created_at`),
  KEY `library_updated_idx` (`updated_at`),
  KEY `library_published_idx` (`is_published`),
  KEY `library_active_idx` (`is_active`),
  KEY `library_display_order_idx` (`display_order`),
  KEY `library_published_at_idx` (`published_at`),
  KEY `library_views_idx` (`views`),
  KEY `library_download_idx` (`download_count`),
  KEY `library_category_id_idx` (`category_id`),
  KEY `library_sub_category_id_idx` (`sub_category_id`),
  CONSTRAINT `fk_library_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_library_sub_category` FOREIGN KEY (`sub_category_id`) REFERENCES `sub_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `library`
-- ----------------------------
INSERT INTO `library` (`id`, `is_published`, `is_active`, `display_order`, `tags_json`, `category_id`, `sub_category_id`, `author`, `views`, `download_count`, `published_at`, `created_at`, `updated_at`) VALUES 
('dae65cd4-ccc8-11f0-93f3-e66132d9aac8', 1, 1, 10, '[\"brochure\",\"pdf\",\"kurumsal\"]', NULL, NULL, 'Güzel Web Design', 0, 0, '2025-11-29 02:12:28.168', '2025-11-29 02:12:28.168', '2025-11-29 02:12:28.168'),
('dae71e62-ccc8-11f0-93f3-e66132d9aac8', 1, 1, 20, '[\"guide\",\"pdf\",\"services\"]', NULL, NULL, 'Güzel Web Design', 0, 0, '2025-11-29 02:12:28.173', '2025-11-29 02:12:28.173', '2025-11-29 02:12:28.173');


-- ----------------------------
-- Table structure for `refresh_tokens`
-- ----------------------------
DROP TABLE IF EXISTS `refresh_tokens`;
CREATE TABLE `refresh_tokens` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `expires_at` datetime(3) NOT NULL,
  `revoked_at` datetime(3) DEFAULT NULL,
  `replaced_by` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `refresh_tokens_user_id_idx` (`user_id`),
  KEY `refresh_tokens_expires_at_idx` (`expires_at`),
  CONSTRAINT `fk_refresh_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `refresh_tokens`
-- ----------------------------
INSERT INTO `refresh_tokens` (`id`, `user_id`, `token_hash`, `created_at`, `expires_at`, `revoked_at`, `replaced_by`) VALUES 
('212e2698-6677-4620-b839-ac224c82b5a9', '4f618a8d-6fdb-498c-898a-395d368b2193', '264722bb9841b5371f4945b2834683cb3814bc4bff3e4b44ebe017cb4f6f089a', '2025-11-29 04:34:20.580', '2025-12-06 03:34:20.579', NULL, NULL),
('7a175a5b-b8bc-4116-b657-8fd51d886fdb', '4f618a8d-6fdb-498c-898a-395d368b2193', '4b45f2d10b6c84a6593b500e547fb4c944d50d366fa21dc39b2f5bb2f58cfa21', '2025-11-29 20:29:15.821', '2025-12-06 19:29:15.817', '2025-11-29 21:05:02.620', 'c46119f4-47fa-4d9a-9249-0f013fa74b93'),
('7f9c90d6-cef3-4b49-9462-ccbafe2bc105', '4f618a8d-6fdb-498c-898a-395d368b2193', '7cba19ceef73c0210d786568f4610c639700cb6b12e0426df5c35242b726b443', '2025-11-29 19:30:36.325', '2025-12-06 18:30:36.324', '2025-11-29 19:29:15.802', '7a175a5b-b8bc-4116-b657-8fd51d886fdb'),
('c46119f4-47fa-4d9a-9249-0f013fa74b93', '4f618a8d-6fdb-498c-898a-395d368b2193', '0cdb8ac89e7915712956cd7f98c420b8e82530b2ea57a0118bced5a838144106', '2025-11-29 22:05:02.630', '2025-12-06 21:05:02.629', NULL, NULL),
('e803330b-a4b4-4317-b187-a5a511e37225', '4f618a8d-6fdb-498c-898a-395d368b2193', 'e35622e91e380fa18e2c7e4c61214c7f8413880fcd27555de736fcc683191ba4', '2025-11-29 03:59:00.483', '2025-12-06 02:59:00.483', '2025-11-29 03:19:01.286', 'fc36ff2f-beae-4699-a59e-c414a32dada6'),
('e9de2d94-76ec-4be5-ab64-a98c7403a8e6', '4f618a8d-6fdb-498c-898a-395d368b2193', 'b6a911623a2cc1e84ce5b0d26828b43b0ea5a44f19b610af085d59ada7c06d8b', '2025-11-29 03:43:20.936', '2025-12-06 02:43:20.935', '2025-11-29 02:59:00.478', 'e803330b-a4b4-4317-b187-a5a511e37225'),
('fc36ff2f-beae-4699-a59e-c414a32dada6', '4f618a8d-6fdb-498c-898a-395d368b2193', 'bf23b0df7a035641dbaa1b6a631e5ddeaed9d72296a33fa3753a3274a4e29c90', '2025-11-29 04:19:01.307', '2025-12-06 03:19:01.304', '2025-11-29 03:34:20.572', '212e2698-6677-4620-b839-ac224c82b5a9');


-- ----------------------------
-- Table structure for `email_templates`
-- ----------------------------
DROP TABLE IF EXISTS `email_templates`;
CREATE TABLE `email_templates` (
  `id` char(36) NOT NULL,
  `template_key` varchar(100) NOT NULL,
  `variables` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`variables`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_email_tpl_key` (`template_key`),
  KEY `ix_email_tpl_active` (`is_active`),
  KEY `ix_email_tpl_updated_at` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `email_templates`
-- ----------------------------
INSERT INTO `email_templates` (`id`, `template_key`, `variables`, `is_active`, `created_at`, `updated_at`) VALUES 
('11112222-3333-4444-5555-666677778888', 'contact_admin_notification', '[\"name\", \"email\", \"phone\", \"subject\", \"message\", \"ip\", \"user_agent\"]', 1, '2025-10-09 19:38:58.000', '2025-10-09 19:38:58.000'),
('4290e3d9-d5b8-4423-aab2-1cbc85bee59b', 'ticket_replied', '[\"user_name\", \"ticket_id\", \"ticket_subject\", \"reply_message\", \"site_name\"]', 1, '2025-10-09 19:38:58.000', '2025-10-13 20:28:47.000'),
('4f85350b-c082-4677-bd9f-ad1e7d9bd038', 'order_item_delivery', '[\"customer_name\", \"order_number\", \"product_name\", \"delivery_content\", \"site_name\"]', 1, '2025-10-16 08:13:25.000', '2025-10-16 08:13:25.000'),
('547e8ec8-2746-4bb8-9be3-3db4d186697d', 'order_completed', '[\"customer_name\", \"order_number\", \"final_amount\", \"site_name\"]', 1, '2025-10-09 19:38:58.000', '2025-10-09 19:38:58.000'),
('5adeb7c9-e07b-4a36-9e49-460cd626cf8c', 'order_received', '[\"customer_name\", \"order_number\", \"final_amount\", \"status\", \"site_name\"]', 1, '2025-10-09 19:38:58.000', '2025-10-09 19:38:58.000'),
('99990000-aaaa-bbbb-cccc-ddddeeee0000', 'contact_user_autoreply', '[\"name\", \"subject\"]', 1, '2025-10-09 19:38:58.000', '2025-10-09 19:38:58.000'),
('c0bb0c00-1a2b-4c5d-9e8f-001122334455', 'password_changed', '[\"user_name\", \"site_name\"]', 1, '2025-10-09 19:38:58.000', '2025-10-09 19:38:58.000'),
('d75ec05a-bac7-446a-ac2a-cfc7b7f2dd07', 'deposit_success', '[\"user_name\", \"amount\", \"new_balance\", \"site_name\"]', 1, '2025-10-09 19:38:58.000', '2025-10-09 19:49:38.000'),
('da91f94a-bfe1-46b7-83fc-b4152e27c65e', 'password_reset', '[\"reset_link\", \"site_name\"]', 1, '2025-10-09 19:38:58.000', '2025-10-09 19:38:58.000'),
('dd5ecc0c-ab34-499a-8103-7a435472794a', 'order_cancelled', '[\"customer_name\", \"order_number\", \"final_amount\", \"cancellation_reason\", \"site_name\"]', 1, '2025-10-09 19:38:58.000', '2025-10-09 19:38:58.000'),
('e7fae474-c1cf-4600-8466-2f915146cfb9', 'welcome', '[\"user_name\", \"user_email\", \"site_name\"]', 1, '2025-10-09 19:38:58.000', '2025-10-13 15:06:38.000');


-- ----------------------------
-- Table structure for `menu_items`
-- ----------------------------
DROP TABLE IF EXISTS `menu_items`;
CREATE TABLE `menu_items` (
  `id` char(36) NOT NULL,
  `parent_id` char(36) DEFAULT NULL,
  `type` enum('page','custom') NOT NULL DEFAULT 'custom',
  `page_id` char(36) DEFAULT NULL,
  `location` enum('header','footer') NOT NULL DEFAULT 'header',
  `section_id` char(36) DEFAULT NULL,
  `icon` varchar(64) DEFAULT NULL,
  `order_num` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `menu_items_parent_idx` (`parent_id`),
  KEY `menu_items_active_idx` (`is_active`),
  KEY `menu_items_order_idx` (`order_num`),
  KEY `menu_items_created_idx` (`created_at`),
  KEY `menu_items_updated_idx` (`updated_at`),
  KEY `menu_items_location_idx` (`location`),
  KEY `menu_items_section_idx` (`section_id`),
  CONSTRAINT `menu_items_parent_fk` FOREIGN KEY (`parent_id`) REFERENCES `menu_items` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `menu_items`
-- ----------------------------
INSERT INTO `menu_items` (`id`, `parent_id`, `type`, `page_id`, `location`, `section_id`, `icon`, `order_num`, `is_active`, `created_at`, `updated_at`) VALUES 
('24c49639-01d0-4274-8fb9-c31ed64d0726', NULL, 'custom', NULL, 'footer', 'f942a930-6743-4ecc-b4b3-1fd6b77f9d77', NULL, 7, 1, '2025-11-29 02:12:29.153', '2025-11-29 02:12:29.153'),
('25740da6-c0f2-4c1d-b131-998018699bfd', NULL, 'custom', NULL, 'header', NULL, NULL, 3, 1, '2025-11-29 02:12:29.153', '2025-11-29 02:12:29.153'),
('2e32b68d-ae71-4d44-8770-95b8dfb03c36', NULL, 'custom', NULL, 'footer', '59583ef1-0ba1-4c7c-b806-84fd204b52b9', NULL, 1, 1, '2025-11-29 02:12:29.153', '2025-11-29 02:12:29.153'),
('3d325c92-d59e-4730-8301-5c9bcff463bc', NULL, 'custom', NULL, 'footer', 'f942a930-6743-4ecc-b4b3-1fd6b77f9d77', NULL, 4, 1, '2025-11-29 02:12:29.153', '2025-11-29 02:12:29.153'),
('455c6ddf-658b-4c0f-8a9e-0b104708dd07', NULL, 'custom', NULL, 'header', NULL, NULL, 5, 1, '2025-11-29 02:12:29.153', '2025-11-29 02:12:29.153'),
('6a4f6b37-ed99-4d98-8c54-d658096aacde', NULL, 'custom', NULL, 'footer', '59583ef1-0ba1-4c7c-b806-84fd204b52b9', NULL, 0, 1, '2025-11-29 02:12:29.153', '2025-11-29 02:12:29.153'),
('71c28444-7b6e-47ae-92be-f59206a1b820', NULL, 'custom', NULL, 'footer', 'f942a930-6743-4ecc-b4b3-1fd6b77f9d77', NULL, 3, 1, '2025-11-29 02:12:29.153', '2025-11-29 02:12:29.153'),
('9fa999a9-9e47-4a3c-9dac-6afba197d79c', NULL, 'custom', NULL, 'footer', 'f942a930-6743-4ecc-b4b3-1fd6b77f9d77', NULL, 5, 1, '2025-11-29 02:12:29.153', '2025-11-29 02:12:29.153'),
('c47a1c3f-cea1-4780-9381-77336bc8ac59', NULL, 'custom', NULL, 'header', NULL, NULL, 2, 1, '2025-11-29 02:12:29.153', '2025-11-29 02:12:29.153'),
('ceed431a-aafb-4aba-bf1f-6217b3960c01', NULL, 'custom', NULL, 'header', NULL, NULL, 4, 1, '2025-11-29 02:12:29.153', '2025-11-29 02:12:29.153'),
('d8ec7f51-384f-400a-9ac6-3a179cb89087', NULL, 'custom', NULL, 'footer', 'f942a930-6743-4ecc-b4b3-1fd6b77f9d77', NULL, 6, 1, '2025-11-29 02:12:29.153', '2025-11-29 02:12:29.153'),
('f1573cc3-5392-448b-89eb-d0e02e947c6d', NULL, 'custom', NULL, 'footer', '59583ef1-0ba1-4c7c-b806-84fd204b52b9', NULL, 2, 1, '2025-11-29 02:12:29.153', '2025-11-29 02:12:29.153'),
('f2570596-db46-4028-902c-d6fe2c9a8312', NULL, 'custom', NULL, 'header', NULL, NULL, 1, 1, '2025-11-29 02:12:29.153', '2025-11-29 02:12:29.153'),
('fe8120b3-919a-49b8-8035-df6fd2a2433f', NULL, 'custom', NULL, 'header', NULL, NULL, 0, 1, '2025-11-29 02:12:29.153', '2025-11-29 02:12:29.153');


-- ----------------------------
-- Table structure for `product_options`
-- ----------------------------
DROP TABLE IF EXISTS `product_options`;
CREATE TABLE `product_options` (
  `id` char(36) NOT NULL,
  `product_id` char(36) NOT NULL,
  `option_name` varchar(100) NOT NULL,
  `option_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`option_values`)),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `product_options_product_id_idx` (`product_id`),
  CONSTRAINT `fk_product_options_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- ----------------------------
-- Table structure for `sub_categories`
-- ----------------------------
DROP TABLE IF EXISTS `sub_categories`;
CREATE TABLE `sub_categories` (
  `id` char(36) NOT NULL,
  `category_id` char(36) NOT NULL,
  `locale` varchar(8) NOT NULL DEFAULT 'tr',
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` longtext DEFAULT NULL,
  `storage_asset_id` char(36) DEFAULT NULL,
  `alt` varchar(255) DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `sub_categories_cat_locale_slug_uq` (`category_id`,`locale`,`slug`),
  KEY `sub_categories_category_id_idx` (`category_id`),
  KEY `sub_categories_locale_idx` (`locale`),
  KEY `sub_categories_active_idx` (`is_active`),
  KEY `sub_categories_order_idx` (`display_order`),
  KEY `sub_categories_storage_asset_idx` (`storage_asset_id`),
  CONSTRAINT `fk_sub_categories_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `sub_categories`
-- ----------------------------
INSERT INTO `sub_categories` (`id`, `category_id`, `locale`, `name`, `slug`, `description`, `image_url`, `storage_asset_id`, `alt`, `icon`, `is_active`, `is_featured`, `display_order`, `created_at`, `updated_at`) VALUES 
('bbbb0001-1111-4111-8111-bbbbbbbb0001', 'aaaa0001-1111-4111-8111-aaaaaaaa0001', 'tr', 'Tek Kişilik Mezarlar', 'tek-kisilik-mezarlar', NULL, NULL, NULL, NULL, NULL, 1, 0, 10, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb0002-1111-4111-8111-bbbbbbbb0002', 'aaaa0001-1111-4111-8111-aaaaaaaa0001', 'tr', 'Çift Kişilik Mezarlar', 'cift-kisilik-mezarlar', NULL, NULL, NULL, NULL, NULL, 1, 0, 20, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb0003-1111-4111-8111-bbbbbbbb0003', 'aaaa0001-1111-4111-8111-aaaaaaaa0001', 'tr', 'Aile Mezarları', 'aile-mezarlari', NULL, NULL, NULL, NULL, NULL, 1, 0, 30, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb0004-1111-4111-8111-bbbbbbbb0004', 'aaaa0001-1111-4111-8111-aaaaaaaa0001', 'tr', 'Granit Mezar Modelleri', 'granit-mezar-modelleri', NULL, NULL, NULL, NULL, NULL, 1, 0, 40, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb0005-1111-4111-8111-bbbbbbbb0005', 'aaaa0001-1111-4111-8111-aaaaaaaa0001', 'tr', 'Mermer Mezar Modelleri', 'mermer-mezar-modelleri', NULL, NULL, NULL, NULL, NULL, 1, 0, 50, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb0101-1111-4111-8111-bbbbbbbb0101', 'aaaa0002-1111-4111-8111-aaaaaaaa0002', 'tr', 'Klasik Baş Taşı', 'klasik-bas-tasi', NULL, NULL, NULL, NULL, NULL, 1, 0, 10, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb0102-1111-4111-8111-bbbbbbbb0102', 'aaaa0002-1111-4111-8111-aaaaaaaa0002', 'tr', 'Modern Baş Taşı', 'modern-bas-tasi', NULL, NULL, NULL, NULL, NULL, 1, 0, 20, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb0103-1111-4111-8111-bbbbbbbb0103', 'aaaa0002-1111-4111-8111-aaaaaaaa0002', 'tr', 'Özel Tasarım Baş Taşı', 'ozel-tasarim-bas-tasi', NULL, NULL, NULL, NULL, NULL, 1, 0, 30, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb0201-1111-4111-8111-bbbbbbbb0201', 'aaaa0003-1111-4111-8111-aaaaaaaa0003', 'tr', 'Vazo Modelleri', 'vazo-modelleri', NULL, NULL, NULL, NULL, NULL, 1, 0, 10, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb0202-1111-4111-8111-bbbbbbbb0202', 'aaaa0003-1111-4111-8111-aaaaaaaa0003', 'tr', 'Fener ve Aydınlatma', 'fener-aydinlatma', NULL, NULL, NULL, NULL, NULL, 1, 0, 20, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb0203-1111-4111-8111-bbbbbbbb0203', 'aaaa0003-1111-4111-8111-aaaaaaaa0003', 'tr', 'Süsleme Aksesuarları', 'susleme-aksesuarlari', NULL, NULL, NULL, NULL, NULL, 1, 0, 30, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb0301-1111-4111-8111-bbbbbbbb0301', 'aaaa0004-1111-4111-8111-aaaaaaaa0004', 'tr', 'Canlı Çiçek Uygulamaları', 'canli-cicek-uygulamalari', NULL, NULL, NULL, NULL, NULL, 1, 0, 10, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb0302-1111-4111-8111-bbbbbbbb0302', 'aaaa0004-1111-4111-8111-aaaaaaaa0004', 'tr', 'Yapay Çiçek Düzenlemeleri', 'yapay-cicek-duzenlemeleri', NULL, NULL, NULL, NULL, NULL, 1, 0, 20, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb0303-1111-4111-8111-bbbbbbbb0303', 'aaaa0004-1111-4111-8111-aaaaaaaa0004', 'tr', 'Kalıcı Peyzaj Çözümleri', 'kalici-peyzaj-cozumleri', NULL, NULL, NULL, NULL, NULL, 1, 0, 30, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb0401-1111-4111-8111-bbbbbbbb0401', 'aaaa0005-1111-4111-8111-aaaaaaaa0005', 'tr', 'Standart Toprak Dolumu', 'standart-toprak-dolumu', NULL, NULL, NULL, NULL, NULL, 1, 0, 10, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb0402-1111-4111-8111-bbbbbbbb0402', 'aaaa0005-1111-4111-8111-aaaaaaaa0005', 'tr', 'Bitki Toprağı Dolumu', 'bitki-topragi-dolumu', NULL, NULL, NULL, NULL, NULL, 1, 0, 20, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb1001-1111-4111-8111-bbbbbbbb1001', 'aaaa1001-1111-4111-8111-aaaaaaaa1001', 'tr', 'Elektrik Aksamı', 'elektrik-aksami', NULL, NULL, NULL, NULL, NULL, 1, 0, 10, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb1002-1111-4111-8111-bbbbbbbb1002', 'aaaa1001-1111-4111-8111-aaaaaaaa1001', 'tr', 'Mekanik Parçalar', 'mekanik-parcalar', NULL, NULL, NULL, NULL, NULL, 1, 0, 20, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb1003-1111-4111-8111-bbbbbbbb1003', 'aaaa1001-1111-4111-8111-aaaaaaaa1001', 'tr', 'Montaj Aksesuarları', 'montaj-aksesuarlari', NULL, NULL, NULL, NULL, NULL, 1, 0, 30, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb2001-1111-4111-8111-bbbbbbbb2001', 'aaaa2001-1111-4111-8111-aaaaaaaa2001', 'tr', 'Duyurular', 'duyurular', NULL, NULL, NULL, NULL, NULL, 1, 0, 10, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb2002-1111-4111-8111-bbbbbbbb2002', 'aaaa2001-1111-4111-8111-aaaaaaaa2001', 'tr', 'Basın Bültenleri', 'basin-bultenleri', NULL, NULL, NULL, NULL, NULL, 1, 0, 20, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb2003-1111-4111-8111-bbbbbbbb2003', 'aaaa2001-1111-4111-8111-aaaaaaaa2001', 'tr', 'Sektör Haberleri', 'sektor-haberleri', NULL, NULL, NULL, NULL, NULL, 1, 0, 30, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb2101-1111-4111-8111-bbbbbbbb2101', 'aaaa2002-1111-4111-8111-aaaaaaaa2002', 'tr', 'Yeni Projeler', 'yeni-projeler', NULL, NULL, NULL, NULL, NULL, 1, 0, 10, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb2102-1111-4111-8111-bbbbbbbb2102', 'aaaa2002-1111-4111-8111-aaaaaaaa2002', 'tr', 'Ödül ve Başarılar', 'odul-ve-basarilar', NULL, NULL, NULL, NULL, NULL, 1, 0, 20, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb2201-1111-4111-8111-bbbbbbbb2201', 'aaaa2003-1111-4111-8111-aaaaaaaa2003', 'tr', 'Genel Duyurular', 'genel-duyurular', NULL, NULL, NULL, NULL, NULL, 1, 0, 10, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb2202-1111-4111-8111-bbbbbbbb2202', 'aaaa2003-1111-4111-8111-aaaaaaaa2003', 'tr', 'Bakım / Servis Duyuruları', 'bakim-servis-duyurulari', NULL, NULL, NULL, NULL, NULL, 1, 0, 20, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb2301-1111-4111-8111-bbbbbbbb2301', 'aaaa2004-1111-4111-8111-aaaaaaaa2004', 'tr', 'Gazete & Dergi', 'gazete-dergi', NULL, NULL, NULL, NULL, NULL, 1, 0, 10, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb2302-1111-4111-8111-bbbbbbbb2302', 'aaaa2004-1111-4111-8111-aaaaaaaa2004', 'tr', 'Online Haberler', 'online-haberler', NULL, NULL, NULL, NULL, NULL, 1, 0, 20, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb3001-1111-4111-8111-bbbbbbbb3001', 'aaaa3001-1111-4111-8111-aaaaaaaa3001', 'tr', 'Bakım Rehberleri', 'bakim-rehberleri', NULL, NULL, NULL, NULL, NULL, 1, 0, 10, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb3002-1111-4111-8111-bbbbbbbb3002', 'aaaa3001-1111-4111-8111-aaaaaaaa3001', 'tr', 'Tasarım Önerileri', 'tasarim-onerileri', NULL, NULL, NULL, NULL, NULL, 1, 0, 20, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb3003-1111-4111-8111-bbbbbbbb3003', 'aaaa3001-1111-4111-8111-aaaaaaaa3001', 'tr', 'Sık Sorulan Sorular', 'sik-sorulan-sorular-blog', NULL, NULL, NULL, NULL, NULL, 1, 0, 30, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb3101-1111-4111-8111-bbbbbbbb3101', 'aaaa3002-1111-4111-8111-aaaaaaaa3002', 'tr', 'Teknik Rehberler', 'teknik-rehberler', NULL, NULL, NULL, NULL, NULL, 1, 0, 10, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb3102-1111-4111-8111-bbbbbbbb3102', 'aaaa3002-1111-4111-8111-aaaaaaaa3002', 'tr', 'Arıza Çözümleri', 'ariza-cozumleri', NULL, NULL, NULL, NULL, NULL, 1, 0, 20, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb3201-1111-4111-8111-bbbbbbbb3201', 'aaaa3003-1111-4111-8111-aaaaaaaa3003', 'tr', 'Pazar Analizi', 'pazar-analizi', NULL, NULL, NULL, NULL, NULL, 1, 0, 10, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb3202-1111-4111-8111-bbbbbbbb3202', 'aaaa3003-1111-4111-8111-aaaaaaaa3003', 'tr', 'Trendler & Gelişmeler', 'trendler-gelismeler', NULL, NULL, NULL, NULL, NULL, 1, 0, 20, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb3301-1111-4111-8111-bbbbbbbb3301', 'aaaa3004-1111-4111-8111-aaaaaaaa3004', 'tr', 'Genel Rehberler', 'genel-rehberler', NULL, NULL, NULL, NULL, NULL, 1, 0, 10, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb3302-1111-4111-8111-bbbbbbbb3302', 'aaaa3004-1111-4111-8111-aaaaaaaa3004', 'tr', 'İlham Veren Hikayeler', 'ilham-veren-hikayeler', NULL, NULL, NULL, NULL, NULL, 1, 0, 20, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb4001-1111-4111-8111-bbbbbbbb4001', 'aaaa4001-1111-4111-8111-aaaaaaaa4001', 'tr', 'Ana Sayfa Sliderı', 'ana-sayfa-slideri', NULL, NULL, NULL, NULL, NULL, 1, 0, 10, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb4002-1111-4111-8111-bbbbbbbb4002', 'aaaa4001-1111-4111-8111-aaaaaaaa4001', 'tr', 'Kampanya Sliderı', 'kampanya-slideri', NULL, NULL, NULL, NULL, NULL, 1, 0, 20, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb5001-1111-4111-8111-bbbbbbbb5001', 'aaaa5001-1111-4111-8111-aaaaaaaa5001', 'tr', 'Bireysel Referanslar', 'bireysel-referanslar', NULL, NULL, NULL, NULL, NULL, 1, 0, 10, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb5002-1111-4111-8111-bbbbbbbb5002', 'aaaa5001-1111-4111-8111-aaaaaaaa5001', 'tr', 'Kurumsal Referanslar', 'kurumsal-referanslar', NULL, NULL, NULL, NULL, NULL, 1, 0, 20, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb6001-1111-4111-8111-bbbbbbbb6001', 'aaaa6001-1111-4111-8111-aaaaaaaa6001', 'tr', 'PDF Dokümanlar', 'pdf-dokumanlar', NULL, NULL, NULL, NULL, NULL, 1, 0, 10, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb6002-1111-4111-8111-bbbbbbbb6002', 'aaaa6001-1111-4111-8111-aaaaaaaa6001', 'tr', 'Görsel Galeri', 'gorsel-galeri', NULL, NULL, NULL, NULL, NULL, 1, 0, 20, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb6003-1111-4111-8111-bbbbbbbb6003', 'aaaa6001-1111-4111-8111-aaaaaaaa6001', 'tr', 'Video İçerikler', 'video-icerikler', NULL, NULL, NULL, NULL, NULL, 1, 0, 30, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb7001-1111-4111-8111-bbbbbbbb7001', 'aaaa7001-1111-4111-8111-aaaaaaaa7001', 'tr', 'Hakkımızda', 'hakkimizda', NULL, NULL, NULL, NULL, NULL, 1, 0, 10, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb7002-1111-4111-8111-bbbbbbbb7002', 'aaaa7001-1111-4111-8111-aaaaaaaa7001', 'tr', 'Misyon & Vizyon', 'misyon-vizyon', NULL, NULL, NULL, NULL, NULL, 1, 0, 20, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb7003-1111-4111-8111-bbbbbbbb7003', 'aaaa7001-1111-4111-8111-aaaaaaaa7001', 'tr', 'İnsan Kaynakları', 'insan-kaynaklari', NULL, NULL, NULL, NULL, NULL, 1, 0, 30, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb8001-1111-4111-8111-bbbbbbbb8001', 'aaaa8001-1111-4111-8111-aaaaaaaa8001', 'tr', 'Bakım Hizmetleri', 'bakim-hizmetleri', NULL, NULL, NULL, NULL, NULL, 1, 0, 10, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb8002-1111-4111-8111-bbbbbbbb8002', 'aaaa8001-1111-4111-8111-aaaaaaaa8001', 'tr', 'Temizlik Hizmetleri', 'temizlik-hizmetleri', NULL, NULL, NULL, NULL, NULL, 1, 0, 20, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459'),
('bbbb8003-1111-4111-8111-bbbbbbbb8003', 'aaaa8001-1111-4111-8111-aaaaaaaa8001', 'tr', 'Peyzaj Hizmetleri', 'peyzaj-hizmetleri', NULL, NULL, NULL, NULL, NULL, 1, 0, 30, '2025-11-29 02:12:26.459', '2025-11-29 02:12:26.459');


-- ----------------------------
-- Table structure for `footer_sections_i18n`
-- ----------------------------
DROP TABLE IF EXISTS `footer_sections_i18n`;
CREATE TABLE `footer_sections_i18n` (
  `id` char(36) NOT NULL,
  `section_id` char(36) NOT NULL,
  `locale` varchar(10) NOT NULL,
  `title` varchar(150) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` longtext DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_footer_sections_i18n_section_locale` (`section_id`,`locale`),
  UNIQUE KEY `ux_footer_sections_i18n_locale_slug` (`locale`,`slug`),
  KEY `footer_sections_i18n_locale_idx` (`locale`),
  KEY `footer_sections_i18n_title_idx` (`title`),
  CONSTRAINT `fk_footer_sections_i18n_section` FOREIGN KEY (`section_id`) REFERENCES `footer_sections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `footer_sections_i18n`
-- ----------------------------
INSERT INTO `footer_sections_i18n` (`id`, `section_id`, `locale`, `title`, `slug`, `description`, `created_at`, `updated_at`) VALUES 
('69583ef1-0ba1-4c7c-b806-84fd204b52b9', '59583ef1-0ba1-4c7c-b806-84fd204b52b9', 'tr', 'Hızlı Erişim', 'hizli-erisim', 'Sık kullanılan sayfalara hızlı erişim bağlantıları.', '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
('f942a930-6743-4ecc-b4b3-1fd6b77f9d78', 'f942a930-6743-4ecc-b4b3-1fd6b77f9d77', 'tr', 'Kurumsal', 'kurumsal', 'Şirket ve yasal bilgilere ait bağlantılar.', '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000');


-- ----------------------------
-- Table structure for `reference_images_i18n`
-- ----------------------------
DROP TABLE IF EXISTS `reference_images_i18n`;
CREATE TABLE `reference_images_i18n` (
  `id` char(36) NOT NULL,
  `image_id` char(36) NOT NULL,
  `locale` varchar(10) NOT NULL,
  `alt` varchar(255) DEFAULT NULL,
  `caption` varchar(1000) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_reference_images_i18n_parent_locale` (`image_id`,`locale`),
  KEY `reference_images_i18n_locale_idx` (`locale`),
  CONSTRAINT `fk_reference_images_i18n_parent` FOREIGN KEY (`image_id`) REFERENCES `reference_images` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `reference_images_i18n`
-- ----------------------------
INSERT INTO `reference_images_i18n` (`id`, `image_id`, `locale`, `alt`, `caption`, `created_at`, `updated_at`) VALUES 
('da298f8d-ccc8-11f0-93f3-e66132d9aac8', 'da2191e4-ccc8-11f0-93f3-e66132d9aac8', 'tr', 'Galeri 1A', NULL, '2025-11-29 02:12:26.930', '2025-11-29 02:12:26.930'),
('da29b4e6-ccc8-11f0-93f3-e66132d9aac8', 'da22a624-ccc8-11f0-93f3-e66132d9aac8', 'tr', 'Galeri 1B', NULL, '2025-11-29 02:12:26.931', '2025-11-29 02:12:26.931'),
('da29dd06-ccc8-11f0-93f3-e66132d9aac8', 'da23b751-ccc8-11f0-93f3-e66132d9aac8', 'tr', 'Galeri 2A', NULL, '2025-11-29 02:12:26.932', '2025-11-29 02:12:26.932'),
('da29f274-ccc8-11f0-93f3-e66132d9aac8', 'da2191e4-ccc8-11f0-93f3-e66132d9aac8', 'en', 'Gallery 1A', NULL, '2025-11-29 02:12:26.932', '2025-11-29 02:12:26.932'),
('da2a0b66-ccc8-11f0-93f3-e66132d9aac8', 'da22a624-ccc8-11f0-93f3-e66132d9aac8', 'en', 'Gallery 1B', NULL, '2025-11-29 02:12:26.933', '2025-11-29 02:12:26.933'),
('da2b0832-ccc8-11f0-93f3-e66132d9aac8', 'da23b751-ccc8-11f0-93f3-e66132d9aac8', 'en', 'Gallery 2A', NULL, '2025-11-29 02:12:26.939', '2025-11-29 02:12:26.939');


-- ----------------------------
-- Table structure for `product_faqs`
-- ----------------------------
DROP TABLE IF EXISTS `product_faqs`;
CREATE TABLE `product_faqs` (
  `id` char(36) NOT NULL,
  `product_id` char(36) NOT NULL,
  `question` varchar(500) NOT NULL,
  `answer` text NOT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `product_faqs_product_id_idx` (`product_id`),
  KEY `product_faqs_order_idx` (`display_order`),
  CONSTRAINT `fk_product_faqs_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- ----------------------------
-- Table structure for `services`
-- ----------------------------
DROP TABLE IF EXISTS `services`;
CREATE TABLE `services` (
  `id` char(36) NOT NULL,
  `type` varchar(32) NOT NULL DEFAULT 'other',
  `category_id` char(36) DEFAULT NULL,
  `sub_category_id` char(36) DEFAULT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `display_order` int(11) NOT NULL DEFAULT 1,
  `featured_image` varchar(500) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `image_asset_id` char(36) DEFAULT NULL,
  `area` varchar(64) DEFAULT NULL,
  `duration` varchar(64) DEFAULT NULL,
  `maintenance` varchar(64) DEFAULT NULL,
  `season` varchar(64) DEFAULT NULL,
  `soil_type` varchar(128) DEFAULT NULL,
  `thickness` varchar(64) DEFAULT NULL,
  `equipment` varchar(128) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `services_active_idx` (`is_active`),
  KEY `services_order_idx` (`display_order`),
  KEY `services_type_idx` (`type`),
  KEY `services_category_id_idx` (`category_id`),
  KEY `services_sub_category_id_idx` (`sub_category_id`),
  KEY `services_image_asset_idx` (`image_asset_id`),
  KEY `services_created_idx` (`created_at`),
  KEY `services_updated_idx` (`updated_at`),
  CONSTRAINT `fk_services_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_services_featured_asset` FOREIGN KEY (`image_asset_id`) REFERENCES `storage_assets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_services_sub_category` FOREIGN KEY (`sub_category_id`) REFERENCES `sub_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `services`
-- ----------------------------
INSERT INTO `services` (`id`, `type`, `category_id`, `sub_category_id`, `featured`, `is_active`, `display_order`, `featured_image`, `image_url`, `image_asset_id`, `area`, `duration`, `maintenance`, `season`, `soil_type`, `thickness`, `equipment`, `created_at`, `updated_at`) VALUES 
('daaf232a-ccc8-11f0-93f3-e66132d9aac8', 'gardening', NULL, NULL, 1, 1, 1, NULL, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop', NULL, '2-5 m²', '3-4 Ay', 'Haftalık Bakım', 'Mevsimlik', NULL, NULL, NULL, '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
('dab12bd3-ccc8-11f0-93f3-e66132d9aac8', 'soil', NULL, NULL, 1, 1, 1, NULL, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop', NULL, '2-10 m²', NULL, NULL, NULL, 'Kaliteli Bahçe Toprağı', '20-30 cm', 'El Aletleri + Küçük Makine', '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000');


-- ----------------------------
-- Table structure for `contact_messages`
-- ----------------------------
DROP TABLE IF EXISTS `contact_messages`;
CREATE TABLE `contact_messages` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(64) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` longtext NOT NULL,
  `status` varchar(32) NOT NULL DEFAULT 'new',
  `is_resolved` tinyint(1) NOT NULL DEFAULT 0,
  `admin_note` varchar(2000) DEFAULT NULL,
  `ip` varchar(64) DEFAULT NULL,
  `user_agent` varchar(512) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `idx_contact_created_at` (`created_at`),
  KEY `idx_contact_status` (`status`),
  KEY `idx_contact_resolved` (`is_resolved`),
  KEY `idx_contact_updated_at` (`updated_at`),
  KEY `idx_contact_status_resolved_created` (`status`,`is_resolved`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `contact_messages`
-- ----------------------------
INSERT INTO `contact_messages` (`id`, `name`, `email`, `phone`, `subject`, `message`, `status`, `is_resolved`, `admin_note`, `ip`, `user_agent`, `website`, `created_at`, `updated_at`) VALUES 
('11111111-2222-3333-4444-555555555555', 'Elif Koç', 'elif@example.com', '+90 530 333 33 44', 'Özel tasarım mezar', 'Modern tasarım granit mezar için görsel ve fiyat bilgisi rica ediyorum.', 'new', 0, NULL, NULL, NULL, NULL, '2024-01-05 14:20:00.000', '2025-11-29 03:05:30.557');


-- ----------------------------
-- Table structure for `service_images_i18n`
-- ----------------------------
DROP TABLE IF EXISTS `service_images_i18n`;
CREATE TABLE `service_images_i18n` (
  `id` char(36) NOT NULL,
  `image_id` char(36) NOT NULL,
  `locale` varchar(10) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `alt` varchar(255) DEFAULT NULL,
  `caption` varchar(500) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_service_images_i18n_unique` (`image_id`,`locale`),
  KEY `service_images_i18n_locale_idx` (`locale`),
  CONSTRAINT `fk_service_images_i18n_image` FOREIGN KEY (`image_id`) REFERENCES `service_images` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `service_images_i18n`
-- ----------------------------
INSERT INTO `service_images_i18n` (`id`, `image_id`, `locale`, `title`, `alt`, `caption`, `created_at`, `updated_at`) VALUES 
('dab86fb5-ccc8-11f0-93f3-e66132d9aac8', 'dab7ef91-ccc8-11f0-93f3-e66132d9aac8', 'tr', 'Mevsimlik çiçek ekimi ana görseli', 'Mezar üzerinde mevsimlik çiçek ekimi hizmeti', 'Mevsimlik çiçeklerle düzenlenmiş mezar alanı', '2025-11-29 02:12:27.866', '2025-11-29 02:12:27.866'),
('dab879cc-ccc8-11f0-93f3-e66132d9aac8', 'dab7ef91-ccc8-11f0-93f3-e66132d9aac8', 'en', 'Seasonal flower planting main image', 'Seasonal flower planting service on the grave', 'Grave area decorated with seasonal flowers', '2025-11-29 02:12:27.866', '2025-11-29 02:12:27.866'),
('dabc4e5e-ccc8-11f0-93f3-e66132d9aac8', 'daba101e-ccc8-11f0-93f3-e66132d9aac8', 'tr', 'Standart toprak doldurumu ana görseli', 'Mezar alanında standart toprak doldurumu hizmeti', 'Temel toprak doldurumu yapılmış mezar alanı', '2025-11-29 02:12:27.882', '2025-11-29 02:12:27.882'),
('dabc5508-ccc8-11f0-93f3-e66132d9aac8', 'daba101e-ccc8-11f0-93f3-e66132d9aac8', 'en', 'Standard soil fill main image', 'Standard soil filling service on the grave', 'Grave area after standard soil filling', '2025-11-29 02:12:27.882', '2025-11-29 02:12:27.882');


-- ----------------------------
-- Table structure for `users`
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `email_verified` tinyint(1) NOT NULL DEFAULT 0,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  `last_sign_in_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `users`
-- ----------------------------
INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `phone`, `is_active`, `email_verified`, `reset_token`, `reset_token_expires`, `created_at`, `updated_at`, `last_sign_in_at`) VALUES 
('19a2bc26-63d1-43ad-ab56-d7f3c3719a34', 'hostingisletmesi@gmail.com', '$2b$12$temporary.hash.needs.reset', 'Nuri Muh', '05414417854', 1, 0, NULL, NULL, '2025-10-13 15:07:15.000', '2025-10-16 09:26:05.000', NULL),
('4f618a8d-6fdb-498c-898a-395d368b2193', 'orhanguzell@gmail.com', '$2b$12$m8oADzBDoLOA7kuwcWcItO7biNONO1o2J2BKdugMrqpxapi2iwMki', 'Orhan Güzel', '+905551112233', 1, 1, NULL, NULL, '2025-11-29 02:12:26.016', '2025-11-29 18:30:36.305', '2025-11-29 18:30:36.304');


-- ----------------------------
-- Table structure for `references`
-- ----------------------------
DROP TABLE IF EXISTS `references`;
CREATE TABLE `references` (
  `id` char(36) NOT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT 0,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `featured_image` varchar(500) DEFAULT NULL,
  `featured_image_asset_id` char(36) DEFAULT NULL,
  `website_url` varchar(500) DEFAULT NULL,
  `category_id` char(36) DEFAULT NULL,
  `sub_category_id` char(36) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `references_created_idx` (`created_at`),
  KEY `references_updated_idx` (`updated_at`),
  KEY `references_published_idx` (`is_published`),
  KEY `references_featured_idx` (`is_featured`),
  KEY `references_display_order_idx` (`display_order`),
  KEY `references_featured_asset_idx` (`featured_image_asset_id`),
  KEY `references_category_id_idx` (`category_id`),
  KEY `references_sub_category_id_idx` (`sub_category_id`),
  CONSTRAINT `fk_references_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_references_sub_category` FOREIGN KEY (`sub_category_id`) REFERENCES `sub_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `references`
-- ----------------------------
INSERT INTO `references` (`id`, `is_published`, `is_featured`, `display_order`, `featured_image`, `featured_image_asset_id`, `website_url`, `category_id`, `sub_category_id`, `created_at`, `updated_at`) VALUES 
('da0e6c14-ccc8-11f0-93f3-e66132d9aac8', 1, 1, 10, NULL, 'd9eaf21c-ccc8-11f0-93f3-e66132d9aac8', 'https://guzelwebdesign.com', NULL, NULL, '2025-11-29 02:12:26.753', '2025-11-29 02:12:26.753'),
('da0f1f31-ccc8-11f0-93f3-e66132d9aac8', 1, 0, 20, NULL, 'd9eb20a7-ccc8-11f0-93f3-e66132d9aac8', 'https://example.com/ecommerce', NULL, NULL, '2025-11-29 02:12:26.757', '2025-11-29 02:12:26.757');


-- ----------------------------
-- Table structure for `product_stock`
-- ----------------------------
DROP TABLE IF EXISTS `product_stock`;
CREATE TABLE `product_stock` (
  `id` char(36) NOT NULL,
  `product_id` char(36) NOT NULL,
  `stock_content` varchar(255) NOT NULL,
  `is_used` tinyint(1) NOT NULL DEFAULT 0,
  `used_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `order_item_id` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_stock_product_id_idx` (`product_id`),
  KEY `product_stock_is_used_idx` (`product_id`,`is_used`),
  KEY `product_stock_order_item_id_idx` (`order_item_id`),
  CONSTRAINT `fk_product_stock_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- ----------------------------
-- Table structure for `product_reviews`
-- ----------------------------
DROP TABLE IF EXISTS `product_reviews`;
CREATE TABLE `product_reviews` (
  `id` char(36) NOT NULL,
  `product_id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `rating` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `customer_name` varchar(255) DEFAULT NULL,
  `review_date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `product_reviews_product_id_idx` (`product_id`),
  KEY `product_reviews_approved_idx` (`product_id`,`is_active`),
  KEY `product_reviews_rating_idx` (`rating`),
  CONSTRAINT `fk_product_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- ----------------------------
-- Table structure for `menu_items_i18n`
-- ----------------------------
DROP TABLE IF EXISTS `menu_items_i18n`;
CREATE TABLE `menu_items_i18n` (
  `id` char(36) NOT NULL,
  `menu_item_id` char(36) NOT NULL,
  `locale` varchar(10) NOT NULL,
  `title` varchar(100) NOT NULL,
  `url` varchar(500) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_menu_items_i18n_item_locale` (`menu_item_id`,`locale`),
  KEY `menu_items_i18n_locale_idx` (`locale`),
  KEY `menu_items_i18n_title_idx` (`title`),
  CONSTRAINT `fk_menu_items_i18n_item` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `menu_items_i18n`
-- ----------------------------
INSERT INTO `menu_items_i18n` (`id`, `menu_item_id`, `locale`, `title`, `url`, `created_at`, `updated_at`) VALUES 
('24c49639-01d0-4274-8fb9-c31ed64d0727', '24c49639-01d0-4274-8fb9-c31ed64d0726', 'tr', 'Kullanım Koşulları', '/kullanim-kosullari', '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
('3d325c92-d59e-4730-8301-5c9bcff463bd', '3d325c92-d59e-4730-8301-5c9bcff463bc', 'tr', 'KVKK', '/kvkk', '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
('3e32b68d-ae71-4d44-8770-95b8dfb03c36', '2e32b68d-ae71-4d44-8770-95b8dfb03c36', 'tr', 'Kampanyalar', '/kampanyalar', '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
('71c28444-7b6e-47ae-92be-f59206a1b821', '71c28444-7b6e-47ae-92be-f59206a1b820', 'tr', 'Gizlilik Politikası', '/gizlilik-politikasi', '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
('7a4f6b37-ed99-4d98-8c54-d658096aacde', '6a4f6b37-ed99-4d98-8c54-d658096aacde', 'tr', 'SSS', '/sss', '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
('9fa999a9-9e47-4a3c-9dac-6afba197d79d', '9fa999a9-9e47-4a3c-9dac-6afba197d79c', 'tr', 'İade ve Değişim', '/iade-degisim', '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
('a2570596-db46-4028-902c-d6fe2c9a8312', 'f2570596-db46-4028-902c-d6fe2c9a8312', 'tr', 'Ürünler', '/urunler', '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
('a47a1c3f-cea1-4780-9381-77336bc8ac59', 'c47a1c3f-cea1-4780-9381-77336bc8ac59', 'tr', 'Kategoriler', '/kategoriler', '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
('a55c6ddf-658b-4c0f-8a9e-0b104708dd07', '455c6ddf-658b-4c0f-8a9e-0b104708dd07', 'tr', 'İletişim', '/iletisim', '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
('a5740da6-c0f2-4c1d-b131-998018699bfd', '25740da6-c0f2-4c1d-b131-998018699bfd', 'tr', 'Hakkımızda', '/hakkimizda', '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
('ae8120b3-919a-49b8-8035-df6fd2a2433f', 'fe8120b3-919a-49b8-8035-df6fd2a2433f', 'tr', 'Anasayfa', '/', '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
('aeed431a-aafb-4aba-bf1f-6217b3960c01', 'ceed431a-aafb-4aba-bf1f-6217b3960c01', 'tr', 'Blog', '/blog', '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
('d8ec7f51-384f-400a-9ac6-3a179cb89088', 'd8ec7f51-384f-400a-9ac6-3a179cb89087', 'tr', 'Ödeme Yöntemleri', '/odeme-yontemleri', '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
('f1573cc3-5392-448b-89eb-d0e02e947c6e', 'f1573cc3-5392-448b-89eb-d0e02e947c6d', 'tr', 'Nasıl Sipariş Verilir?', '/nasil-siparis-verilir', '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000');


-- ----------------------------
-- Table structure for `slider`
-- ----------------------------
DROP TABLE IF EXISTS `slider`;
CREATE TABLE `slider` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `locale` varchar(8) NOT NULL DEFAULT 'tr',
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` text DEFAULT NULL,
  `image_asset_id` char(36) DEFAULT NULL,
  `alt` varchar(255) DEFAULT NULL,
  `button_text` varchar(100) DEFAULT NULL,
  `button_link` varchar(255) DEFAULT NULL,
  `featured` tinyint(1) unsigned NOT NULL DEFAULT 0,
  `is_active` tinyint(1) unsigned NOT NULL DEFAULT 1,
  `display_order` int(10) unsigned NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_slider_slug_locale` (`slug`,`locale`),
  UNIQUE KEY `uniq_slider_uuid` (`uuid`),
  KEY `idx_slider_active` (`is_active`),
  KEY `idx_slider_order` (`display_order`),
  KEY `idx_slider_image_asset` (`image_asset_id`),
  KEY `idx_slider_locale` (`locale`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `slider`
-- ----------------------------
INSERT INTO `slider` (`id`, `uuid`, `locale`, `name`, `slug`, `description`, `image_url`, `image_asset_id`, `alt`, `button_text`, `button_link`, `featured`, `is_active`, `display_order`, `created_at`, `updated_at`) VALUES 
(1, 'dbbc832a-ccc8-11f0-93f3-e66132d9aac8', 'tr', 'Endüstriyel Su Soğutma Kulelerinde Uzman Çözüm Ortağınız', 'endustriyel-su-sogutma-kulelerinde-uzman-cozum-ortaginiz', 'Enerji santralleri, endüstriyel tesisler ve ticari binalar için yüksek verimli su soğutma kulesi çözümleri sunuyoruz.', 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1200&h=600&fit=crop', NULL, 'Endüstriyel su soğutma kulesi çözümleri', 'Teklif Al', 'iletisim', 1, 1, 1, '2024-01-20 00:00:00.000', '2024-01-20 00:00:00.000'),
(2, 'dbbc8663-ccc8-11f0-93f3-e66132d9aac8', 'tr', 'Açık ve Kapalı Devre Su Soğutma Kuleleri', 'acik-ve-kapali-devre-su-sogutma-kuleleri', 'FRP, galvanizli çelik ve betonarme gövdeli su soğutma kuleleri ile prosesinize en uygun çözümü tasarlıyoruz.', 'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&h=600&q=80', NULL, 'Açık / kapalı devre su soğutma kuleleri', 'Çözümleri İncele', 'cozumler/su-sogutma-kulesi', 0, 1, 2, '2024-01-21 00:00:00.000', '2024-01-21 00:00:00.000'),
(3, 'dbbc87cb-ccc8-11f0-93f3-e66132d9aac8', 'tr', 'Keşif, Projelendirme ve Anahtar Teslim Montaj', 'kesif-projelendirme-ve-anahtar-teslim-montaj', 'Saha keşfi, ısı yükü hesapları, mekanik tasarım ve devreye alma süreçlerinin tamamını Ensotek mühendisliği ile yönetiyoruz.', 'https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=1200&h=600&fit=crop', NULL, 'Su soğutma kulesi keşif ve projelendirme', 'Keşif Talep Et', 'hizmetler/kesif-projelendirme', 0, 1, 3, '2024-01-22 00:00:00.000', '2024-01-22 00:00:00.000'),
(4, 'dbbc88b5-ccc8-11f0-93f3-e66132d9aac8', 'tr', 'Periyodik Bakım ve Revizyon Hizmetleri', 'periyodik-bakim-ve-revizyon-hizmetleri', 'Mevcut su soğutma kuleleriniz için nozül, dolgu, fan ve mekanik aksam yenileme ile kapasite ve verimlilik iyileştirmeleri sağlıyoruz.', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=600&fit=crop', NULL, 'Su soğutma kulesi bakım ve revizyon hizmetleri', 'Bakım Planla', 'hizmetler/bakim-revizyon', 0, 1, 4, '2024-01-23 00:00:00.000', '2024-01-23 00:00:00.000'),
(5, 'dbbc897e-ccc8-11f0-93f3-e66132d9aac8', 'tr', 'Otomasyon, SCADA ve Uzaktan İzleme Çözümleri', 'otomasyon-scada-ve-uzaktan-izleme-cozumleri', 'Su soğutma kulelerinizi enerji tüketimi, debi, sıcaklık ve arıza durumlarına göre gerçek zamanlı izleyebileceğiniz otomasyon altyapısı kuruyoruz.', 'https://images.unsplash.com/photo-1582719478250-cc70d3d45ba1?w=1200&h=600&fit=crop', NULL, 'Su soğutma kulesi otomasyon ve SCADA çözümleri', 'Detaylı Bilgi Al', 'hizmetler/otomasyon-scada', 0, 1, 5, '2024-01-24 00:00:00.000', '2024-01-24 00:00:00.000');


-- ----------------------------
-- Table structure for `faqs_i18n`
-- ----------------------------
DROP TABLE IF EXISTS `faqs_i18n`;
CREATE TABLE `faqs_i18n` (
  `id` char(36) NOT NULL,
  `faq_id` char(36) NOT NULL,
  `locale` varchar(10) NOT NULL,
  `question` varchar(500) NOT NULL,
  `answer` longtext NOT NULL,
  `slug` varchar(255) NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_faqs_i18n_parent_locale` (`faq_id`,`locale`),
  UNIQUE KEY `ux_faqs_i18n_locale_slug` (`locale`,`slug`),
  KEY `faqs_i18n_locale_idx` (`locale`),
  KEY `faqs_i18n_slug_idx` (`slug`),
  KEY `faqs_i18n_category_idx` (`category`),
  CONSTRAINT `fk_faqs_i18n_faq` FOREIGN KEY (`faq_id`) REFERENCES `faqs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `faqs_i18n`
-- ----------------------------
INSERT INTO `faqs_i18n` (`id`, `faq_id`, `locale`, `question`, `answer`, `slug`, `category`, `created_at`, `updated_at`) VALUES 
('aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'tr', 'Ürünler ne kadar sürede teslim edilir?', 'Ödemeniz onaylandıktan sonra ürününüz otomatik olarak anında e-posta adresinize ve üye panelinize teslim edilir. Ortalama teslimat süresi 1-2 dakikadır.', 'urunler-ne-kadar-surede-teslim-edilir', 'Teslimat', '2024-01-01 00:00:00.000', '2025-11-29 02:43:56.455'),
('bbbb2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'tr', 'Hangi ödeme yöntemlerini kabul ediyorsunuz?', 'Kredi kartı, banka havalesi, Papara, PayTR, Shopier ve kripto para (Coinbase Commerce) ile ödeme yapabilirsiniz. Tüm ödemeler SSL sertifikası ile güvence altındadır.', 'hangi-odeme-yontemlerini-kabul-ediyorsunuz', 'Ödeme', '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
('cccc3333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'tr', 'Ürün çalışmazsa ne olur?', 'Satın aldığınız ürün çalışmaz veya hatalı ise 7 gün içinde destek ekibimizle iletişime geçerek değişim veya iade talebinde bulunabilirsiniz. Tüm ürünlerimiz garanti kapsamındadır.', 'urun-calismazsa-ne-olur', 'İade & Garanti', '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
('dddd4444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'tr', 'Toplu alımlarda indirim var mı?', 'Evet! 5+ ürün alımlarında %5, 10+ ürün alımlarında %10 indirim otomatik olarak uygulanır. Daha fazla bilgi için müşteri hizmetlerimizle iletişime geçebilirsiniz.', 'toplu-alimlarda-indirim-var-mi', 'İndirim & Kampanya', '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
('eeee5555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'tr', 'Lisanslar kaç cihazda kullanılabilir?', 'Her ürünün kullanım koşulları farklıdır. Ürün detay sayfasında lisans türü ve kaç cihazda kullanılabileceği belirtilmiştir. Tek kullanımlık, çoklu kullanım ve süreli lisanslar mevcuttur.', 'lisanslar-kac-cihazda-kullanilabilir', 'Lisans', '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
('ffff6666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666', 'tr', 'Müşteri desteği nasıl alırım?', '7/24 canlı destek, e-posta, WhatsApp ve Telegram üzerinden bizimle iletişime geçebilirsiniz. Üye panelinizden destek talebi oluşturabilir veya SSS bölümünü inceleyebilirsiniz.', 'musteri-destegi-nasil-alirim', 'Destek', '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000');


-- ----------------------------
-- Table structure for `categories`
-- ----------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` char(36) NOT NULL,
  `locale` varchar(8) NOT NULL DEFAULT 'tr',
  `module_key` varchar(64) NOT NULL DEFAULT 'general',
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` longtext DEFAULT NULL,
  `storage_asset_id` char(36) DEFAULT NULL,
  `alt` varchar(255) DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_slug_locale_module_uq` (`slug`,`locale`,`module_key`),
  KEY `categories_active_idx` (`is_active`),
  KEY `categories_order_idx` (`display_order`),
  KEY `categories_storage_asset_idx` (`storage_asset_id`),
  KEY `categories_locale_idx` (`locale`),
  KEY `categories_module_idx` (`module_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `categories`
-- ----------------------------
INSERT INTO `categories` (`id`, `locale`, `module_key`, `name`, `slug`, `description`, `image_url`, `storage_asset_id`, `alt`, `icon`, `is_active`, `is_featured`, `display_order`, `created_at`, `updated_at`) VALUES 
('aaaa0001-1111-4111-8111-aaaaaaaa0001', 'tr', 'product', 'MEZAR MODELLERİ', 'mezar-modelleri', NULL, NULL, NULL, NULL, NULL, 1, 0, 10, '2025-11-29 02:12:26.451', '2025-11-29 02:12:26.451'),
('aaaa0002-1111-4111-8111-aaaaaaaa0002', 'tr', 'product', 'MEZAR BAŞ TAŞI MODELLERİ', 'mezar-bas-tasi-modelleri', NULL, NULL, NULL, NULL, NULL, 1, 0, 20, '2025-11-29 02:12:26.451', '2025-11-29 02:12:26.451'),
('aaaa0003-1111-4111-8111-aaaaaaaa0003', 'tr', 'product', 'MEZAR AKSESUARLARI', 'mezar-aksesuarlari', NULL, NULL, NULL, NULL, NULL, 1, 0, 30, '2025-11-29 02:12:26.451', '2025-11-29 02:12:26.451'),
('aaaa0004-1111-4111-8111-aaaaaaaa0004', 'tr', 'product', 'MEZAR ÇİÇEKLENDİRME', 'mezar-ciceklendirme', NULL, NULL, NULL, NULL, NULL, 1, 0, 40, '2025-11-29 02:12:26.451', '2025-11-29 02:12:26.451'),
('aaaa0005-1111-4111-8111-aaaaaaaa0005', 'tr', 'product', 'MEZAR TOPRAK DOLUMU', 'mezar-toprak-dolumu', NULL, NULL, NULL, NULL, NULL, 1, 0, 50, '2025-11-29 02:12:26.451', '2025-11-29 02:12:26.451'),
('aaaa1001-1111-4111-8111-aaaaaaaa1001', 'tr', 'sparepart', 'YEDEK PARÇA KATEGORİLERİ', 'yedek-parca-kategorileri', NULL, NULL, NULL, NULL, NULL, 1, 0, 10, '2025-11-29 02:12:26.451', '2025-11-29 02:12:26.451'),
('aaaa2001-1111-4111-8111-aaaaaaaa2001', 'tr', 'news', 'GENEL HABERLER', 'genel-haberler', NULL, NULL, NULL, NULL, NULL, 1, 0, 10, '2025-11-29 02:12:26.451', '2025-11-29 02:12:26.451'),
('aaaa2002-1111-4111-8111-aaaaaaaa2002', 'tr', 'news', 'ŞİRKET HABERLERİ', 'sirket-haberleri', NULL, NULL, NULL, NULL, NULL, 1, 0, 20, '2025-11-29 02:12:26.451', '2025-11-29 02:12:26.451'),
('aaaa2003-1111-4111-8111-aaaaaaaa2003', 'tr', 'news', 'DUYURULAR', 'duyurular', NULL, NULL, NULL, NULL, NULL, 1, 0, 30, '2025-11-29 02:12:26.451', '2025-11-29 02:12:26.451'),
('aaaa2004-1111-4111-8111-aaaaaaaa2004', 'tr', 'news', 'BASINDA BİZ', 'basinda-biz', NULL, NULL, NULL, NULL, NULL, 1, 0, 40, '2025-11-29 02:12:26.451', '2025-11-29 02:12:26.451'),
('aaaa3001-1111-4111-8111-aaaaaaaa3001', 'tr', 'blog', 'GENEL BLOG YAZILARI', 'genel-blog-yazilari', NULL, NULL, NULL, NULL, NULL, 1, 0, 10, '2025-11-29 02:12:26.451', '2025-11-29 02:12:26.451'),
('aaaa3002-1111-4111-8111-aaaaaaaa3002', 'tr', 'blog', 'TEKNİK YAZILAR', 'teknik-yazilar', NULL, NULL, NULL, NULL, NULL, 1, 0, 20, '2025-11-29 02:12:26.451', '2025-11-29 02:12:26.451'),
('aaaa3003-1111-4111-8111-aaaaaaaa3003', 'tr', 'blog', 'SEKTÖREL YAZILAR', 'sektorel-yazilar', NULL, NULL, NULL, NULL, NULL, 1, 0, 30, '2025-11-29 02:12:26.451', '2025-11-29 02:12:26.451'),
('aaaa3004-1111-4111-8111-aaaaaaaa3004', 'tr', 'blog', 'GENEL YAZILAR', 'genel-yazilar', NULL, NULL, NULL, NULL, NULL, 1, 0, 40, '2025-11-29 02:12:26.451', '2025-11-29 02:12:26.451'),
('aaaa4001-1111-4111-8111-aaaaaaaa4001', 'tr', 'slider', 'ANA SLIDER', 'ana-slider', NULL, NULL, NULL, NULL, NULL, 1, 0, 10, '2025-11-29 02:12:26.451', '2025-11-29 02:12:26.451'),
('aaaa5001-1111-4111-8111-aaaaaaaa5001', 'tr', 'references', 'REFERANSLAR', 'referanslar', NULL, NULL, NULL, NULL, NULL, 1, 0, 10, '2025-11-29 02:12:26.451', '2025-11-29 02:12:26.451'),
('aaaa6001-1111-4111-8111-aaaaaaaa6001', 'tr', 'library', 'DÖKÜMAN KÜTÜPHANESİ', 'dokuman-kutuphanesi', NULL, NULL, NULL, NULL, NULL, 1, 0, 10, '2025-11-29 02:12:26.451', '2025-11-29 02:12:26.451'),
('aaaa7001-1111-4111-8111-aaaaaaaa7001', 'tr', 'about', 'KURUMSAL', 'kurumsal', NULL, NULL, NULL, NULL, NULL, 1, 0, 10, '2025-11-29 02:12:26.451', '2025-11-29 02:12:26.451'),
('aaaa7002-1111-4111-8111-aaaaaaaa7002', 'tr', 'about', 'HAKKIMIZDA', 'hakkimizda', NULL, NULL, NULL, NULL, NULL, 1, 0, 20, '2025-11-29 02:12:26.451', '2025-11-29 02:12:26.451'),
('aaaa7003-1111-4111-8111-aaaaaaaa7003', 'tr', 'about', 'MİSYONUMUZ', 'misyonumuz', NULL, NULL, NULL, NULL, NULL, 1, 0, 30, '2025-11-29 02:12:26.451', '2025-11-29 02:12:26.451'),
('aaaa7004-1111-4111-8111-aaaaaaaa7004', 'tr', 'about', 'VİZYONUMUZ', 'vizyonumuz', NULL, NULL, NULL, NULL, NULL, 1, 0, 40, '2025-11-29 02:12:26.451', '2025-11-29 02:12:26.451'),
('aaaa8001-1111-4111-8111-aaaaaaaa8001', 'tr', 'services', 'HİZMETLER', 'hizmetler', NULL, NULL, NULL, NULL, NULL, 1, 0, 10, '2025-11-29 02:12:26.451', '2025-11-29 02:12:26.451');


-- ----------------------------
-- Table structure for `newsletter_subscribers`
-- ----------------------------
DROP TABLE IF EXISTS `newsletter_subscribers`;
CREATE TABLE `newsletter_subscribers` (
  `id` char(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `locale` varchar(10) DEFAULT NULL,
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '{}' CHECK (json_valid(`meta`)),
  `unsubscribed_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_newsletter_email` (`email`),
  KEY `newsletter_verified_idx` (`is_verified`),
  KEY `newsletter_locale_idx` (`locale`),
  KEY `newsletter_unsub_idx` (`unsubscribed_at`),
  KEY `newsletter_created_idx` (`created_at`),
  KEY `newsletter_updated_idx` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `newsletter_subscribers`
-- ----------------------------
INSERT INTO `newsletter_subscribers` (`id`, `email`, `is_verified`, `locale`, `meta`, `unsubscribed_at`, `created_at`, `updated_at`) VALUES 
('dbaee5ed-ccc8-11f0-93f3-e66132d9aac8', 'demo.tr.user@example.com', 1, 'tr', '{\"source\": \"seed\", \"tags\": [\"campaign\", \"welcome\"], \"note\": \"Örnek TR abonesi\"}', NULL, '2025-01-05 10:00:00.000', '2025-01-05 10:00:00.000'),
('dbaeeeb1-ccc8-11f0-93f3-e66132d9aac8', 'demo.en.user@example.com', 1, 'en', '{\"source\": \"seed\", \"tags\": [\"newsletter\"], \"note\": \"Verification pending\"}', NULL, '2025-01-06 11:30:00.000', '2025-11-29 03:19:38.889'),
('dbaef2ff-ccc8-11f0-93f3-e66132d9aac8', 'demo.de.user@example.com', 1, 'de', '{\"source\": \"seed\", \"tags\": [\"unsubscribed\"], \"note\": \"Kullanıcı bülten aboneliğini iptal etti\"}', NULL, '2025-01-03 09:00:00.000', '2025-11-29 03:19:09.392');


-- ----------------------------
-- Table structure for `services_i18n`
-- ----------------------------
DROP TABLE IF EXISTS `services_i18n`;
CREATE TABLE `services_i18n` (
  `id` char(36) NOT NULL,
  `service_id` char(36) NOT NULL,
  `locale` varchar(10) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `material` varchar(255) DEFAULT NULL,
  `price` varchar(128) DEFAULT NULL,
  `includes` varchar(255) DEFAULT NULL,
  `warranty` varchar(128) DEFAULT NULL,
  `image_alt` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_services_i18n_parent_locale` (`service_id`,`locale`),
  UNIQUE KEY `ux_services_locale_slug` (`locale`,`slug`),
  KEY `services_i18n_slug_idx` (`slug`),
  KEY `services_i18n_name_idx` (`name`),
  KEY `services_i18n_created_idx` (`created_at`),
  KEY `services_i18n_updated_idx` (`updated_at`),
  CONSTRAINT `fk_services_i18n_parent` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `services_i18n`
-- ----------------------------
INSERT INTO `services_i18n` (`id`, `service_id`, `locale`, `slug`, `name`, `description`, `material`, `price`, `includes`, `warranty`, `image_alt`, `created_at`, `updated_at`) VALUES 
('dab03d73-ccc8-11f0-93f3-e66132d9aac8', 'daaf232a-ccc8-11f0-93f3-e66132d9aac8', 'tr', 'mevsimlik-cicek-ekimi', 'Mevsimlik Çiçek Ekimi', 'Mezar alanınıza mevsimlik çiçek ekimi ve düzenli bakım hizmeti', 'Mevsim Çiçekleri', 'Fiyat İçin Arayınız', 'Çiçek + Toprak + Ekim + Bakım', 'Çiçek Sağlığı Garantisi', 'Mevsimlik çiçek ekimi', '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
('dab1ca42-ccc8-11f0-93f3-e66132d9aac8', 'dab12bd3-ccc8-11f0-93f3-e66132d9aac8', 'tr', 'standart-toprak-doldurumu', 'Standart Toprak Doldurumu', 'Mezar alanının temel toprak doldurumu ve düzeltme işlemi', 'Kaliteli Bahçe Toprağı', 'Fiyat İçin Arayınız', 'Toprak + Nakliye + İşçilik + Düzeltme', '6 Ay Çöküntü Garantisi', 'Standart toprak doldurumu', '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
('dab46055-ccc8-11f0-93f3-e66132d9aac8', 'daaf232a-ccc8-11f0-93f3-e66132d9aac8', 'en', 'mevsimlik-cicek-ekimi', 'Mevsimlik Çiçek Ekimi', 'Mezar alanınıza mevsimlik çiçek ekimi ve düzenli bakım hizmeti', 'Mevsim Çiçekleri', 'Fiyat İçin Arayınız', 'Çiçek + Toprak + Ekim + Bakım', 'Çiçek Sağlığı Garantisi', 'Mevsimlik çiçek ekimi', '2025-11-29 02:12:27.830', '2025-11-29 02:12:27.830'),
('dab46832-ccc8-11f0-93f3-e66132d9aac8', 'dab12bd3-ccc8-11f0-93f3-e66132d9aac8', 'en', 'standart-toprak-doldurumu', 'Standart Toprak Doldurumu', 'Mezar alanının temel toprak doldurumu ve düzeltme işlemi', 'Kaliteli Bahçe Toprağı', 'Fiyat İçin Arayınız', 'Toprak + Nakliye + İşçilik + Düzeltme', '6 Ay Çöküntü Garantisi', 'Standart toprak doldurumu', '2025-11-29 02:12:27.830', '2025-11-29 02:12:27.830');


-- ----------------------------
-- Table structure for `user_roles`
-- ----------------------------
DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `role` enum('admin','moderator','user') NOT NULL DEFAULT 'user',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_roles_user_id_role_unique` (`user_id`,`role`),
  KEY `user_roles_user_id_idx` (`user_id`),
  KEY `user_roles_role_idx` (`role`),
  KEY `user_roles_user_id_created_at_idx` (`user_id`,`created_at`),
  CONSTRAINT `fk_user_roles_user_id_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `user_roles`
-- ----------------------------
INSERT INTO `user_roles` (`id`, `user_id`, `role`, `created_at`) VALUES 
('d9a6f722-ccc8-11f0-93f3-e66132d9aac8', '4f618a8d-6fdb-498c-898a-395d368b2193', 'admin', '2025-11-29 02:12:26.074');


-- ----------------------------
-- Table structure for `footer_sections`
-- ----------------------------
DROP TABLE IF EXISTS `footer_sections`;
CREATE TABLE `footer_sections` (
  `id` char(36) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `footer_sections_active_idx` (`is_active`),
  KEY `footer_sections_order_idx` (`display_order`),
  KEY `footer_sections_created_idx` (`created_at`),
  KEY `footer_sections_updated_idx` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `footer_sections`
-- ----------------------------
INSERT INTO `footer_sections` (`id`, `is_active`, `display_order`, `created_at`, `updated_at`) VALUES 
('59583ef1-0ba1-4c7c-b806-84fd204b52b9', 1, 0, '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
('f942a930-6743-4ecc-b4b3-1fd6b77f9d77', 1, 1, '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000');


-- ----------------------------
-- Table structure for `product_specs`
-- ----------------------------
DROP TABLE IF EXISTS `product_specs`;
CREATE TABLE `product_specs` (
  `id` char(36) NOT NULL,
  `product_id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `value` text NOT NULL,
  `category` enum('physical','material','service','custom') NOT NULL DEFAULT 'custom',
  `order_num` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `product_specs_product_id_idx` (`product_id`),
  CONSTRAINT `fk_product_specs_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- ----------------------------
-- Table structure for `library_i18n`
-- ----------------------------
DROP TABLE IF EXISTS `library_i18n`;
CREATE TABLE `library_i18n` (
  `id` char(36) NOT NULL,
  `library_id` char(36) NOT NULL,
  `locale` varchar(10) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `summary` longtext DEFAULT NULL,
  `content` longtext NOT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` varchar(500) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_library_i18n_parent_locale` (`library_id`,`locale`),
  UNIQUE KEY `ux_library_i18n_locale_slug` (`locale`,`slug`),
  KEY `library_i18n_locale_idx` (`locale`),
  KEY `library_i18n_slug_idx` (`slug`),
  CONSTRAINT `fk_library_i18n_parent` FOREIGN KEY (`library_id`) REFERENCES `library` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `library_i18n`
-- ----------------------------
INSERT INTO `library_i18n` (`id`, `library_id`, `locale`, `title`, `slug`, `summary`, `content`, `meta_title`, `meta_description`, `created_at`, `updated_at`) VALUES 
('daf6d468-ccc8-11f0-93f3-e66132d9aac8', 'dae65cd4-ccc8-11f0-93f3-e66132d9aac8', 'tr', 'Kurumsal Tanıtım Broşürü', 'kurumsal-brosur', 'Ajansın sunduğu hizmetleri ve referansları özetleyen PDF broşür.', '{\"html\": \"<p>Ajansımızın hizmetlerini, süreçlerini ve öne çıkan projelerini içeren kurumsal tanıtım broşürüdür.</p>\"}', 'Kurumsal Tanıtım Broşürü', 'Ajans ve hizmet tanıtımını içeren kurumsal PDF broşür.', '2025-11-29 02:12:28.274', '2025-11-29 02:12:28.274'),
('daf8cbfd-ccc8-11f0-93f3-e66132d9aac8', 'dae71e62-ccc8-11f0-93f3-e66132d9aac8', 'tr', 'Hizmet Rehberi', 'hizmet-rehberi', 'Ajansın sunduğu dijital ve kreatif hizmetlerin kısa özeti.', '{\"html\": \"<p>Tasarım, yazılım geliştirme, e-ticaret, performans optimizasyonu ve danışmanlık hizmetlerini içeren kapsamlı hizmet rehberi.</p>\"}', 'Hizmet Rehberi', 'Dijital ajans hizmetlerini anlatan PDF rehber.', '2025-11-29 02:12:28.287', '2025-11-29 02:12:28.287'),
('dafa20c7-ccc8-11f0-93f3-e66132d9aac8', 'dae65cd4-ccc8-11f0-93f3-e66132d9aac8', 'en', 'Company Brochure', 'company-brochure', 'PDF brochure that summarizes our agency, services and selected projects.', '{\"html\": \"<p>This company brochure presents our digital services, workflow and selected case studies in English.</p>\"}', 'Company Brochure', 'Corporate PDF brochure about our agency and services.', '2025-11-29 02:12:28.296', '2025-11-29 02:12:28.296'),
('dafb8e4d-ccc8-11f0-93f3-e66132d9aac8', 'dae71e62-ccc8-11f0-93f3-e66132d9aac8', 'en', 'Service Guide', 'service-guide', 'PDF guide that describes our main digital and creative services.', '{\"html\": \"<p>A compact guide that explains our design, development, e-commerce and consulting services in English.</p>\"}', 'Service Guide', 'PDF guide that presents our digital services.', '2025-11-29 02:12:28.305', '2025-11-29 02:12:28.305');


-- ----------------------------
-- Table structure for `storage_assets_i18n`
-- ----------------------------
DROP TABLE IF EXISTS `storage_assets_i18n`;
CREATE TABLE `storage_assets_i18n` (
  `id` char(36) NOT NULL,
  `asset_id` char(36) NOT NULL,
  `locale` varchar(10) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `alt` varchar(255) DEFAULT NULL,
  `caption` varchar(1000) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_storage_assets_i18n_parent_locale` (`asset_id`,`locale`),
  KEY `idx_storage_assets_i18n_locale` (`locale`),
  CONSTRAINT `fk_storage_assets_i18n_asset` FOREIGN KEY (`asset_id`) REFERENCES `storage_assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `storage_assets_i18n`
-- ----------------------------
INSERT INTO `storage_assets_i18n` (`id`, `asset_id`, `locale`, `title`, `alt`, `caption`, `description`, `created_at`, `updated_at`) VALUES 
('d9f1f753-ccc8-11f0-93f3-e66132d9aac8', 'd9eaf21c-ccc8-11f0-93f3-e66132d9aac8', 'tr', 'Hero', 'Hero', 'Featured image', NULL, '2025-11-29 02:12:26.565', '2025-11-29 02:12:26.565'),
('d9f2f875-ccc8-11f0-93f3-e66132d9aac8', 'd9eb20a7-ccc8-11f0-93f3-e66132d9aac8', 'tr', 'Ref1', 'Ref1', 'Featured image', NULL, '2025-11-29 02:12:26.572', '2025-11-29 02:12:26.572'),
('d9f3fd41-ccc8-11f0-93f3-e66132d9aac8', 'd9eb50d2-ccc8-11f0-93f3-e66132d9aac8', 'tr', 'Ref2', 'Ref2', 'Featured image', NULL, '2025-11-29 02:12:26.579', '2025-11-29 02:12:26.579'),
('d9f41f16-ccc8-11f0-93f3-e66132d9aac8', 'd9eb8892-ccc8-11f0-93f3-e66132d9aac8', 'tr', 'Galeri1A', 'Galeri 1A', 'Gallery image', NULL, '2025-11-29 02:12:26.580', '2025-11-29 02:12:26.580'),
('d9f44686-ccc8-11f0-93f3-e66132d9aac8', 'd9ebc2e3-ccc8-11f0-93f3-e66132d9aac8', 'tr', 'Galeri1B', 'Galeri 1B', 'Gallery image', NULL, '2025-11-29 02:12:26.581', '2025-11-29 02:12:26.581'),
('d9f46589-ccc8-11f0-93f3-e66132d9aac8', 'd9ec19da-ccc8-11f0-93f3-e66132d9aac8', 'tr', 'Galeri2A', 'Galeri 2A', 'Gallery image', NULL, '2025-11-29 02:12:26.581', '2025-11-29 02:12:26.581'),
('d9f48472-ccc8-11f0-93f3-e66132d9aac8', 'd9eaf21c-ccc8-11f0-93f3-e66132d9aac8', 'en', 'Hero', 'Hero', 'Featured image', NULL, '2025-11-29 02:12:26.582', '2025-11-29 02:12:26.582'),
('d9f49e43-ccc8-11f0-93f3-e66132d9aac8', 'd9eb20a7-ccc8-11f0-93f3-e66132d9aac8', 'en', 'Ref1', 'Ref1', 'Featured image', NULL, '2025-11-29 02:12:26.583', '2025-11-29 02:12:26.583'),
('d9f4d26b-ccc8-11f0-93f3-e66132d9aac8', 'd9eb50d2-ccc8-11f0-93f3-e66132d9aac8', 'en', 'Ref2', 'Ref2', 'Featured image', NULL, '2025-11-29 02:12:26.584', '2025-11-29 02:12:26.584'),
('d9f4f4f0-ccc8-11f0-93f3-e66132d9aac8', 'd9eb8892-ccc8-11f0-93f3-e66132d9aac8', 'en', 'Gallery1A', 'Gallery 1A', 'Gallery image', NULL, '2025-11-29 02:12:26.585', '2025-11-29 02:12:26.585'),
('d9f5eec1-ccc8-11f0-93f3-e66132d9aac8', 'd9ebc2e3-ccc8-11f0-93f3-e66132d9aac8', 'en', 'Gallery1B', 'Gallery 1B', 'Gallery image', NULL, '2025-11-29 02:12:26.591', '2025-11-29 02:12:26.591'),
('d9f6eaa6-ccc8-11f0-93f3-e66132d9aac8', 'd9ec19da-ccc8-11f0-93f3-e66132d9aac8', 'en', 'Gallery2A', 'Gallery 2A', 'Gallery image', NULL, '2025-11-29 02:12:26.598', '2025-11-29 02:12:26.598');


-- ----------------------------
-- Table structure for `service_images`
-- ----------------------------
DROP TABLE IF EXISTS `service_images`;
CREATE TABLE `service_images` (
  `id` char(36) NOT NULL,
  `service_id` char(36) NOT NULL,
  `image_asset_id` char(36) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `service_images_service_idx` (`service_id`),
  KEY `service_images_active_idx` (`is_active`),
  KEY `service_images_order_idx` (`display_order`),
  KEY `service_images_asset_idx` (`image_asset_id`),
  CONSTRAINT `fk_service_images_asset` FOREIGN KEY (`image_asset_id`) REFERENCES `storage_assets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_service_images_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `service_images`
-- ----------------------------
INSERT INTO `service_images` (`id`, `service_id`, `image_asset_id`, `image_url`, `is_active`, `display_order`, `created_at`, `updated_at`) VALUES 
('dab7ef91-ccc8-11f0-93f3-e66132d9aac8', 'daaf232a-ccc8-11f0-93f3-e66132d9aac8', NULL, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop', 1, 1, '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
('daba101e-ccc8-11f0-93f3-e66132d9aac8', 'dab12bd3-ccc8-11f0-93f3-e66132d9aac8', NULL, 'https://images.unsplash.com/photo-1589929460218-da4ba5fce3f5?w=800&h=600&fit=crop', 1, 1, '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000');


-- ----------------------------
-- Table structure for `notifications`
-- ----------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user_id` (`user_id`),
  KEY `idx_notifications_user_read` (`user_id`,`is_read`),
  KEY `idx_notifications_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `notifications`
-- ----------------------------
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`) VALUES 
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'Hoş geldiniz!', 'Hesabınız başarıyla oluşturuldu. İyi alışverişler!', 'system', 0, '2025-11-29 02:12:28.021'),
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'İlk sipariş fırsatı', 'İlk siparişinizde ekstra indirim kazandınız. Sepette kupon kullanmayı unutmayın.', 'custom', 0, '2025-11-29 02:12:28.021');


-- ----------------------------
-- Table structure for `ticket_replies`
-- ----------------------------
DROP TABLE IF EXISTS `ticket_replies`;
CREATE TABLE `ticket_replies` (
  `id` char(36) NOT NULL,
  `ticket_id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `message` longtext NOT NULL,
  `is_admin` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `idx_ticket_replies_ticket` (`ticket_id`),
  KEY `idx_ticket_replies_created` (`created_at`),
  CONSTRAINT `fk_ticket_replies_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `ticket_replies`
-- ----------------------------
INSERT INTO `ticket_replies` (`id`, `ticket_id`, `user_id`, `message`, `is_admin`, `created_at`) VALUES 
('002c708b-40e6-4ed2-ba57-baf9820d288a', '22c8d700-a5b8-4395-b1ce-1aba42495add', '7129bc31-88dc-42da-ab80-415a21f2ea9a', 'rtertertert', 1, '2025-10-13 15:35:26.000'),
('11edb28f-f448-470f-bbf8-f41ed95d1299', 'abebedb2-eefb-4d8f-a3bc-bb7e5b96a8aa', '7129bc31-88dc-42da-ab80-415a21f2ea9a', 'annen baban varmıdır', 1, '2025-10-13 15:31:17.000'),
('1a24fbf0-7ead-4658-91b9-501ed2af8f3e', 'ded743a6-7618-430c-bffb-e4db49dc6247', '7129bc31-88dc-42da-ab80-415a21f2ea9a', 'qwe', 1, '2025-10-15 14:54:40.000'),
('2415fa5f-bb16-4579-b4a4-a9f81d1b3f96', '951808b7-632b-4f6f-b2ff-a55f06ad19f9', '7129bc31-88dc-42da-ab80-415a21f2ea9a', 'sdfsdfsdf', 1, '2025-10-13 15:18:52.000'),
('50ba596c-a42d-4d93-a200-511746c13aad', 'f20fa9f8-5d93-463a-bf7b-60449fa5dfa4', '7129bc31-88dc-42da-ab80-415a21f2ea9a', 'asd', 1, '2025-10-15 14:51:05.000'),
('52ca9e72-cc03-4e04-a395-4ea697b9109e', 'a2f05a24-ac0b-4b59-a322-9864cc5e5364', '7129bc31-88dc-42da-ab80-415a21f2ea9a', 'Halledildi.', 1, '2025-10-13 12:55:25.000'),
('6145dfcb-dd55-4161-8cb4-e93e36ec56d5', 'df786c2d-5668-4688-88ad-952a3eebc812', '7129bc31-88dc-42da-ab80-415a21f2ea9a', 'mjhhjkj', 1, '2025-10-13 15:25:57.000'),
('68b76c1f-b1bc-47e2-b0ea-b76d674a7bea', 'eb07b91d-d727-40a0-9dcd-55321578d0ab', '7129bc31-88dc-42da-ab80-415a21f2ea9a', 'Buyrun.', 1, '2025-10-14 08:09:21.000'),
('7b7e644e-32bf-4e54-9dc5-55c1c1a6a65a', 'a894ffcf-28cb-4609-9021-b381e559a5f2', '7129bc31-88dc-42da-ab80-415a21f2ea9a', 'gdfgdfgdfgdfgdfg', 1, '2025-10-13 15:37:32.000'),
('84734c73-861c-42aa-baaf-6b1c47aa57c6', 'ded743a6-7618-430c-bffb-e4db49dc6247', '7129bc31-88dc-42da-ab80-415a21f2ea9a', 'qweqwe', 1, '2025-10-15 14:54:20.000'),
('8bb03576-8794-43b3-b5ca-adcf79b2a8b9', '8f83c5b7-5cbb-4d7e-8262-2b89c5415e6d', '7129bc31-88dc-42da-ab80-415a21f2ea9a', 'asdasd', 0, '2025-10-15 14:22:17.000'),
('8cb9e080-2331-453f-8e1d-0079e59d1e97', 'c742d0ad-3f07-466b-ac1e-2cf34b84941a', '7129bc31-88dc-42da-ab80-415a21f2ea9a', 'asd', 1, '2025-10-15 14:44:06.000'),
('8cfe1c53-2e05-44f2-8fe0-cdc44d8e6ef9', 'a2f05a24-ac0b-4b59-a322-9864cc5e5364', '0ac37a5c-a8be-4d25-b853-1e5c9574c1b3', 'tamamdır\n', 0, '2025-10-13 12:55:34.000'),
('94a8863b-c5fe-4823-8bc2-dd984c10fa62', '1b483b05-a8e0-48bd-8233-792863d26973', '7129bc31-88dc-42da-ab80-415a21f2ea9a', 'dfgdfgdfg', 1, '2025-10-13 16:01:03.000'),
('96d44802-14f4-4faf-9125-113b19f4ab8c', '534148b8-7462-422e-93d7-430cc2fdf6a1', '7129bc31-88dc-42da-ab80-415a21f2ea9a', 'sadsad', 1, '2025-10-13 15:39:16.000'),
('a014e062-fa53-4dba-b69a-c839c0d11ddf', 'ded743a6-7618-430c-bffb-e4db49dc6247', '4a8fb7f7-0668-4429-9309-fe88ac90eed2', 'qwe', 0, '2025-10-15 14:54:31.000'),
('b8867640-7014-4bb3-be17-37d4a41805c6', 'dff55daa-ff67-401e-ba81-9513e2fbb164', '7129bc31-88dc-42da-ab80-415a21f2ea9a', '45', 0, '2025-10-06 22:33:36.000'),
('cdc4b674-9360-46ec-9158-7ec7ce047e59', 'dff55daa-ff67-401e-ba81-9513e2fbb164', '7129bc31-88dc-42da-ab80-415a21f2ea9a', '545', 1, '2025-10-06 22:33:22.000'),
('e76247c0-95dc-4295-8661-3d6b901e4950', '22c8d700-a5b8-4395-b1ce-1aba42495add', '7129bc31-88dc-42da-ab80-415a21f2ea9a', 'rdgdfgdfgdfgdfgdfgdfgdfg', 1, '2025-10-13 15:33:27.000'),
('ff93ce04-575c-4c7a-9cbd-b7aec9b9c88b', '8f83c5b7-5cbb-4d7e-8262-2b89c5415e6d', '7129bc31-88dc-42da-ab80-415a21f2ea9a', 'asd', 1, '2025-10-15 14:23:24.000');


-- ----------------------------
-- Table structure for `products`
-- ----------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` char(36) NOT NULL,
  `locale` varchar(8) NOT NULL DEFAULT 'tr',
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL,
  `category_id` char(36) NOT NULL,
  `sub_category_id` char(36) DEFAULT NULL,
  `image_url` longtext DEFAULT NULL,
  `storage_asset_id` char(36) DEFAULT NULL,
  `alt` varchar(255) DEFAULT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT json_array() CHECK (json_valid(`images`)),
  `storage_image_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT json_array() CHECK (json_valid(`storage_image_ids`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT json_array() CHECK (json_valid(`tags`)),
  `specifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`specifications`)),
  `product_code` varchar(64) DEFAULT NULL,
  `stock_quantity` int(11) NOT NULL DEFAULT 0,
  `rating` decimal(3,2) NOT NULL DEFAULT 5.00,
  `review_count` int(11) NOT NULL DEFAULT 0,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` varchar(500) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_locale_slug_uq` (`locale`,`slug`),
  UNIQUE KEY `products_code_uq` (`product_code`),
  KEY `products_category_id_idx` (`category_id`),
  KEY `products_sub_category_id_idx` (`sub_category_id`),
  KEY `products_locale_idx` (`locale`),
  KEY `products_active_idx` (`is_active`),
  KEY `products_asset_idx` (`storage_asset_id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_products_subcategory` FOREIGN KEY (`sub_category_id`) REFERENCES `sub_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- ----------------------------
-- Table structure for `library_images_i18n`
-- ----------------------------
DROP TABLE IF EXISTS `library_images_i18n`;
CREATE TABLE `library_images_i18n` (
  `id` char(36) NOT NULL,
  `image_id` char(36) NOT NULL,
  `locale` varchar(10) NOT NULL,
  `alt` varchar(255) DEFAULT NULL,
  `caption` varchar(1000) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_library_images_i18n_parent_locale` (`image_id`,`locale`),
  KEY `library_images_i18n_locale_idx` (`locale`),
  CONSTRAINT `fk_library_images_i18n_parent` FOREIGN KEY (`image_id`) REFERENCES `library_images` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- ----------------------------
-- Table structure for `profiles`
-- ----------------------------
DROP TABLE IF EXISTS `profiles`;
CREATE TABLE `profiles` (
  `id` char(36) NOT NULL,
  `full_name` text DEFAULT NULL,
  `phone` varchar(64) DEFAULT NULL,
  `avatar_url` text DEFAULT NULL,
  `address_line1` varchar(255) DEFAULT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(128) DEFAULT NULL,
  `country` varchar(128) DEFAULT NULL,
  `postal_code` varchar(32) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_profiles_id_users_id` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `profiles`
-- ----------------------------
INSERT INTO `profiles` (`id`, `full_name`, `phone`, `avatar_url`, `address_line1`, `address_line2`, `city`, `country`, `postal_code`, `created_at`, `updated_at`) VALUES 
('19a2bc26-63d1-43ad-ab56-d7f3c3719a34', 'Nuri Muh', '05414417854', NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-29 02:12:26.007', '2025-11-29 02:12:26.007'),
('4f618a8d-6fdb-498c-898a-395d368b2193', 'Orhan Güzel', '+905551112233', NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-29 02:12:26.026', '2025-11-29 02:12:26.026');


-- ----------------------------
-- Table structure for `reference_images`
-- ----------------------------
DROP TABLE IF EXISTS `reference_images`;
CREATE TABLE `reference_images` (
  `id` char(36) NOT NULL,
  `reference_id` char(36) NOT NULL,
  `asset_id` char(36) NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `reference_images_reference_idx` (`reference_id`),
  KEY `reference_images_asset_idx` (`asset_id`),
  KEY `reference_images_active_idx` (`is_active`),
  KEY `reference_images_order_idx` (`display_order`),
  CONSTRAINT `fk_reference_images_parent` FOREIGN KEY (`reference_id`) REFERENCES `references` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `reference_images`
-- ----------------------------
INSERT INTO `reference_images` (`id`, `reference_id`, `asset_id`, `image_url`, `display_order`, `is_active`, `created_at`, `updated_at`) VALUES 
('da2191e4-ccc8-11f0-93f3-e66132d9aac8', 'da0e6c14-ccc8-11f0-93f3-e66132d9aac8', 'd9eb8892-ccc8-11f0-93f3-e66132d9aac8', NULL, 1, 1, '2025-11-29 02:12:26.878', '2025-11-29 02:12:26.878'),
('da22a624-ccc8-11f0-93f3-e66132d9aac8', 'da0e6c14-ccc8-11f0-93f3-e66132d9aac8', 'd9ebc2e3-ccc8-11f0-93f3-e66132d9aac8', NULL, 2, 1, '2025-11-29 02:12:26.885', '2025-11-29 02:12:26.885'),
('da23b751-ccc8-11f0-93f3-e66132d9aac8', 'da0f1f31-ccc8-11f0-93f3-e66132d9aac8', 'd9ec19da-ccc8-11f0-93f3-e66132d9aac8', NULL, 1, 1, '2025-11-29 02:12:26.892', '2025-11-29 02:12:26.892');


-- ----------------------------
-- Table structure for `email_templates_i18n`
-- ----------------------------
DROP TABLE IF EXISTS `email_templates_i18n`;
CREATE TABLE `email_templates_i18n` (
  `id` char(36) NOT NULL,
  `template_id` char(36) NOT NULL,
  `locale` varchar(10) NOT NULL,
  `template_name` varchar(150) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_email_tpl_key_locale` (`template_id`,`locale`),
  KEY `ix_email_tpl_i18n_locale` (`locale`),
  KEY `ix_email_tpl_i18n_name` (`template_name`),
  CONSTRAINT `fk_email_tpl_i18n_template` FOREIGN KEY (`template_id`) REFERENCES `email_templates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `email_templates_i18n`
-- ----------------------------
INSERT INTO `email_templates_i18n` (`id`, `template_id`, `locale`, `template_name`, `subject`, `content`, `created_at`, `updated_at`) VALUES 
('21112222-3333-4444-5555-666677778888', '11112222-3333-4444-5555-666677778888', 'tr', 'Contact Admin Notification', 'Yeni İletişim Mesajı - {{subject}}', '<div style=\"font-family:system-ui,-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif;font-size:14px;line-height:1.5;color:#111827;\">\n  <h1 style=\"font-size:18px;margin-bottom:12px;\">Yeni iletişim formu mesajı</h1>\n  <p><strong>Ad Soyad:</strong> {{name}}</p>\n  <p><strong>E-posta:</strong> {{email}}</p>\n  <p><strong>Telefon:</strong> {{phone}}</p>\n  <p><strong>Konu:</strong> {{subject}}</p>\n  {{#if ip}}<p><strong>IP:</strong> {{ip}}</p>{{/if}}\n  {{#if user_agent}}<p><strong>User-Agent:</strong> {{user_agent}}</p>{{/if}}\n  <hr style=\"margin:16px 0;border:none;border-top:1px solid #e5e7eb;\" />\n  <p><strong>Mesaj:</strong></p>\n  <pre style=\"white-space:pre-wrap;word-break:break-word;background:#f9fafb;padding:12px;border-radius:8px;border:1px solid #e5e7eb;\">{{message}}</pre>\n</div>', '2025-10-09 19:38:58.000', '2025-10-09 19:38:58.000'),
('647e8ec8-2746-4bb8-9be3-3db4d186697d', '547e8ec8-2746-4bb8-9be3-3db4d186697d', 'tr', 'Order Completed', 'Siparişiniz Tamamlandı - {{site_name}}', '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">\n    <h1 style=\"color: #10b981; text-align: center;\">✓ Siparişiniz Tamamlandı</h1>\n    <p style=\"color: #666; font-size: 16px;\">Merhaba <strong>{{customer_name}}</strong>,</p>\n    <p style=\"color: #666; font-size: 16px;\">Siparişiniz başarıyla tamamlandı ve ürünleriniz teslim edildi.</p>\n    <div style=\"background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;\">\n      <p style=\"margin: 0 0 10px 0; color: #666;\"><strong>Sipariş No:</strong> {{order_number}}</p>\n      <p style=\"margin: 0; color: #666;\"><strong>Toplam Tutar:</strong> {{final_amount}} TL</p>\n    </div>\n    <p style=\"color: #666; font-size: 16px;\">Ürünlerinizi hesabınızdan görüntüleyebilirsiniz.</p>\n    <p style=\"color: #666; font-size: 16px;\">Deneyiminizi paylaşmak isterseniz değerlendirme yapabilirsiniz.</p>\n    <p style=\"color: #666; font-size: 16px;\">Saygılarımızla,<br>{{site_name}} Ekibi</p>\n  </div>', '2025-10-09 19:38:58.000', '2025-10-09 19:38:58.000'),
('7290e3d9-d5b8-4423-aab2-1cbc85bee59b', '4290e3d9-d5b8-4423-aab2-1cbc85bee59b', 'tr', 'Ticket Replied', 'Destek Talebiniz Yanıtlandı - {{site_name}}', '<h1 class=\"ql-align-center\">Destek Talebiniz Yanıtlandı</h1><p>Merhaba <strong>{{user_name}}</strong>,</p><p>Destek talebiniz yanıtlandı.</p><p><br></p><p>Detayları görüntülemek için kullanıcı paneline giriş yapabilirsiniz.</p><p>Saygılarımızla,</p><p>{{site_name}} Ekibi</p>', '2025-10-09 19:38:58.000', '2025-10-13 20:28:47.000'),
('7adeb7c9-e07b-4a36-9e49-460cd626cf8c', '5adeb7c9-e07b-4a36-9e49-460cd626cf8c', 'tr', 'Order Received', 'Siparişiniz Alındı - {{site_name}}', '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">\n    <h1 style=\"color: #333; text-align: center;\">Siparişiniz Alındı</h1>\n    <p style=\"color: #666; font-size: 16px;\">Merhaba <strong>{{customer_name}}</strong>,</p>\n    <p style=\"color: #666; font-size: 16px;\">Siparişiniz başarıyla alındı ve işleme alındı.</p>\n    <div style=\"background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;\">\n      <p style=\"margin: 0 0 10px 0; color: #666;\"><strong>Sipariş No:</strong> {{order_number}}</p>\n      <p style=\"margin: 0 0 10px 0; color: #666;\"><strong>Toplam Tutar:</strong> {{final_amount}} TL</p>\n      <p style=\"margin: 0; color: #666;\"><strong>Durum:</strong> {{status}}</p>\n    </div>\n    <p style=\"color: #666; font-size: 16px;\">Siparişinizin durumunu hesabınızdan takip edebilirsiniz.</p>\n    <p style=\"color: #666; font-size: 16px;\">Saygılarımızla,<br>{{site_name}} Ekibi</p>\n  </div>', '2025-10-09 19:38:58.000', '2025-10-09 19:38:58.000'),
('8f85350b-c082-4677-bd9f-ad1e7d9bd038', '4f85350b-c082-4677-bd9f-ad1e7d9bd038', 'tr', 'Order Item Delivery', 'Ürününüz Teslim Edildi - {{product_name}}', '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">\n  <h1 style=\"color: #10b981; text-align: center;\">✓ Ürününüz Teslim Edildi</h1>\n  <p style=\"color: #666; font-size: 16px;\">Merhaba <strong>{{customer_name}}</strong>,</p>\n  <p style=\"color: #666; font-size: 16px;\">Siparişinize ait ürününüz teslim edilmiştir.</p>\n  \n  <div style=\"background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;\">\n    <p style=\"margin: 0 0 10px 0; color: #666;\"><strong>Sipariş No:</strong> {{order_number}}</p>\n    <p style=\"margin: 0 0 10px 0; color: #666;\"><strong>Ürün:</strong> {{product_name}}</p>\n  </div>\n  \n  <div style=\"background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;\">\n    <h3 style=\"margin-top: 0; color: #10b981;\">Teslimat Bilgileri:</h3>\n    <pre style=\"background: white; padding: 15px; border-radius: 5px; color: #333; white-space: pre-wrap; word-wrap: break-word;\">{{delivery_content}}</pre>\n  </div>\n  \n  <p style=\"color: #666; font-size: 14px; margin-top: 20px;\">\n    <strong>Not:</strong> Bu bilgileri güvenli bir şekilde saklayınız. Hesabınızdan tüm siparişlerinizi görüntüleyebilirsiniz.\n  </p>\n  \n  <p style=\"color: #666; font-size: 16px;\">Saygılarımızla,<br>{{site_name}} Ekibi</p>\n</div>', '2025-10-16 08:13:25.000', '2025-10-16 08:13:25.000'),
('99990000-bbbb-cccc-dddd-eeeeffff0000', '99990000-aaaa-bbbb-cccc-ddddeeee0000', 'tr', 'Contact User Autoreply', 'Mesajınızı Aldık - {{subject}}', '<div style=\"font-family:system-ui,-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif;font-size:14px;line-height:1.5;color:#111827;\">\n  <h1 style=\"font-size:18px;margin-bottom:12px;\">Mesajınızı Aldık</h1>\n  <p>Merhaba <strong>{{name}}</strong>,</p>\n  <p>İletişim formu üzerinden göndermiş olduğunuz mesaj bize ulaştı.</p>\n  <p>En kısa süre içinde size dönüş yapacağız.</p>\n  <p>İyi günler dileriz.</p>\n</div>', '2025-10-09 19:38:58.000', '2025-10-09 19:38:58.000'),
('d0bb0c00-1a2b-4c5d-9e8f-554433221100', 'c0bb0c00-1a2b-4c5d-9e8f-001122334455', 'tr', 'Password Changed', 'Şifreniz Güncellendi - {{site_name}}', '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">\n    <h1 style=\"font-size:20px; text-align:center;\">Şifreniz Güncellendi</h1>\n    <p>Merhaba <strong>{{user_name}}</strong>,</p>\n    <p>Hesap şifreniz başarıyla değiştirildi.</p>\n    <p>Eğer bu işlemi siz yapmadıysanız lütfen en kısa sürede bizimle iletişime geçin.</p>\n    <p>Saygılarımızla,</p>\n    <p>{{site_name}} Ekibi</p>\n</div>', '2025-10-09 19:38:58.000', '2025-10-09 19:38:58.000'),
('ed5ecc0c-ab34-499a-8103-7a435472794a', 'dd5ecc0c-ab34-499a-8103-7a435472794a', 'tr', 'Order Cancelled', 'Sipariş İptali - {{site_name}}', '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">\n    <h1 style=\"color: #ef4444; text-align: center;\">Siparişiniz İptal Edildi</h1>\n    <p style=\"color: #666; font-size: 16px;\">Merhaba <strong>{{customer_name}}</strong>,</p>\n    <p style=\"color: #666; font-size: 16px;\">Siparişiniz iptal edildi.</p>\n    <div style=\"background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;\">\n      <p style=\"margin: 0 0 10px 0; color: #666;\"><strong>Sipariş No:</strong> {{order_number}}</p>\n      <p style=\"margin: 0 0 10px 0; color: #666;\"><strong>Tutar:</strong> {{final_amount}} TL</p>\n      <p style=\"margin: 0; color: #666;\"><strong>İptal Nedeni:</strong> {{cancellation_reason}}</p>\n    </div>\n    <p style=\"color: #666; font-size: 16px;\">Ödemeniz varsa iade işlemi başlatılacaktır.</p>\n    <p style=\"color: #666; font-size: 16px;\">Sorularınız için bizimle iletişime geçebilirsiniz.</p>\n    <p style=\"color: #666; font-size: 16px;\">Saygılarımızla,<br>{{site_name}} Ekibi</p>\n  </div>', '2025-10-09 19:38:58.000', '2025-10-09 19:38:58.000'),
('f75ec05a-bac7-446a-ac2a-cfc7b7f2dd07', 'd75ec05a-bac7-446a-ac2a-cfc7b7f2dd07', 'tr', 'Deposit Success', 'Bakiye Yükleme Onaylandı - {{site_name}}', '<h1 class=\"ql-align-center\">✓ Bakiye Yükleme Başarılı</h1><p>Merhaba <strong>{{user_name}}</strong>,</p><p>Bakiye yükleme talebiniz onaylandı ve hesabınıza eklendi.</p><p><br></p><p><strong>Yüklenen Tutar:</strong> {{amount}} TL</p><p><strong>Yeni Bakiye:</strong> {{new_balance}} TL</p><p>Artık alışverişe başlayabilirsiniz!</p><p>Saygılarımızla,</p><p>{{site_name}} Ekibi</p>', '2025-10-09 19:38:58.000', '2025-10-09 19:49:38.000'),
('f7fae474-c1cf-4600-8466-2f915146cfb9', 'e7fae474-c1cf-4600-8466-2f915146cfb9', 'tr', 'Welcome', 'Hesabiniz Oluşturuldu - {{site_name}}', '<h1 class=\"ql-align-center\">Hesabınız Oluşturuldu</h1><p>Merhaba <strong>{{user_name}}</strong>,</p><p>{{site_name}} ailesine hoş geldiniz! Hesabınız başarıyla oluşturuldu.</p><p><br></p><p>E-posta: <strong>{{user_email}}</strong></p><p>Herhangi bir sorunuz olursa bizimle iletişime geçmekten çekinmeyin.</p><p>Saygılarımızla,</p><p>{{site_name}} Ekibi</p>', '2025-10-09 19:38:58.000', '2025-10-13 15:06:38.000'),
('fa91f94a-bfe1-46b7-83fc-b4152e27c65e', 'da91f94a-bfe1-46b7-83fc-b4152e27c65e', 'tr', 'Password Reset', 'Şifre Sıfırlama Talebi - {{site_name}}', '<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">\n    <h1 style=\"color: #333; text-align: center;\">Şifre Sıfırlama</h1>\n    <p style=\"color: #666; font-size: 16px;\">Merhaba,</p>\n    <p style=\"color: #666; font-size: 16px;\">Hesabınız için şifre sıfırlama talebi aldık.</p>\n    <div style=\"background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;\">\n      <a href=\"{{reset_link}}\" style=\"display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;\">Şifremi Sıfırla</a>\n    </div>\n    <p style=\"color: #666; font-size: 14px;\">Bu linkin geçerlilik süresi 1 saattir.</p>\n    <p style=\"color: #666; font-size: 14px;\">Bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>\n    <p style=\"color: #666; font-size: 16px;\">Saygılarımızla,<br>{{site_name}} Ekibi</p>\n  </div>', '2025-10-09 19:38:58.000', '2025-10-09 19:38:58.000');


-- ----------------------------
-- Table structure for `library_files`
-- ----------------------------
DROP TABLE IF EXISTS `library_files`;
CREATE TABLE `library_files` (
  `id` char(36) NOT NULL,
  `library_id` char(36) NOT NULL,
  `asset_id` char(36) NOT NULL,
  `file_url` varchar(500) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `size_bytes` int(11) DEFAULT NULL,
  `mime_type` varchar(255) DEFAULT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `library_files_library_idx` (`library_id`),
  KEY `library_files_asset_idx` (`asset_id`),
  KEY `library_files_active_idx` (`is_active`),
  KEY `library_files_order_idx` (`display_order`),
  CONSTRAINT `fk_library_files_asset` FOREIGN KEY (`asset_id`) REFERENCES `storage_assets` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_library_files_parent` FOREIGN KEY (`library_id`) REFERENCES `library` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- ----------------------------
-- Table structure for `review_i18n`
-- ----------------------------
DROP TABLE IF EXISTS `review_i18n`;
CREATE TABLE `review_i18n` (
  `id` char(36) NOT NULL,
  `review_id` char(36) NOT NULL,
  `locale` varchar(8) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `comment` text NOT NULL,
  `admin_reply` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_review_i18n_review_locale` (`review_id`,`locale`),
  KEY `review_i18n_review_idx` (`review_id`),
  KEY `review_i18n_locale_idx` (`locale`),
  CONSTRAINT `fk_review_i18n_review` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of `review_i18n`
-- ----------------------------
INSERT INTO `review_i18n` (`id`, `review_id`, `locale`, `title`, `comment`, `admin_reply`, `created_at`, `updated_at`) VALUES 
('da7c967a-ccc8-11f0-93f3-e66132d9aac8', '44440001-4444-4444-8444-444444440001', 'tr', 'Misyon metni çok net ve anlaşılır', 'Ensotek\'in misyon açıklaması, sektöre bakışını ve müşteri odaklı yaklaşımını çok net şekilde ortaya koyuyor.', NULL, '2025-11-29 02:12:27.472', '2025-11-29 02:12:27.472'),
('da7c9f04-ccc8-11f0-93f3-e66132d9aac8', '44440001-4444-4444-8444-444444440001', 'en', 'Clear and well-defined mission', 'The mission statement clearly reflects Ensotek\'s customer-oriented approach and position in the market.', 'Translated from the original Turkish review.', '2025-11-29 02:12:27.472', '2025-11-29 02:12:27.472'),
('da7ca7f5-ccc8-11f0-93f3-e66132d9aac8', '44440002-4444-4444-8444-444444440002', 'en', 'Strong customer-oriented mission', 'I really like how Ensotek puts customer satisfaction and efficiency at the center of its mission.', NULL, '2025-11-29 02:12:27.472', '2025-11-29 02:12:27.472'),
('da7cac69-ccc8-11f0-93f3-e66132d9aac8', '44440002-4444-4444-8444-444444440002', 'tr', 'Müşteri odaklı güçlü bir misyon', 'Ensotek\'in müşteri memnuniyeti ve verimliliği merkeze alan misyon yaklaşımını beğendim.', 'İngilizce yorumun Türkçe çevirisidir.', '2025-11-29 02:12:27.472', '2025-11-29 02:12:27.472'),
('da7cb12d-ccc8-11f0-93f3-e66132d9aac8', '44440003-4444-4444-8444-444444440003', 'tr', '40 yıllık deneyimi hissettiriyor', 'Hakkımızda sayfasındaki bilgiler, firmanın sektörde ne kadar köklü ve tecrübeli olduğunu çok iyi anlatıyor.', NULL, '2025-11-29 02:12:27.472', '2025-11-29 02:12:27.472'),
('da7cb534-ccc8-11f0-93f3-e66132d9aac8', '44440004-4444-4444-8444-444444440004', 'en', 'Impressive background', 'The about page gives a very clear picture of Ensotek\'s long-term experience and strong reference projects.', NULL, '2025-11-29 02:12:27.472', '2025-11-29 02:12:27.472'),
('da7cb8cf-ccc8-11f0-93f3-e66132d9aac8', '44440005-4444-4444-8444-444444440005', 'tr', 'Bakım rehberi çok faydalı', 'Periyodik bakım yazısı, sahadaki ekibimiz için kontrol listesi gibi kullanabileceğimiz pratik bilgiler içeriyor.', NULL, '2025-11-29 02:12:27.472', '2025-11-29 02:12:27.472');
