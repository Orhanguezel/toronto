-- =============================================================
-- 049-8_site_settings_ui_offer.sql
-- Ensotek – UI Offer (site_settings.ui_offer)
--   - Teklif sayfası (pages/offer/index.tsx)
--   - OfferPage container (src/components/containers/offer/OfferPage.tsx)
--   - OfferPublicForm (src/components/public/offer/OfferPublicForm.tsx)
--   - OfferSection (src/components/containers/offer/OfferSection.tsx)
--   - ServiceCta (src/components/containers/service/ServiceCta.tsx)
-- =============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- -------------------------------------------------------------
-- TR
-- -------------------------------------------------------------
INSERT INTO site_settings (id, `key`, locale, `value`, created_at, updated_at)
VALUES
(
  UUID(),
  'ui_offer',
  'tr',
  JSON_OBJECT(
    -- SAYFA BAŞLIĞI (src/pages/offer/index.tsx)
    'ui_offer_page_title',           'Teklif Talep Formu',

    -- OFFER PAGE CONTAINER (src/components/containers/offer/OfferPage.tsx)
    'ui_offer_heading_general',      'Teklif Talep Formu',
    'ui_offer_subtitle',
      'İhtiyacınıza özel soğutma çözümleri ve teknik danışmanlık.',
    'ui_offer_description',
      'Formu doldurun, satış ekibimiz en kısa sürede sizinle iletişime geçsin.',
    'ui_offer_section_label',        'Teknik Teklifler',

    -- PUBLIC FORM (src/components/public/offer/OfferPublicForm.tsx)
    'ui_offer_form_heading',         'Teklif Talep Formu',
    'ui_offer_form_intro',
      'Firmanız ve talebiniz ile ilgili bilgileri paylaşın; en kısa sürede size özel teklif ile dönüş yapalım.',
    'ui_offer_form_radio_general',   'Genel teklif',
    'ui_offer_form_radio_product',   'Ürün / Yedek Parça',
    'ui_offer_form_radio_service',   'Hizmet (Mühendislik / Revizyon)',

    'ui_offer_form_general_text',
      'Genel teklif talebinizi kısaca açıklayınız.',
    'ui_offer_form_product_text',
      'İhtiyaç duyduğunuz kule ile ilgili teknik bilgileri doldurunuz.',
    'ui_offer_form_service_text',
      'Talep ettiğiniz hizmet ile ilgili bilgileri doldurunuz.',

    'ui_offer_form_error',
      'Teklif talebi gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
    'ui_offer_form_success',
      'Teklif talebiniz alındı. Referans numarası: ',
    'ui_offer_form_submit',          'Teklif Talep Et',
    'ui_offer_form_submitting',      'Gönderiliyor...',

    'ui_offer_form_kvkk_label',
      'KVKK / gizlilik politikası ve kullanım şartlarını okudum, kabul ediyorum. (zorunlu)',
    'ui_offer_form_marketing_label',
      'Kampanya ve bilgilendirme e-postaları almak istiyorum. (opsiyonel)',
    'ui_offer_form_kvkk_alert',
      'Lütfen KVKK / şartlar onayını işaretleyin.',

    -- OFFER SECTION (src/components/containers/offer/OfferSection.tsx)
    'ui_offer_heading_product',      'Bu ürün için teklif isteyin',
    'ui_offer_heading_service',      'Bu hizmet için teklif isteyin',
    'ui_offer_intro_product',
      'Bu ürün için özel teklif talebi oluşturabilirsiniz.',
    'ui_offer_intro_service',
      'Bu hizmet için özel teklif talebi oluşturabilirsiniz.',
    'ui_offer_intro_general',
      'İhtiyaçlarınıza özel teklif talep edebilirsiniz.',
    'ui_offer_button_product',       'Teklif sayfasına git',
    'ui_offer_button_service',       'Teklif sayfasına git',
    'ui_offer_button_general',       'Teklif iste',

    -- SERVICE CTA (src/components/containers/service/ServiceCta.tsx)
    'ui_offer_cta_title',
      'Soğutma kuleleriniz için en uygun çözümü birlikte planlayalım.',
    'ui_offer_cta_text',
      'Sisteminizi kısaca anlatın, mühendislik ekibimiz performans ve verimlilik odaklı bir çözüm önersin.',
    'ui_offer_cta_button',           'Teklif iste'
  ),
  NOW(3),
  NOW(3)
),
-- -------------------------------------------------------------
-- EN
-- -------------------------------------------------------------
(
  UUID(),
  'ui_offer',
  'en',
  JSON_OBJECT(
    -- PAGE TITLE (src/pages/offer/index.tsx)
    'ui_offer_page_title',           'Request an Offer',

    -- OFFER PAGE CONTAINER (src/components/containers/offer/OfferPage.tsx)
    'ui_offer_heading_general',      'Request an Offer',
    'ui_offer_subtitle',
      'Tailored cooling solutions and technical consulting.',
    'ui_offer_description',
      'Fill in the form and our sales team will contact you as soon as possible.',
    'ui_offer_section_label',        'Technical Offers',

    -- PUBLIC FORM (src/components/public/offer/OfferPublicForm.tsx)
    'ui_offer_form_heading',         'Request an Offer',
    'ui_offer_form_intro',
      'Share details about your company and request; we will get back to you with a tailored quotation.',
    'ui_offer_form_radio_general',   'General quote',
    'ui_offer_form_radio_product',   'Product / Spare Part',
    'ui_offer_form_radio_service',   'Service (Engineering / Retrofit)',

    'ui_offer_form_general_text',
      'Please describe your general quotation request.',
    'ui_offer_form_product_text',
      'Please fill in the technical details of the cooling tower you need.',
    'ui_offer_form_service_text',
      'Please fill in the details for the requested service.',

    'ui_offer_form_error',
      'An error occurred while submitting your request. Please try again later.',
    'ui_offer_form_success',
      'Your request has been received. Reference no: ',
    'ui_offer_form_submit',          'Request an Offer',
    'ui_offer_form_submitting',      'Submitting...',

    'ui_offer_form_kvkk_label',
      'I have read and accept the privacy policy and terms of use (mandatory).',
    'ui_offer_form_marketing_label',
      'I would like to receive promotional and information e-mails (optional).',
    'ui_offer_form_kvkk_alert',
      'Please accept the privacy terms.',

    -- OFFER SECTION (src/components/containers/offer/OfferSection.tsx)
    'ui_offer_heading_product',      'Request a quote for this product',
    'ui_offer_heading_service',      'Request a quote for this service',
    'ui_offer_intro_product',
      'Fill in the form to request a tailored quotation for this product.',
    'ui_offer_intro_service',
      'Fill in the form to request a tailored quotation for this service.',
    'ui_offer_intro_general',
      'Request a tailored quotation for your needs.',
    'ui_offer_button_product',       'Go to offer page',
    'ui_offer_button_service',       'Go to offer page',
    'ui_offer_button_general',       'Request an offer',

    -- SERVICE CTA (src/components/containers/service/ServiceCta.tsx)
    'ui_offer_cta_title',
      'Let’s design the most suitable cooling solution for your plant.',
    'ui_offer_cta_text',
      'Tell us briefly about your system and our engineering team will propose a performance-focused solution.',
    'ui_offer_cta_button',           'Request a quote'
  ),
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `value`    = VALUES(`value`),
  updated_at = VALUES(updated_at);

-- -------------------------------------------------------------
-- TR → DE otomatik kopya (Almanca özel çeviri gelene kadar)
-- -------------------------------------------------------------
INSERT INTO site_settings (id, `key`, locale, `value`, created_at, updated_at)
SELECT UUID(), s.`key`, 'de', s.`value`, NOW(3), NOW(3)
FROM site_settings s
WHERE s.locale = 'tr'
  AND s.`key` = 'ui_offer'
  AND NOT EXISTS (
    SELECT 1
    FROM site_settings t
    WHERE t.`key` = s.`key`
      AND t.locale = 'de'
  );
