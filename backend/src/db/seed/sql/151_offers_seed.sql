-- 151_offers_seed.sql
SET NAMES utf8mb4;
SET time_zone = '+00:00';

START TRANSACTION;

INSERT INTO `offers`
(
  `id`, `offer_no`, `status`, `locale`, `country_code`,
  `customer_name`, `company_name`, `email`, `phone`,
  `subject`, `message`, `product_id`, `form_data`,
  `consent_marketing`, `consent_terms`,
  `currency`, `net_total`, `vat_rate`, `vat_total`, `shipping_total`, `gross_total`,
  `valid_until`, `admin_notes`, `pdf_url`, `pdf_asset_id`,
  `email_sent_at`, `created_at`, `updated_at`
)
VALUES

-- 1) Public Form (TR)
('aaaa0000-0000-0000-0000-000000000001',
 NULL, 'new', 'tr', 'TR',
 'Ahmet Yılmaz', 'Yılmaz Soğutma Sistemleri', 'ahmet.yilmaz@example.com', '+90 532 000 00 01',
 'Endüstriyel su soğutma kulesi teklifi',
 'Mevcut tesisteki 500 m³/h debiye uygun, kapalı devre kule için teklif rica ediyoruz.',
 NULL,
 '{"design_flow_m3h":500,"inlet_temp_c":35,"outlet_temp_c":28,"wet_bulb_c":24,"notes":"Mevcut pompa korunacak"}',
 1, 1, 'EUR',
 NULL, NULL, NULL, NULL, NULL,
 NULL, NULL, NULL, NULL,
 NULL,
 '2024-01-10 10:00:00.000', '2024-01-10 10:00:00.000'),

-- 2) Public form (EN)
('bbbb0000-0000-0000-0000-000000000002',
 NULL, 'new', 'en', 'DE',
 'Michael Fischer', 'Fischer Industrie GmbH', 'm.fischer@example.de', '+49 170 0000002',
 'Cooling tower quotation request',
 'We are planning to replace our existing cooling tower and need a quotation including installation.',
 NULL,
 '{"design_flow_m3h":250,"inlet_temp_c":32,"outlet_temp_c":27,"wet_bulb_c":23,"notes":"Outdoor installation, noise level is important"}',
 0, 1, 'EUR',
 NULL, NULL, NULL, NULL, NULL,
 NULL, NULL, NULL, NULL,
 NULL,
 '2024-01-11 09:15:00.000', '2024-01-11 09:15:00.000'),

-- 3) Admin – quoted
('cccc0000-0000-0000-0000-000000000003',
 'ENS-2024-0001', 'quoted', 'tr', 'TR',
 'Mehmet Demir', 'Demir Makina', 'mehmet.demir@example.com', '+90 532 000 00 03',
 'Açık devre FRP kule teklifi',
 'Teknik detaylar alınmış, fiyat çalışması yapılmıştır.',
 NULL,
 '{"design_flow_m3h":400,"inlet_temp_c":35,"outlet_temp_c":27,"wet_bulb_c":24,"options":["sound_attenuators","ladder_with_cage"]}',
 1, 1, 'EUR',
 18500.00, 19.00, 3515.00, NULL, 22015.00,
 '2024-02-15 00:00:00.000',
 'Teslim süresi 8-10 hafta.',
 NULL, NULL,
 NULL,
 '2024-01-12 14:30:00.000', '2024-01-12 14:30:00.000'),

-- 4) Sent (PDF hazır)
('dddd0000-0000-0000-0000-000000000004',
 'ENS-2024-0002', 'sent', 'en', 'DE',
 'Thomas Müller', 'Müller Kältetechnik GmbH', 't.mueller@example.com', '+49 170 0000004',
 'Closed circuit cooling tower quotation',
 'Final offer prepared and sent to customer.',
 NULL,
 '{"design_flow_m3h":300,"inlet_temp_c":30,"outlet_temp_c":25,"wet_bulb_c":21,"options":["winter_kit","bypass_line"]}',
 0, 1, 'EUR',
 23600.00, 19.00, 4484.00, NULL, 28084.00,
 '2024-03-01 00:00:00.000',
 'Delivery time 10-12 weeks.',
 '/uploads/offers/ENS-2024-0002.pdf',
 '99999999-9999-9999-9999-999999999999',
 '2024-01-15 16:45:00.000',
 '2024-01-13 09:00:00.000', '2024-01-15 16:45:00.000')

ON DUPLICATE KEY UPDATE
  `offer_no`         = VALUES(`offer_no`),
  `status`           = VALUES(`status`),
  `locale`           = VALUES(`locale`),
  `country_code`     = VALUES(`country_code`),
  `customer_name`    = VALUES(`customer_name`),
  `company_name`     = VALUES(`company_name`),
  `email`            = VALUES(`email`),
  `phone`            = VALUES(`phone`),
  `subject`          = VALUES(`subject`),
  `message`          = VALUES(`message`),
  `product_id`       = VALUES(`product_id`),
  `form_data`        = VALUES(`form_data`),
  `consent_marketing`= VALUES(`consent_marketing`),
  `consent_terms`    = VALUES(`consent_terms`),
  `currency`         = VALUES(`currency`),
  `net_total`        = VALUES(`net_total`),
  `vat_rate`         = VALUES(`vat_rate`),
  `vat_total`        = VALUES(`vat_total`),
  `shipping_total`   = VALUES(`shipping_total`),
  `gross_total`      = VALUES(`gross_total`),
  `valid_until`      = VALUES(`valid_until`),
  `admin_notes`      = VALUES(`admin_notes`),
  `pdf_url`          = VALUES(`pdf_url`),
  `pdf_asset_id`     = VALUES(`pdf_asset_id`),
  `email_sent_at`    = VALUES(`email_sent_at`),
  `updated_at`       = VALUES(`updated_at`);

COMMIT;
