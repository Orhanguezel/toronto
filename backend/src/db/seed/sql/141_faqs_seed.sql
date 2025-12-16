-- 141_faqs_seed.sql
-- Multilingual FAQs seed (faqs + faqs_i18n)
--  - Şema 140_faqs.sql içinde tanımlı olmalı (DROP/CREATE yok)
--  - Burada sadece INSERT / ON DUPLICATE KEY UPDATE var
--  - TR + EN örnek kayıtlar, ileride yeni locale eklenebilir

SET NAMES utf8mb4;
SET time_zone = '+00:00';

START TRANSACTION;

-- =============================================================
-- SEED: PARENT KAYITLAR (faqs)
-- =============================================================
INSERT INTO `faqs`
(`id`,                                `is_active`, `display_order`, `created_at`,                `updated_at`)
VALUES
('11111111-1111-1111-1111-111111111111', 1, 1, '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
('22222222-2222-2222-2222-222222222222', 1, 2, '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
('33333333-3333-3333-3333-333333333333', 1, 3, '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
('44444444-4444-4444-4444-444444444444', 1, 4, '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
('55555555-5555-5555-5555-555555555555', 1, 5, '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000'),
('66666666-6666-6666-6666-666666666666', 1, 6, '2024-01-01 00:00:00.000', '2024-01-01 00:00:00.000')
ON DUPLICATE KEY UPDATE
  `is_active`     = VALUES(`is_active`),
  `display_order` = VALUES(`display_order`),
  `updated_at`    = VALUES(`updated_at`);

-- =============================================================
-- SEED: I18N KAYITLAR (faqs_i18n) – TR + EN
--  NOT: category string alanı yok; kategori ID bazlı parent’tan gelecek.
-- =============================================================

INSERT INTO `faqs_i18n`
(`id`,
 `faq_id`,
 `locale`,
 `question`,
 `answer`,
 `slug`,
 `created_at`,
 `updated_at`)
VALUES
-- 1) Teslimat / Delivery
('aaaa1111-1111-1111-1111-111111111111',
 '11111111-1111-1111-1111-111111111111',
 'tr',
 'Ürünler ne kadar sürede teslim edilir?',
 'Ödemeniz onaylandıktan sonra ürününüz otomatik olarak anında e-posta adresinize ve üye panelinize teslim edilir. Ortalama teslimat süresi 1-2 dakikadır.',
 'urunler-ne-kadar-surede-teslim-edilir',
 '2024-01-01 00:00:00.000',
 '2024-01-01 00:00:00.000'),

('aaaa1111-1111-1111-1111-222222222222',
 '11111111-1111-1111-1111-111111111111',
 'en',
 'How fast are products delivered?',
 'Once your payment is confirmed, your product is delivered automatically to your e-mail address and customer panel. Average delivery time is 1–2 minutes.',
 'how-fast-are-products-delivered',
 '2024-01-01 00:00:00.000',
 '2024-01-01 00:00:00.000'),

-- 2) Ödeme yöntemleri / Payment methods
('bbbb2222-2222-2222-2222-222222222222',
 '22222222-2222-2222-2222-222222222222',
 'tr',
 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
 'Kredi kartı, banka havalesi, Papara, PayTR, Shopier ve kripto para (Coinbase Commerce) ile ödeme yapabilirsiniz. Tüm ödemeler SSL sertifikası ile güvence altındadır.',
 'hangi-odeme-yontemlerini-kabul-ediyorsunuz',
 '2024-01-01 00:00:00.000',
 '2024-01-01 00:00:00.000'),

('bbbb2222-2222-2222-2222-333333333333',
 '22222222-2222-2222-2222-222222222222',
 'en',
 'Which payment methods do you accept?',
 'You can pay by credit card, bank transfer, Papara, PayTR, Shopier and cryptocurrency (Coinbase Commerce). All payments are protected with SSL encryption.',
 'which-payment-methods-do-you-accept',
 '2024-01-01 00:00:00.000',
 '2024-01-01 00:00:00.000'),

-- 3) Ürün çalışmazsa / Returns & warranty
('cccc3333-3333-3333-3333-333333333333',
 '33333333-3333-3333-3333-333333333333',
 'tr',
 'Ürün çalışmazsa ne olur?',
 'Satın aldığınız ürün çalışmaz veya hatalı ise 7 gün içinde destek ekibimizle iletişime geçerek değişim veya iade talebinde bulunabilirsiniz. Tüm ürünlerimiz garanti kapsamındadır.',
 'urun-calismazsa-ne-olur',
 '2024-01-01 00:00:00.000',
 '2024-01-01 00:00:00.000'),

('cccc3333-3333-3333-3333-444444444444',
 '33333333-3333-3333-3333-333333333333',
 'en',
 'What happens if the product does not work?',
 'If the product you purchased does not work or is faulty, you can contact our support team within 7 days to request a replacement or refund. All our products are covered by warranty.',
 'what-happens-if-the-product-does-not-work',
 '2024-01-01 00:00:00.000',
 '2024-01-01 00:00:00.000'),

-- 4) Toplu alım / Bulk purchase & discounts
('dddd4444-4444-4444-4444-444444444444',
 '44444444-4444-4444-4444-444444444444',
 'tr',
 'Toplu alımlarda indirim var mı?',
 'Evet! 5+ ürün alımlarında %5, 10+ ürün alımlarında %10 indirim otomatik olarak uygulanır. Daha fazla bilgi için müşteri hizmetlerimizle iletişime geçebilirsiniz.',
 'toplu-alimlarda-indirim-var-mi',
 '2024-01-01 00:00:00.000',
 '2024-01-01 00:00:00.000'),

('dddd4444-4444-4444-4444-555555555555',
 '44444444-4444-4444-4444-444444444444',
 'en',
 'Do you offer discounts for bulk purchases?',
 'Yes! We apply a 5% discount for 5+ products and a 10% discount for 10+ products automatically. For larger orders, please contact our sales team.',
 'do-you-offer-discounts-for-bulk-purchases',
 '2024-01-01 00:00:00.000',
 '2024-01-01 00:00:00.000'),

-- 5) Lisans kullanımı / License usage
('eeee5555-5555-5555-5555-555555555555',
 '55555555-5555-5555-5555-555555555555',
 'tr',
 'Lisanslar kaç cihazda kullanılabilir?',
 'Her ürünün kullanım koşulları farklıdır. Ürün detay sayfasında lisans türü ve kaç cihazda kullanılabileceği belirtilmiştir. Tek kullanımlık, çoklu kullanım ve süreli lisanslar mevcuttur.',
 'lisanslar-kac-cihazda-kullanilabilir',
 '2024-01-01 00:00:00.000',
 '2024-01-01 00:00:00.000'),

('eeee5555-5555-5555-5555-666666666666',
 '55555555-5555-5555-5555-555555555555',
 'en',
 'On how many devices can licenses be used?',
 'Each product has its own license terms. On the product detail page you will find the license type and how many devices it can be used on. We offer single-use, multi-use and time-limited licenses.',
 'on-how-many-devices-can-licenses-be-used',
 '2024-01-01 00:00:00.000',
 '2024-01-01 00:00:00.000'),

-- 6) Destek kanalları / Support channels
('ffff6666-6666-6666-6666-666666666666',
 '66666666-6666-6666-6666-666666666666',
 'tr',
 'Müşteri desteği nasıl alırım?',
 '7/24 canlı destek, e-posta, WhatsApp ve Telegram üzerinden bizimle iletişime geçebilirsiniz. Üye panelinizden destek talebi oluşturabilir veya SSS bölümünü inceleyebilirsiniz.',
 'musteri-destegi-nasil-alirim',
 '2024-01-01 00:00:00.000',
 '2024-01-01 00:00:00.000'),

('ffff6666-6666-6666-6666-777777777777',
 '66666666-6666-6666-6666-666666666666',
 'en',
 'How can I get customer support?',
 'You can reach us via 24/7 live chat, e-mail, WhatsApp or Telegram. You can also create a support ticket from your customer panel or check the FAQ section.',
 'how-can-i-get-customer-support',
 '2024-01-01 00:00:00.000',
 '2024-01-01 00:00:00.000')
ON DUPLICATE KEY UPDATE
  `question`   = VALUES(`question`),
  `answer`     = VALUES(`answer`),
  `slug`       = VALUES(`slug`),
  `updated_at` = VALUES(`updated_at`);

COMMIT;
