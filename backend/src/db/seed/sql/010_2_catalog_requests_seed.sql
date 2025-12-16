-- =============================================================
-- 010_2_catalog_requests_seed.sql
-- Seed: catalog_requests
-- =============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO `catalog_requests` (
  `id`,
  `status`,
  `locale`,
  `country_code`,
  `customer_name`,
  `company_name`,
  `email`,
  `phone`,
  `message`,
  `consent_marketing`,
  `consent_terms`,
  `admin_notes`,
  `email_sent_at`,
  `created_at`,
  `updated_at`
) VALUES
(
  '2a0e9d9a-3a3a-4c8e-9af3-2d6f86b0a901',
  'new',
  'tr',
  'TR',
  'Ahmet Yılmaz',
  'Yılmaz Makina',
  'ahmet.yilmaz@example.com',
  '+90 532 111 22 33',
  'Merhaba, soğutma kulesi kataloğunu paylaşabilir misiniz? Proje için teknik döküman da lazım.',
  1,
  1,
  NULL,
  NULL,
  '2025-12-10 09:15:00.000',
  '2025-12-10 09:15:00.000'
),
(
  '5c1f4c2e-6ed5-4e10-8e5d-4e1b52c7b7b2',
  'sent',
  'en',
  'DE',
  'John Carter',
  'Carter HVAC GmbH',
  'john.carter@example.com',
  '+49 170 123 45 67',
  'Please send the latest product catalog and price list.',
  0,
  1,
  'Sent catalog PDF link via template catalog_sent_customer.',
  '2025-12-09 14:05:12.123',
  '2025-12-09 13:58:00.000',
  '2025-12-09 14:05:12.123'
),
(
  '8d3e7b6a-9f26-4df2-8b8c-5b7c9e2b3c13',
  'failed',
  'de',
  'DE',
  'Max Mustermann',
  'Mustermann Industrie',
  'max.mustermann@example.com',
  '+49 152 222 33 44',
  'Bitte senden Sie mir den aktuellen Katalog.',
  0,
  1,
  'SMTP timeout on send. Needs resend.',
  NULL,
  '2025-12-08 11:22:00.000',
  '2025-12-08 11:30:00.000'
),
(
  'c6e1e9d4-2b7a-4b25-9a67-7a4d9e1b0d44',
  'archived',
  'tr',
  'TR',
  'Ayşe Demir',
  NULL,
  'ayse.demir@example.com',
  NULL,
  'Katalog talebi artık gerekmiyor, teşekkürler.',
  0,
  1,
  'User requested no longer needed. Archived.',
  '2025-11-25 10:10:00.000',
  '2025-11-25 09:55:00.000',
  '2025-12-01 08:00:00.000'
)
ON DUPLICATE KEY UPDATE
  `status`            = VALUES(`status`),
  `locale`            = VALUES(`locale`),
  `country_code`      = VALUES(`country_code`),
  `customer_name`     = VALUES(`customer_name`),
  `company_name`      = VALUES(`company_name`),
  `email`             = VALUES(`email`),
  `phone`             = VALUES(`phone`),
  `message`           = VALUES(`message`),
  `consent_marketing` = VALUES(`consent_marketing`),
  `consent_terms`     = VALUES(`consent_terms`),
  `admin_notes`       = VALUES(`admin_notes`),
  `email_sent_at`     = VALUES(`email_sent_at`),
  `updated_at`        = CURRENT_TIMESTAMP(3);

SET FOREIGN_KEY_CHECKS = 1;
