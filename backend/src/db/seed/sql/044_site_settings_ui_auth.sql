-- =============================================================
-- 044_site_settings_ui_auth.sql  (Auth sayfaları – login/register/logout)
-- =============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ui_auth : Login / Register / Logout metinleri

INSERT INTO site_settings (id, `key`, locale, `value`, created_at, updated_at) VALUES
(
  UUID(),
  'ui_auth',
  'tr',
  JSON_OBJECT(
    -- Meta
    'login_meta_title',      'Giriş Yap | Ensotek',
    'login_meta_desc',       'Ensotek hesabınıza giriş yapın.',
    'register_meta_title',   'Kayıt Ol | Ensotek',
    'register_meta_desc',    'Ensotek hesabı oluşturun.',
    'logout_meta_title',     'Çıkış Yapılıyor | Ensotek',
    'logout_meta_desc',      'Ensotek hesabınızdan çıkış yapılıyor.',

    -- Login
    'login_title',                   'Giriş Yap',
    'login_lead',                    'Hesabınıza giriş yapın veya yeni hesap oluşturun.',
    'login_email_label',             'E-posta',
    'login_email_placeholder',       'ornek@ensotek.com',
    'login_password_label',          'Şifre',
    'login_password_placeholder',    'Şifreniz',
    'login_remember_me',             'Beni hatırla',
    'login_submit',                  'Giriş Yap',
    'login_loading',                 'Giriş yapılıyor...',
    'login_or',                      'veya',
    'login_google_button',           'Google ile devam et',
    'login_google_loading',          'Google yönlendiriliyor...',
    'login_no_account',              'Hesabın yok mu?',
    'login_register_link',           'yeni hesap oluşturun',
    'login_register_cta',            'Hemen kayıt ol',
    'login_error_required',          'E-posta ve şifre zorunludur.',
    'login_error_google_generic',    'Google ile giriş başlatılırken bir hata oluştu.',

    -- Register
    'register_title',                        'Kayıt Ol',
    'register_lead_has_account',             'Zaten hesabın var mı?',
    'register_login_link',                   'Giriş yap',
    'register_fullname_label',               'Ad Soyad',
    'register_fullname_placeholder',         'Adınız Soyadınız',
    'register_phone_label',                  'Telefon',
    'register_phone_placeholder',            '+90 5xx xxx xx xx',
    'register_email_label',                  'E-posta',
    'register_email_placeholder',            'ornek@ensotek.com',
    'register_password_label',               'Şifre',
    'register_password_placeholder',         'Şifreniz',
    'register_password_again_label',         'Şifre (Tekrar)',
    'register_password_again_placeholder',   'Şifrenizi tekrar girin',
    'register_submit',                       'Kayıt Ol',
    'register_loading',                      'Kayıt olunuyor...',
    'register_or',                           'veya',
    'register_google_button',                'Google ile devam et',
    'register_google_loading',               'Google yönlendiriliyor...',
    'register_error_required',               'E-posta ve şifre zorunludur.',
    'register_error_password_length',        'Şifre en az 6 karakter olmalıdır.',
    'register_error_password_mismatch',      'Şifreler eşleşmiyor.',
    'register_error_google_generic',         'Google ile kayıt başlatılırken bir hata oluştu.',

    -- Logout
    'logout_title',   'Çıkış yapılıyor...',
    'logout_lead',    'Lütfen bekleyin, birkaç saniye içinde giriş sayfasına yönlendirileceksiniz.',
    'logout_error',   'Sunucudan çıkış yapılırken bir sorun oluştu, ancak yerel oturumunuz temizlendi.'
  ),
  NOW(3),
  NOW(3)
),
(
  UUID(),
  'ui_auth',
  'en',
  JSON_OBJECT(
    -- Meta
    'login_meta_title',      'Sign In | Ensotek',
    'login_meta_desc',       'Sign in to your Ensotek account.',
    'register_meta_title',   'Sign Up | Ensotek',
    'register_meta_desc',    'Create your Ensotek account.',
    'logout_meta_title',     'Signing out | Ensotek',
    'logout_meta_desc',      'Signing you out of your Ensotek account.',

    -- Login
    'login_title',                   'Sign In',
    'login_lead',                    'Sign in to your account or create a new one.',
    'login_email_label',             'Email',
    'login_email_placeholder',       'example@ensotek.com',
    'login_password_label',          'Password',
    'login_password_placeholder',    'Your password',
    'login_remember_me',             'Remember me',
    'login_submit',                  'Sign In',
    'login_loading',                 'Signing in...',
    'login_or',                      'or',
    'login_google_button',           'Continue with Google',
    'login_google_loading',          'Redirecting to Google...',
    'login_no_account',              'Don''t have an account?',
    'login_register_link',           'create a new account',
    'login_register_cta',            'Sign up',
    'login_error_required',          'Email and password are required.',
    'login_error_google_generic',    'An error occurred while starting Google login.',

    -- Register
    'register_title',                        'Sign Up',
    'register_lead_has_account',             'Already have an account?',
    'register_login_link',                   'Sign in',
    'register_fullname_label',               'Full Name',
    'register_fullname_placeholder',         'Your full name',
    'register_phone_label',                  'Phone',
    'register_phone_placeholder',            '+90 5xx xxx xx xx',
    'register_email_label',                  'Email',
    'register_email_placeholder',            'example@ensotek.com',
    'register_password_label',               'Password',
    'register_password_placeholder',         'Your password',
    'register_password_again_label',         'Password (again)',
    'register_password_again_placeholder',   'Re-enter your password',
    'register_submit',                       'Sign Up',
    'register_loading',                      'Creating account...',
    'register_or',                           'or',
    'register_google_button',                'Continue with Google',
    'register_google_loading',               'Redirecting to Google...',
    'register_error_required',               'Email and password are required.',
    'register_error_password_length',        'Password must be at least 6 characters.',
    'register_error_password_mismatch',      'Passwords do not match.',
    'register_error_google_generic',         'An error occurred while starting Google signup.',

    -- Logout
    'logout_title',   'Signing out...',
    'logout_lead',    'Please wait, you will be redirected to the login page in a few seconds.',
    'logout_error',   'There was a problem signing out from the server, but your local session has been cleared.'
  ),
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `value`    = VALUES(`value`),
  updated_at = VALUES(updated_at);

-- TR → DE (opsiyonel, Almanca özel çeviri gelene kadar bire bir kopya)
INSERT INTO site_settings (id, `key`, locale, `value`, created_at, updated_at)
SELECT UUID(), s.`key`, 'de', s.`value`, NOW(3), NOW(3)
FROM site_settings s
WHERE s.locale = 'tr'
  AND s.`key` = 'ui_auth'
  AND NOT EXISTS (
    SELECT 1
    FROM site_settings t
    WHERE t.`key` = s.`key`
      AND t.locale = 'de'
  );
