-- =============================================================
-- 021_storage_assets_i18n.sql  (storage_assets_i18n)
-- =============================================================

/* ================= TABLE ================= */
CREATE TABLE IF NOT EXISTS `storage_assets_i18n` (
  id          CHAR(36)     NOT NULL,
  asset_id    CHAR(36)     NOT NULL,
  locale      VARCHAR(10)  NOT NULL,

  title       VARCHAR(255) DEFAULT NULL,
  alt         VARCHAR(255) DEFAULT NULL,
  caption     VARCHAR(1000) DEFAULT NULL,
  description TEXT         DEFAULT NULL,

  created_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),
  UNIQUE KEY ux_storage_assets_i18n_parent_locale (asset_id, locale),
  KEY idx_storage_assets_i18n_locale (locale),
  CONSTRAINT fk_storage_assets_i18n_asset
    FOREIGN KEY (asset_id) REFERENCES storage_assets(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* ================= SEED ================= */

-- TR
INSERT INTO storage_assets_i18n
(id, asset_id, locale, title, alt, caption, description, created_at, updated_at)
VALUES
(UUID(), @ASSET_HERO_ID, 'tr', 'Hero', 'Hero', 'Featured image', NULL, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE title=VALUES(title), alt=VALUES(alt), caption=VALUES(caption), updated_at=VALUES(updated_at);

INSERT INTO storage_assets_i18n VALUES
(UUID(), @ASSET_REF1_ID, 'tr', 'Ref1', 'Ref1', 'Featured image', NULL, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE title=VALUES(title), alt=VALUES(alt), caption=VALUES(caption), updated_at=VALUES(updated_at);

INSERT INTO storage_assets_i18n VALUES
(UUID(), @ASSET_REF2_ID, 'tr', 'Ref2', 'Ref2', 'Featured image', NULL, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE title=VALUES(title), alt=VALUES(alt), caption=VALUES(caption), updated_at=VALUES(updated_at);

INSERT INTO storage_assets_i18n VALUES
(UUID(), @ASSET_G1A_ID, 'tr', 'Galeri1A', 'Galeri 1A', 'Gallery image', NULL, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE title=VALUES(title), alt=VALUES(alt), caption=VALUES(caption), updated_at=VALUES(updated_at);

INSERT INTO storage_assets_i18n VALUES
(UUID(), @ASSET_G1B_ID, 'tr', 'Galeri1B', 'Galeri 1B', 'Gallery image', NULL, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE title=VALUES(title), alt=VALUES(alt), caption=VALUES(caption), updated_at=VALUES(updated_at);

INSERT INTO storage_assets_i18n VALUES
(UUID(), @ASSET_G2A_ID, 'tr', 'Galeri2A', 'Galeri 2A', 'Gallery image', NULL, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE title=VALUES(title), alt=VALUES(alt), caption=VALUES(caption), updated_at=VALUES(updated_at);

-- EN
INSERT INTO storage_assets_i18n VALUES
(UUID(), @ASSET_HERO_ID, 'en', 'Hero', 'Hero', 'Featured image', NULL, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE title=VALUES(title), alt=VALUES(alt), caption=VALUES(caption), updated_at=VALUES(updated_at);

INSERT INTO storage_assets_i18n VALUES
(UUID(), @ASSET_REF1_ID, 'en', 'Ref1', 'Ref1', 'Featured image', NULL, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE title=VALUES(title), alt=VALUES(alt), caption=VALUES(caption), updated_at=VALUES(updated_at);

INSERT INTO storage_assets_i18n VALUES
(UUID(), @ASSET_REF2_ID, 'en', 'Ref2', 'Ref2', 'Featured image', NULL, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE title=VALUES(title), alt=VALUES(alt), caption=VALUES(caption), updated_at=VALUES(updated_at);

INSERT INTO storage_assets_i18n VALUES
(UUID(), @ASSET_G1A_ID, 'en', 'Gallery1A', 'Gallery 1A', 'Gallery image', NULL, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE title=VALUES(title), alt=VALUES(alt), caption=VALUES(caption), updated_at=VALUES(updated_at);

INSERT INTO storage_assets_i18n VALUES
(UUID(), @ASSET_G1B_ID, 'en', 'Gallery1B', 'Gallery 1B', 'Gallery image', NULL, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE title=VALUES(title), alt=VALUES(alt), caption=VALUES(caption), updated_at=VALUES(updated_at);

INSERT INTO storage_assets_i18n VALUES
(UUID(), @ASSET_G2A_ID, 'en', 'Gallery2A', 'Gallery 2A', 'Gallery image', NULL, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE title=VALUES(title), alt=VALUES(alt), caption=VALUES(caption), updated_at=VALUES(updated_at);

/* Eksik EN kayıtları için TR'den kopya (genelleme) */
INSERT INTO storage_assets_i18n (id, asset_id, locale, title, alt, caption, description, created_at, updated_at)
SELECT UUID(), s.asset_id, 'en', s.title, s.alt, s.caption, s.description, NOW(3), NOW(3)
FROM storage_assets_i18n s
WHERE s.locale='tr'
  AND NOT EXISTS (
    SELECT 1 FROM storage_assets_i18n t WHERE t.asset_id=s.asset_id AND t.locale='en'
  );
