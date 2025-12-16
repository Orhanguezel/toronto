-- =============================================================
-- 024_reference_images_i18n.sql (gallery: reference_images_i18n)
-- =============================================================

-- ================= TABLE =================
CREATE TABLE IF NOT EXISTS `reference_images_i18n` (
  id        CHAR(36)      NOT NULL,
  image_id  CHAR(36)      NOT NULL,
  locale    VARCHAR(10)   NOT NULL,
  alt       VARCHAR(255)  DEFAULT NULL,
  caption   VARCHAR(1000) DEFAULT NULL,

  created_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),
  UNIQUE KEY ux_reference_images_i18n_parent_locale (image_id, locale),
  KEY reference_images_i18n_locale_idx (locale),

  CONSTRAINT fk_reference_images_i18n_parent
    FOREIGN KEY (image_id) REFERENCES reference_images(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================= SEED: TR =================
-- Toronto A (TR)
INSERT INTO reference_images_i18n
(id, image_id, locale, alt, caption, created_at, updated_at)
SELECT
  UUID(),
  @REFIMG_TORONTO_A_ID,
  'tr',
  'Toronto galeri görseli 1',
  NULL,
  NOW(3),
  NOW(3)
WHERE EXISTS (
  SELECT 1 FROM reference_images WHERE id = @REFIMG_TORONTO_A_ID
)
ON DUPLICATE KEY UPDATE
  alt        = VALUES(alt),
  caption    = VALUES(caption),
  updated_at = VALUES(updated_at);

-- Toronto B (TR)
INSERT INTO reference_images_i18n
(id, image_id, locale, alt, caption, created_at, updated_at)
SELECT
  UUID(),
  @REFIMG_TORONTO_B_ID,
  'tr',
  'Toronto galeri görseli 2',
  NULL,
  NOW(3),
  NOW(3)
WHERE EXISTS (
  SELECT 1 FROM reference_images WHERE id = @REFIMG_TORONTO_B_ID
)
ON DUPLICATE KEY UPDATE
  alt        = VALUES(alt),
  caption    = VALUES(caption),
  updated_at = VALUES(updated_at);

-- E-commerce A (TR)
INSERT INTO reference_images_i18n
(id, image_id, locale, alt, caption, created_at, updated_at)
SELECT
  UUID(),
  @REFIMG_ECOM_A_ID,
  'tr',
  'E-ticaret galeri görseli',
  NULL,
  NOW(3),
  NOW(3)
WHERE EXISTS (
  SELECT 1 FROM reference_images WHERE id = @REFIMG_ECOM_A_ID
)
ON DUPLICATE KEY UPDATE
  alt        = VALUES(alt),
  caption    = VALUES(caption),
  updated_at = VALUES(updated_at);

-- ================= SEED: EN =================
-- Toronto A (EN)
INSERT INTO reference_images_i18n
(id, image_id, locale, alt, caption, created_at, updated_at)
SELECT
  UUID(),
  @REFIMG_TORONTO_A_ID,
  'en',
  'Toronto gallery image 1',
  NULL,
  NOW(3),
  NOW(3)
WHERE EXISTS (
  SELECT 1 FROM reference_images WHERE id = @REFIMG_TORONTO_A_ID
)
ON DUPLICATE KEY UPDATE
  alt        = VALUES(alt),
  caption    = VALUES(caption),
  updated_at = VALUES(updated_at);

-- Toronto B (EN)
INSERT INTO reference_images_i18n
(id, image_id, locale, alt, caption, created_at, updated_at)
SELECT
  UUID(),
  @REFIMG_TORONTO_B_ID,
  'en',
  'Toronto gallery image 2',
  NULL,
  NOW(3),
  NOW(3)
WHERE EXISTS (
  SELECT 1 FROM reference_images WHERE id = @REFIMG_TORONTO_B_ID
)
ON DUPLICATE KEY UPDATE
  alt        = VALUES(alt),
  caption    = VALUES(caption),
  updated_at = VALUES(updated_at);

-- E-commerce A (EN)
INSERT INTO reference_images_i18n
(id, image_id, locale, alt, caption, created_at, updated_at)
SELECT
  UUID(),
  @REFIMG_ECOM_A_ID,
  'en',
  'E-commerce gallery image',
  NULL,
  NOW(3),
  NOW(3)
WHERE EXISTS (
  SELECT 1 FROM reference_images WHERE id = @REFIMG_ECOM_A_ID
)
ON DUPLICATE KEY UPDATE
  alt        = VALUES(alt),
  caption    = VALUES(caption),
  updated_at = VALUES(updated_at);

-- Eksik EN kayıtları için TR’den kopya
INSERT INTO reference_images_i18n
(id, image_id, locale, alt, caption, created_at, updated_at)
SELECT
  UUID(),
  s.image_id,
  'en',
  s.alt,
  s.caption,
  NOW(3),
  NOW(3)
FROM reference_images_i18n s
WHERE s.locale = 'tr'
  AND NOT EXISTS (
    SELECT 1
    FROM reference_images_i18n t
    WHERE t.image_id = s.image_id
      AND t.locale    = 'en'
  );
