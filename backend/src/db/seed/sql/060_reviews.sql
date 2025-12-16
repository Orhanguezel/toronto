-- =============================================================
-- FILE: 060_reviews.sql
-- Çok dilli review modülü (generic + custom_pages uyumlu)
-- =============================================================

/* Eski tablolari temizle (varsa) */
DROP TABLE IF EXISTS `review_i18n`;
DROP TABLE IF EXISTS `reviews_i18n`;
DROP TABLE IF EXISTS `reviews`;

-- =============================================================
-- PARENT TABLO: reviews
--  - Hedef (target_type + target_id)
--  - Kullanici bilgisi, rating, aktif/onay, beğeni sayıları
--  - Yorum metni DİL-BAĞIMSIZ değil, i18n tablodan geliyor
-- =============================================================
CREATE TABLE `reviews` (
  `id`              CHAR(36)      NOT NULL,
  `target_type`     VARCHAR(50)   NOT NULL,          -- 'custom_page', 'product', 'service' vs.
  `target_id`       CHAR(36)      NOT NULL,          -- custom_pages.id, products.id, ...

  `name`            VARCHAR(255)  NOT NULL,
  `email`           VARCHAR(255)  NOT NULL,

  `rating`          TINYINT       NOT NULL,          -- 1..5
  `is_active`       TINYINT(1)    NOT NULL DEFAULT 1,
  `is_approved`     TINYINT(1)    NOT NULL DEFAULT 0,
  `display_order`   INT           NOT NULL DEFAULT 0,

  -- Like / dislike sayacı (kümülatif)
  `likes_count`     INT           NOT NULL DEFAULT 0,
  `dislikes_count`  INT           NOT NULL DEFAULT 0,

  -- FE tarafında reaction/like butonu için kullanılan sayaç
  -- (backend SELECT r.helpful_count bekliyor → burada ayrıca tutuluyor)
  `helpful_count`   INT           NOT NULL DEFAULT 0,

  -- Kullanıcının ilk gönderdiği dil
  `submitted_locale` VARCHAR(8)   NOT NULL,

  `created_at`      DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`      DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                         ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),

  KEY `reviews_target_idx`        (`target_type`, `target_id`),
  KEY `reviews_rating_idx`        (`rating`),
  KEY `reviews_active_idx`        (`is_active`),
  KEY `reviews_approved_idx`      (`is_approved`),
  KEY `reviews_display_order_idx` (`display_order`),
  KEY `reviews_created_idx`       (`created_at`),
  KEY `reviews_updated_idx`       (`updated_at`),
  KEY `reviews_helpful_idx`       (`helpful_count`)
  -- NOT: target_id için generic tasarım; custom_pages/product gibi farklı
  -- tablolara bağlanacağı için burada direkt foreign key vermiyoruz.
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- I18N TABLO: review_i18n
--  - Her satır: (review_id + locale) için yorum metni + admin cevabı
--  - Kullanıcı YORUMUNU bir dilde bırakır; admin isterse diğer
--    dillerde i18n kayıtlarını doldurabilir.
-- =============================================================
CREATE TABLE `review_i18n` (
  `id`            CHAR(36)      NOT NULL,
  `review_id`     CHAR(36)      NOT NULL,
  `locale`        VARCHAR(8)    NOT NULL,

  `title`         VARCHAR(255)  DEFAULT NULL,  -- opsiyonel başlık (yorum kartında kullanılabilir)
  `comment`       TEXT          NOT NULL,      -- düz metin veya HTML; FE nasıl istiyorsa
  `admin_reply`   TEXT          DEFAULT NULL,  -- admin'in cevabı (locale'e göre)

  `created_at`    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                                       ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),

  UNIQUE KEY `ux_review_i18n_review_locale` (`review_id`, `locale`),
  KEY `review_i18n_review_idx`  (`review_id`),
  KEY `review_i18n_locale_idx`  (`locale`),

  CONSTRAINT `fk_review_i18n_review`
    FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
