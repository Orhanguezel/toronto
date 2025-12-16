-- =============================================================
-- 071_services_tr.sql  (Ensotek services – parent + TR i18n)
-- =============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

START TRANSACTION;

-- =========================================================
-- 1) Bakım ve Onarım / Maintenance & Repair
-- =========================================================

SET @SRV_MAINT_ID := (
  SELECT s.id
  FROM services s
  JOIN services_i18n i ON i.service_id = s.id AND i.locale = 'tr'
  WHERE i.slug = 'bakim-ve-onarim'
  LIMIT 1
);
SET @SRV_MAINT_ID := COALESCE(@SRV_MAINT_ID, UUID());

INSERT INTO `services`
(`id`,
 `type`,
 `category_id`, `sub_category_id`,
 `featured`, `is_active`, `display_order`,
 `featured_image`, `image_url`, `image_asset_id`,
 `created_at`, `updated_at`)
VALUES
(
  @SRV_MAINT_ID,
  'maintenance_repair',
  'aaaa8001-1111-4111-8111-aaaaaaaa8001', -- SERVICES category
  'bbbb8002-1111-4111-8111-bbbbbbbb8002', -- Bakım ve Onarım
  1, 1, 10,
  NULL, NULL, NULL,
  '2024-01-01 00:00:00.000',
  '2024-01-01 00:00:00.000'
)
ON DUPLICATE KEY UPDATE
 `type`            = VALUES(`type`),
 `category_id`     = VALUES(`category_id`),
 `sub_category_id` = VALUES(`sub_category_id`),
 `featured`        = VALUES(`featured`),
 `is_active`       = VALUES(`is_active`),
 `display_order`   = VALUES(`display_order`),
 `featured_image`  = VALUES(`featured_image`),
 `image_url`       = VALUES(`image_url`),
 `image_asset_id`  = VALUES(`image_asset_id`),
 `updated_at`      = VALUES(`updated_at`);

-- TR
INSERT INTO `services_i18n`
(`id`,`service_id`,`locale`,
 `slug`,`name`,
 `description`,`material`,`price`,
 `includes`,`warranty`,`image_alt`,
 `tags`,`meta_title`,`meta_description`,`meta_keywords`,
 `created_at`,`updated_at`)
VALUES
(
  UUID(),
  @SRV_MAINT_ID,
  'tr',
  'bakim-ve-onarim',
  'Bakım ve Onarım',
  'Mevcut soğutma kulelerinin verimliliğini ve sürekliliğini sağlamak için uçtan uca bakım ve onarım hizmetleri sunuyoruz. Ensotek, endüstriyel su soğutma kulelerinizin planlı duruşlara bağlı kalmadan, stabil ve güvenli şekilde çalışması için periyodik bakım programları, arıza tespit ve yerinde müdahale hizmetleri sağlar. Mekanik parçaların kontrolü, dolgu ve dağıtıcı temizliği, fan – motor – redüktör bakımı, korozyon kontrolleri ve performans ölçümleri gibi tüm adımlar standart prosedürlerimize göre kayıt altına alınır. Böylece hem beklenmeyen arızaların önüne geçer, hem de kule verimini ilk günkü seviyeye mümkün olduğunca yakın tutarız.',
  'FRP gövde, galvaniz çelik şase, PVC/PVDF dolgu, paslanmaz bağlantı elemanları',
  'Proje kapsamına ve kule kapasitesine göre tekliflendirilir',
  'Periyodik kontrol ve raporlama, mekanik bakım, temizlik ve kimyasal şartların kontrolü, kritik yedek parçaların değişimi',
  'İşçilik için 12 aya kadar, kullanılan yedek parçalar için üretici garantisi',
  'Endüstriyel soğutma kulesi bakım ve onarım hizmeti',
  'bakım, onarım, periyodik bakım, servis, endüstriyel soğutma kulesi',
  'Bakım ve Onarım | Ensotek',
  'Ensotek, endüstriyel su soğutma kuleleri için planlı bakım, arıza tespiti ve profesyonel onarım hizmetleri sunar. Periyodik bakım programları ile verim kaybını ve beklenmeyen duruşları en aza indirir.',
  'bakım ve onarım, soğutma kulesi bakımı, endüstriyel bakım hizmeti, periyodik bakım programı',
  '2024-01-01 00:00:00.000',
  '2024-01-01 00:00:00.000'
)
ON DUPLICATE KEY UPDATE
 `slug`             = VALUES(`slug`),
 `name`             = VALUES(`name`),
 `description`      = VALUES(`description`),
 `material`         = VALUES(`material`),
 `price`            = VALUES(`price`),
 `includes`         = VALUES(`includes`),
 `warranty`         = VALUES(`warranty`),
 `image_alt`        = VALUES(`image_alt`),
 `tags`             = VALUES(`tags`),
 `meta_title`       = VALUES(`meta_title`),
 `meta_description` = VALUES(`meta_description`),
 `meta_keywords`    = VALUES(`meta_keywords`),
 `updated_at`       = VALUES(`updated_at`);


-- =========================================================
-- 2) Modernizasyon / Modernization
-- =========================================================

SET @SRV_MOD_ID := (
  SELECT s.id
  FROM services s
  JOIN services_i18n i ON i.service_id = s.id AND i.locale = 'tr'
  WHERE i.slug = 'modernizasyon'
  LIMIT 1
);
SET @SRV_MOD_ID := COALESCE(@SRV_MOD_ID, UUID());

INSERT INTO `services`
(`id`,
 `type`,
 `category_id`, `sub_category_id`,
 `featured`, `is_active`, `display_order`,
 `featured_image`, `image_url`, `image_asset_id`,
 `created_at`, `updated_at`)
VALUES
(
  @SRV_MOD_ID,
  'modernization',
  'aaaa8001-1111-4111-8111-aaaaaaaa8001',
  'bbbb8003-1111-4111-8111-bbbbbbbb8003',
  1, 1, 20,
  NULL, NULL, NULL,
  '2024-01-01 00:00:00.000',
  '2024-01-01 00:00:00.000'
)
ON DUPLICATE KEY UPDATE
 `type`            = VALUES(`type`),
 `category_id`     = VALUES(`category_id`),
 `sub_category_id` = VALUES(`sub_category_id`),
 `featured`        = VALUES(`featured`),
 `is_active`       = VALUES(`is_active`),
 `display_order`   = VALUES(`display_order`),
 `featured_image`  = VALUES(`featured_image`),
 `image_url`       = VALUES(`image_url`),
 `image_asset_id`  = VALUES(`image_asset_id`),
 `updated_at`      = VALUES(`updated_at`);

-- TR
INSERT INTO `services_i18n`
(`id`,`service_id`,`locale`,
 `slug`,`name`,
 `description`,`material`,`price`,
 `includes`,`warranty`,`image_alt`,
 `tags`,`meta_title`,`meta_description`,`meta_keywords`,
 `created_at`,`updated_at`)
VALUES
(
  UUID(),
  @SRV_MOD_ID,
  'tr',
  'modernizasyon',
  'Modernizasyon',
  'Mevcut soğutma kulelerinizin enerji verimliliğini artırmak, işletme maliyetlerini düşürmek ve güncel standartlara uyum sağlamak için modernizasyon çözümleri sunuyoruz. Ensotek, eski teknoloji ile çalışan kuleleri; yeni nesil fan – motor kombinasyonları, yüksek verimli dolgu tipleri, gelişmiş su dağıtım sistemleri ve otomasyon entegrasyonları ile yenileyerek daha düşük enerji tüketimiyle aynı veya daha yüksek soğutma kapasitesine ulaşmanızı sağlar. Modernizasyon çalışmaları sayesinde yeni kule yatırımına gerek kalmadan, mevcut altyapınız üzerinde performans ve güvenlik iyileştirmeleri gerçekleştirilir.',
  'Yüksek verimli FRP gövde, enerji tasarruflu fan ve motorlar, yeni nesil PVC/PVDF dolgu tipleri',
  'Proje keşfi ve performans analizine göre tekliflendirilir',
  'Performans analizi, modernizasyon projelendirmesi, ekipman temini, montaj ve devreye alma, saha testleri',
  'Kullanılan ekipmanlara bağlı olarak 12–24 ay arası işçilik ve ekipman garantisi',
  'Modernize edilmiş endüstriyel soğutma kuleleri',
  'modernizasyon, enerji verimliliği, kule yenileme, retrofit, performans artırımı',
  'Modernizasyon | Ensotek',
  'Ensotek, mevcut su soğutma kulelerinin modernizasyonu için enerji verimliliği odaklı çözümler sunar. Fan, dolgu, dağıtım sistemi ve otomasyon modernizasyonları ile daha düşük enerji tüketimi ve daha yüksek performans elde edilir.',
  'soğutma kulesi modernizasyonu, retrofit, enerji tasarrufu, kule performans iyileştirme',
  '2024-01-01 00:00:00.000',
  '2024-01-01 00:00:00.000'
)
ON DUPLICATE KEY UPDATE
 `slug`             = VALUES(`slug`),
 `name`             = VALUES(`name`),
 `description`      = VALUES(`description`),
 `material`         = VALUES(`material`),
 `price`            = VALUES(`price`),
 `includes`         = VALUES(`includes`),
 `warranty`         = VALUES(`warranty`),
 `image_alt`        = VALUES(`image_alt`),
 `tags`             = VALUES(`tags`),
 `meta_title`       = VALUES(`meta_title`),
 `meta_description` = VALUES(`meta_description`),
 `meta_keywords`    = VALUES(`meta_keywords`),
 `updated_at`       = VALUES(`updated_at`);


-- =========================================================
-- 3) Yedek Parçalar ve Bileşenler / Spare Parts & Components
-- =========================================================

SET @SRV_SPARE_ID := (
  SELECT s.id
  FROM services s
  JOIN services_i18n i ON i.service_id = s.id AND i.locale = 'tr'
  WHERE i.slug = 'yedek-parcalar-ve-bilesenler'
  LIMIT 1
);
SET @SRV_SPARE_ID := COALESCE(@SRV_SPARE_ID, UUID());

INSERT INTO `services`
(`id`,
 `type`,
 `category_id`, `sub_category_id`,
 `featured`, `is_active`, `display_order`,
 `featured_image`, `image_url`, `image_asset_id`,
 `created_at`, `updated_at`)
VALUES
(
  @SRV_SPARE_ID,
  'spare_parts_components',
  'aaaa8001-1111-4111-8111-aaaaaaaa8001',
  'bbbb8004-1111-4111-8111-bbbbbbbb8004',
  1, 1, 30,
  NULL, NULL, NULL,
  '2024-01-01 00:00:00.000',
  '2024-01-01 00:00:00.000'
)
ON DUPLICATE KEY UPDATE
 `type`            = VALUES(`type`),
 `category_id`     = VALUES(`category_id`),
 `sub_category_id` = VALUES(`sub_category_id`),
 `featured`        = VALUES(`featured`),
 `is_active`       = VALUES(`is_active`),
 `display_order`   = VALUES(`display_order`),
 `featured_image`  = VALUES(`featured_image`),
 `image_url`       = VALUES(`image_url`),
 `image_asset_id`  = VALUES(`image_asset_id`),
 `updated_at`      = VALUES(`updated_at`);

-- TR
INSERT INTO `services_i18n`
(`id`,`service_id`,`locale`,
 `slug`,`name`,
 `description`,`material`,`price`,
 `includes`,`warranty`,`image_alt`,
 `tags`,`meta_title`,`meta_description`,`meta_keywords`,
 `created_at`,`updated_at`)
VALUES
(
  UUID(),
  @SRV_SPARE_ID,
  'tr',
  'yedek-parcalar-ve-bilesenler',
  'Yedek Parçalar ve Bileşenler',
  'Soğutma kulelerinizin duruş sürelerini en aza indirmek için, kritik bileşenlerden yapısal parçalara kadar geniş bir yedek parça portföyü sunuyoruz. Ensotek, fan, motor, redüktör, dolgu malzemeleri, su dağıtım nozulları, damla tutucular, su haznesi ekipmanları ve bağlantı elemanları dahil olmak üzere çok çeşitli yedek parça ve bileşeni stoktan veya kısa termin süreleri ile tedarik eder. Uygun parça seçimi için teknik ekibimiz; marka–model, çalışma şartları ve proses gereksinimlerinize göre en doğru çözümü önerir.',
  'FRP ve galvaniz şase parçaları, PVC/PVDF dolgu, damla tutucu, nozullar, fan – motor – redüktör bileşenleri',
  'Parça tipi ve adetlerine göre tekliflendirilir',
  'Teknik parça seçimi desteği, muadil/paralel ürün alternatifleri, hızlı tedarik, talep halinde yerinde montaj',
  'Ürün bazlı üretici garantileri geçerlidir; işçilik için ek garanti opsiyonu sunulabilir',
  'Soğutma kulesi yedek parça ve bileşenleri',
  'yedek parça, kule bileşenleri, fan, dolgu, damla tutucu, nozullar',
  'Yedek Parçalar ve Bileşenler | Ensotek',
  'Ensotek, soğutma kuleleri için fan, motor, dolgu, damla tutucu ve nozullar gibi kritik bileşenleri kapsayan geniş bir yedek parça portföyü sunar. Doğru parça seçimi ve hızlı tedarik ile duruş sürelerini azaltır.',
  'soğutma kulesi yedek parça, kule bileşenleri, endüstriyel yedek parça tedariki',
  '2024-01-01 00:00:00.000',
  '2024-01-01 00:00:00.000'
)
ON DUPLICATE KEY UPDATE
 `slug`             = VALUES(`slug`),
 `name`             = VALUES(`name`),
 `description`      = VALUES(`description`),
 `material`         = VALUES(`material`),
 `price`            = VALUES(`price`),
 `includes`         = VALUES(`includes`),
 `warranty`         = VALUES(`warranty`),
 `image_alt`        = VALUES(`image_alt`),
 `tags`             = VALUES(`tags`),
 `meta_title`       = VALUES(`meta_title`),
 `meta_description` = VALUES(`meta_description`),
 `meta_keywords`    = VALUES(`meta_keywords`),
 `updated_at`       = VALUES(`updated_at`);


-- =========================================================
-- 4) Uygulamalar ve Referanslar / Applications & References
-- =========================================================

SET @SRV_APPREF_ID := (
  SELECT s.id
  FROM services s
  JOIN services_i18n i ON i.service_id = s.id AND i.locale = 'tr'
  WHERE i.slug = 'uygulamalar-ve-referanslar'
  LIMIT 1
);
SET @SRV_APPREF_ID := COALESCE(@SRV_APPREF_ID, UUID());

INSERT INTO `services`
(`id`,
 `type`,
 `category_id`, `sub_category_id`,
 `featured`, `is_active`, `display_order`,
 `featured_image`, `image_url`, `image_asset_id`,
 `created_at`, `updated_at`)
VALUES
(
  @SRV_APPREF_ID,
  'applications_references',
  'aaaa8001-1111-4111-8111-aaaaaaaa8001',
  'bbbb8005-1111-4111-8111-bbbbbbbb8005',
  1, 1, 40,
  NULL, NULL, NULL,
  '2024-01-01 00:00:00.000',
  '2024-01-01 00:00:00.000'
)
ON DUPLICATE KEY UPDATE
 `type`            = VALUES(`type`),
 `category_id`     = VALUES(`category_id`),
 `sub_category_id` = VALUES(`sub_category_id`),
 `featured`        = VALUES(`featured`),
 `is_active`       = VALUES(`is_active`),
 `display_order`   = VALUES(`display_order`),
 `featured_image`  = VALUES(`featured_image`),
 `image_url`       = VALUES(`image_url`),
 `image_asset_id`  = VALUES(`image_asset_id`),
 `updated_at`      = VALUES(`updated_at`);

-- TR
INSERT INTO `services_i18n`
(`id`,`service_id`,`locale`,
 `slug`,`name`,
 `description`,`material`,`price`,
 `includes`,`warranty`,`image_alt`,
 `tags`,`meta_title`,`meta_description`,`meta_keywords`,
 `created_at`,`updated_at`)
VALUES
(
  UUID(),
  @SRV_APPREF_ID,
  'tr',
  'uygulamalar-ve-referanslar',
  'Uygulamalar ve Referanslar',
  'Ensotek, enerji, kimya, gıda, ilaç, otomotiv, çelik, HVAC ve proses suyu kullanılan pek çok sektörde su soğutma kuleleri ile çözüm üretmiş, birçok referans proje tamamlamıştır. Farklı kapasitelerde açık ve kapalı devre FRP soğutma kuleleri, deniz suyu uygulamaları, yüksek korozyon riski olan ortamlar ve sınırlı alanlı projeler için özelleştirilmiş tasarımlar geliştiriyoruz. Referanslarımız; uzun yıllar sorunsuz çalışan kuleler, düşük işletme maliyetleri ve sahada kanıtlanmış performans değerleri ile öne çıkar. Talep halinde sektöre özel referans listeleri ve örnek proje çıktıları paylaşılabilmektedir.',
  NULL,
  'Proje ve uygulama kapsamına göre değişir',
  'Sektör bazlı referans listeleri, örnek projeler, teknik çözüm önerileri, yerinde keşif ve danışmanlık',
  NULL,
  'Ensotek uygulama ve referans projeleri',
  'referans, uygulama, proje, enerji sektörü, proses suyu, endüstriyel soğutma',
  'Uygulamalar ve Referanslar | Ensotek',
  'Ensotek, enerji, kimya, gıda, ilaç, otomotiv ve birçok farklı sektörde FRP su soğutma kuleleri ile tamamlanmış referans projelere sahiptir. Sektöre özel çözümler, yüksek performans ve uzun ömürlü uygulamalar sunar.',
  'soğutma kulesi referansları, endüstriyel uygulamalar, sektörel projeler',
  '2024-01-01 00:00:00.000',
  '2024-01-01 00:00:00.000'
)
ON DUPLICATE KEY UPDATE
 `slug`             = VALUES(`slug`),
 `name`             = VALUES(`name`),
 `description`      = VALUES(`description`),
 `material`         = VALUES(`material`),
 `price`            = VALUES(`price`),
 `includes`         = VALUES(`includes`),
 `warranty`         = VALUES(`warranty`),
 `image_alt`        = VALUES(`image_alt`),
 `tags`             = VALUES(`tags`),
 `meta_title`       = VALUES(`meta_title`),
 `meta_description` = VALUES(`meta_description`),
 `meta_keywords`    = VALUES(`meta_keywords`),
 `updated_at`       = VALUES(`updated_at`);


-- =========================================================
-- 5) Mühendislik Desteği / Engineering Support
-- =========================================================

SET @SRV_ENGSUP_ID := (
  SELECT s.id
  FROM services s
  JOIN services_i18n i ON i.service_id = s.id AND i.locale = 'tr'
  WHERE i.slug = 'muhendislik-destegi'
  LIMIT 1
);
SET @SRV_ENGSUP_ID := COALESCE(@SRV_ENGSUP_ID, UUID());

INSERT INTO `services`
(`id`,
 `type`,
 `category_id`, `sub_category_id`,
 `featured`, `is_active`, `display_order`,
 `featured_image`, `image_url`, `image_asset_id`,
 `created_at`, `updated_at`)
VALUES
(
  @SRV_ENGSUP_ID,
  'engineering_support',
  'aaaa8001-1111-4111-8111-aaaaaaaa8001',
  'bbbb8006-1111-4111-8111-bbbbbbbb8006',
  1, 1, 50,
  NULL, NULL, NULL,
  '2024-01-01 00:00:00.000',
  '2024-01-01 00:00:00.000'
)
ON DUPLICATE KEY UPDATE
 `type`            = VALUES(`type`),
 `category_id`     = VALUES(`category_id`),
 `sub_category_id` = VALUES(`sub_category_id`),
 `featured`        = VALUES(`featured`),
 `is_active`       = VALUES(`is_active`),
 `display_order`   = VALUES(`display_order`),
 `featured_image`  = VALUES(`featured_image`),
 `image_url`       = VALUES(`image_url`),
 `image_asset_id`  = VALUES(`image_asset_id`),
 `updated_at`      = VALUES(`updated_at`);

-- TR
INSERT INTO `services_i18n`
(`id`,`service_id`,`locale`,
 `slug`,`name`,
 `description`,`material`,`price`,
 `includes`,`warranty`,`image_alt`,
 `tags`,`meta_title`,`meta_description`,`meta_keywords`,
 `created_at`,`updated_at`)
VALUES
(
  UUID(),
  @SRV_ENGSUP_ID,
  'tr',
  'muhendislik-destegi',
  'Mühendislik Desteği',
  'Ensotek, soğutma kuleleri alanında proje öncesinden işletmeye alma ve sonrası süreçlere kadar kapsamlı mühendislik desteği sağlar. Hidrolik ve termal hesapların yapılması, kule kapasite seçimi, proses gereksinimlerine göre doğru kule tipi ve malzeme kombinasyonunun belirlenmesi, yerleşim ve montaj planlaması gibi konularda uzman mühendis kadromuzla yanınızdayız. Ayrıca sahada performans ölçümleri, mevcut sistem analizleri, iyileştirme önerileri ve teknik eğitimler ile işletme ekibinizin sistemi daha güvenli ve verimli kullanmasına yardımcı oluruz.',
  NULL,
  'Mühendislik hizmeti kapsamına göre tekliflendirilir',
  'Ön proje çalışmaları, hidrolik/termal hesaplar, yerinde keşif, raporlama, saha toplantıları ve teknik eğitimler',
  NULL,
  'Mühendislik desteği hizmeti görsel açıklaması',
  'mühendislik desteği, proje, danışmanlık, kule seçimi, performans analizi',
  'Mühendislik Desteği | Ensotek',
  'Ensotek, soğutma kuleleri için hidrolik ve termal hesaplar, kule seçimi, proje danışmanlığı, performans analizi ve teknik eğitimleri kapsayan kapsamlı mühendislik desteği sunar.',
  'soğutma kulesi mühendislik desteği, proje danışmanlığı, performans analizi',
  '2024-01-01 00:00:00.000',
  '2024-01-01 00:00:00.000'
)
ON DUPLICATE KEY UPDATE
 `slug`             = VALUES(`slug`),
 `name`             = VALUES(`name`),
 `description`      = VALUES(`description`),
 `material`         = VALUES(`material`),
 `price`            = VALUES(`price`),
 `includes`         = VALUES(`includes`),
 `warranty`         = VALUES(`warranty`),
 `image_alt`        = VALUES(`image_alt`),
 `tags`             = VALUES(`tags`),
 `meta_title`       = VALUES(`meta_title`),
 `meta_description` = VALUES(`meta_description`),
 `meta_keywords`    = VALUES(`meta_keywords`),
 `updated_at`       = VALUES(`updated_at`);


-- =========================================================
-- 6) Üretim / Production
-- =========================================================

SET @SRV_PROD_ID := (
  SELECT s.id
  FROM services s
  JOIN services_i18n i ON i.service_id = s.id AND i.locale = 'tr'
  WHERE i.slug = 'uretim'
  LIMIT 1
);
SET @SRV_PROD_ID := COALESCE(@SRV_PROD_ID, UUID());

INSERT INTO `services`
(`id`,
 `type`,
 `category_id`, `sub_category_id`,
 `featured`, `is_active`, `display_order`,
 `featured_image`, `image_url`, `image_asset_id`,
 `created_at`, `updated_at`)
VALUES
(
  @SRV_PROD_ID,
  'production',
  'aaaa8001-1111-4111-8111-aaaaaaaa8001',
  'bbbb8001-1111-4111-8111-bbbbbbbb8001',
  1, 1, 60,
  NULL, NULL, NULL,
  '2024-01-01 00:00:00.000',
  '2024-01-01 00:00:00.000'
)
ON DUPLICATE KEY UPDATE
 `type`            = VALUES(`type`),
 `category_id`     = VALUES(`category_id`),
 `sub_category_id` = VALUES(`sub_category_id`),
 `featured`        = VALUES(`featured`),
 `is_active`       = VALUES(`is_active`),
 `display_order`   = VALUES(`display_order`),
 `featured_image`  = VALUES(`featured_image`),
 `image_url`       = VALUES(`image_url`),
 `image_asset_id`  = VALUES(`image_asset_id`),
 `updated_at`      = VALUES(`updated_at`);

-- TR
INSERT INTO `services_i18n`
(`id`,`service_id`,`locale`,
 `slug`,`name`,
 `description`,`material`,`price`,
 `includes`,`warranty`,`image_alt`,
 `tags`,`meta_title`,`meta_description`,`meta_keywords`,
 `created_at`,`updated_at`)
VALUES
(
  UUID(),
  @SRV_PROD_ID,
  'tr',
  'uretim',
  'Üretim',
  'Ensotek, açık ve kapalı devre FRP (cam elyaf takviyeli polyester) su soğutma kulelerinin tasarım ve üretiminde uzmanlaşmıştır. Üretim süreçlerimizde korozyona dayanıklı malzemeler, yüksek kaliteli reçineler ve uzun ömürlü metal aksamlar kullanılır. Standart tip kulelerin yanı sıra, proses gereksinimlerine ve saha koşullarına göre özel tasarım kuleler de geliştiriyoruz. Tasarımdan kalıp imalatına, mekanik montajdan kalite kontrollerine kadar tüm aşamalar, uluslararası standartlara uygun olarak dokümante edilir ve izlenir.',
  'FRP gövde panelleri, galvaniz çelik konstrüksiyon, paslanmaz bağlantı elemanları, PVC/PVDF dolgu ve damla tutucular',
  'Kule tipi, kapasite ve opsiyonlara göre proje bazlı fiyatlandırılır',
  'Standart veya özel tasarım kule üretimi, fabrika montajı, sevkiyat öncesi testler, sahada montaj ve devreye alma',
  'Kule gövdesi için uzun ömürlü malzeme garantisi, ekipmanlar için üretici garantileri geçerlidir',
  'Endüstriyel FRP su soğutma kulesi üretimi',
  'üretim, FRP soğutma kulesi, endüstriyel kule imalatı, açık devre, kapalı devre',
  'Üretim | Ensotek',
  'Ensotek, açık ve kapalı devre FRP su soğutma kulelerinin tasarım ve üretiminde uzmanlaşmış bir üreticidir. Korozyona dayanıklı malzemeler ve yüksek kalite standartları ile uzun ömürlü ve verimli soğutma kuleleri üretir.',
  'FRP soğutma kulesi üretimi, endüstriyel üretim, özel tasarım kuleler',
  '2024-01-01 00:00:00.000',
  '2024-01-01 00:00:00.000'
)
ON DUPLICATE KEY UPDATE
 `slug`             = VALUES(`slug`),
 `name`             = VALUES(`name`),
 `description`      = VALUES(`description`),
 `material`         = VALUES(`material`),
 `price`            = VALUES(`price`),
 `includes`         = VALUES(`includes`),
 `warranty`         = VALUES(`warranty`),
 `image_alt`        = VALUES(`image_alt`),
 `tags`             = VALUES(`tags`),
 `meta_title`       = VALUES(`meta_title`),
 `meta_description` = VALUES(`meta_description`),
 `meta_keywords`    = VALUES(`meta_keywords`),
 `updated_at`       = VALUES(`updated_at`);

COMMIT;
