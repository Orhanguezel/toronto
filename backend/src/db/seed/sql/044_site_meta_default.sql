-- =============================================================
-- Varsayılan meta bilgileri (title/description/keywords)
-- FE'de Layout.tsx tarafından kullanılıyor.
-- =============================================================

-- TR varsayılan meta
INSERT INTO site_settings (id, `key`, locale, `value`, created_at, updated_at) VALUES
(
  UUID(),
  'site_meta_default',
  'tr',
  JSON_OBJECT(
    'title',       'Ensotek | Endüstriyel Çözümler',
    'description', 'Endüstriyel soğutma kuleleri, modernizasyon ve enerji verimliliği çözümleri sunan Ensotek Enerji Sistemleri.',
    'keywords',    'ensotek, endüstriyel, soğutma kulesi, enerji verimliliği, b2b'
  ),
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `value`    = VALUES(`value`),
  updated_at = VALUES(updated_at);

-- EN varsayılan meta
INSERT INTO site_settings (id, `key`, locale, `value`, created_at, updated_at) VALUES
(
  UUID(),
  'site_meta_default',
  'en',
  JSON_OBJECT(
    'title',       'Ensotek | Industrial Solutions',
    'description', 'Ensotek Energy Systems provides industrial cooling tower engineering and energy efficiency solutions.',
    'keywords',    'ensotek, industrial, cooling towers, energy efficiency, b2b'
  ),
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `value`    = VALUES(`value`),
  updated_at = VALUES(updated_at);

-- DE varsayılan meta (isteğe göre düzenleyebilirsin)
INSERT INTO site_settings (id, `key`, locale, `value`, created_at, updated_at) VALUES
(
  UUID(),
  'site_meta_default',
  'de',
  JSON_OBJECT(
    'title',       'Ensotek | Industrielle Lösungen',
    'description', 'Ensotek Energiesysteme bietet industrielle Kühlturmtechnik und Energieeffizienzlösungen.',
    'keywords',    'ensotek, industriell, kühlturm, energieeffizienz, b2b'
  ),
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  `value`    = VALUES(`value`),
  updated_at = VALUES(updated_at);
