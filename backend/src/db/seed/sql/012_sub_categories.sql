-- 012_catalog_subcategories.sql
-- Alt Kategoriler - Ensotek
-- modules: product + sparepart + news + blog + slider + portfolio + about + services + faq + team
-- Base + i18n pattern (şimdilik tr + en)

START TRANSACTION;

-- =========================
-- 1) SUB CATEGORIES (BASE)
-- =========================
INSERT INTO sub_categories
  (
    id,
    category_id,
    image_url,
    storage_asset_id,
    alt,
    icon,
    is_active,
    is_featured,
    display_order
  )
VALUES
  -- PRODUCT: SOĞUTMA KULELERİ (aaaa0001)
  ('bbbb0001-1111-4111-8111-bbbbbbbb0001', 'aaaa0001-1111-4111-8111-aaaaaaaa0001', NULL, NULL, NULL, NULL, 1, 0, 10),
  ('bbbb0002-1111-4111-8111-bbbbbbbb0002', 'aaaa0001-1111-4111-8111-aaaaaaaa0001', NULL, NULL, NULL, NULL, 1, 0, 20),
  ('bbbb0003-1111-4111-8111-bbbbbbbb0003', 'aaaa0001-1111-4111-8111-aaaaaaaa0001', NULL, NULL, NULL, NULL, 1, 0, 30),
  ('bbbb0004-1111-4111-8111-bbbbbbbb0004', 'aaaa0001-1111-4111-8111-aaaaaaaa0001', NULL, NULL, NULL, NULL, 1, 0, 40),
  ('bbbb0005-1111-4111-8111-bbbbbbbb0005', 'aaaa0001-1111-4111-8111-aaaaaaaa0001', NULL, NULL, NULL, NULL, 1, 0, 50),

  -- PRODUCT: AÇIK DEVRE (aaaa0002)
  ('bbbb0101-1111-4111-8111-bbbbbbbb0101', 'aaaa0002-1111-4111-8111-aaaaaaaa0002', NULL, NULL, NULL, NULL, 1, 0, 10),
  ('bbbb0102-1111-4111-8111-bbbbbbbb0102', 'aaaa0002-1111-4111-8111-aaaaaaaa0002', NULL, NULL, NULL, NULL, 1, 0, 20),
  ('bbbb0103-1111-4111-8111-bbbbbbbb0103', 'aaaa0002-1111-4111-8111-aaaaaaaa0002', NULL, NULL, NULL, NULL, 1, 0, 30),

  -- PRODUCT: KAPALI DEVRE (aaaa0003)
  ('bbbb0201-1111-4111-8111-bbbbbbbb0201', 'aaaa0003-1111-4111-8111-aaaaaaaa0003', NULL, NULL, NULL, NULL, 1, 0, 10),
  ('bbbb0202-1111-4111-8111-bbbbbbbb0202', 'aaaa0003-1111-4111-8111-aaaaaaaa0003', NULL, NULL, NULL, NULL, 1, 0, 20),
  ('bbbb0203-1111-4111-8111-bbbbbbbb0203', 'aaaa0003-1111-4111-8111-aaaaaaaa0003', NULL, NULL, NULL, NULL, 1, 0, 30),

  -- PRODUCT: HİBRİT (aaaa0004)
  ('bbbb0301-1111-4111-8111-bbbbbbbb0301', 'aaaa0004-1111-4111-8111-aaaaaaaa0004', NULL, NULL, NULL, NULL, 1, 0, 10),
  ('bbbb0302-1111-4111-8111-bbbbbbbb0302', 'aaaa0004-1111-4111-8111-aaaaaaaa0004', NULL, NULL, NULL, NULL, 1, 0, 20),
  ('bbbb0303-1111-4111-8111-bbbbbbbb0303', 'aaaa0004-1111-4111-8111-aaaaaaaa0004', NULL, NULL, NULL, NULL, 1, 0, 30),

  -- PRODUCT: ISI TRANSFER (aaaa0005)
  ('bbbb0401-1111-4111-8111-bbbbbbbb0401', 'aaaa0005-1111-4111-8111-aaaaaaaa0005', NULL, NULL, NULL, NULL, 1, 0, 10),
  ('bbbb0402-1111-4111-8111-bbbbbbbb0402', 'aaaa0005-1111-4111-8111-aaaaaaaa0005', NULL, NULL, NULL, NULL, 1, 0, 20),

  -- NEWS: GENEL HABERLER (aaaa2001)
  ('bbbb2001-1111-4111-8111-bbbbbbbb2001', 'aaaa2001-1111-4111-8111-aaaaaaaa2001', NULL, NULL, NULL, NULL, 1, 0, 10),
  ('bbbb2002-1111-4111-8111-bbbbbbbb2002', 'aaaa2001-1111-4111-8111-aaaaaaaa2001', NULL, NULL, NULL, NULL, 1, 0, 20),
  ('bbbb2003-1111-4111-8111-bbbbbbbb2003', 'aaaa2001-1111-4111-8111-aaaaaaaa2001', NULL, NULL, NULL, NULL, 1, 0, 30),

  -- NEWS: ŞİRKET HABERLERİ (aaaa2002)
  ('bbbb2101-1111-4111-8111-bbbbbbbb2101', 'aaaa2002-1111-4111-8111-aaaaaaaa2002', NULL, NULL, NULL, NULL, 1, 0, 10),
  ('bbbb2102-1111-4111-8111-bbbbbbbb2102', 'aaaa2002-1111-4111-8111-aaaaaaaa2002', NULL, NULL, NULL, NULL, 1, 0, 20),

  -- NEWS: DUYURULAR (aaaa2003)
  ('bbbb2201-1111-4111-8111-bbbbbbbb2201', 'aaaa2003-1111-4111-8111-aaaaaaaa2003', NULL, NULL, NULL, NULL, 1, 0, 10),
  ('bbbb2202-1111-4111-8111-bbbbbbbb2202', 'aaaa2003-1111-4111-8111-aaaaaaaa2003', NULL, NULL, NULL, NULL, 1, 0, 20),

  -- NEWS: BASINDA ENSOTEK (aaaa2004)
  ('bbbb2301-1111-4111-8111-bbbbbbbb2301', 'aaaa2004-1111-4111-8111-aaaaaaaa2004', NULL, NULL, NULL, NULL, 1, 0, 10),
  ('bbbb2302-1111-4111-8111-bbbbbbbb2302', 'aaaa2004-1111-4111-8111-aaaaaaaa2004', NULL, NULL, NULL, NULL, 1, 0, 20),

  -- BLOG: (aaaa3001)
  ('bbbb3001-1111-4111-8111-bbbbbbbb3001', 'aaaa3001-1111-4111-8111-aaaaaaaa3001', NULL, NULL, NULL, NULL, 1, 0, 10),
  ('bbbb3002-1111-4111-8111-bbbbbbbb3002', 'aaaa3001-1111-4111-8111-aaaaaaaa3001', NULL, NULL, NULL, NULL, 1, 0, 20),
  ('bbbb3003-1111-4111-8111-bbbbbbbb3003', 'aaaa3001-1111-4111-8111-aaaaaaaa3001', NULL, NULL, NULL, NULL, 1, 0, 30),

  -- BLOG: (aaaa3002)
  ('bbbb3101-1111-4111-8111-bbbbbbbb3101', 'aaaa3002-1111-4111-8111-aaaaaaaa3002', NULL, NULL, NULL, NULL, 1, 0, 10),
  ('bbbb3102-1111-4111-8111-bbbbbbbb3102', 'aaaa3002-1111-4111-8111-aaaaaaaa3002', NULL, NULL, NULL, NULL, 1, 0, 20),

  -- BLOG: (aaaa3003)
  ('bbbb3201-1111-4111-8111-bbbbbbbb3201', 'aaaa3003-1111-4111-8111-aaaaaaaa3003', NULL, NULL, NULL, NULL, 1, 0, 10),
  ('bbbb3202-1111-4111-8111-bbbbbbbb3202', 'aaaa3003-1111-4111-8111-aaaaaaaa3003', NULL, NULL, NULL, NULL, 1, 0, 20),

  -- BLOG: (aaaa3004)
  ('bbbb3301-1111-4111-8111-bbbbbbbb3301', 'aaaa3004-1111-4111-8111-aaaaaaaa3004', NULL, NULL, NULL, NULL, 1, 0, 10),
  ('bbbb3302-1111-4111-8111-bbbbbbbb3302', 'aaaa3004-1111-4111-8111-aaaaaaaa3004', NULL, NULL, NULL, NULL, 1, 0, 20),

  -- SLIDER: (aaaa4001)
  ('bbbb4001-1111-4111-8111-bbbbbbbb4001', 'aaaa4001-1111-4111-8111-aaaaaaaa4001', NULL, NULL, NULL, NULL, 1, 0, 10),
  ('bbbb4002-1111-4111-8111-bbbbbbbb4002', 'aaaa4001-1111-4111-8111-aaaaaaaa4001', NULL, NULL, NULL, NULL, 1, 0, 20),

  -- PORTFOLIO ROOT (aaaa5001)
  ('bbbb5001-1111-4111-8111-bbbbbbbb5001', 'aaaa5001-1111-4111-8111-aaaaaaaa5001', NULL, NULL, NULL, NULL, 1, 0, 10),
  ('bbbb5002-1111-4111-8111-bbbbbbbb5002', 'aaaa5001-1111-4111-8111-aaaaaaaa5001', NULL, NULL, NULL, NULL, 1, 0, 20),

  -- ABOUT: KURUMSAL (aaaa7001)
  ('bbbb7001-1111-4111-8111-bbbbbbbb7001', 'aaaa7001-1111-4111-8111-aaaaaaaa7001', NULL, NULL, NULL, NULL, 1, 0, 10),
  ('bbbb7002-1111-4111-8111-bbbbbbbb7002', 'aaaa7001-1111-4111-8111-aaaaaaaa7001', NULL, NULL, NULL, NULL, 1, 0, 20),
  ('bbbb7003-1111-4111-8111-bbbbbbbb7003', 'aaaa7001-1111-4111-8111-aaaaaaaa7001', NULL, NULL, NULL, NULL, 1, 0, 30),

  -- SERVICES: (aaaa8001)
  ('bbbb8001-1111-4111-8111-bbbbbbbb8001', 'aaaa8001-1111-4111-8111-aaaaaaaa8001', NULL, NULL, NULL, NULL, 1, 0, 10),
  ('bbbb8002-1111-4111-8111-bbbbbbbb8002', 'aaaa8001-1111-4111-8111-aaaaaaaa8001', NULL, NULL, NULL, NULL, 1, 0, 20),
  ('bbbb8003-1111-4111-8111-bbbbbbbb8003', 'aaaa8001-1111-4111-8111-aaaaaaaa8001', NULL, NULL, NULL, NULL, 1, 0, 30),
  ('bbbb8004-1111-4111-8111-bbbbbbbb8004', 'aaaa8001-1111-4111-8111-aaaaaaaa8001', NULL, NULL, NULL, NULL, 1, 0, 40),
  ('bbbb8005-1111-4111-8111-bbbbbbbb8005', 'aaaa8001-1111-4111-8111-aaaaaaaa8001', NULL, NULL, NULL, NULL, 1, 0, 50),
  ('bbbb8006-1111-4111-8111-bbbbbbbb8006', 'aaaa8001-1111-4111-8111-aaaaaaaa8001', NULL, NULL, NULL, NULL, 1, 0, 60),

  -- FAQ: (aaaa9001)
  ('bbbb9001-1111-4111-8111-bbbbbbbb9001', 'aaaa9001-1111-4111-8111-aaaaaaaa9001', NULL, NULL, NULL, NULL, 1, 0, 10),
  ('bbbb9002-1111-4111-8111-bbbbbbbb9002', 'aaaa9001-1111-4111-8111-aaaaaaaa9001', NULL, NULL, NULL, NULL, 1, 0, 20),
  ('bbbb9003-1111-4111-8111-bbbbbbbb9003', 'aaaa9001-1111-4111-8111-aaaaaaaa9001', NULL, NULL, NULL, NULL, 1, 0, 30),
  ('bbbb9004-1111-4111-8111-bbbbbbbb9004', 'aaaa9001-1111-4111-8111-aaaaaaaa9001', NULL, NULL, NULL, NULL, 1, 0, 40),

  -- TEAM: (aaaa9101)
  ('bbbb9101-1111-4111-8111-bbbbbbbb9101', 'aaaa9101-1111-4111-8111-aaaaaaaa9101', NULL, NULL, NULL, NULL, 1, 0, 10),
  ('bbbb9102-1111-4111-8111-bbbbbbbb9102', 'aaaa9101-1111-4111-8111-aaaaaaaa9101', NULL, NULL, NULL, NULL, 1, 0, 20),
  ('bbbb9103-1111-4111-8111-bbbbbbbb9103', 'aaaa9101-1111-4111-8111-aaaaaaaa9101', NULL, NULL, NULL, NULL, 1, 0, 30)

ON DUPLICATE KEY UPDATE
  category_id       = VALUES(category_id),
  image_url         = VALUES(image_url),
  storage_asset_id  = VALUES(storage_asset_id),
  alt               = VALUES(alt),
  icon              = VALUES(icon),
  is_active         = VALUES(is_active),
  is_featured       = VALUES(is_featured),
  display_order     = VALUES(display_order);

-- =========================
-- 2) SUB CATEGORY I18N (TR + EN)
-- =========================
INSERT INTO sub_category_i18n
  (
    sub_category_id,
    locale,
    name,
    slug,
    description,
    alt
  )
VALUES
  -- PRODUCT: SOĞUTMA KULELERİ (TR + EN)
  ('bbbb0001-1111-4111-8111-bbbbbbbb0001', 'tr', 'Endüstriyel Soğutma Kuleleri', 'endustriyel-sogutma-kuleleri', NULL, NULL),
  ('bbbb0002-1111-4111-8111-bbbbbbbb0002', 'tr', 'HVAC Soğutma Kuleleri', 'hvac-sogutma-kuleleri', NULL, NULL),
  ('bbbb0003-1111-4111-8111-bbbbbbbb0003', 'tr', 'Proses Soğutma Uygulamaları', 'proses-sogutma-uygulamalari', NULL, NULL),
  ('bbbb0004-1111-4111-8111-bbbbbbbb0004', 'tr', 'Yüksek Kapasiteli Kuleler', 'yuksek-kapasiteli-kuleler', NULL, NULL),
  ('bbbb0005-1111-4111-8111-bbbbbbbb0005', 'tr', 'Kompakt Çatı Tipi Kuleler', 'kompakt-cati-tipi-kuleler', NULL, NULL),

  ('bbbb0001-1111-4111-8111-bbbbbbbb0001', 'en', 'Industrial Cooling Towers', 'industrial-cooling-towers', NULL, NULL),
  ('bbbb0002-1111-4111-8111-bbbbbbbb0002', 'en', 'HVAC Cooling Towers', 'hvac-cooling-towers', NULL, NULL),
  ('bbbb0003-1111-4111-8111-bbbbbbbb0003', 'en', 'Process Cooling Applications', 'process-cooling-applications', NULL, NULL),
  ('bbbb0004-1111-4111-8111-bbbbbbbb0004', 'en', 'High Capacity Towers', 'high-capacity-towers', NULL, NULL),
  ('bbbb0005-1111-4111-8111-bbbbbbbb0005', 'en', 'Compact Rooftop Towers', 'compact-rooftop-towers', NULL, NULL),

  -- PRODUCT: AÇIK DEVRE (TR + EN)
  ('bbbb0101-1111-4111-8111-bbbbbbbb0101', 'tr', 'Doğrudan Temaslı Açık Devre Kuleler', 'dogrudan-temasli-acik-devre-kuleler', NULL, NULL),
  ('bbbb0102-1111-4111-8111-bbbbbbbb0102', 'tr', 'Mekanik Çekişli Açık Devre Kuleler', 'mekanik-cekisli-acik-devre-kuleler', NULL, NULL),
  ('bbbb0103-1111-4111-8111-bbbbbbbb0103', 'tr', 'Doğal Çekişli Açık Devre Kuleler', 'dogal-cekisli-acik-devre-kuleler', NULL, NULL),

  ('bbbb0101-1111-4111-8111-bbbbbbbb0101', 'en', 'Direct Contact Open Circuit Towers', 'direct-contact-open-circuit-towers', NULL, NULL),
  ('bbbb0102-1111-4111-8111-bbbbbbbb0102', 'en', 'Mechanical Draft Open Circuit Towers', 'mechanical-draft-open-circuit-towers', NULL, NULL),
  ('bbbb0103-1111-4111-8111-bbbbbbbb0103', 'en', 'Natural Draft Open Circuit Towers', 'natural-draft-open-circuit-towers', NULL, NULL),

  -- PRODUCT: KAPALI DEVRE (TR + EN)
  ('bbbb0201-1111-4111-8111-bbbbbbbb0201', 'tr', 'Sıçratmalı Kapalı Devre Kuleler', 'sicratmali-kapali-devre-kuleler', NULL, NULL),
  ('bbbb0202-1111-4111-8111-bbbbbbbb0202', 'tr', 'Film Tip Kapalı Devre Kuleler', 'film-tip-kapali-devre-kuleler', NULL, NULL),
  ('bbbb0203-1111-4111-8111-bbbbbbbb0203', 'tr', 'Adyabatik Kapalı Devre Çözümler', 'adyabatik-kapali-devre-cozumler', NULL, NULL),

  ('bbbb0201-1111-4111-8111-bbbbbbbb0201', 'en', 'Spray Type Closed Circuit Towers', 'spray-type-closed-circuit-towers', NULL, NULL),
  ('bbbb0202-1111-4111-8111-bbbbbbbb0202', 'en', 'Film Type Closed Circuit Towers', 'film-type-closed-circuit-cooling-towers', NULL, NULL),
  ('bbbb0203-1111-4111-8111-bbbbbbbb0203', 'en', 'Adiabatic Closed Circuit Solutions', 'adiabatic-closed-circuit-solutions', NULL, NULL),

  -- PRODUCT: HİBRİT (TR + EN)
  ('bbbb0301-1111-4111-8111-bbbbbbbb0301', 'tr', 'Hibrit Adyabatik Sistemler', 'hibrit-adyabatik-sistemler', NULL, NULL),
  ('bbbb0302-1111-4111-8111-bbbbbbbb0302', 'tr', 'Hibrit Kule + Kuru Soğutucu', 'hibrit-kule-kuru-sogutucu', NULL, NULL),
  ('bbbb0303-1111-4111-8111-bbbbbbbb0303', 'tr', 'Mevsimsel Hibrit Çözümler', 'mevsimsel-hibrit-cozumler', NULL, NULL),

  ('bbbb0301-1111-4111-8111-bbbbbbbb0301', 'en', 'Hybrid Adiabatic Systems', 'hybrid-adiabatic-systems', NULL, NULL),
  ('bbbb0302-1111-4111-8111-bbbbbbbb0302', 'en', 'Hybrid Tower + Dry Cooler', 'hybrid-tower-dry-cooler', NULL, NULL),
  ('bbbb0303-1111-4111-8111-bbbbbbbb0303', 'en', 'Seasonal Hybrid Solutions', 'seasonal-hybrid-solutions', NULL, NULL),

  -- PRODUCT: ISI TRANSFER (TR + EN)
  ('bbbb0401-1111-4111-8111-bbbbbbbb0401', 'tr', 'Plakalı Isı Eşanjörleri', 'plakali-isi-esanjorleri', NULL, NULL),
  ('bbbb0402-1111-4111-8111-bbbbbbbb0402', 'tr', 'Buhar Kondenserleri', 'buhar-kondenserleri', NULL, NULL),

  ('bbbb0401-1111-4111-8111-bbbbbbbb0401', 'en', 'Plate Heat Exchangers', 'plate-heat-exchangers', NULL, NULL),
  ('bbbb0402-1111-4111-8111-bbbbbbbb0402', 'en', 'Steam Condensers', 'steam-condensers', NULL, NULL),

  -- NEWS (TR + EN)
  ('bbbb2001-1111-4111-8111-bbbbbbbb2001', 'tr', 'Duyurular', 'duyurular', NULL, NULL),
  ('bbbb2002-1111-4111-8111-bbbbbbbb2002', 'tr', 'Basın Bültenleri', 'basin-bultenleri', NULL, NULL),
  ('bbbb2003-1111-4111-8111-bbbbbbbb2003', 'tr', 'Sektör Haberleri', 'sektor-haberleri', NULL, NULL),

  ('bbbb2001-1111-4111-8111-bbbbbbbb2001', 'en', 'Announcements', 'announcements', NULL, NULL),
  ('bbbb2002-1111-4111-8111-bbbbbbbb2002', 'en', 'Press Releases', 'press-releases', NULL, NULL),
  ('bbbb2003-1111-4111-8111-bbbbbbbb2003', 'en', 'Industry News', 'industry-news', NULL, NULL),

  -- NEWS: ŞİRKET HABERLERİ (TR + EN)
  ('bbbb2101-1111-4111-8111-bbbbbbbb2101', 'tr', 'Yeni Projeler', 'yeni-projeler', NULL, NULL),
  ('bbbb2102-1111-4111-8111-bbbbbbbb2102', 'tr', 'Ödül ve Başarılar', 'odul-ve-basarilar', NULL, NULL),

  ('bbbb2101-1111-4111-8111-bbbbbbbb2101', 'en', 'New Projects', 'new-projects', NULL, NULL),
  ('bbbb2102-1111-4111-8111-bbbbbbbb2102', 'en', 'Awards & Achievements', 'awards-and-achievements', NULL, NULL),

  -- NEWS: DUYURULAR (TR + EN)
  ('bbbb2201-1111-4111-8111-bbbbbbbb2201', 'tr', 'Genel Duyurular', 'genel-duyurular', NULL, NULL),
  ('bbbb2202-1111-4111-8111-bbbbbbbb2202', 'tr', 'Bakım / Servis Duyuruları', 'bakim-servis-duyurulari', NULL, NULL),

  ('bbbb2201-1111-4111-8111-bbbbbbbb2201', 'en', 'General Announcements', 'general-announcements', NULL, NULL),
  ('bbbb2202-1111-4111-8111-bbbbbbbb2202', 'en', 'Maintenance / Service Announcements', 'maintenance-service-announcements', NULL, NULL),

  -- NEWS: BASINDA ENSOTEK (TR + EN)
  ('bbbb2301-1111-4111-8111-bbbbbbbb2301', 'tr', 'Gazete & Dergi', 'gazete-dergi', NULL, NULL),
  ('bbbb2302-1111-4111-8111-bbbbbbbb2302', 'tr', 'Online Haberler', 'online-haberler', NULL, NULL),

  ('bbbb2301-1111-4111-8111-bbbbbbbb2301', 'en', 'Newspaper & Magazine', 'newspaper-and-magazine', NULL, NULL),
  ('bbbb2302-1111-4111-8111-bbbbbbbb2302', 'en', 'Online News', 'online-news', NULL, NULL),

  -- BLOG (TR + EN)
  ('bbbb3001-1111-4111-8111-bbbbbbbb3001', 'tr', 'Bakım Rehberleri', 'bakim-rehberleri', NULL, NULL),
  ('bbbb3002-1111-4111-8111-bbbbbbbb3002', 'tr', 'Tasarım Önerileri', 'tasarim-onerileri', NULL, NULL),
  ('bbbb3003-1111-4111-8111-bbbbbbbb3003', 'tr', 'Sık Sorulan Sorular', 'sik-sorulan-sorular-blog', NULL, NULL),

  ('bbbb3001-1111-4111-8111-bbbbbbbb3001', 'en', 'Maintenance Guides', 'maintenance-guides', NULL, NULL),
  ('bbbb3002-1111-4111-8111-bbbbbbbb3002', 'en', 'Design Tips', 'design-tips', NULL, NULL),
  ('bbbb3003-1111-4111-8111-bbbbbbbb3003', 'en', 'Frequently Asked Questions', 'frequently-asked-questions-blog', NULL, NULL),

  -- BLOG: TEKNİK (TR + EN)
  ('bbbb3101-1111-4111-8111-bbbbbbbb3101', 'tr', 'Teknik Rehberler', 'teknik-rehberler', NULL, NULL),
  ('bbbb3102-1111-4111-8111-bbbbbbbb3102', 'tr', 'Arıza Çözümleri', 'ariza-cozumleri', NULL, NULL),

  ('bbbb3101-1111-4111-8111-bbbbbbbb3101', 'en', 'Technical Guides', 'technical-guides', NULL, NULL),
  ('bbbb3102-1111-4111-8111-bbbbbbbb3102', 'en', 'Troubleshooting', 'troubleshooting', NULL, NULL),

  -- BLOG: SEKTÖREL (TR + EN)
  ('bbbb3201-1111-4111-8111-bbbbbbbb3201', 'tr', 'Pazar Analizi', 'pazar-analizi', NULL, NULL),
  ('bbbb3202-1111-4111-8111-bbbbbbbb3202', 'tr', 'Trendler & Gelişmeler', 'trendler-gelismeler', NULL, NULL),

  ('bbbb3201-1111-4111-8111-bbbbbbbb3201', 'en', 'Market Analysis', 'market-analysis', NULL, NULL),
  ('bbbb3202-1111-4111-8111-bbbbbbbb3202', 'en', 'Trends & Developments', 'trends-and-developments', NULL, NULL),

  -- BLOG: GENEL (TR + EN)
  ('bbbb3301-1111-4111-8111-bbbbbbbb3301', 'tr', 'Genel Rehberler', 'genel-rehberler', NULL, NULL),
  ('bbbb3302-1111-4111-8111-bbbbbbbb3302', 'tr', 'İlham Veren Hikayeler', 'ilham-veren-hikayeler', NULL, NULL),

  ('bbbb3301-1111-4111-8111-bbbbbbbb3301', 'en', 'General Guides', 'general-guides', NULL, NULL),
  ('bbbb3302-1111-4111-8111-bbbbbbbb3302', 'en', 'Inspiring Stories', 'inspiring-stories', NULL, NULL),

  -- SLIDER (TR + EN)
  ('bbbb4001-1111-4111-8111-bbbbbbbb4001', 'tr', 'Ana Sayfa Sliderı', 'ana-sayfa-slideri', NULL, NULL),
  ('bbbb4002-1111-4111-8111-bbbbbbbb4002', 'tr', 'Kampanya Sliderı', 'kampanya-slideri', NULL, NULL),

  ('bbbb4001-1111-4111-8111-bbbbbbbb4001', 'en', 'Homepage Slider', 'homepage-slider', NULL, NULL),
  ('bbbb4002-1111-4111-8111-bbbbbbbb4002', 'en', 'Campaign Slider', 'campaign-slider', NULL, NULL),

  -- PORTFOLIO (TR + EN)  [eski "references" yerine]
  ('bbbb5001-1111-4111-8111-bbbbbbbb5001', 'tr', 'Bireysel Portföy', 'bireysel-portfoy', NULL, NULL),
  ('bbbb5002-1111-4111-8111-bbbbbbbb5002', 'tr', 'Kurumsal Portföy', 'kurumsal-portfoy', NULL, NULL),

  ('bbbb5001-1111-4111-8111-bbbbbbbb5001', 'en', 'Individual Portfolio', 'individual-portfolio', NULL, NULL),
  ('bbbb5002-1111-4111-8111-bbbbbbbb5002', 'en', 'Corporate Portfolio', 'corporate-portfolio', NULL, NULL),

  -- ABOUT (TR + EN)
  ('bbbb7001-1111-4111-8111-bbbbbbbb7001', 'tr', 'Hakkımızda', 'hakkimizda', NULL, NULL),
  ('bbbb7002-1111-4111-8111-bbbbbbbb7002', 'tr', 'Misyon & Vizyon', 'misyon-vizyon', NULL, NULL),
  ('bbbb7003-1111-4111-8111-bbbbbbbb7003', 'tr', 'İnsan Kaynakları', 'insan-kaynaklari', NULL, NULL),

  ('bbbb7001-1111-4111-8111-bbbbbbbb7001', 'en', 'About Us', 'about-us-page', NULL, NULL),
  ('bbbb7002-1111-4111-8111-bbbbbbbb7002', 'en', 'Mission & Vision', 'mission-and-vision', NULL, NULL),
  ('bbbb7003-1111-4111-8111-bbbbbbbb7003', 'en', 'Human Resources', 'human-resources', NULL, NULL),

  -- SERVICES (TR + EN)
  ('bbbb8001-1111-4111-8111-bbbbbbbb8001', 'tr', 'Üretim', 'uretim',
    'Ensotek, endüstriyel su soğutma kuleleri üretiminde uzmandır. Açık ve kapalı devre FRP (cam elyaf takviyeli polyester) malzemeden, dayanıklı, uzun ömürlü ve yüksek kaliteli soğutma kuleleri üretir.',
    NULL
  ),
  ('bbbb8001-1111-4111-8111-bbbbbbbb8001', 'en', 'Production', 'production',
    'Ensotek is specialized in manufacturing industrial water cooling towers. The production covers durable, long life open and closed circuit FRP cooling towers with high quality standards.',
    NULL
  ),

  ('bbbb8002-1111-4111-8111-bbbbbbbb8002', 'tr', 'Bakım ve Onarım', 'bakim-ve-onarim',
    'Ensotek, endüstriyel su soğutma kulelerinizin sorunsuz çalışmasını sağlamak amacıyla periyodik bakım ve profesyonel onarım hizmetleri sunar. Deneyimli ekibimiz ile sistemlerinizin ömrünü uzatır ve performans kaybını önleriz. Mevcut soğutma kulelerinin verimliliğini sağlamak için düzenli bakım ve onarım hizmetleri sunuyoruz.',
    NULL
  ),
  ('bbbb8002-1111-4111-8111-bbbbbbbb8002', 'en', 'Maintenance & Repair', 'maintenance-and-repair',
    'Ensotek provides periodic maintenance and professional repair services for industrial water cooling towers, extending system lifetime and preserving performance and efficiency.',
    NULL
  ),

  ('bbbb8003-1111-4111-8111-bbbbbbbb8003', 'tr', 'Modernizasyon', 'modernizasyon',
    'Ensotek, mevcut su soğutma kulelerinin daha verimli ve güncel standartlara uygun çalışabilmesi için modernizasyon çözümleri sunar. Eskiyen sistemlerinizi daha düşük maliyetle yenilemek ve enerji verimliliğini artırmak mümkündür. Eski soğutma kulelerinin performansını artırmak için modernizasyon hizmetleri sunuyoruz.',
    NULL
  ),
  ('bbbb8003-1111-4111-8111-bbbbbbbb8003', 'en', 'Modernization', 'modernization',
    'Ensotek offers modernization solutions to bring existing cooling towers up to current efficiency and performance standards, increasing energy efficiency with lower investment costs.',
    NULL
  ),

  ('bbbb8004-1111-4111-8111-bbbbbbbb8004', 'tr', 'Yedek Parçalar ve Bileşenler', 'yedek-parcalar-ve-bilesenler',
    'Ensotek, su soğutma kuleleri için geniş bir yedek parça ve bileşen portföyü sunar. Tüm yedek parçalarımız, kulelerinizin uzun ömürlü ve verimli çalışması için kaliteli ve güvenilirdir. Soğutma kulelerinin sorunsuz çalışmasını sağlamak için geniş yedek parça ve bileşen seçenekleri sunuyoruz.',
    NULL
  ),
  ('bbbb8004-1111-4111-8111-bbbbbbbb8004', 'en', 'Spare Parts & Components', 'spare-parts-and-components',
    'Ensotek supplies a wide portfolio of spare parts and components for cooling towers, ensuring reliable, long life and efficient operation of your systems.',
    NULL
  ),

  ('bbbb8005-1111-4111-8111-bbbbbbbb8005', 'tr', 'Uygulamalar ve Portföy', 'uygulamalar-ve-portfoy',
    'Ensotek, endüstriyel ve ticari alanlarda çok sayıda projeye ve uygulamaya sahiptir. Enerji, kimya, gıda, ilaç, otomotiv ve daha birçok sektörde su soğutma kuleleriyle yerli ve yabancı yüzlerce projeye çözüm sunmuştur.',
    NULL
  ),
  ('bbbb8005-1111-4111-8111-bbbbbbbb8005', 'en', 'Applications & Portfolio', 'applications-and-portfolio',
    'Ensotek has many projects and applications in industrial and commercial fields, delivering long life and efficient cooling tower solutions for many sectors.',
    NULL
  ),

  ('bbbb8006-1111-4111-8111-bbbbbbbb8006', 'tr', 'Mühendislik Desteği', 'muhendislik-destegi',
    'Ensotek, projelendirme, danışmanlık, sistem optimizasyonu, performans analizi ve teknik eğitim dahil olmak üzere kapsamlı mühendislik destek hizmetleri sağlar.',
    NULL
  ),
  ('bbbb8006-1111-4111-8111-bbbbbbbb8006', 'en', 'Engineering Support', 'engineering-support',
    'Ensotek provides comprehensive engineering support for cooling tower projects, including design, consulting, system optimisation, performance analysis and technical training.',
    NULL
  ),

  -- FAQ (TR + EN)
  ('bbbb9001-1111-4111-8111-bbbbbbbb9001', 'tr', 'Genel Sorular', 'genel-sorular', NULL, NULL),
  ('bbbb9002-1111-4111-8111-bbbbbbbb9002', 'tr', 'Ürünler Hakkında', 'urunler-hakkinda', NULL, NULL),
  ('bbbb9003-1111-4111-8111-bbbbbbbb9003', 'tr', 'Teknik Destek', 'teknik-destek', NULL, NULL),
  ('bbbb9004-1111-4111-8111-bbbbbbbb9004', 'tr', 'Bakım ve Servis', 'bakim-ve-servis', NULL, NULL),

  ('bbbb9001-1111-4111-8111-bbbbbbbb9001', 'en', 'General Questions', 'general-questions', NULL, NULL),
  ('bbbb9002-1111-4111-8111-bbbbbbbb9002', 'en', 'About Products', 'about-products', NULL, NULL),
  ('bbbb9003-1111-4111-8111-bbbbbbbb9003', 'en', 'Technical Support', 'technical-support', NULL, NULL),
  ('bbbb9004-1111-4111-8111-bbbbbbbb9004', 'en', 'Maintenance & Service', 'maintenance-and-service', NULL, NULL),

  -- TEAM (TR + EN)
  ('bbbb9101-1111-4111-8111-bbbbbbbb9101', 'tr', 'Yönetim ve Kurucu Ortaklar', 'yonetim-ve-kurucu-ortaklar', NULL, NULL),
  ('bbbb9102-1111-4111-8111-bbbbbbbb9102', 'tr', 'Mühendislik Ekibi', 'muhendislik-ekibi', NULL, NULL),
  ('bbbb9103-1111-4111-8111-bbbbbbbb9103', 'tr', 'Saha ve Servis Ekibi', 'saha-ve-servis-ekibi', NULL, NULL),

  ('bbbb9101-1111-4111-8111-bbbbbbbb9101', 'en', 'Management & Founders', 'management-and-founders', NULL, NULL),
  ('bbbb9102-1111-4111-8111-bbbbbbbb9102', 'en', 'Engineering Team', 'engineering-team', NULL, NULL),
  ('bbbb9103-1111-4111-8111-bbbbbbbb9103', 'en', 'Field & Service Team', 'field-and-service-team', NULL, NULL)

ON DUPLICATE KEY UPDATE
  name        = VALUES(name),
  slug        = VALUES(slug),
  description = VALUES(description),
  alt         = VALUES(alt);

COMMIT;
