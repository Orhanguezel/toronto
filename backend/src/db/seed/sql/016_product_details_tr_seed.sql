-- =============================================================
-- 016_product_details_tr_seed.sql
-- Products: Specs + FAQs + Reviews + Options + Stock (TR)
--  - Ana ürünler (bbbb0001..0003)
--  - Spareparts (bbbb1001..1002)
--  - TR için specs & FAQs (locale = 'tr')
-- =============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

-- =============================================================
-- 1) PRODUCT SPECS – TR
--    Önce ilgili ürünlerin TR specs kayıtlarını temizle
-- =============================================================

DELETE FROM product_specs
WHERE product_id IN (
  'bbbb0001-2222-4222-8222-bbbbbbbb0001',
  'bbbb0002-2222-4222-8222-bbbbbbbb0002',
  'bbbb0003-2222-4222-8222-bbbbbbbb0003',
  'bbbb1001-2222-4222-8222-bbbbbbbb1001',
  'bbbb1002-2222-4222-8222-bbbbbbbb1002'
)
AND locale = 'tr';

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
  -- ===== PRODUCT 1: Açık Devre Soğutma Kulesi =====
  ('pspc0001-1111-4111-8111-aaaaaaaa0001',
   'bbbb0001-2222-4222-8222-bbbbbbbb0001',
   'tr',
   'Debi Kapasitesi',
   '1.500 m3/h – 4.500 m3/h aralığında farklı modeller',
   'physical',
   1),
  ('pspc0002-1111-4111-8111-aaaaaaaa0002',
   'bbbb0001-2222-4222-8222-bbbbbbbb0001',
   'tr',
   'Fan Tipi',
   'Mekanik çekişli aksiyal fan, düşük ses seviyesi',
   'physical',
   2),
  ('pspc0003-1111-4111-8111-aaaaaaaa0003',
   'bbbb0001-2222-4222-8222-bbbbbbbb0001',
   'tr',
   'Gövde Malzemesi',
   'Sıcak daldırma galvaniz çelik ve GRP paneller',
   'material',
   3),
  ('pspc0004-1111-4111-8111-aaaaaaaa0004',
   'bbbb0001-2222-4222-8222-bbbbbbbb0001',
   'tr',
   'Dolgu Tipi',
   'Yüksek verimli film tip PVC dolgu',
   'material',
   4),
  ('pspc0005-1111-4111-8111-aaaaaaaa0005',
   'bbbb0001-2222-4222-8222-bbbbbbbb0001',
   'tr',
   'Garanti Süresi',
   '2 yıl sistem garantisi',
   'service',
   5),

  -- ===== PRODUCT 2: Kapalı Devre Soğutma Kulesi =====
  ('pspc0011-1111-4111-8111-aaaaaaaa0011',
   'bbbb0002-2222-4222-8222-bbbbbbbb0002',
   'tr',
   'Soğutma Kapasitesi',
   '500 kW – 2.000 kW aralığında standart modeller',
   'physical',
   1),
  ('pspc0012-1111-4111-8111-aaaaaaaa0012',
   'bbbb0002-2222-4222-8222-bbbbbbbb0002',
   'tr',
   'Serpantin Malzemesi',
   'Galvaniz çelik veya opsiyonel paslanmaz çelik serpantin',
   'material',
   2),
  ('pspc0013-1111-4111-8111-aaaaaaaa0013',
   'bbbb0002-2222-4222-8222-bbbbbbbb0002',
   'tr',
   'Devre Yapısı',
   'Kapalı proses devresi + açık kule devresi',
   'custom',
   3),
  ('pspc0014-1111-4111-8111-aaaaaaaa0014',
   'bbbb0002-2222-4222-8222-bbbbbbbb0002',
   'tr',
   'Uygulama Alanları',
   'Proses soğutma, chiller kondenser devreleri, ısı geri kazanım sistemleri',
   'custom',
   4),
  ('pspc0015-1111-4111-8111-aaaaaaaa0015',
   'bbbb0002-2222-4222-8222-bbbbbbbb0002',
   'tr',
   'Garanti Süresi',
   '3 yıl serpantin sızdırmazlık garantisi',
   'service',
   5),

  -- ===== PRODUCT 3: Hibrit Adyabatik Sistem =====
  ('pspc0021-1111-4111-8111-aaaaaaaa0021',
   'bbbb0003-2222-4222-8222-bbbbbbbb0003',
   'tr',
   'Çalışma Modları',
   'Kuru, adyabatik ve hibrit mod arasında otomatik geçiş',
   'custom',
   1),
  ('pspc0022-1111-4111-8111-aaaaaaaa0022',
   'bbbb0003-2222-4222-8222-bbbbbbbb0003',
   'tr',
   'Su Tasarrufu',
   'Klasik soğutma kulelerine göre %60 a varan su tasarrufu',
   'physical',
   2),
  ('pspc0023-1111-4111-8111-aaaaaaaa0023',
   'bbbb0003-2222-4222-8222-bbbbbbbb0003',
   'tr',
   'Uygulama Alanları',
   'Veri merkezleri, hastaneler, endüstriyel prosesler ve ofis binaları',
   'custom',
   3),
  ('pspc0024-1111-4111-8111-aaaaaaaa0024',
   'bbbb0003-2222-4222-8222-bbbbbbbb0003',
   'tr',
   'Garanti Süresi',
   '2 yıl sistem garantisi',
   'service',
   4),

  -- ===== SPAREPART 1: Kule Fan Motoru =====
  ('pspc0101-1111-4111-8111-aaaaaaaa0101',
   'bbbb1001-2222-4222-8222-bbbbbbbb1001',
   'tr',
   'Güç Aralığı',
   '7,5 kW – 30 kW',
   'physical',
   1),
  ('pspc0102-1111-4111-8111-aaaaaaaa0102',
   'bbbb1001-2222-4222-8222-bbbbbbbb1001',
   'tr',
   'Koruma Sınıfı',
   'IP55, dış ortam şartlarına dayanımlı',
   'material',
   2),
  ('pspc0103-1111-4111-8111-aaaaaaaa0103',
   'bbbb1001-2222-4222-8222-bbbbbbbb1001',
   'tr',
   'Besleme',
   '400V / 3 Faz / 50 Hz',
   'physical',
   3),
  ('pspc0104-1111-4111-8111-aaaaaaaa0104',
   'bbbb1001-2222-4222-8222-bbbbbbbb1001',
   'tr',
   'Montaj Tipi',
   'Flanş montaj, kule fan göbeğine uyumlu',
   'custom',
   4),

  -- ===== SPAREPART 2: PVC Dolgu Bloğu =====
  ('pspc0111-1111-4111-8111-aaaaaaaa0111',
   'bbbb1002-2222-4222-8222-bbbbbbbb1002',
   'tr',
   'Malzeme',
   'Yüksek ısı ve kimyasal dayanımlı PVC',
   'material',
   1),
  ('pspc0112-1111-4111-8111-aaaaaaaa0112',
   'bbbb1002-2222-4222-8222-bbbbbbbb1002',
   'tr',
   'Çalışma Sıcaklığı',
   'Maksimum 60 °C sürekli çalışma',
   'physical',
   2),
  ('pspc0113-1111-4111-8111-aaaaaaaa0113',
   'bbbb1002-2222-4222-8222-bbbbbbbb1002',
   'tr',
   'Tip',
   'Film tip dolgu bloğu',
   'custom',
   3)
ON DUPLICATE KEY UPDATE
  locale    = VALUES(locale),
  name      = VALUES(name),
  value     = VALUES(value),
  category  = VALUES(category),
  order_num = VALUES(order_num);

-- =============================================================
-- 2) PRODUCT FAQS – TR
--    Önce ilgili ürünlerin TR FAQ kayıtlarını temizle
-- =============================================================

DELETE FROM product_faqs
WHERE product_id IN (
  'bbbb0001-2222-4222-8222-bbbbbbbb0001',
  'bbbb0002-2222-4222-8222-bbbbbbbb0002',
  'bbbb0003-2222-4222-8222-bbbbbbbb0003',
  'bbbb1001-2222-4222-8222-bbbbbbbb1001',
  'bbbb1002-2222-4222-8222-bbbbbbbb1002'
)
AND locale = 'tr';

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
  -- ===== PRODUCT 1: Açık Devre Soğutma Kulesi =====
  ('pfqa0001-1111-4111-8111-aaaaaaaa0001',
   'bbbb0001-2222-4222-8222-bbbbbbbb0001',
   'tr',
   'Açık devre soğutma kulesinin bakımı ne sıklıkla yapılmalıdır?',
   'Minimum yılda bir kez genel bakım ve temizlik, su kalitesi kötü ise 6 ayda bir kontrol önerilir.',
   1,
   1),
  ('pfqa0002-1111-4111-8111-aaaaaaaa0002',
   'bbbb0001-2222-4222-8222-bbbbbbbb0001',
   'tr',
   'Kuleyi kış şartlarında kullanırken nelere dikkat etmeliyim?',
   'Donma riskine karşı drenaj noktalarının kontrol edilmesi ve gerekiyorsa ısıtıcı veya by-pass devrelerinin kullanılması önerilir.',
   2,
   1),
  ('pfqa0003-1111-4111-8111-aaaaaaaa0003',
   'bbbb0001-2222-4222-8222-bbbbbbbb0001',
   'tr',
   'Dolgu ve sürüklenme tutucuların ömrü ne kadardır?',
   'Çalışma koşullarına bağlı olarak 5-7 yıl aralığında değişmekle birlikte, düzenli bakım ömrü uzatır.',
   3,
   1),

  -- ===== PRODUCT 2: Kapalı Devre Soğutma Kulesi =====
  ('pfqa0011-1111-4111-8111-aaaaaaaa0011',
   'bbbb0002-2222-4222-8222-bbbbbbbb0002',
   'tr',
   'Kapalı devre kulelerde proses suyu neden daha temiz kalır?',
   'Proses suyu hava ile doğrudan temas etmediği için dış ortamdan kir ve partikül almaz, korozyon ve kireçlenme riski azalır.',
   1,
   1),
  ('pfqa0012-1111-4111-8111-aaaaaaaa0012',
   'bbbb0002-2222-4222-8222-bbbbbbbb0002',
   'tr',
   'Serpantin temizliği nasıl yapılır?',
   'Serpantinler kimyasal yıkama veya düşük basınçlı su ile temizlenebilir, üretici tavsiyelerine uygun kimyasallar kullanılmalıdır.',
   2,
   1),

  -- ===== PRODUCT 3: Hibrit Adyabatik Sistem =====
  ('pfqa0021-1111-4111-8111-aaaaaaaa0021',
   'bbbb0003-2222-4222-8222-bbbbbbbb0003',
   'tr',
   'Hibrit adyabatik sistemler hangi projelerde avantaj sağlar?',
   'Su tüketiminin kısıtlı olduğu, su maliyetinin yüksek olduğu veya yasal sınırların bulunduğu projelerde önemli avantaj sağlar.',
   1,
   1),
  ('pfqa0022-1111-4111-8111-aaaaaaaa0022',
   'bbbb0003-2222-4222-8222-bbbbbbbb0003',
   'tr',
   'Tamamen kuru modda çalışmak mümkün müdür?',
   'Tasarım koşullarına bağlı olarak belirli dış sıcaklıklara kadar sistem tamamen kuru modda çalışabilir.',
   2,
   1),

  -- ===== SPAREPART 1: Fan Motoru =====
  ('pfqa0101-1111-4111-8111-aaaaaaaa0101',
   'bbbb1001-2222-4222-8222-bbbbbbbb1001',
   'tr',
   'Mevcut kulemdeki fan motoru ile uyumluluğu nasıl kontrol edebilirim?',
   'Etiket bilgilerindeki güç, devir ve flanş ölçülerinin teknik dokümanımız ile karşılaştırılması gerekir.',
   1,
   1),
  ('pfqa0102-1111-4111-8111-aaaaaaaa0102',
   'bbbb1001-2222-4222-8222-bbbbbbbb1001',
   'tr',
   'Motoru inverter ile kullanabilir miyim?',
   'Uygun izolasyon sınıfına sahip motorlar frekans invertörü ile birlikte kullanılabilir, detaylar için teknik ekibimiz ile iletişime geçiniz.',
   2,
   1),

  -- ===== SPAREPART 2: PVC Dolgu Bloğu =====
  ('pfqa0111-1111-4111-8111-aaaaaaaa0111',
   'bbbb1002-2222-4222-8222-bbbbbbbb1002',
   'tr',
   'Dolgu değişimi sırasında kuleyi tamamen durdurmak gerekir mi?',
   'Güvenlik açısından dolgu değişimi sırasında kule devre dışı bırakılmalıdır.',
   1,
   1),
  ('pfqa0112-1111-4111-8111-aaaaaaaa0112',
   'bbbb1002-2222-4222-8222-bbbbbbbb1002',
   'tr',
   'PVC dolgu bloklarının ortalama ömrü nedir?',
   'Su kalitesi ve çalışma şartlarına bağlı olarak ortalama 5 yıl ömür beklenir.',
   2,
   1)
ON DUPLICATE KEY UPDATE
  locale        = VALUES(locale),
  question      = VALUES(question),
  answer        = VALUES(answer),
  display_order = VALUES(display_order),
  is_active     = VALUES(is_active);

-- =============================================================
-- 3) PRODUCT REVIEWS  (locale yok, dil bağımsız / TR içerik)
-- =============================================================

INSERT INTO product_reviews (
  id,
  product_id,
  user_id,
  rating,
  comment,
  is_active,
  customer_name,
  review_date
)
VALUES
  ('prev0001-1111-4111-8111-aaaaaaaa0001',
   'bbbb0001-2222-4222-8222-bbbbbbbb0001',
   NULL,
   5,
   'Proses hattımızda 1 yıldır kullanıyoruz, enerji tüketimi ve su sarfiyatı beklediğimizden daha iyi.',
   1,
   'Murat K.',
   '2025-01-15 10:00:00.000'),
  -- ... diğer review kayıtların (değişmeden) ...
  ('prev0115-1111-4111-8111-aaaaaaaa0115',
   'bbbb1002-2222-4222-8222-bbbbbbbb1002',
   NULL,
   5,
   'Kule verimini gözle görülür şekilde artırdı.',
   1,
   'Selin C.',
   '2025-04-01 14:20:00.000')
ON DUPLICATE KEY UPDATE
  rating        = VALUES(rating),
  comment       = VALUES(comment),
  is_active     = VALUES(is_active),
  customer_name = VALUES(customer_name),
  review_date   = VALUES(review_date);

-- =============================================================
-- 4) PRODUCT OPTIONS – TR (dil bağımsız label ama TR yazılı)
-- =============================================================

INSERT INTO product_options (
  id,
  product_id,
  option_name,
  option_values
)
VALUES
  ('popt0001-1111-4111-8111-aaaaaaaa0001',
   'bbbb0001-2222-4222-8222-bbbbbbbb0001',
   'Debi Kapasitesi',
   JSON_ARRAY(
     JSON_OBJECT('code','1500','label','1.500 m3/h'),
     JSON_OBJECT('code','2500','label','2.500 m3/h'),
     JSON_OBJECT('code','3500','label','3.500 m3/h'),
     JSON_OBJECT('code','4500','label','4.500 m3/h')
   )),
  -- ... diğer options kayıtların ...
  ('popt0112-1111-4111-8111-aaaaaaaa0112',
   'bbbb1002-2222-4222-8222-bbbbbbbb1002',
   'Dolgu Tipi',
   JSON_ARRAY(
     JSON_OBJECT('code','film','label','Film Tip'),
     JSON_OBJECT('code','splash','label','Splash Tip (özel üretim)')
   ))
ON DUPLICATE KEY UPDATE
  option_name   = VALUES(option_name),
  option_values = VALUES(option_values);

-- =============================================================
-- 5) PRODUCT STOCK – TR
-- =============================================================

INSERT INTO product_stock (
  id,
  product_id,
  stock_content,
  is_used,
  used_at,
  order_item_id
)
VALUES
  ('pstk0101-1111-4111-8111-aaaaaaaa0101',
   'bbbb1001-2222-4222-8222-bbbbbbbb1001',
   'FM-7.5-2025-0001',
   0,
   NULL,
   NULL),
  -- ... diğer stock kayıtların ...
  ('pstk0113-1111-4111-8111-aaaaaaaa0113',
   'bbbb1002-2222-4222-8222-bbbbbbbb1002',
   'FILL-PVC-125-2025-0003',
   1,
   '2025-04-10 09:30:00.000',
   NULL)
ON DUPLICATE KEY UPDATE
  stock_content = VALUES(stock_content),
  is_used       = VALUES(is_used),
  used_at       = VALUES(used_at),
  order_item_id = VALUES(order_item_id);

COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
