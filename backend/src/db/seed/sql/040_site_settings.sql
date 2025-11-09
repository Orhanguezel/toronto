-- =============================================================
-- 040_site_settings.sql  (çok dilli site ayarları)
-- =============================================================

/* =============================================================
   TABLO
   id (CHAR(36)), key (VARCHAR(100)), locale (VARCHAR(8)), value (TEXT JSON),
   created_at/updated_at, UNIQUE(key,locale)
   ============================================================= */
CREATE TABLE IF NOT EXISTS site_settings (
  id          CHAR(36)      NOT NULL,
  `key`       VARCHAR(100)  NOT NULL,
  locale      VARCHAR(8)    NOT NULL,
  `value`     TEXT          NOT NULL,
  created_at  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY site_settings_key_locale_uq (`key`, locale),
  KEY site_settings_key_idx (`key`),
  KEY site_settings_locale_idx (locale)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* =============================================================
   SEED: TR (default) 
   ============================================================= */
INSERT INTO site_settings (id, `key`, locale, `value`, created_at, updated_at) VALUES
(UUID(), 'contact_info', 'tr',
 JSON_OBJECT(
   'phones', JSON_ARRAY('+49 152 0000000'),
   'email',  'info@ornek.com',
   'address','Musterstr. 10, 10115 Berlin, Almanya',
   'whatsappNumber','+49 152 0000000'
 ), NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `value`=VALUES(`value`), updated_at=VALUES(updated_at);

INSERT INTO site_settings (id, `key`, locale, `value`, created_at, updated_at) VALUES
(UUID(), 'socials', 'tr',
 JSON_OBJECT(
   'instagram','https://instagram.com/ornek',
   'facebook','https://facebook.com/ornek',
   'youtube','https://youtube.com/@ornek',
   'linkedin','https://linkedin.com/company/ornek',
   'x','https://x.com/ornek'
 ), NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `value`=VALUES(`value`), updated_at=VALUES(updated_at);

/* =============================================================
   SEED: EN
   ============================================================= */
INSERT INTO site_settings (id, `key`, locale, `value`, created_at, updated_at) VALUES
(UUID(), 'contact_info', 'en',
 JSON_OBJECT(
   'phones', JSON_ARRAY('+49 152 0000000'),
   'email',  'hello@example.com',
   'address','Musterstr. 10, 10115 Berlin, Germany',
   'whatsappNumber','+49 152 0000000'
 ), NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `value`=VALUES(`value`), updated_at=VALUES(updated_at);

INSERT INTO site_settings (id, `key`, locale, `value`, created_at, updated_at) VALUES
(UUID(), 'socials', 'en',
 JSON_OBJECT(
   'instagram','https://instagram.com/example',
   'facebook','https://facebook.com/example',
   'youtube','https://youtube.com/@example',
   'linkedin','https://linkedin.com/company/example',
   'x','https://x.com/example'
 ), NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `value`=VALUES(`value`), updated_at=VALUES(updated_at);


/* =============================================================
   OTOMATİK KOPYA: TR’de olup EN’de eksik kalanlar EN’e kopyalansın
   (başlangıçta tek dil girildiğinde diğer dile otomatik çoğaltma)
   ============================================================= */
INSERT INTO site_settings (id, `key`, locale, `value`, created_at, updated_at)
SELECT UUID(), s.`key`, 'en', s.`value`, NOW(3), NOW(3)
FROM site_settings s
WHERE s.locale = 'tr'
  AND NOT EXISTS (
    SELECT 1 FROM site_settings t
    WHERE t.`key` = s.`key` AND t.locale = 'en'
  );
