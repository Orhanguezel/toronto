-- 011_catalog_categories.sql
-- Kategoriler (üst) - Ensotek (çoklu dil)
-- modules: product + sparepart + news + blog + slider + portfolio + about + services + faq + team
-- Base + i18n pattern (şimdilik sadece tr + en)

START TRANSACTION;

-- =========================
-- 1) CATEGORIES (BASE)
-- =========================
INSERT INTO categories
  (
    id,
    module_key,
    image_url,
    storage_asset_id,
    alt,
    icon,
    is_active,
    is_featured,
    display_order
  )
VALUES
  -- ==========================================================
  -- PRODUCT modülü – Soğutma kuleleri çözümleri
  -- ==========================================================
  ('aaaa0001-1111-4111-8111-aaaaaaaa0001', 'product', NULL, NULL, NULL, NULL, 1, 1, 10),
  ('aaaa0002-1111-4111-8111-aaaaaaaa0002', 'product', NULL, NULL, NULL, NULL, 1, 0, 11),
  ('aaaa0003-1111-4111-8111-aaaaaaaa0003', 'product', NULL, NULL, NULL, NULL, 1, 0, 12),
  ('aaaa0004-1111-4111-8111-aaaaaaaa0004', 'product', NULL, NULL, NULL, NULL, 1, 0, 13),
  ('aaaa0005-1111-4111-8111-aaaaaaaa0005', 'product', NULL, NULL, NULL, NULL, 1, 0, 14),

  -- =====================
  -- NEWS modülü
  -- =====================
  ('aaaa2001-1111-4111-8111-aaaaaaaa2001', 'news', NULL, NULL, NULL, NULL, 1, 0, 16),
  ('aaaa2002-1111-4111-8111-aaaaaaaa2002', 'news', NULL, NULL, NULL, NULL, 1, 0, 17),
  ('aaaa2003-1111-4111-8111-aaaaaaaa2003', 'news', NULL, NULL, NULL, NULL, 1, 0, 18),
  ('aaaa2004-1111-4111-8111-aaaaaaaa2004', 'news', NULL, NULL, NULL, NULL, 1, 0, 19),

  -- =====================
  -- BLOG modülü
  -- =====================
  ('aaaa3001-1111-4111-8111-aaaaaaaa3001', 'blog', NULL, NULL, NULL, NULL, 1, 0, 20),
  ('aaaa3002-1111-4111-8111-aaaaaaaa3002', 'blog', NULL, NULL, NULL, NULL, 1, 0, 21),
  ('aaaa3003-1111-4111-8111-aaaaaaaa3003', 'blog', NULL, NULL, NULL, NULL, 1, 0, 22),
  ('aaaa3004-1111-4111-8111-aaaaaaaa3004', 'blog', NULL, NULL, NULL, NULL, 1, 0, 23),

  -- =====================
  -- SLIDER modülü
  -- =====================
  ('aaaa4001-1111-4111-8111-aaaaaaaa4001', 'slider', NULL, NULL, NULL, NULL, 1, 0, 24),

  -- =====================
  -- PORTFOLIO modülü (sektörel)
  -- =====================
  ('aaaa5001-1111-4111-8111-aaaaaaaa5001', 'portfolio', NULL, NULL, NULL, NULL, 1, 1, 25),
  ('aaaa5002-1111-4111-8111-aaaaaaaa5002', 'portfolio', NULL, NULL, NULL, NULL, 1, 0, 26),
  ('aaaa5003-1111-4111-8111-aaaaaaaa5003', 'portfolio', NULL, NULL, NULL, NULL, 1, 0, 27),
  ('aaaa5004-1111-4111-8111-aaaaaaaa5004', 'portfolio', NULL, NULL, NULL, NULL, 1, 0, 28),
  ('aaaa5005-1111-4111-8111-aaaaaaaa5005', 'portfolio', NULL, NULL, NULL, NULL, 1, 0, 29),
  ('aaaa5006-1111-4111-8111-aaaaaaaa5006', 'portfolio', NULL, NULL, NULL, NULL, 1, 0, 30),
  ('aaaa5007-1111-4111-8111-aaaaaaaa5007', 'portfolio', NULL, NULL, NULL, NULL, 1, 0, 31),
  ('aaaa5008-1111-4111-8111-aaaaaaaa5008', 'portfolio', NULL, NULL, NULL, NULL, 1, 0, 32),
  ('aaaa5009-1111-4111-8111-aaaaaaaa5009', 'portfolio', NULL, NULL, NULL, NULL, 1, 0, 33),
  ('aaaa5010-1111-4111-8111-aaaaaaaa5010', 'portfolio', NULL, NULL, NULL, NULL, 1, 0, 34),

  -- =====================
  -- ABOUT modülü (kurumsal sayfalar)
  -- =====================
  ('aaaa7001-1111-4111-8111-aaaaaaaa7001', 'about', NULL, NULL, NULL, NULL, 1, 0, 36),
  ('aaaa7002-1111-4111-8111-aaaaaaaa7002', 'about', NULL, NULL, NULL, NULL, 1, 0, 37),
  ('aaaa7003-1111-4111-8111-aaaaaaaa7003', 'about', NULL, NULL, NULL, NULL, 1, 0, 38),
  ('aaaa7004-1111-4111-8111-aaaaaaaa7004', 'about', NULL, NULL, NULL, NULL, 1, 0, 39),

  -- =====================
  -- SERVICES modülü
  -- =====================
  ('aaaa8001-1111-4111-8111-aaaaaaaa8001', 'services', NULL, NULL, NULL, NULL, 1, 0, 40),

  -- =====================
  -- FAQ modülü
  -- =====================
  ('aaaa9001-1111-4111-8111-aaaaaaaa9001', 'faq', NULL, NULL, NULL, NULL, 1, 0, 41),

  -- =====================
  -- TEAM modülü
  -- =====================
  ('aaaa9101-1111-4111-8111-aaaaaaaa9101', 'team', NULL, NULL, NULL, NULL, 1, 0, 42)

ON DUPLICATE KEY UPDATE
  module_key       = VALUES(module_key),
  image_url        = VALUES(image_url),
  storage_asset_id = VALUES(storage_asset_id),
  alt              = VALUES(alt),
  icon             = VALUES(icon),
  is_active        = VALUES(is_active),
  is_featured      = VALUES(is_featured),
  display_order    = VALUES(display_order);

-- =========================
-- 2) CATEGORY I18N (TR + EN)
-- =========================
INSERT INTO category_i18n
  (
    category_id,
    locale,
    name,
    slug,
    description,
    alt
  )
VALUES
  -- PRODUCT (TR)
  ('aaaa0001-1111-4111-8111-aaaaaaaa0001', 'tr', 'SOĞUTMA KULELERİ', 'sogutma-kuleleri', NULL, NULL),
  ('aaaa0002-1111-4111-8111-aaaaaaaa0002', 'tr', 'AÇIK DEVRE SOĞUTMA KULELERİ', 'acik-devre-sogutma-kuleleri', NULL, NULL),
  ('aaaa0003-1111-4111-8111-aaaaaaaa0003', 'tr', 'KAPALI DEVRE SOĞUTMA KULELERİ', 'kapali-devre-sogutma-kuleleri', NULL, NULL),
  ('aaaa0004-1111-4111-8111-aaaaaaaa0004', 'tr', 'HİBRİT SOĞUTMA SİSTEMLERİ', 'hibrit-sogutma-sistemleri', NULL, NULL),
  ('aaaa0005-1111-4111-8111-aaaaaaaa0005', 'tr', 'ISI TRANSFER ÇÖZÜMLERİ', 'isi-transfer-cozumleri', NULL, NULL),

  -- PRODUCT (EN)
  ('aaaa0001-1111-4111-8111-aaaaaaaa0001', 'en', 'Cooling Towers', 'cooling-towers', NULL, NULL),
  ('aaaa0002-1111-4111-8111-aaaaaaaa0002', 'en', 'Open Circuit Cooling Towers', 'open-circuit-cooling-towers', NULL, NULL),
  ('aaaa0003-1111-4111-8111-aaaaaaaa0003', 'en', 'Closed Circuit Cooling Towers', 'closed-circuit-cooling-towers', NULL, NULL),
  ('aaaa0004-1111-4111-8111-aaaaaaaa0004', 'en', 'Hybrid Cooling Systems', 'hybrid-cooling-systems', NULL, NULL),
  ('aaaa0005-1111-4111-8111-aaaaaaaa0005', 'en', 'Heat Transfer Solutions', 'heat-transfer-solutions', NULL, NULL),


  -- NEWS (TR)
  ('aaaa2001-1111-4111-8111-aaaaaaaa2001', 'tr', 'GENEL HABERLER', 'genel-haberler', NULL, NULL),
  ('aaaa2002-1111-4111-8111-aaaaaaaa2002', 'tr', 'ŞİRKET HABERLERİ', 'sirket-haberleri', NULL, NULL),
  ('aaaa2003-1111-4111-8111-aaaaaaaa2003', 'tr', 'DUYURULAR', 'duyurular', NULL, NULL),
  ('aaaa2004-1111-4111-8111-aaaaaaaa2004', 'tr', 'BASINDA ENSOTEK', 'basinda-ensotek', NULL, NULL),

  -- NEWS (EN)
  ('aaaa2001-1111-4111-8111-aaaaaaaa2001', 'en', 'General News', 'general-news', NULL, NULL),
  ('aaaa2002-1111-4111-8111-aaaaaaaa2002', 'en', 'Company News', 'company-news', NULL, NULL),
  ('aaaa2003-1111-4111-8111-aaaaaaaa2003', 'en', 'Announcements', 'announcements', NULL, NULL),
  ('aaaa2004-1111-4111-8111-aaaaaaaa2004', 'en', 'Ensotek in the Media', 'ensotek-in-the-media', NULL, NULL),

  -- BLOG (TR)
  ('aaaa3001-1111-4111-8111-aaaaaaaa3001', 'tr', 'GENEL BLOG YAZILARI', 'genel-blog-yazilari', NULL, NULL),
  ('aaaa3002-1111-4111-8111-aaaaaaaa3002', 'tr', 'TEKNİK YAZILAR', 'teknik-yazilar', NULL, NULL),
  ('aaaa3003-1111-4111-8111-aaaaaaaa3003', 'tr', 'SEKTÖREL YAZILAR', 'sektorel-yazilar', NULL, NULL),
  ('aaaa3004-1111-4111-8111-aaaaaaaa3004', 'tr', 'ENERJİ VERİMLİLİĞİ & GENEL YAZILAR', 'enerji-verimliligi-genel-yazilar', NULL, NULL),

  -- BLOG (EN)
  ('aaaa3001-1111-4111-8111-aaaaaaaa3001', 'en', 'General Blog Posts', 'general-blog-posts', NULL, NULL),
  ('aaaa3002-1111-4111-8111-aaaaaaaa3002', 'en', 'Technical Articles', 'technical-articles', NULL, NULL),
  ('aaaa3003-1111-4111-8111-aaaaaaaa3003', 'en', 'Sector Articles', 'sector-articles', NULL, NULL),
  ('aaaa3004-1111-4111-8111-aaaaaaaa3004', 'en', 'Energy Efficiency & General Articles', 'energy-efficiency-general-articles', NULL, NULL),

  -- SLIDER (TR + EN)
  ('aaaa4001-1111-4111-8111-aaaaaaaa4001', 'tr', 'ANA SLIDER', 'ana-slider', NULL, NULL),
  ('aaaa4001-1111-4111-8111-aaaaaaaa4001', 'en', 'Main Slider', 'main-slider', NULL, NULL),

  -- PORTFOLIO (TR)
  ('aaaa5001-1111-4111-8111-aaaaaaaa5001', 'tr', 'PORTFÖY', 'portfoy', NULL, NULL),
  ('aaaa5002-1111-4111-8111-aaaaaaaa5002', 'tr', 'ENERJİ SANTRALLERİ', 'enerji-santralleri', NULL, NULL),
  ('aaaa5003-1111-4111-8111-aaaaaaaa5003', 'tr', 'PETROKİMYA & KİMYA TESİSLERİ', 'petrokimya-kimya-tesisleri', NULL, NULL),
  ('aaaa5004-1111-4111-8111-aaaaaaaa5004', 'tr', 'ÇİMENTO & MADENCİLİK', 'cimento-madencilik', NULL, NULL),
  ('aaaa5005-1111-4111-8111-aaaaaaaa5005', 'tr', 'GIDA & İÇECEK TESİSLERİ', 'gida-icecek-tesisleri', NULL, NULL),
  ('aaaa5006-1111-4111-8111-aaaaaaaa5006', 'tr', 'ÇELİK & METAL SANAYİ', 'celik-metal-sanayi', NULL, NULL),
  ('aaaa5007-1111-4111-8111-aaaaaaaa5007', 'tr', 'OTOMOTİV & YAN SANAYİ', 'otomotiv-yan-sanayi', NULL, NULL),
  ('aaaa5008-1111-4111-8111-aaaaaaaa5008', 'tr', 'AVM & TİCARİ BİNALAR', 'avm-ticari-binalar', NULL, NULL),
  ('aaaa5009-1111-4111-8111-aaaaaaaa5009', 'tr', 'VERİ MERKEZİ & HASTANE', 'veri-merkezi-hastane', NULL, NULL),
  ('aaaa5010-1111-4111-8111-aaaaaaaa5010', 'tr', 'DİĞER PROJELER', 'diger-projeler', NULL, NULL),

  -- PORTFOLIO (EN)
  ('aaaa5001-1111-4111-8111-aaaaaaaa5001', 'en', 'Portfolio', 'portfolio', NULL, NULL),
  ('aaaa5002-1111-4111-8111-aaaaaaaa5002', 'en', 'Power Plants', 'power-plants', NULL, NULL),
  ('aaaa5003-1111-4111-8111-aaaaaaaa5003', 'en', 'Petrochemical & Chemical Plants', 'petrochemical-chemical-plants', NULL, NULL),
  ('aaaa5004-1111-4111-8111-aaaaaaaa5004', 'en', 'Cement & Mining', 'cement-mining', NULL, NULL),
  ('aaaa5005-1111-4111-8111-aaaaaaaa5005', 'en', 'Food & Beverage Plants', 'food-beverage-plants', NULL, NULL),
  ('aaaa5006-1111-4111-8111-aaaaaaaa5006', 'en', 'Steel & Metal Industry', 'steel-metal-industry', NULL, NULL),
  ('aaaa5007-1111-4111-8111-aaaaaaaa5007', 'en', 'Automotive & Supplier Industry', 'automotive-supplier-industry', NULL, NULL),
  ('aaaa5008-1111-4111-8111-aaaaaaaa5008', 'en', 'Malls & Commercial Buildings', 'malls-commercial-buildings', NULL, NULL),
  ('aaaa5009-1111-4111-8111-aaaaaaaa5009', 'en', 'Data Centers & Hospitals', 'data-centers-hospitals', NULL, NULL),
  ('aaaa5010-1111-4111-8111-aaaaaaaa5010', 'en', 'Other Projects', 'other-projects', NULL, NULL),

  -- ABOUT (TR + EN)
  ('aaaa7001-1111-4111-8111-aaaaaaaa7001', 'tr', 'KURUMSAL', 'kurumsal', NULL, NULL),
  ('aaaa7002-1111-4111-8111-aaaaaaaa7002', 'tr', 'HAKKIMIZDA', 'hakkimizda', NULL, NULL),
  ('aaaa7003-1111-4111-8111-aaaaaaaa7003', 'tr', 'MİSYONUMUZ', 'misyonumuz', NULL, NULL),
  ('aaaa7004-1111-4111-8111-aaaaaaaa7004', 'tr', 'VİZYONUMUZ', 'vizyonumuz', NULL, NULL),

  ('aaaa7001-1111-4111-8111-aaaaaaaa7001', 'en', 'Corporate', 'corporate', NULL, NULL),
  ('aaaa7002-1111-4111-8111-aaaaaaaa7002', 'en', 'About Us', 'about-us', NULL, NULL),
  ('aaaa7003-1111-4111-8111-aaaaaaaa7003', 'en', 'Our Mission', 'our-mission', NULL, NULL),
  ('aaaa7004-1111-4111-8111-aaaaaaaa7004', 'en', 'Our Vision', 'our-vision', NULL, NULL),

  -- SERVICES (TR + EN)
  ('aaaa8001-1111-4111-8111-aaaaaaaa8001', 'tr', 'HİZMETLER', 'hizmetler',
    'Ensotek, su soğutma kuleleri için üretim, bakım ve onarım, modernizasyon, yedek parça tedariki, uygulamalar ve mühendislik desteği sunar.',
    NULL
  ),
  ('aaaa8001-1111-4111-8111-aaaaaaaa8001', 'en', 'Services', 'services',
    'Ensotek provides production, maintenance and repair, modernization, spare parts, applications and engineering support for industrial cooling towers.',
    NULL
  ),

  -- FAQ (TR + EN)
  ('aaaa9001-1111-4111-8111-aaaaaaaa9001', 'tr', 'SIKÇA SORULAN SORULAR', 'sikca-sorulan-sorular', NULL, NULL),
  ('aaaa9001-1111-4111-8111-aaaaaaaa9001', 'en', 'Frequently Asked Questions', 'frequently-asked-questions', NULL, NULL),

  -- TEAM (TR + EN)
  ('aaaa9101-1111-4111-8111-aaaaaaaa9101', 'tr', 'EKİBİMİZ', 'ekibimiz',
    'Ensotek mühendislik, proje, saha ve servis ekiplerinden oluşan uzman kadromuz.',
    NULL
  ),
  ('aaaa9101-1111-4111-8111-aaaaaaaa9101', 'en', 'Our Team', 'our-team',
    'Our expert team consisting of engineering, project, field and service professionals at Ensotek.',
    NULL
  )

ON DUPLICATE KEY UPDATE
  name        = VALUES(name),
  slug        = VALUES(slug),
  description = VALUES(description),
  alt         = VALUES(alt);

COMMIT;
