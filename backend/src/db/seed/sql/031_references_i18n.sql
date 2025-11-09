-- =============================================================
-- 031_references_i18n.sql (only seeds)
-- =============================================================

/* ================= SEED: TR ================= */

-- Toronto Ajans (TR)
INSERT INTO `references_i18n`
(id, reference_id, locale, title, slug, summary, content, featured_image_alt, meta_title, meta_description, created_at, updated_at)
VALUES
(UUID(), @REF_TORONTO_ID, 'tr',
 'Toronto Ajans', 'toronto-ajans',
 'Yaratıcı hizmetler ve reklam çözümleri.',
 JSON_OBJECT('html','<p>Toronto; ürün, marka ve kampanyalar için yaratıcı çözümler sunar.</p>'),
 'Kapak görseli', 'Toronto Ajans', 'Yaratıcı hizmetler ve reklam çözümleri.',
 NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
 title=VALUES(title), slug=VALUES(slug), summary=VALUES(summary),
 content=VALUES(content), featured_image_alt=VALUES(featured_image_alt),
 meta_title=VALUES(meta_title), meta_description=VALUES(meta_description),
 updated_at=VALUES(updated_at);

-- E-Ticaret Platformu (TR)
INSERT INTO `references_i18n` VALUES
(UUID(), @REF_ECOM_ID, 'tr',
 'E-Ticaret Platformu', 'e-ticaret-platformu',
 'Ürün yönetimi, ödeme ve kargo entegrasyonları.',
 JSON_OBJECT('html','<p>Ölçeklenebilir altyapı ile hızlı e-ticaret.</p>'),
 'Ürün görseli', 'E-Ticaret Platformu', 'Ölçeklenebilir e-ticaret altyapısı.',
 NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
 title=VALUES(title), slug=VALUES(slug), summary=VALUES(summary),
 content=VALUES(content), featured_image_alt=VALUES(featured_image_alt),
 meta_title=VALUES(meta_title), meta_description=VALUES(meta_description),
 updated_at=VALUES(updated_at);

/* ================= SEED: EN ================= */

-- Toronto Agency (EN)
INSERT INTO `references_i18n` VALUES
(UUID(), @REF_TORONTO_ID, 'en',
 'Toronto Agency', 'toronto-agency',
 'Creative services and ad solutions.',
 JSON_OBJECT('html','<p>Toronto delivers creative solutions for products, brands and campaigns.</p>'),
 'Cover image', 'Toronto Agency', 'Creative services and ad solutions.',
 NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
 title=VALUES(title), slug=VALUES(slug), summary=VALUES(summary),
 content=VALUES(content), featured_image_alt=VALUES(featured_image_alt),
 meta_title=VALUES(meta_title), meta_description=VALUES(meta_description),
 updated_at=VALUES(updated_at);

-- E-commerce Platform (EN)
INSERT INTO `references_i18n` VALUES
(UUID(), @REF_ECOM_ID, 'en',
 'E-commerce Platform', 'ecommerce-platform',
 'Product management, payments and shipments.',
 JSON_OBJECT('html','<p>Fast e-commerce on scalable infra.</p>'),
 'Product image', 'E-commerce Platform', 'Scalable e-commerce platform.',
 NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
 title=VALUES(title), slug=VALUES(slug), summary=VALUES(summary),
 content=VALUES(content), featured_image_alt=VALUES(featured_image_alt),
 meta_title=VALUES(meta_title), meta_description=VALUES(meta_description),
 updated_at=VALUES(updated_at);

/* Eksik EN çevirileri için TR’den kopya (slug TR’den gelir) */
INSERT INTO `references_i18n`
(id, reference_id, locale, title, slug, summary, content, featured_image_alt, meta_title, meta_description, created_at, updated_at)
SELECT UUID(), s.reference_id, 'en', s.title, s.slug, s.summary, s.content, s.featured_image_alt, s.meta_title, s.meta_description, NOW(3), NOW(3)
FROM `references_i18n` s
WHERE s.locale='tr'
  AND NOT EXISTS (
    SELECT 1 FROM `references_i18n` t WHERE t.reference_id=s.reference_id AND t.locale='en'
  );
