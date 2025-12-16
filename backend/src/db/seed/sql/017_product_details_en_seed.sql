-- =============================================================
-- 017_product_details_en_seed.sql
-- Products: Specs + FAQs (EN)
--  - Ana ürünler (bbbb0001..0003)
--  - Spareparts (bbbb1001..1002)
--  - EN için specs & FAQs (locale = 'en')
-- =============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

-- =============================================================
-- 1) PRODUCT SPECS – EN
--    Önce ilgili ürünlerin EN specs kayıtlarını temizle
-- =============================================================

DELETE FROM product_specs
WHERE product_id IN (
  'bbbb0001-2222-4222-8222-bbbbbbbb0001',
  'bbbb0002-2222-4222-8222-bbbbbbbb0002',
  'bbbb0003-2222-4222-8222-bbbbbbbb0003',
  'bbbb1001-2222-4222-8222-bbbbbbbb1001',
  'bbbb1002-2222-4222-8222-bbbbbbbb1002'
)
AND locale = 'en';

INSERT INTO product_specs (
  id,
  product_id,
  locale,
  name,
  value,
  category,
  order_num
)
VALUES
  -- ===== PRODUCT 1: Industrial Open Circuit Cooling Tower =====
  ('pspc0e01-1111-4111-8111-eeeeeeee0001',
   'bbbb0001-2222-4222-8222-bbbbbbbb0001',
   'en',
   'Flow Capacity',
   'Different models between 1,500 m3/h and 4,500 m3/h',
   'physical',
   1),
  ('pspc0e02-1111-4111-8111-eeeeeeee0002',
   'bbbb0001-2222-4222-8222-bbbbbbbb0001',
   'en',
   'Fan Type',
   'Mechanical draft axial fan with low noise level',
   'physical',
   2),
  ('pspc0e03-1111-4111-8111-eeeeeeee0003',
   'bbbb0001-2222-4222-8222-bbbbbbbb0001',
   'en',
   'Casing Material',
   'Hot-dip galvanized steel and GRP panels',
   'material',
   3),
  ('pspc0e04-1111-4111-8111-eeeeeeee0004',
   'bbbb0001-2222-4222-8222-bbbbbbbb0001',
   'en',
   'Fill Type',
   'High-efficiency film type PVC fill',
   'material',
   4),
  ('pspc0e05-1111-4111-8111-eeeeeeee0005',
   'bbbb0001-2222-4222-8222-bbbbbbbb0001',
   'en',
   'Warranty Period',
   '2-year system warranty',
   'service',
   5),

  -- ===== PRODUCT 2: Film Type Closed Circuit Cooling Tower =====
  ('pspc0e11-1111-4111-8111-eeeeeeee0011',
   'bbbb0002-2222-4222-8222-bbbbbbbb0002',
   'en',
   'Cooling Capacity',
   'Standard models between 500 kW and 2,000 kW',
   'physical',
   1),
  ('pspc0e12-1111-4111-8111-eeeeeeee0012',
   'bbbb0002-2222-4222-8222-bbbbbbbb0002',
   'en',
   'Coil Material',
   'Galvanized steel or optional stainless-steel coil',
   'material',
   2),
  ('pspc0e13-1111-4111-8111-eeeeeeee0013',
   'bbbb0002-2222-4222-8222-bbbbbbbb0002',
   'en',
   'Circuit Configuration',
   'Closed process circuit + open tower circuit',
   'custom',
   3),
  ('pspc0e14-1111-4111-8111-eeeeeeee0014',
   'bbbb0002-2222-4222-8222-bbbbbbbb0002',
   'en',
   'Applications',
   'Process cooling, chiller condenser loops, heat recovery systems',
   'custom',
   4),
  ('pspc0e15-1111-4111-8111-eeeeeeee0015',
   'bbbb0002-2222-4222-8222-bbbbbbbb0002',
   'en',
   'Warranty Period',
   '3-year coil leak-tightness warranty',
   'service',
   5),

  -- ===== PRODUCT 3: Hybrid Adiabatic Cooling System =====
  ('pspc0e21-1111-4111-8111-eeeeeeee0021',
   'bbbb0003-2222-4222-8222-bbbbbbbb0003',
   'en',
   'Operating Modes',
   'Automatic switching between dry, adiabatic and hybrid modes',
   'custom',
   1),
  ('pspc0e22-1111-4111-8111-eeeeeeee0022',
   'bbbb0003-2222-4222-8222-bbbbbbbb0003',
   'en',
   'Water Saving',
   'Up to 60% water saving compared to conventional cooling towers',
   'physical',
   2),
  ('pspc0e23-1111-4111-8111-eeeeeeee0023',
   'bbbb0003-2222-4222-8222-bbbbbbbb0003',
   'en',
   'Applications',
   'Data centers, hospitals, industrial processes and office buildings',
   'custom',
   3),
  ('pspc0e24-1111-4111-8111-eeeeeeee0024',
   'bbbb0003-2222-4222-8222-bbbbbbbb0003',
   'en',
   'Warranty Period',
   '2-year system warranty',
   'service',
   4),

  -- ===== SPAREPART 1: Cooling Tower Fan Motor =====
  ('pspc0e31-1111-4111-8111-eeeeeeee0031',
   'bbbb1001-2222-4222-8222-bbbbbbbb1001',
   'en',
   'Power Range',
   '7.5 kW – 30 kW',
   'physical',
   1),
  ('pspc0e32-1111-4111-8111-eeeeeeee0032',
   'bbbb1001-2222-4222-8222-bbbbbbbb1001',
   'en',
   'Protection Class',
   'IP55, suitable for outdoor conditions',
   'material',
   2),
  ('pspc0e33-1111-4111-8111-eeeeeeee0033',
   'bbbb1001-2222-4222-8222-bbbbbbbb1001',
   'en',
   'Power Supply',
   '400V / 3 Phase / 50 Hz',
   'physical',
   3),
  ('pspc0e34-1111-4111-8111-eeeeeeee0034',
   'bbbb1001-2222-4222-8222-bbbbbbbb1001',
   'en',
   'Mounting Type',
   'Flange mounting, compatible with cooling tower fan hub',
   'custom',
   4),

  -- ===== SPAREPART 2: PVC Fill Block =====
  ('pspc0e41-1111-4111-8111-eeeeeeee0041',
   'bbbb1002-2222-4222-8222-bbbbbbbb1002',
   'en',
   'Material',
   'PVC with high thermal and chemical resistance',
   'material',
   1),
  ('pspc0e42-1111-4111-8111-eeeeeeee0042',
   'bbbb1002-2222-4222-8222-bbbbbbbb1002',
   'en',
   'Operating Temperature',
   'Maximum 60 °C continuous operation',
   'physical',
   2),
  ('pspc0e43-1111-4111-8111-eeeeeeee0043',
   'bbbb1002-2222-4222-8222-bbbbbbbb1002',
   'en',
   'Type',
   'Film-type fill block',
   'custom',
   3)
ON DUPLICATE KEY UPDATE
  locale    = VALUES(locale),
  name      = VALUES(name),
  value     = VALUES(value),
  category  = VALUES(category),
  order_num = VALUES(order_num);

-- =============================================================
-- 2) PRODUCT FAQS – EN
--    Önce ilgili ürünlerin EN FAQ kayıtlarını temizle
-- =============================================================

DELETE FROM product_faqs
WHERE product_id IN (
  'bbbb0001-2222-4222-8222-bbbbbbbb0001',
  'bbbb0002-2222-4222-8222-bbbbbbbb0002',
  'bbbb0003-2222-4222-8222-bbbbbbbb0003',
  'bbbb1001-2222-4222-8222-bbbbbbbb1001',
  'bbbb1002-2222-4222-8222-bbbbbbbb1002'
)
AND locale = 'en';

INSERT INTO product_faqs (
  id,
  product_id,
  locale,
  question,
  answer,
  display_order,
  is_active
)
VALUES
  -- ===== PRODUCT 1: Industrial Open Circuit Cooling Tower =====
  ('pfqe0001-1111-4111-8111-eeeeeeee0001',
   'bbbb0001-2222-4222-8222-bbbbbbbb0001',
   'en',
   'How often should the open circuit cooling tower be maintained?',
   'At least once a year general maintenance and cleaning is recommended; if water quality is poor, inspections every 6 months are advised.',
   1,
   1),
  ('pfqe0002-1111-4111-8111-eeeeeeee0002',
   'bbbb0001-2222-4222-8222-bbbbbbbb0001',
   'en',
   'What should I consider when operating the tower in winter conditions?',
   'Drain points should be checked against freezing risk and, if necessary, heaters or bypass circuits should be used.',
   2,
   1),
  ('pfqe0003-1111-4111-8111-eeeeeeee0003',
   'bbbb0001-2222-4222-8222-bbbbbbbb0001',
   'en',
   'What is the lifetime of fill and drift eliminators?',
   'Depending on operating conditions, lifetime is typically 5–7 years, and regular maintenance extends it.',
   3,
   1),

  -- ===== PRODUCT 2: Film Type Closed Circuit Cooling Tower =====
  ('pfqe0011-1111-4111-8111-eeeeeeee0011',
   'bbbb0002-2222-4222-8222-bbbbbbbb0002',
   'en',
   'Why does process water stay cleaner in closed circuit towers?',
   'Since process water does not come into direct contact with air, it does not pick up dirt and particles from the environment, reducing corrosion and scaling risk.',
   1,
   1),
  ('pfqe0012-1111-4111-8111-eeeeeeee0012',
   'bbbb0002-2222-4222-8222-bbbbbbbb0002',
   'en',
   'How should the coil be cleaned?',
   'Coils can be cleaned by chemical washing or low-pressure water; chemicals should comply with the manufacturer’s recommendations.',
   2,
   1),

  -- ===== PRODUCT 3: Hybrid Adiabatic Cooling System =====
  ('pfqe0021-1111-4111-8111-eeeeeeee0021',
   'bbbb0003-2222-4222-8222-bbbbbbbb0003',
   'en',
   'In which projects do hybrid adiabatic systems offer advantages?',
   'They are particularly advantageous in projects where water consumption is limited, water cost is high or legal limits are in place.',
   1,
   1),
  ('pfqe0022-1111-4111-8111-eeeeeeee0022',
   'bbbb0003-2222-4222-8222-bbbbbbbb0003',
   'en',
   'Is it possible to operate completely in dry mode?',
   'Depending on design conditions, the system can operate fully in dry mode up to certain ambient temperatures.',
   2,
   1),

  -- ===== SPAREPART 1: Cooling Tower Fan Motor =====
  ('pfqe0101-1111-4111-8111-eeeeeeee0101',
   'bbbb1001-2222-4222-8222-bbbbbbbb1001',
   'en',
   'How can I check compatibility with the fan motor in my existing tower?',
   'Power, speed and flange dimensions on the nameplate should be compared with our technical documentation.',
   1,
   1),
  ('pfqe0102-1111-4111-8111-eeeeeeee0102',
   'bbbb1001-2222-4222-8222-bbbbbbbb1001',
   'en',
   'Can I operate the motor with a frequency inverter?',
   'Motors with a suitable insulation class can be used with a frequency inverter; please contact our technical team for details.',
   2,
   1),

  -- ===== SPAREPART 2: PVC Fill Block =====
  ('pfqe0111-1111-4111-8111-eeeeeeee0111',
   'bbbb1002-2222-4222-8222-bbbbbbbb1002',
   'en',
   'Do I need to completely shut down the tower when replacing fill blocks?',
   'For safety reasons the tower should be taken out of service during fill replacement.',
   1,
   1),
  ('pfqe0112-1111-4111-8111-eeeeeeee0112',
   'bbbb1002-2222-4222-8222-bbbbbbbb1002',
   'en',
   'What is the average lifetime of PVC fill blocks?',
   'Depending on water quality and operating conditions, an average lifetime of around 5 years can be expected.',
   2,
   1)
ON DUPLICATE KEY UPDATE
  locale        = VALUES(locale),
  question      = VALUES(question),
  answer        = VALUES(answer),
  display_order = VALUES(display_order),
  is_active     = VALUES(is_active);

COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
