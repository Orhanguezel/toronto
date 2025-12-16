-- =============================================================
-- 022_references_i18n.sql (i18n seeds)
--   NOT: @REF_TORONTO_ID ve @REF_ECOM_ID, 021_references.seeds.sql
--        içinde tanımlanmış olmalıdır.
-- =============================================================

/* ================= SEED: TR ================= */

-- Toronto Ajans (TR)
INSERT INTO `references_i18n`
(id, reference_id, locale, title, slug, summary, content,
 featured_image_alt, meta_title, meta_description, created_at, updated_at)
VALUES
(UUID(), @REF_TORONTO_ID, 'tr',
 'Toronto Ajans', 'toronto-ajans',
 'Yaratıcı hizmetler ve reklam çözümleri.',
 JSON_OBJECT(
   'html',
   '<p>Toronto; ürün, marka ve kampanyalar için yaratıcı dijital çözümler ve web projeleri geliştirir.</p>'
 ),
 'Kapak görseli',
 'Toronto Ajans | Referans',
 'Toronto Ajans için geliştirilen dijital çözümler ve web projeleri.',
 NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
 title              = VALUES(title),
 slug               = VALUES(slug),
 summary            = VALUES(summary),
 content            = VALUES(content),
 featured_image_alt = VALUES(featured_image_alt),
 meta_title         = VALUES(meta_title),
 meta_description   = VALUES(meta_description),
 updated_at         = VALUES(updated_at);

-- E-Ticaret Platformu (TR)
INSERT INTO `references_i18n`
(id, reference_id, locale, title, slug, summary, content,
 featured_image_alt, meta_title, meta_description, created_at, updated_at)
VALUES
(UUID(), @REF_ECOM_ID, 'tr',
 'E-Ticaret Platformu', 'e-ticaret-platformu',
 'Ürün yönetimi, ödeme ve kargo entegrasyonlarını içeren modern e-ticaret altyapısı.',
 JSON_OBJECT(
   'html',
   '<p>Ensotek altyapısı üzerinde geliştirilen e-ticaret platformu; ölçeklenebilir mimari, güvenli ödeme ve esnek ürün yönetimi ile hizmet verir.</p>'
 ),
 'Ürün görseli',
 'E-Ticaret Platformu | Referans',
 'Ölçeklenebilir ve güvenli e-ticaret platformu referans projesi.',
 NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
 title              = VALUES(title),
 slug               = VALUES(slug),
 summary            = VALUES(summary),
 content            = VALUES(content),
 featured_image_alt = VALUES(featured_image_alt),
 meta_title         = VALUES(meta_title),
 meta_description   = VALUES(meta_description),
 updated_at         = VALUES(updated_at);

/* ================= SEED: EN ================= */

-- Toronto Agency (EN)
INSERT INTO `references_i18n`
(id, reference_id, locale, title, slug, summary, content,
 featured_image_alt, meta_title, meta_description, created_at, updated_at)
VALUES
(UUID(), @REF_TORONTO_ID, 'en',
 'Toronto Agency', 'toronto-agency',
 'Creative services and digital solutions.',
 JSON_OBJECT(
   'html',
   '<p>Toronto delivers creative digital solutions and web projects for products, brands and campaigns.</p>'
 ),
 'Cover image',
 'Toronto Agency | Reference',
 'Digital solutions and web projects delivered for Toronto Agency.',
 NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
 title              = VALUES(title),
 slug               = VALUES(slug),
 summary            = VALUES(summary),
 content            = VALUES(content),
 featured_image_alt = VALUES(featured_image_alt),
 meta_title         = VALUES(meta_title),
 meta_description   = VALUES(meta_description),
 updated_at         = VALUES(updated_at);

-- E-commerce Platform (EN)
INSERT INTO `references_i18n`
(id, reference_id, locale, title, slug, summary, content,
 featured_image_alt, meta_title, meta_description, created_at, updated_at)
VALUES
(UUID(), @REF_ECOM_ID, 'en',
 'E-commerce Platform', 'ecommerce-platform',
 'Modern e-commerce infrastructure with product, payment and shipping integrations.',
 JSON_OBJECT(
   'html',
   '<p>A scalable e-commerce platform built on Ensotek infrastructure with secure payments and flexible product management.</p>'
 ),
 'Product image',
 'E-commerce Platform | Reference',
 'Scalable e-commerce platform reference project.',
 NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
 title              = VALUES(title),
 slug               = VALUES(slug),
 summary            = VALUES(summary),
 content            = VALUES(content),
 featured_image_alt = VALUES(featured_image_alt),
 meta_title         = VALUES(meta_title),
 meta_description   = VALUES(meta_description),
 updated_at         = VALUES(updated_at);

/* Eksik EN çevirileri için TR’den kopya (slug TR’den gelir) */
INSERT INTO `references_i18n`
(id, reference_id, locale, title, slug, summary, content,
 featured_image_alt, meta_title, meta_description, created_at, updated_at)
SELECT UUID(), s.reference_id, 'en',
       s.title, s.slug, s.summary, s.content,
       s.featured_image_alt, s.meta_title, s.meta_description,
       NOW(3), NOW(3)
FROM `references_i18n` s
WHERE s.locale = 'tr'
  AND NOT EXISTS (
    SELECT 1
    FROM `references_i18n` t
    WHERE t.reference_id = s.reference_id
      AND t.locale = 'en'
  );
