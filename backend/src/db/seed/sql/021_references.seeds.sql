-- =============================================================
-- 021_references.seeds.sql  (parent seeds)
-- =============================================================

-- ================= SEED: Parent satırlar =================
-- 011_catalog_categories.sql içindeki IDs:
--  aaaa5002 = ENERJİ SANTRALLERİ
--  aaaa5003 = PETROKİMYA & KİMYA TESİSLERİ
--  aaaa5004 = ÇİMENTO & MADENCİLİK
--  aaaa5005 = GIDA & İÇECEK TESİSLERİ
--  aaaa5006 = ÇELİK & METAL SANAYİ
--  aaaa5007 = OTOMOTİV & YAN SANAYİ
--  aaaa5008 = AVM & TİCARİ BİNALAR
--  aaaa5009 = VERİ MERKEZİ & HASTANE
--  aaaa5010 = DİĞER PROJELER

-- ID değişkenleri (022/023/024 içinde de kullanılır)
SET @REF_ENERGY_PP1_ID     := UUID();
SET @REF_ENERGY_PP2_ID     := UUID();

SET @REF_PETRO_1_ID        := UUID();
SET @REF_PETRO_2_ID        := UUID();

SET @REF_CEMENT_1_ID       := UUID();
SET @REF_CEMENT_2_ID       := UUID();

SET @REF_FOOD_1_ID         := UUID();
SET @REF_FOOD_2_ID         := UUID();

SET @REF_STEEL_1_ID        := UUID();
SET @REF_STEEL_2_ID        := UUID();

SET @REF_AUTO_1_ID         := UUID();
SET @REF_AUTO_2_ID         := UUID();

SET @REF_TORONTO_ID        := UUID();  -- AVM & Ticari Binalar (Toronto Ajans)
SET @REF_AVM_2_ID          := UUID();  -- AVM için ikinci referans

SET @REF_DC_1_ID           := UUID();  -- Veri merkezi & hastane
SET @REF_DC_2_ID           := UUID();

SET @REF_ECOM_ID           := UUID();  -- E-ticaret platformu
SET @REF_OTHER_2_ID        := UUID();  -- Diğer projeler ikinci referans

INSERT INTO `references`
(
  id,
  is_published,
  is_featured,
  display_order,
  featured_image,
  featured_image_asset_id,
  website_url,
  category_id,
  sub_category_id,
  created_at,
  updated_at
)
VALUES
  -- ENERJİ SANTRALLERİ
  (@REF_ENERGY_PP1_ID, 1, 1, 10,
   NULL, NULL,
   'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&h=600&q=80',
   'aaaa5002-1111-4111-8111-aaaaaaaa5002',
   NULL,
   NOW(3), NOW(3)),
  (@REF_ENERGY_PP2_ID, 1, 0, 20,
   NULL, NULL,
   'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&h=600&q=80',
   'aaaa5002-1111-4111-8111-aaaaaaaa5002',
   NULL,
   NOW(3), NOW(3)),

  -- PETROKİMYA & KİMYA TESİSLERİ
  (@REF_PETRO_1_ID, 1, 1, 30,
   NULL, NULL,
   'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&h=600&q=80',
   'aaaa5003-1111-4111-8111-aaaaaaaa5003',
   NULL,
   NOW(3), NOW(3)),
  (@REF_PETRO_2_ID, 1, 0, 40,
   NULL, NULL,
   'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&h=600&q=80',
   'aaaa5003-1111-4111-8111-aaaaaaaa5003',
   NULL,
   NOW(3), NOW(3)),

  -- ÇİMENTO & MADENCİLİK
  (@REF_CEMENT_1_ID, 1, 1, 50,
   NULL, NULL,
   'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&h=600&q=80',
   'aaaa5004-1111-4111-8111-aaaaaaaa5004',
   NULL,
   NOW(3), NOW(3)),
  (@REF_CEMENT_2_ID, 1, 0, 60,
   NULL, NULL,
   'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&h=600&q=80',
   'aaaa5004-1111-4111-8111-aaaaaaaa5004',
   NULL,
   NOW(3), NOW(3)),

  -- GIDA & İÇECEK TESİSLERİ
  (@REF_FOOD_1_ID, 1, 1, 70,
   NULL, NULL,
   'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&h=600&q=80',
   'aaaa5005-1111-4111-8111-aaaaaaaa5005',
   NULL,
   NOW(3), NOW(3)),
  (@REF_FOOD_2_ID, 1, 0, 80,
   NULL, NULL,
   'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&h=600&q=80',
   'aaaa5005-1111-4111-8111-aaaaaaaa5005',
   NULL,
   NOW(3), NOW(3)),

  -- ÇELİK & METAL SANAYİ
  (@REF_STEEL_1_ID, 1, 1, 90,
   NULL, NULL,
   'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&h=600&q=80',
   'aaaa5006-1111-4111-8111-aaaaaaaa5006',
   NULL,
   NOW(3), NOW(3)),
  (@REF_STEEL_2_ID, 1, 0, 100,
   NULL, NULL,
   'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&h=600&q=80',
   'aaaa5006-1111-4111-8111-aaaaaaaa5006',
   NULL,
   NOW(3), NOW(3)),

  -- OTOMOTİV & YAN SANAYİ
  (@REF_AUTO_1_ID, 1, 1, 110,
   NULL, NULL,
   'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&h=600&q=80',
   'aaaa5007-1111-4111-8111-aaaaaaaa5007',
   NULL,
   NOW(3), NOW(3)),
  (@REF_AUTO_2_ID, 1, 0, 120,
   NULL, NULL,
   'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&h=600&q=80',
   'aaaa5007-1111-4111-8111-aaaaaaaa5007',
   NULL,
   NOW(3), NOW(3)),

  -- AVM & TİCARİ BİNALAR
  (@REF_TORONTO_ID, 1, 1, 130,
   NULL, @ASSET_HERO_ID,
   'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&h=600&q=80',
   'aaaa5008-1111-4111-8111-aaaaaaaa5008',
   NULL,
   NOW(3), NOW(3)),
  (@REF_AVM_2_ID, 1, 0, 140,
   NULL, NULL,
   'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&h=600&q=80',
   'aaaa5008-1111-4111-8111-aaaaaaaa5008',
   NULL,
   NOW(3), NOW(3)),

  -- VERİ MERKEZİ & HASTANE
  (@REF_DC_1_ID, 1, 1, 150,
   NULL, NULL,
   'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&h=600&q=80',
   'aaaa5009-1111-4111-8111-aaaaaaaa5009',
   NULL,
   NOW(3), NOW(3)),
  (@REF_DC_2_ID, 1, 0, 160,
   NULL, NULL,
   'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&h=600&q=80',
   'aaaa5009-1111-4111-8111-aaaaaaaa5009',
   NULL,
   NOW(3), NOW(3)),

  -- DİĞER PROJELER
  (@REF_ECOM_ID, 1, 1, 170,
   NULL, @ASSET_REF1_ID,
   'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&h=600&q=80',
   'aaaa5010-1111-4111-8111-aaaaaaaa5010',
   NULL,
   NOW(3), NOW(3)),
  (@REF_OTHER_2_ID, 1, 0, 180,
   NULL, NULL,
   'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=1200&h=600&q=80',
   'aaaa5010-1111-4111-8111-aaaaaaaa5010',
   NULL,
   NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  is_published            = VALUES(is_published),
  is_featured             = VALUES(is_featured),
  display_order           = VALUES(display_order),
  featured_image          = VALUES(featured_image),
  featured_image_asset_id = VALUES(featured_image_asset_id),
  website_url             = VALUES(website_url),
  category_id             = VALUES(category_id),
  sub_category_id         = VALUES(sub_category_id),
  updated_at              = VALUES(updated_at);
