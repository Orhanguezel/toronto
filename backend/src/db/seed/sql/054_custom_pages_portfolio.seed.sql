-- =============================================================
-- FILE: 054_custom_pages_portfolio.seed.sql
-- Portfolio sayfaları (PORTFOLIO modülü) – custom_pages + custom_pages_i18n
-- 011_catalog_categories.sql & 012_catalog_subcategories.sql ile uyumlu
-- =============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

/* KATEGORİ ID’LERİ (PORTFOLIO) */
SET @CAT_PORTFOLIO_MAIN := 'aaaa5001-1111-4111-8111-aaaaaaaa5001'; -- Portfolio (root)

/* ALT KATEGORİLER (PORTFOLIO) */
SET @SUB_PORTFOLIO_INDIVIDUAL := 'bbbb5001-1111-4111-8111-bbbbbbbb5001'; -- Bireysel Portföy
SET @SUB_PORTFOLIO_CORPORATE  := 'bbbb5002-1111-4111-8111-bbbbbbbb5002'; -- Kurumsal Portföy

/* SABİT PAGE ID’LERİ (PORTFOLIO ITEMS) */
SET @PORTFOLIO_INDIV_1 := '44440001-4444-4444-8444-444444440001';
SET @PORTFOLIO_CORP_1  := '44440002-4444-4444-8444-444444440002';
SET @PORTFOLIO_CORP_2  := '44440003-4444-4444-8444-444444440003';

/* PARENT INSERT – custom_pages */
INSERT INTO `custom_pages`
  (`id`, `is_published`, `display_order`,
   `featured_image`, `featured_image_asset_id`,
   `category_id`, `sub_category_id`,
   `created_at`, `updated_at`)
VALUES
  (
    @PORTFOLIO_INDIV_1,
    1,
    101,
    NULL,
    NULL,
    @CAT_PORTFOLIO_MAIN,
    @SUB_PORTFOLIO_INDIVIDUAL,
    NOW(3),
    NOW(3)
  ),
  (
    @PORTFOLIO_CORP_1,
    1,
    102,
    NULL,
    NULL,
    @CAT_PORTFOLIO_MAIN,
    @SUB_PORTFOLIO_CORPORATE,
    NOW(3),
    NOW(3)
  ),
  (
    @PORTFOLIO_CORP_2,
    1,
    103,
    NULL,
    NULL,
    @CAT_PORTFOLIO_MAIN,
    @SUB_PORTFOLIO_CORPORATE,
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

/* I18N – PORTFOLIO_INDIV_1 (Bireysel Portföy / Individual Portfolio) */
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
  @PORTFOLIO_INDIV_1,
  'tr',
  'Bireysel Proje – Uygulama Özeti',
  'bireysel-proje-uygulama-ozeti',
  JSON_OBJECT(
    'html',
    '<p>Bu çalışma, sahada yapılan keşif sonrasında mevcut sistemin iyileştirilmesi ve performans artışı hedefiyle planlandı. Uygulama kapsamında kurulum/iyileştirme adımları tamamlanarak sistem verimi ve işletme sürekliliği güçlendirildi.</p>'
  ),
  'Bireysel portföy kapsamında tamamlanan uygulamaya ait kısa özet ve kazanımlar.',
  NULL,
  'Bireysel Proje | Portföy',
  'Bireysel portföy kapsamında tamamlanan uygulama çalışmasının kapsamı, yaklaşımı ve kazanımlarını özetleyen portföy sayfası.',
  'ensotek,portfolio,bireysel,uygulama,projeler,sogutma kuleleri',
  NOW(3),
  NOW(3)
),
-- EN
(
  UUID(),
  @PORTFOLIO_INDIV_1,
  'en',
  'Individual Project – Implementation Summary',
  'individual-project-implementation-summary',
  JSON_OBJECT(
    'html',
    '<p>This work was planned after an on-site survey, aiming to improve the existing system and increase performance. The implementation steps were completed to strengthen efficiency and operational continuity.</p>'
  ),
  'Short overview and outcomes of a completed implementation within the individual portfolio.',
  NULL,
  'Individual Project | Portfolio',
  'Portfolio page summarising scope, approach and outcomes of a completed implementation within the individual portfolio.',
  'ensotek,portfolio,individual,implementation,projects,cooling towers',
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

/* I18N – PORTFOLIO_CORP_1 (Kurumsal Portföy / Corporate Portfolio) */
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
  @PORTFOLIO_CORP_1,
  'tr',
  'Kurumsal Proje – Soğutma Kulesi Modernizasyonu',
  'kurumsal-proje-sogutma-kulesi-modernizasyonu',
  JSON_OBJECT(
    'html',
    '<p>Kurumsal tesis için yürütülen modernizasyon çalışmasında, sistemin mevcut durumu analiz edilerek verimlilik ve işletme güvenliği odaklı iyileştirmeler planlandı. Uygulama sonrası performans artışı ve bakım kolaylığı hedefleri desteklendi.</p>'
  ),
  'Kurumsal portföy kapsamında tamamlanan modernizasyon projesinin kapsam ve kazanımlarına ilişkin kısa özet.',
  NULL,
  'Kurumsal Proje Modernizasyonu | Portföy',
  'Kurumsal tesislerde yürütülen soğutma kulesi modernizasyon projelerine örnek bir uygulama ve elde edilen kazanımlar.',
  'ensotek,portfolio,kurumsal,modernizasyon,sogutma kulesi,verimlilik',
  NOW(3),
  NOW(3)
),
-- EN
(
  UUID(),
  @PORTFOLIO_CORP_1,
  'en',
  'Corporate Project – Cooling Tower Modernization',
  'corporate-project-cooling-tower-modernization',
  JSON_OBJECT(
    'html',
    '<p>In this modernization project for a corporate facility, the current system was analysed and improvements were planned with a focus on efficiency and operational safety. Post-implementation, performance gains and maintainability were supported.</p>'
  ),
  'Short summary of scope and outcomes of a modernization project within the corporate portfolio.',
  NULL,
  'Cooling Tower Modernization | Portfolio',
  'Example corporate cooling tower modernization project and the key outcomes achieved in terms of efficiency and reliability.',
  'ensotek,portfolio,corporate,modernization,cooling tower,efficiency',
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

/* I18N – PORTFOLIO_CORP_2 (Kurumsal Portföy / Corporate Portfolio #2) */
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
  @PORTFOLIO_CORP_2,
  'tr',
  'Kurumsal Proje – Bakım & Servis Uygulaması',
  'kurumsal-proje-bakim-servis-uygulamasi',
  JSON_OBJECT(
    'html',
    '<p>Periyodik bakım ve servis uygulaması kapsamında, kritik bileşen kontrolleri, temizlik ve gerekli ayar/iyileştirme adımları gerçekleştirildi. Amaç; süreklilik, arıza riskinin azaltılması ve sistem performansının korunmasıdır.</p>'
  ),
  'Kurumsal portföy kapsamında bakım ve servis uygulamasına ait kısa proje özeti.',
  NULL,
  'Kurumsal Bakım & Servis | Portföy',
  'Kurumsal tesislerde periyodik bakım ve servis uygulamalarına örnek portföy içeriği.',
  'ensotek,portfolio,kurumsal,bakim,servis,commissioning,maintenance',
  NOW(3),
  NOW(3)
),
-- EN
(
  UUID(),
  @PORTFOLIO_CORP_2,
  'en',
  'Corporate Project – Maintenance & Service Implementation',
  'corporate-project-maintenance-service-implementation',
  JSON_OBJECT(
    'html',
    '<p>Within the periodic maintenance and service scope, critical component checks, cleaning and required adjustment/improvement steps were carried out. The goal is operational continuity, reduced failure risk and preserved system performance.</p>'
  ),
  'Short project summary of a maintenance and service implementation within the corporate portfolio.',
  NULL,
  'Maintenance & Service | Portfolio',
  'Portfolio item example for periodic maintenance and service implementations in corporate facilities.',
  'ensotek,portfolio,corporate,maintenance,service,commissioning',
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
