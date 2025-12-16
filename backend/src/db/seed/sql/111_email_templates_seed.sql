-- 111_email_templates_seed.sql
-- EMAIL_TEMPLATES SEED (i18n'li)

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ============================================================
-- 1) PARENT KAYITLAR (email_templates)
--    (locale'den bağımsız, sadece key + variables)
-- ============================================================

INSERT INTO `email_templates`
(`id`, `template_key`, `variables`, `is_active`, `created_at`, `updated_at`)
VALUES
-- ticket_replied
('4290e3d9-d5b8-4423-aab2-1cbc85bee59b',
 'ticket_replied',
 JSON_ARRAY('user_name','ticket_id','ticket_subject','reply_message','site_name'),
 1, '2025-10-09 19:38:58.000', '2025-10-13 20:28:47.000'),

-- password_reset
('da91f94a-bfe1-46b7-83fc-b4152e27c65e',
 'password_reset',
 JSON_ARRAY('reset_link','site_name'),
 1, '2025-10-09 19:38:58.000', '2025-10-09 19:38:58.000'),

-- password_changed
('c0bb0c00-1a2b-4c5d-9e8f-001122334455',
 'password_changed',
 JSON_ARRAY('user_name','site_name'),
 1, '2025-10-09 19:38:58.000', '2025-10-09 19:38:58.000'),

-- contact_admin_notification
('11112222-3333-4444-5555-666677778888',
 'contact_admin_notification',
 JSON_ARRAY('name','email','phone','subject','message','ip','user_agent'),
 1, '2025-10-09 19:38:58.000', '2025-10-09 19:38:58.000'),

-- contact_user_autoreply
('99990000-aaaa-bbbb-cccc-ddddeeee0000',
 'contact_user_autoreply',
 JSON_ARRAY('name','subject'),
 1, '2025-10-09 19:38:58.000', '2025-10-09 19:38:58.000'),

-- welcome
('e7fae474-c1cf-4600-8466-2f915146cfb9',
 'welcome',
 JSON_ARRAY('user_name','user_email','site_name'),
 1, '2025-10-09 19:38:58.000', '2025-10-13 15:06:38.000'),

-- offer_sent_customer
('1111aaaa-2222-3333-4444-555566667777',
 'offer_sent_customer',
 JSON_ARRAY(
   'customer_name',
   'company_name',
   'offer_no',
   'email',
   'phone',
   'currency',
   'net_total',
   'vat_total',
   'gross_total',
   'valid_until',
   'pdf_url'
 ),
 1, '2025-10-10 10:00:00.000', '2025-10-10 10:00:00.000'),

-- offer_sent_admin
('2222bbbb-2222-3333-4444-555566667777',
 'offer_sent_admin',
 JSON_ARRAY(
   'customer_name',
   'company_name',
   'offer_no',
   'email',
   'phone',
   'currency',
   'net_total',
   'vat_total',
   'gross_total',
   'valid_until',
   'pdf_url'
 ),
 1, '2025-10-10 10:00:00.000', '2025-10-10 10:00:00.000'),

-- offer_request_received_admin
('3333cccc-2222-3333-4444-555566667777',
 'offer_request_received_admin',
 JSON_ARRAY(
   'customer_name',
   'company_name',
   'email',
   'phone',
   'offer_id',
   'message'
 ),
 1, '2025-10-10 10:00:00.000', '2025-10-10 10:00:00.000'),

-- catalog_request_received_admin
('4444dddd-2222-3333-4444-555566667777',
 'catalog_request_received_admin',
 JSON_ARRAY(
   'site_title',
   'site_name',
   'customer_name',
   'company_name',
   'email',
   'phone',
   'message',
   'locale',
   'country_code',
   'catalog_url',
   'catalog_request_id'
 ),
 1, '2025-12-14 00:00:00.000', '2025-12-14 00:00:00.000'),

-- catalog_sent_customer
('5555eeee-2222-3333-4444-555566667777',
 'catalog_sent_customer',
 JSON_ARRAY(
   'site_title',
   'site_name',
   'customer_name',
   'company_name',
   'email',
   'phone',
   'catalog_url',
   'catalog_filename'
 ),
 1, '2025-12-14 00:00:00.000', '2025-12-14 00:00:00.000')
ON DUPLICATE KEY UPDATE
  `variables`  = VALUES(`variables`),
  `is_active`  = VALUES(`is_active`),
  `updated_at` = VALUES(`updated_at`);

-- ============================================================
-- 2) I18N KAYITLAR (email_templates_i18n)
--    Aynı template_id için birden fazla locale: tr + en
-- ============================================================

INSERT INTO `email_templates_i18n`
(`id`, `template_id`, `locale`, `template_name`, `subject`, `content`, `created_at`, `updated_at`)
VALUES
-- ticket_replied (tr)
('7290e3d9-d5b8-4423-aab2-1cbc85bee59b',
 '4290e3d9-d5b8-4423-aab2-1cbc85bee59b',
 'tr',
 'Ticket Replied',
 'Destek Talebiniz Yanıtlandı - {{site_name}}',
 '<h1 class="ql-align-center">Destek Talebiniz Yanıtlandı</h1><p>Merhaba <strong>{{user_name}}</strong>,</p><p>Destek talebiniz yanıtlandı.</p><p><br></p><p>Detayları görüntülemek için kullanıcı paneline giriş yapabilirsiniz.</p><p>Saygılarımızla,</p><p>{{site_name}} Ekibi</p>',
 '2025-10-09 19:38:58.000', '2025-10-13 20:28:47.000'),

-- ticket_replied (en)
('8290e3d9-d5b8-4423-aab2-1cbc85bee59b',
 '4290e3d9-d5b8-4423-aab2-1cbc85bee59b',
 'en',
 'Ticket Replied',
 'Your Support Ticket Has Been Answered - {{site_name}}',
 '<h1 class="ql-align-center">Your Support Ticket Has Been Answered</h1><p>Hello <strong>{{user_name}}</strong>,</p><p>Your support ticket has been answered.</p><p><br></p><p>You can log in to your account to view the full details.</p><p>Best regards,</p><p>{{site_name}} Team</p>',
 '2025-10-09 19:38:58.000', '2025-10-13 20:28:47.000'),

-- password_reset (tr)
('fa91f94a-bfe1-46b7-83fc-b4152e27c65e',
 'da91f94a-bfe1-46b7-83fc-b4152e27c65e',
 'tr',
 'Password Reset',
 'Şifre Sıfırlama Talebi - {{site_name}}',
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #333; text-align: center;">Şifre Sıfırlama</h1>
    <p style="color: #666; font-size: 16px;">Merhaba,</p>
    <p style="color: #666; font-size: 16px;">Hesabınız için şifre sıfırlama talebi aldık.</p>
    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
      <a href="{{reset_link}}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Şifremi Sıfırla</a>
    </div>
    <p style="color: #666; font-size: 14px;">Bu linkin geçerlilik süresi 1 saattir.</p>
    <p style="color: #666; font-size: 14px;">Bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
    <p style="color: #666; font-size: 16px;">Saygılarımızla,<br>{{site_name}} Ekibi</p>
  </div>',
 '2025-10-09 19:38:58.000', '2025-10-09 19:38:58.000'),

-- password_reset (en)
('ea91f94a-bfe1-46b7-83fc-b4152e27c65e',
 'da91f94a-bfe1-46b7-83fc-b4152e27c65e',
 'en',
 'Password Reset',
 'Password Reset Request - {{site_name}}',
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #333; text-align: center;">Password Reset</h1>
    <p style="color: #666; font-size: 16px;">Hello,</p>
    <p style="color: #666; font-size: 16px;">We received a password reset request for your account.</p>
    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
      <a href="{{reset_link}}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset My Password</a>
    </div>
    <p style="color: #666; font-size: 14px;">This link is valid for 1 hour.</p>
    <p style="color: #666; font-size: 14px;">If you did not request this, you can safely ignore this email.</p>
    <p style="color: #666; font-size: 16px;">Best regards,<br>{{site_name}} Team</p>
  </div>',
 '2025-10-09 19:38:58.000', '2025-10-09 19:38:58.000'),

-- password_changed (tr)
('d0bb0c00-1a2b-4c5d-9e8f-554433221100',
 'c0bb0c00-1a2b-4c5d-9e8f-001122334455',
 'tr',
 'Password Changed',
 'Şifreniz Güncellendi - {{site_name}}',
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="font-size:20px; text-align:center;">Şifreniz Güncellendi</h1>
    <p>Merhaba <strong>{{user_name}}</strong>,</p>
    <p>Hesap şifreniz başarıyla değiştirildi.</p>
    <p>Eğer bu işlemi siz yapmadıysanız lütfen en kısa sürede bizimle iletişime geçin.</p>
    <p>Saygılarımızla,</p>
    <p>{{site_name}} Ekibi</p>
</div>',
 '2025-10-09 19:38:58.000', '2025-10-09 19:38:58.000'),

-- password_changed (en)
('e0bb0c00-1a2b-4c5d-9e8f-554433221100',
 'c0bb0c00-1a2b-4c5d-9e8f-001122334455',
 'en',
 'Password Changed',
 'Your Password Has Been Updated - {{site_name}}',
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="font-size:20px; text-align:center;">Your Password Has Been Updated</h1>
    <p>Hello <strong>{{user_name}}</strong>,</p>
    <p>Your account password has been successfully changed.</p>
    <p>If you did not perform this action, please contact us as soon as possible.</p>
    <p>Best regards,</p>
    <p>{{site_name}} Team</p>
</div>',
 '2025-10-09 19:38:58.000', '2025-10-09 19:38:58.000'),

-- contact_admin_notification (tr)
('21112222-3333-4444-5555-666677778888',
 '11112222-3333-4444-5555-666677778888',
 'tr',
 'Contact Admin Notification',
 'Yeni İletişim Mesajı - {{subject}}',
 '<div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,''Segoe UI'',sans-serif;font-size:14px;line-height:1.5;color:#111827;">
  <h1 style="font-size:18px;margin-bottom:12px;">Yeni iletişim formu mesajı</h1>
  <p><strong>Ad Soyad:</strong> {{name}}</p>
  <p><strong>E-posta:</strong> {{email}}</p>
  <p><strong>Telefon:</strong> {{phone}}</p>
  <p><strong>Konu:</strong> {{subject}}</p>
  <p><strong>IP:</strong> {{ip}}</p>
  <p><strong>User-Agent:</strong> {{user_agent}}</p>
  <hr style="margin:16px 0;border:none;border-top:1px solid #e5e7eb;" />
  <p><strong>Mesaj:</strong></p>
  <pre style="white-space:pre-wrap;word-break:break-word;background:#f9fafb;padding:12px;border-radius:8px;border:1px solid #e5e7eb;">{{message}}</pre>
</div>',
 '2025-10-09 19:38:58.000', '2025-10-09 19:38:58.000'),

-- contact_admin_notification (en)
('31112222-3333-4444-5555-666677778888',
 '11112222-3333-4444-5555-666677778888',
 'en',
 'Contact Admin Notification',
 'New Contact Message - {{subject}}',
 '<div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,''Segoe UI'',sans-serif;font-size:14px;line-height:1.5;color:#111827;">
  <h1 style="font-size:18px;margin-bottom:12px;">New contact form message</h1>
  <p><strong>Name:</strong> {{name}}</p>
  <p><strong>Email:</strong> {{email}}</p>
  <p><strong>Phone:</strong> {{phone}}</p>
  <p><strong>Subject:</strong> {{subject}}</p>
  <p><strong>IP:</strong> {{ip}}</p>
  <p><strong>User-Agent:</strong> {{user_agent}}</p>
  <hr style="margin:16px 0;border:none;border-top:1px solid #e5e7eb;" />
  <p><strong>Message:</strong></p>
  <pre style="white-space:pre-wrap;word-break:break-word;background:#f9fafb;padding:12px;border-radius:8px;border:1px solid #e5e7eb;">{{message}}</pre>
</div>',
 '2025-10-09 19:38:58.000', '2025-10-09 19:38:58.000'),

-- contact_user_autoreply (tr)
('99990000-bbbb-cccc-dddd-eeeeffff0000',
 '99990000-aaaa-bbbb-cccc-ddddeeee0000',
 'tr',
 'Contact User Autoreply',
 'Mesajınızı Aldık - {{subject}}',
 '<div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,''Segoe UI'',sans-serif;font-size:14px;line-height:1.5;color:#111827;">
  <h1 style="font-size:18px;margin-bottom:12px;">Mesajınızı Aldık</h1>
  <p>Merhaba <strong>{{name}}</strong>,</p>
  <p>İletişim formu üzerinden göndermiş olduğunuz mesaj bize ulaştı.</p>
  <p>En kısa süre içinde size dönüş yapacağız.</p>
  <p>İyi günler dileriz.</p>
</div>',
 '2025-10-09 19:38:58.000', '2025-10-09 19:38:58.000'),

-- contact_user_autoreply (en)
('99990000-cccc-dddd-eeee-ffff11110000',
 '99990000-aaaa-bbbb-cccc-ddddeeee0000',
 'en',
 'Contact User Autoreply',
 'We''ve Received Your Message - {{subject}}',
 '<div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,''Segoe UI'',sans-serif;font-size:14px;line-height:1.5;color:#111827;">
  <h1 style="font-size:18px;margin-bottom:12px;">We''ve received your message</h1>
  <p>Hello <strong>{{name}}</strong>,</p>
  <p>Your message sent via our contact form has reached us.</p>
  <p>We will get back to you as soon as possible.</p>
  <p>Have a nice day.</p>
</div>',
 '2025-10-09 19:38:58.000', '2025-10-09 19:38:58.000'),

-- welcome (tr)
('f7fae474-c1cf-4600-8466-2f915146cfb9',
 'e7fae474-c1cf-4600-8466-2f915146cfb9',
 'tr',
 'Welcome',
 'Hesabiniz Oluşturuldu - {{site_name}}',
 '<h1 class="ql-align-center">Hesabınız Oluşturuldu</h1><p>Merhaba <strong>{{user_name}}</strong>,</p><p>{{site_name}} ailesine hoş geldiniz! Hesabınız başarıyla oluşturuldu.</p><p><br></p><p>E-posta: <strong>{{user_email}}</strong></p><p>Herhangi bir sorunuz olursa bizimle iletişime geçmekten çekinmeyin.</p><p>Saygılarımızla,</p><p>{{site_name}} Ekibi</p>',
 '2025-10-09 19:38:58.000', '2025-10-13 15:06:38.000'),

-- welcome (en)
('07fae474-c1cf-4600-8466-2f915146cfb9',
 'e7fae474-c1cf-4600-8466-2f915146cfb9',
 'en',
 'Welcome',
 'Your Account Has Been Created - {{site_name}}',
 '<h1 class="ql-align-center">Your Account Has Been Created</h1><p>Hello <strong>{{user_name}}</strong>,</p><p>Welcome to {{site_name}}! Your account has been successfully created.</p><p><br></p><p>Email: <strong>{{user_email}}</strong></p><p>If you have any questions, feel free to contact us anytime.</p><p>Best regards,</p><p>{{site_name}} Team</p>',
 '2025-10-09 19:38:58.000', '2025-10-13 15:06:38.000'),

-- offer_sent_customer (tr)
('1111aaaa-2222-3333-4444-aaaabbbb0001',
 '1111aaaa-2222-3333-4444-555566667777',
 'tr',
 'Offer Sent (Customer)',
 'Teklifiniz Hazır - Teklif No: {{offer_no}}',
 '<div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,''Segoe UI'',sans-serif;font-size:14px;line-height:1.5;color:#111827;max-width:640px;margin:0 auto;">
  <h1 style="font-size:20px;margin-bottom:12px;">Teklifiniz Hazır</h1>
  <p>Merhaba <strong>{{customer_name}}</strong>,</p>
  <p>Talebiniz doğrultusunda hazırladığımız teklif bilgilerini aşağıda bulabilirsiniz.</p>
  <ul style="padding-left:18px;margin:12px 0;">
    <li><strong>Teklif No:</strong> {{offer_no}}</li>
    <li><strong>Müşteri:</strong> {{customer_name}} ({{company_name}})</li>
    <li><strong>E-posta:</strong> {{email}}</li>
    <li><strong>Telefon:</strong> {{phone}}</li>
    <li><strong>Para Birimi:</strong> {{currency}}</li>
    <li><strong>Ara Toplam (Net):</strong> {{net_total}}</li>
    <li><strong>KDV:</strong> {{vat_total}}</li>
    <li><strong>Genel Toplam (Brüt):</strong> {{gross_total}}</li>
    <li><strong>Geçerlilik Tarihi:</strong> {{valid_until}}</li>
  </ul>
  <p>Teklif detaylarını PDF olarak görüntülemek için aşağıdaki bağlantıyı kullanabilirsiniz:</p>
  <p><a href="{{pdf_url}}" style="display:inline-block;padding:10px 18px;border-radius:6px;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;">PDF Teklifi Görüntüle</a></p>
  <p style="margin-top:20px;">Herhangi bir sorunuz olması durumunda bu e-postayı yanıtlayarak veya telefonla bizimle iletişime geçebilirsiniz.</p>
  <p>Saygılarımızla,<br>Satış Ekibi</p>
</div>',
 '2025-10-10 10:00:00.000', '2025-10-10 10:00:00.000'),

-- offer_sent_customer (en)
('1111aaaa-2222-3333-4444-aaaabbbb0002',
 '1111aaaa-2222-3333-4444-555566667777',
 'en',
 'Offer Sent (Customer)',
 'Your Quotation is Ready - Offer No: {{offer_no}}',
 '<div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,''Segoe UI'',sans-serif;font-size:14px;line-height:1.5;color:#111827;max-width:640px;margin:0 auto;">
  <h1 style="font-size:20px;margin-bottom:12px;">Your Quotation is Ready</h1>
  <p>Hello <strong>{{customer_name}}</strong>,</p>
  <p>We have prepared your quotation based on your request. You can find the summary below.</p>
  <ul style="padding-left:18px;margin:12px 0;">
    <li><strong>Offer No:</strong> {{offer_no}}</li>
    <li><strong>Customer:</strong> {{customer_name}} ({{company_name}})</li>
    <li><strong>Email:</strong> {{email}}</li>
    <li><strong>Phone:</strong> {{phone}}</li>
    <li><strong>Currency:</strong> {{currency}}</li>
    <li><strong>Net Total:</strong> {{net_total}}</li>
    <li><strong>VAT:</strong> {{vat_total}}</li>
    <li><strong>Gross Total:</strong> {{gross_total}}</li>
    <li><strong>Valid Until:</strong> {{valid_until}}</li>
  </ul>
  <p>You can view the full quotation as a PDF using the link below:</p>
  <p><a href="{{pdf_url}}" style="display:inline-block;padding:10px 18px;border-radius:6px;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;">View PDF Quotation</a></p>
  <p style="margin-top:20px;">If you have any questions, simply reply to this email or call us.</p>
  <p>Best regards,<br>Sales Team</p>
</div>',
 '2025-10-10 10:00:00.000', '2025-10-10 10:00:00.000'),

-- offer_sent_admin (tr)
('2222bbbb-2222-3333-4444-bbbbcccc0001',
 '2222bbbb-2222-3333-4444-555566667777',
 'tr',
 'Offer Sent (Admin)',
 'Teklif Gönderildi - Teklif No: {{offer_no}}',
 '<div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,''Segoe UI'',sans-serif;font-size:14px;line-height:1.5;color:#111827;max-width:640px;margin:0 auto;">
  <h1 style="font-size:18px;margin-bottom:12px;">Teklif Müşteriye Gönderildi</h1>
  <p>Aşağıdaki teklif müşteriye e-posta ile gönderildi:</p>
  <ul style="padding-left:18px;margin:12px 0;">
    <li><strong>Teklif No:</strong> {{offer_no}}</li>
    <li><strong>Müşteri:</strong> {{customer_name}} ({{company_name}})</li>
    <li><strong>E-posta:</strong> {{email}}</li>
    <li><strong>Telefon:</strong> {{phone}}</li>
    <li><strong>Para Birimi:</strong> {{currency}}</li>
    <li><strong>Ara Toplam (Net):</strong> {{net_total}}</li>
    <li><strong>KDV:</strong> {{vat_total}}</li>
    <li><strong>Genel Toplam (Brüt):</strong> {{gross_total}}</li>
    <li><strong>Geçerlilik Tarihi:</strong> {{valid_until}}</li>
  </ul>
  <p>PDF linki: <a href="{{pdf_url}}">{{pdf_url}}</a></p>
</div>',
 '2025-10-10 10:00:00.000', '2025-10-10 10:00:00.000'),

-- offer_sent_admin (en)
('2222bbbb-2222-3333-4444-bbbbcccc0002',
 '2222bbbb-2222-3333-4444-555566667777',
 'en',
 'Offer Sent (Admin)',
 'Offer Sent to Customer - Offer No: {{offer_no}}',
 '<div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,''Segoe UI'',sans-serif;font-size:14px;line-height:1.5;color:#111827;max-width:640px;margin:0 auto;">
  <h1 style="font-size:18px;margin-bottom:12px;">Quotation Sent to Customer</h1>
  <p>The following quotation has been sent to the customer:</p>
  <ul style="padding-left:18px;margin:12px 0;">
    <li><strong>Offer No:</strong> {{offer_no}}</li>
    <li><strong>Customer:</strong> {{customer_name}} ({{company_name}})</li>
    <li><strong>Email:</strong> {{email}}</li>
    <li><strong>Phone:</strong> {{phone}}</li>
    <li><strong>Currency:</strong> {{currency}}</li>
    <li><strong>Net Total:</strong> {{net_total}}</li>
    <li><strong>VAT:</strong> {{vat_total}}</li>
    <li><strong>Gross Total:</strong> {{gross_total}}</li>
    <li><strong>Valid Until:</strong> {{valid_until}}</li>
  </ul>
  <p>PDF link: <a href="{{pdf_url}}">{{pdf_url}}</a></p>
</div>',
 '2025-10-10 10:00:00.000', '2025-10-10 10:00:00.000'),

-- offer_request_received_admin (tr)
('3333cccc-2222-3333-4444-ccccdddd0001',
 '3333cccc-2222-3333-4444-555566667777',
 'tr',
 'Offer Request Received (Admin)',
 'Yeni Teklif Talebi - {{customer_name}}',
 '<div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,''Segoe UI'',sans-serif;font-size:14px;line-height:1.5;color:#111827;max-width:640px;margin:0 auto;">
  <h1 style="font-size:18px;margin-bottom:12px;">Yeni teklif talebi</h1>
  <p>Aşağıdaki bilgilerle yeni bir teklif talebi oluşturuldu:</p>
  <ul style="padding-left:18px;margin:12px 0;">
    <li><strong>Teklif ID:</strong> {{offer_id}}</li>
    <li><strong>Müşteri:</strong> {{customer_name}} ({{company_name}})</li>
    <li><strong>E-posta:</strong> {{email}}</li>
    <li><strong>Telefon:</strong> {{phone}}</li>
  </ul>
  <p><strong>Müşteri Mesajı:</strong></p>
  <pre style="white-space:pre-wrap;word-break:break-word;background:#f9fafb;padding:12px;border-radius:8px;border:1px solid #e5e7eb;">{{message}}</pre>
</div>',
 '2025-10-10 10:00:00.000', '2025-10-10 10:00:00.000'),

-- offer_request_received_admin (en)
('3333cccc-2222-3333-4444-ccccdddd0002',
 '3333cccc-2222-3333-4444-555566667777',
 'en',
 'Offer Request Received (Admin)',
 'New Offer Request - {{customer_name}}',
 '<div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,''Segoe UI'',sans-serif;font-size:14px;line-height:1.5;color:#111827;max-width:640px;margin:0 auto;">
  <h1 style="font-size:18px;margin-bottom:12px;">New offer request</h1>
  <p>A new offer request has been created with the following details:</p>
  <ul style="padding-left:18px;margin:12px 0;">
    <li><strong>Offer ID:</strong> {{offer_id}}</li>
    <li><strong>Customer:</strong> {{customer_name}} ({{company_name}})</li>
    <li><strong>Email:</strong> {{email}}</li>
    <li><strong>Phone:</strong> {{phone}}</li>
  </ul>
  <p><strong>Customer Message:</strong></p>
  <pre style="white-space:pre-wrap;word-break:break-word;background:#f9fafb;padding:12px;border-radius:8px;border:1px solid #e5e7eb;">{{message}}</pre>
</div>',
 '2025-10-10 10:00:00.000', '2025-10-10 10:00:00.000'),

-- catalog_request_received_admin (tr)
('4444dddd-2222-3333-4444-aaaabbbb0001',
 '4444dddd-2222-3333-4444-555566667777',
 'tr',
 'Catalog Request Received (Admin)',
 'Yeni Katalog Talebi - {{customer_name}}',
 '<div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,''Segoe UI'',sans-serif;font-size:14px;line-height:1.5;color:#111827;max-width:640px;margin:0 auto;">
  <h1 style="font-size:18px;margin-bottom:12px;">Yeni katalog talebi</h1>
  <p>Yeni bir katalog talebi oluşturuldu. Detaylar:</p>
  <ul style="padding-left:18px;margin:12px 0;">
    <li><strong>Talep ID:</strong> {{catalog_request_id}}</li>
    <li><strong>Müşteri:</strong> {{customer_name}}</li>
    <li><strong>Firma:</strong> {{company_name}}</li>
    <li><strong>E-posta:</strong> {{email}}</li>
    <li><strong>Telefon:</strong> {{phone}}</li>
    <li><strong>Ülke Kodu:</strong> {{country_code}}</li>
    <li><strong>Locale:</strong> {{locale}}</li>
  </ul>
  <p style="margin:16px 0 6px;"><strong>Müşteri Mesajı:</strong></p>
  <pre style="white-space:pre-wrap;word-break:break-word;background:#f9fafb;padding:12px;border-radius:8px;border:1px solid #e5e7eb;">{{message}}</pre>
  <p style="margin-top:16px;">Admin panelden talebi onaylayıp kataloğu gönderin.</p>
  <p style="margin-top:12px;font-size:12px;color:#6b7280;">
    Katalog PDF (referans link): <a href="{{catalog_url}}">{{catalog_url}}</a>
  </p>
</div>',
 '2025-12-14 00:00:00.000', '2025-12-14 00:00:00.000'),

-- catalog_request_received_admin (en)
('4444dddd-2222-3333-4444-aaaabbbb0002',
 '4444dddd-2222-3333-4444-555566667777',
 'en',
 'Catalog Request Received (Admin)',
 'New Catalog Request - {{customer_name}}',
 '<div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,''Segoe UI'',sans-serif;font-size:14px;line-height:1.5;color:#111827;max-width:640px;margin:0 auto;">
  <h1 style="font-size:18px;margin-bottom:12px;">New catalog request</h1>
  <p>A new catalog request has been created. Details:</p>
  <ul style="padding-left:18px;margin:12px 0;">
    <li><strong>Request ID:</strong> {{catalog_request_id}}</li>
    <li><strong>Customer:</strong> {{customer_name}}</li>
    <li><strong>Company:</strong> {{company_name}}</li>
    <li><strong>Email:</strong> {{email}}</li>
    <li><strong>Phone:</strong> {{phone}}</li>
    <li><strong>Country Code:</strong> {{country_code}}</li>
    <li><strong>Locale:</strong> {{locale}}</li>
  </ul>
  <p style="margin:16px 0 6px;"><strong>Customer message:</strong></p>
  <pre style="white-space:pre-wrap;word-break:break-word;background:#f9fafb;padding:12px;border-radius:8px;border:1px solid #e5e7eb;">{{message}}</pre>
  <p style="margin-top:16px;">Please approve the request and send the catalog from the admin panel.</p>
  <p style="margin-top:12px;font-size:12px;color:#6b7280;">
    Catalog PDF (reference link): <a href="{{catalog_url}}">{{catalog_url}}</a>
  </p>
</div>',
 '2025-12-14 00:00:00.000', '2025-12-14 00:00:00.000'),

-- catalog_sent_customer (tr)
('5555eeee-2222-3333-4444-aaaabbbb0001',
 '5555eeee-2222-3333-4444-555566667777',
 'tr',
 'Catalog Sent (Customer)',
 'Kataloğunuz Hazır - {{site_name}}',
 '<div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,''Segoe UI'',sans-serif;font-size:14px;line-height:1.6;color:#111827;max-width:640px;margin:0 auto;">
  <h1 style="font-size:20px;margin-bottom:12px;">Katalog Talebiniz</h1>
  <p>Merhaba <strong>{{customer_name}}</strong>,</p>
  <p>Katalog talebiniz alınmıştır. Katalog PDF dosyası bu e-postaya eklenmiştir.</p>
  <p style="margin:14px 0;">Eğer e-posta istemciniz ek dosyayı açmada sorun yaşarsa, kataloğu aşağıdaki bağlantıdan da görüntüleyebilirsiniz:</p>
  <p>
    <a href="{{catalog_url}}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#2563eb;color:#fff;text-decoration:none;font-weight:600;">
      Kataloğu Görüntüle
    </a>
  </p>
  <p style="margin-top:20px;color:#374151;">Saygılarımızla,<br/>{{site_name}} Ekibi</p>
  <p style="margin-top:12px;font-size:12px;color:#6b7280;">Ek dosya adı: {{catalog_filename}}</p>
</div>',
 '2025-12-14 00:00:00.000', '2025-12-14 00:00:00.000'),

-- catalog_sent_customer (en)
('5555eeee-2222-3333-4444-aaaabbbb0002',
 '5555eeee-2222-3333-4444-555566667777',
 'en',
 'Catalog Sent (Customer)',
 'Your Catalog is Ready - {{site_name}}',
 '<div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,''Segoe UI'',sans-serif;font-size:14px;line-height:1.6;color:#111827;max-width:640px;margin:0 auto;">
  <h1 style="font-size:20px;margin-bottom:12px;">Your catalog request</h1>
  <p>Hello <strong>{{customer_name}}</strong>,</p>
  <p>Your catalog request has been processed. The PDF catalog is attached to this email.</p>
  <p style="margin:14px 0;">If your email client has trouble opening the attachment, you can also view the catalog using the link below:</p>
  <p>
    <a href="{{catalog_url}}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#2563eb;color:#fff;text-decoration:none;font-weight:600;">
      View Catalog
    </a>
  </p>
  <p style="margin-top:20px;color:#374151;">Best regards,<br/>{{site_name}} Team</p>
  <p style="margin-top:12px;font-size:12px;color:#6b7280;">Attachment name: {{catalog_filename}}</p>
</div>',
 '2025-12-14 00:00:00.000', '2025-12-14 00:00:00.000')
ON DUPLICATE KEY UPDATE
  `template_name` = VALUES(`template_name`),
  `subject`       = VALUES(`subject`),
  `content`       = VALUES(`content`),
  `updated_at`    = VALUES(`updated_at`);
