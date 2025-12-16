-- =============================================================
-- 047_site_settings_ui_service.sql
-- ui_services: Service list + detail + "more services" translations
-- Pattern: site_settings (key = 'ui_services', locale, JSON value)
-- =============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

INSERT INTO site_settings (id, `key`, locale, `value`, created_at, updated_at)
VALUES
(
  UUID(),
  'ui_services',
  'tr',
  JSON_OBJECT(
    -- Genel sayfa / liste
    'ui_services_page_title',           'Hizmetler',
    'ui_services_subprefix',            'Ensotek',
    'ui_services_sublabel',             'Hizmetler',
    'ui_services_title',                'Neler yapıyoruz',

    -- Placeholder / ortak
    'ui_services_placeholder_title',    'Hizmetimiz',
    'ui_services_placeholder_summary',  'Hizmet açıklaması yakında eklenecektir.',
    'ui_services_details_aria',         'hizmet detaylarını görüntüle',

    -- "More services" alanı
    'ui_services_more_subtitle',        'Diğer hizmetlerimizi keşfedin',
    'ui_services_more_title',           'İlginizi çekebilecek diğer hizmetler',

    -- Detay sayfası / durumlar
    'ui_services_detail_title',         'Hizmet',
    'ui_services_not_found_title',      'Hizmet bulunamadı',
    'ui_services_not_found_desc',       'Aradığınız hizmet bulunamadı veya artık yayında değil.',
    'ui_services_back_to_list',         'Hizmetlere geri dön',

    -- Fiyat / kapsam / malzeme / garanti
    'ui_services_price_label',          'Fiyat',
    'ui_services_includes_label',       'Hizmet kapsamı',
    'ui_services_material_label',       'Kullanılan malzeme',
    'ui_services_warranty_label',       'Garanti',

    -- Özellikler (specs)
    'ui_services_specs_title',          'Hizmet özellikleri',
    'ui_services_area_label',           'Alan',
    'ui_services_duration_label',       'Süre',
    'ui_services_maintenance_label',    'Bakım',
    'ui_services_season_label',         'Mevsim',
    'ui_services_soil_type_label',      'Toprak türü',
    'ui_services_thickness_label',      'Kalınlık',
    'ui_services_equipment_label',      'Ekipman',

    -- Galeri
    'ui_services_gallery_title',        'Hizmet galerisi',

    -- Sidebar info
    'ui_services_sidebar_info_title',   'Hizmet bilgileri',
    'ui_services_sidebar_type',         'Hizmet tipi',
    'ui_services_sidebar_category',     'Kategori',
    'ui_services_sidebar_status',       'Durum',

    -- Ortak statü
    'ui_common_active',                 'Aktif',
    'ui_common_passive',                'Pasif',

    -- Sidebar CTA
    'ui_services_sidebar_cta_title',    'Detaylı bilgi ister misiniz?',
    'ui_services_sidebar_cta_desc',     'Bu hizmet hakkında detaylı bilgi veya özel teklif almak için bizimle iletişime geçin.',
    'ui_services_sidebar_cta_button',   'İletişime geçin'
  ),
  NOW(3),
  NOW(3)
),
(
  UUID(),
  'ui_services',
  'en',
  JSON_OBJECT(
    -- General page / list
    'ui_services_page_title',           'Services',
    'ui_services_subprefix',            'Ensotek',
    'ui_services_sublabel',             'Services',
    'ui_services_title',                'What we do',

    -- Placeholder / common
    'ui_services_placeholder_title',    'Our service',
    'ui_services_placeholder_summary',  'Service description is coming soon.',
    'ui_services_details_aria',         'view service details',

    -- "More services" section
    'ui_services_more_subtitle',        'Discover our other services',
    'ui_services_more_title',           'You may also be interested in',

    -- Detail page / states
    'ui_services_detail_title',         'Service',
    'ui_services_not_found_title',      'Service not found',
    'ui_services_not_found_desc',       'The service you are looking for could not be found or is no longer available.',
    'ui_services_back_to_list',         'Back to services',

    -- Price / includes / material / warranty
    'ui_services_price_label',          'Price',
    'ui_services_includes_label',       'Service includes',
    'ui_services_material_label',       'Material',
    'ui_services_warranty_label',       'Warranty',

    -- Specs
    'ui_services_specs_title',          'Service specifications',
    'ui_services_area_label',           'Area',
    'ui_services_duration_label',       'Duration',
    'ui_services_maintenance_label',    'Maintenance',
    'ui_services_season_label',         'Season',
    'ui_services_soil_type_label',      'Soil type',
    'ui_services_thickness_label',      'Thickness',
    'ui_services_equipment_label',      'Equipment',

    -- Gallery
    'ui_services_gallery_title',        'Service gallery',

    -- Sidebar info
    'ui_services_sidebar_info_title',   'Service info',
    'ui_services_sidebar_type',         'Service type',
    'ui_services_sidebar_category',     'Category',
    'ui_services_sidebar_status',       'Status',

    -- Common status
    'ui_common_active',                 'Active',
    'ui_common_passive',                'Inactive',

    -- Sidebar CTA
    'ui_services_sidebar_cta_title',    'Need more information?',
    'ui_services_sidebar_cta_desc',     'Contact us to get a custom offer or detailed information about this service.',
    'ui_services_sidebar_cta_button',   'Contact us'
  ),
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `value`    = VALUES(`value`),
  updated_at = VALUES(updated_at);

-- TR → DE otomatik kopya (Almanca özel çeviri gelene kadar)
INSERT INTO site_settings (id, `key`, locale, `value`, created_at, updated_at)
SELECT UUID(), s.`key`, 'de', s.`value`, NOW(3), NOW(3)
FROM site_settings s
WHERE s.locale = 'tr'
  AND s.`key` = 'ui_services'
  AND NOT EXISTS (
    SELECT 1
    FROM site_settings t
    WHERE t.`key` = s.`key`
      AND t.locale = 'de'
  );
