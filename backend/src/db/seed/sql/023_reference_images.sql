-- =============================================================
-- 023_reference_images.sql (gallery: reference_images)
-- =============================================================

/* ================= CLEANUP ================= */
DROP TABLE IF EXISTS `reference_images_i18n`;
DROP TABLE IF EXISTS `reference_images`;

/* ================= TABLE ================= */
CREATE TABLE `reference_images` (
  id            CHAR(36)     NOT NULL,
  reference_id  CHAR(36)     NOT NULL,
  asset_id      CHAR(36)     NOT NULL,
  image_url     VARCHAR(500) DEFAULT NULL,

  display_order INT          NOT NULL DEFAULT 0,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,

  created_at    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),
  KEY reference_images_reference_idx (reference_id),
  KEY reference_images_asset_idx     (asset_id),
  KEY reference_images_active_idx    (is_active),
  KEY reference_images_order_idx     (display_order),

  CONSTRAINT fk_reference_images_parent
    FOREIGN KEY (reference_id) REFERENCES `references`(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* ================= SEED: GALLERY ================= */
-- NOT:
--   @REF_TORONTO_ID, @REF_ECOM_ID,
--   @ASSET_G1A_ID, @ASSET_G1B_ID, @ASSET_G2A_ID
-- bu değişkenler asset ve reference seedlerinde tanımlı olmalı.

-- ----------------- Toronto: image A -----------------
SET @REFIMG_TORONTO_A_ID := (
  SELECT id
  FROM reference_images
  WHERE reference_id = @REF_TORONTO_ID
    AND asset_id     = @ASSET_G1A_ID
  LIMIT 1
);
SET @REFIMG_TORONTO_A_ID := COALESCE(@REFIMG_TORONTO_A_ID, UUID());

INSERT INTO reference_images
(id, reference_id, asset_id, image_url, display_order, is_active, created_at, updated_at)
SELECT
  @REFIMG_TORONTO_A_ID,
  @REF_TORONTO_ID,
  @ASSET_G1A_ID,
  NULL,
  1,
  1,
  NOW(3),
  NOW(3)
WHERE @REF_TORONTO_ID IS NOT NULL
  AND @ASSET_G1A_ID IS NOT NULL
ON DUPLICATE KEY UPDATE
  asset_id      = VALUES(asset_id),
  display_order = VALUES(display_order),
  is_active     = VALUES(is_active),
  updated_at    = VALUES(updated_at);

-- ----------------- Toronto: image B -----------------
SET @REFIMG_TORONTO_B_ID := (
  SELECT id
  FROM reference_images
  WHERE reference_id = @REF_TORONTO_ID
    AND asset_id     = @ASSET_G1B_ID
  LIMIT 1
);
SET @REFIMG_TORONTO_B_ID := COALESCE(@REFIMG_TORONTO_B_ID, UUID());

INSERT INTO reference_images
(id, reference_id, asset_id, image_url, display_order, is_active, created_at, updated_at)
SELECT
  @REFIMG_TORONTO_B_ID,
  @REF_TORONTO_ID,
  @ASSET_G1B_ID,
  NULL,
  2,
  1,
  NOW(3),
  NOW(3)
WHERE @REF_TORONTO_ID IS NOT NULL
  AND @ASSET_G1B_ID IS NOT NULL
ON DUPLICATE KEY UPDATE
  asset_id      = VALUES(asset_id),
  display_order = VALUES(display_order),
  is_active     = VALUES(is_active),
  updated_at    = VALUES(updated_at);

-- ----------------- E-commerce: image A -----------------
SET @REFIMG_ECOM_A_ID := (
  SELECT id
  FROM reference_images
  WHERE reference_id = @REF_ECOM_ID
    AND asset_id     = @ASSET_G2A_ID
  LIMIT 1
);
SET @REFIMG_ECOM_A_ID := COALESCE(@REFIMG_ECOM_A_ID, UUID());

INSERT INTO reference_images
(id, reference_id, asset_id, image_url, display_order, is_active, created_at, updated_at)
SELECT
  @REFIMG_ECOM_A_ID,
  @REF_ECOM_ID,
  @ASSET_G2A_ID,
  NULL,
  1,
  1,
  NOW(3),
  NOW(3)
WHERE @REF_ECOM_ID IS NOT NULL
  AND @ASSET_G2A_ID IS NOT NULL
ON DUPLICATE KEY UPDATE
  asset_id      = VALUES(asset_id),
  display_order = VALUES(display_order),
  is_active     = VALUES(is_active),
  updated_at    = VALUES(updated_at);
