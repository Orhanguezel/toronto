-- =============================================================
-- 014_products_seed.sql
-- Ensotek Ürünleri (Soğutma Kuleleri + Isı Transfer Çözümleri)
--   - TR + EN (product_i18n ile)
--   - Base ürünler tek ID
-- =============================================================

START TRANSACTION;

-- =========================
-- 1) BASE PRODUCTS
-- =========================

INSERT INTO products (
  id,
  category_id,
  sub_category_id,
  price,
  image_url,
  storage_asset_id,
  images,
  storage_image_ids,
  is_active,
  is_featured,
  order_num,
  product_code,
  stock_quantity,
  rating,
  review_count
)
VALUES
  -- PRODUCT 1: Açık Devre Soğutma Kulesi (base)
  (
    'bbbb0001-2222-4222-8222-bbbbbbbb0001',
    'aaaa0002-1111-4111-8111-aaaaaaaa0002', -- AÇIK DEVRE (TR)
    'bbbb0101-1111-4111-8111-bbbbbbbb0101', -- Doğrudan Temaslı Açık Devre Kuleler (TR)
    185000.00,
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&h=600&q=80',
    NULL,
    JSON_ARRAY(
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&h=600&q=80',
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&h=600&q=80'
    ),
    JSON_ARRAY(),
    1,
    1,
    1,                 -- order_num
    'CT-OC-001-TR',    -- base product_code (istersen sadeleştirirsin)
    4,
    4.90,
    3
  ),

  -- PRODUCT 2: Kapalı Devre Soğutma Kulesi (Film Tip)
  (
    'bbbb0002-2222-4222-8222-bbbbbbbb0002',
    'aaaa0003-1111-4111-8111-aaaaaaaa0003', -- KAPALI DEVRE (TR)
    'bbbb0202-1111-4111-8111-bbbbbbbb0202', -- Film Tip Kapalı Devre Kuleler (TR)
    235000.00,
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1200&h=600&q=80',
    NULL,
    JSON_ARRAY(
      'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1200&h=600&q=80',
      'https://images.unsplash.com/photo-1582719478250-cc50a1f5a1aa?auto=format&fit=crop&w=1200&h=600&q=80'
    ),
    JSON_ARRAY(),
    1,
    1,
    2,                 -- order_num
    'CT-CC-010-TR',
    3,
    4.85,
    2
  ),

  -- PRODUCT 3: Hibrit Adyabatik Soğutma Sistemi
  (
    'bbbb0003-2222-4222-8222-bbbbbbbb0003',
    'aaaa0004-1111-4111-8111-aaaaaaaa0004', -- HİBRİT SOĞUTMA SİSTEMLERİ (TR)
    'bbbb0301-1111-4111-8111-bbbbbbbb0301', -- Hibrit Adyabatik Sistemler (TR)
    310000.00,
    'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&h=600&q=80',
    NULL,
    JSON_ARRAY(
      'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&h=600&q=80'
    ),
    JSON_ARRAY(),
    1,
    0,
    3,                 -- order_num
    'CT-HY-001-TR',
    2,
    4.95,
    1
  )
ON DUPLICATE KEY UPDATE
  category_id       = VALUES(category_id),
  sub_category_id   = VALUES(sub_category_id),
  price             = VALUES(price),
  image_url         = VALUES(image_url),
  storage_asset_id  = VALUES(storage_asset_id),
  images            = VALUES(images),
  storage_image_ids = VALUES(storage_image_ids),
  is_active         = VALUES(is_active),
  is_featured       = VALUES(is_featured),
  order_num         = VALUES(order_num),
  product_code      = VALUES(product_code),
  stock_quantity    = VALUES(stock_quantity),
  rating            = VALUES(rating),
  review_count      = VALUES(review_count);

-- =========================
-- 2) PRODUCT I18N (TR + EN)
-- =========================

INSERT INTO product_i18n (
  product_id,
  locale,
  title,
  slug,
  description,
  alt,
  tags,
  specifications,
  meta_title,
  meta_description
)
VALUES
  -- ---------- PRODUCT 1: TR ----------
  (
    'bbbb0001-2222-4222-8222-bbbbbbbb0001',
    'tr',
    'Endüstriyel Açık Devre Soğutma Kulesi',
    'endüstriyel-acik-devre-sogutma-kulesi',
    'Endüstriyel prosesler, HVAC ve enerji santrallerinde kullanılan, yüksek verimli açık devre soğutma kulesi. Doğrudan temaslı ısı transferi sayesinde düşük işletme maliyeti ve yüksek performans sunar.',
    'Endüstriyel açık devre soğutma kulesi',
    JSON_ARRAY('sogutma kulesi', 'acik devre', 'endustriyel', 'ensotek'),
    JSON_OBJECT(
      'capacity', '1.500 m³/h – 4.500 m³/h',
      'fanType', 'Mekanik çekişli, aksiyal fan',
      'structure', 'Galvaniz çelik + GRP paneller',
      'fillType', 'Film tip PVC dolgu',
      'waterLoss', 'Optimize edilmiş sürüklenme ayırıcılar',
      'warranty', '2 yıl sistem garantisi'
    ),
    'Endüstriyel Açık Devre Soğutma Kulesi | Ensotek',
    'Endüstriyel prosesler ve HVAC uygulamaları için yüksek verimli açık devre soğutma kulesi. Düşük enerji tüketimi ve uzun ömürlü tasarım.'
  ),

  -- ---------- PRODUCT 1: EN ----------
  (
    'bbbb0001-2222-4222-8222-bbbbbbbb0001',
    'en',
    'Industrial Open Circuit Cooling Tower',
    'industrial-open-circuit-cooling-tower',
    'High-efficiency open circuit cooling tower designed for industrial processes, HVAC systems and power plants. Direct-contact heat transfer provides low operating cost and high performance.',
    'Industrial open circuit cooling tower',
    JSON_ARRAY('cooling tower', 'open circuit', 'industrial', 'ensotek'),
    JSON_OBJECT(
      'capacity', '1,500 m³/h – 4,500 m³/h',
      'fanType', 'Mechanical draft axial fan',
      'structure', 'Hot-dip galvanized steel + GRP panels',
      'fillType', 'Film-type PVC fill media',
      'waterLoss', 'Optimized drift eliminators',
      'warranty', '2-year system warranty'
    ),
    'Industrial Open Circuit Cooling Tower | Ensotek',
    'High-efficiency open circuit cooling tower for industrial and HVAC applications with low energy consumption and long service life.'
  ),

  -- ---------- PRODUCT 2: TR ----------
  (
    'bbbb0002-2222-4222-8222-bbbbbbbb0002',
    'tr',
    'Film Tip Kapalı Devre Soğutma Kulesi',
    'film-tip-kapali-devre-sogutma-kulesi',
    'Suyun prosesle temas etmediği, film tip eşanjör yüzeyleri ile çalışan kapalı devre soğutma kulesi. Kireçlenme ve kirlenmeye karşı düşük bakım ihtiyacı sunar.',
    'Film tip kapalı devre soğutma kulesi',
    JSON_ARRAY('kapali devre', 'sogutma kulesi', 'film tip', 'proses sogutma'),
    JSON_OBJECT(
      'capacity', '500 kW – 2.000 kW',
      'coilMaterial', 'Galvaniz çelik veya paslanmaz çelik serpantin',
      'waterCircuit', 'Kapalı devre proses devresi + açık devre kule devresi',
      'application', 'Proses soğutma, chiller kondenser devreleri',
      'warranty', '3 yıl serpantin sızdırmazlık garantisi'
    ),
    'Film Tip Kapalı Devre Soğutma Kulesi | Ensotek',
    'Proses akışkanının hava ile temas etmediği, düşük bakım ihtiyacına sahip film tip kapalı devre soğutma kulesi.'
  ),

  -- ---------- PRODUCT 2: EN ----------
  (
    'bbbb0002-2222-4222-8222-bbbbbbbb0002',
    'en',
    'Film Type Closed Circuit Cooling Tower',
    'film-type-closed-circuit-cooling-tower',
    'Closed circuit cooling tower with film-type coil surfaces, where process water does not come into direct contact with air. Provides low maintenance and high reliability.',
    'Film type closed circuit cooling tower',
    JSON_ARRAY('closed circuit', 'cooling tower', 'film type', 'process cooling'),
    JSON_OBJECT(
      'capacity', '500 kW – 2,000 kW',
      'coilMaterial', 'Galvanized steel or stainless steel coil',
      'waterCircuit', 'Closed process circuit + open tower circuit',
      'application', 'Process cooling, chiller condenser loops',
      'warranty', '3-year coil leak-tightness warranty'
    ),
    'Film Type Closed Circuit Cooling Tower | Ensotek',
    'Closed circuit cooling tower with film-type coil surfaces, low maintenance requirements and high reliability.'
  ),

  -- ---------- PRODUCT 3: TR ----------
  (
    'bbbb0003-2222-4222-8222-bbbbbbbb0003',
    'tr',
    'Hibrit Adyabatik Soğutma Sistemi',
    'hibrit-adyabatik-sogutma-sistemi',
    'Kuru soğutucu ve adyabatik ön soğutma teknolojisini birleştiren hibrit soğutma sistemi. Su tüketiminin kritik olduğu projeler için enerji verimliliği ve esnek işletme imkanı sunar.',
    'Hibrit adyabatik soğutma sistemi',
    JSON_ARRAY('hibrit sogutma', 'adyabatik', 'kuru sogutucu', 'enerji verimliligi'),
    JSON_OBJECT(
      'waterSaving', 'Klasik kulelere göre %60’a varan su tasarrufu',
      'operationModes', 'Kuru, adyabatik ve hibrit mod',
      'application', 'Veri merkezleri, hastaneler, endüstriyel prosesler',
      'warranty', '2 yıl sistem garantisi'
    ),
    'Hibrit Adyabatik Soğutma Sistemi | Ensotek',
    'Su tüketiminin kritik olduğu projeler için geliştirilen, kuru soğutucu ve adyabatik soğutmayı birleştiren hibrit soğutma sistemi.'
  ),

  -- ---------- PRODUCT 3: EN ----------
  (
    'bbbb0003-2222-4222-8222-bbbbbbbb0003',
    'en',
    'Hybrid Adiabatic Cooling System',
    'hybrid-adiabatic-cooling-system',
    'Hybrid cooling system that combines dry cooler technology with adiabatic pre-cooling. Provides energy efficiency and flexible operation in projects where water consumption is critical.',
    'Hybrid adiabatic cooling system',
    JSON_ARRAY('hybrid cooling', 'adiabatic', 'dry cooler', 'energy efficiency'),
    JSON_OBJECT(
      'waterSaving', 'Up to 60% water saving compared to conventional towers',
      'operationModes', 'Dry, adiabatic and hybrid modes',
      'application', 'Data centers, hospitals, industrial processes',
      'warranty', '2-year system warranty'
    ),
    'Hybrid Adiabatic Cooling System | Ensotek',
    'Hybrid cooling system combining dry coolers and adiabatic pre-cooling, designed for projects with limited water resources.'
  )
ON DUPLICATE KEY UPDATE
  title            = VALUES(title),
  slug             = VALUES(slug),
  description      = VALUES(description),
  alt              = VALUES(alt),
  tags             = VALUES(tags),
  specifications   = VALUES(specifications),
  meta_title       = VALUES(meta_title),
  meta_description = VALUES(meta_description);

COMMIT;
