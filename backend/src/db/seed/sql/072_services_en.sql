-- =============================================================
-- 072_services_en.sql  (Ensotek services – EN i18n only)
-- =============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

START TRANSACTION;

-- ---------------------------------------------------------
-- 1) Maintenance & Repair
-- ---------------------------------------------------------

SET @SRV_MAINT_ID := (
  SELECT s.id
  FROM services s
  JOIN services_i18n i ON i.service_id = s.id AND i.locale = 'tr'
  WHERE i.slug = 'bakim-ve-onarim'
  LIMIT 1
);

INSERT INTO `services_i18n`
(`id`,`service_id`,`locale`,
 `slug`,`name`,
 `description`,`material`,`price`,
 `includes`,`warranty`,`image_alt`,
 `tags`,`meta_title`,`meta_description`,`meta_keywords`,
 `created_at`,`updated_at`)
VALUES
(
  UUID(),
  @SRV_MAINT_ID,
  'en',
  'maintenance-and-repair',
  'Maintenance & Repair',
  'We provide end-to-end maintenance and repair services to keep your cooling towers running reliably and efficiently. Ensotek offers periodic maintenance programs, fault diagnosis and on-site repair services for industrial cooling towers. Our teams inspect mechanical components, fillings and water distribution systems, carry out cleaning, lubrication and alignment works, and record all activities in line with our standard procedures. In this way, we help you minimize unplanned downtime, extend equipment lifetime and keep cooling performance as close as possible to the design values.',
  'FRP body, galvanized steel frame, PVC/PVDF fills, stainless steel fasteners',
  'Priced based on scope, tower capacity and service frequency',
  'Periodic inspections and reporting, mechanical maintenance, cleaning and condition checks, replacement of critical spare parts',
  'Up to 12 months workmanship warranty, plus manufacturer warranty for supplied parts',
  'Industrial cooling tower maintenance and repair service',
  'maintenance, repair, service, periodic maintenance, industrial cooling tower',
  'Maintenance & Repair | Ensotek',
  'Ensotek provides periodic maintenance and professional repair services for industrial cooling towers. Planned maintenance programs and expert interventions help reduce performance loss and unplanned downtime.',
  'cooling tower maintenance, industrial maintenance service, periodic maintenance program',
  '2024-01-01 00:00:00.000',
  '2024-01-01 00:00:00.000'
)
ON DUPLICATE KEY UPDATE
 `slug`             = VALUES(`slug`),
 `name`             = VALUES(`name`),
 `description`      = VALUES(`description`),
 `material`         = VALUES(`material`),
 `price`            = VALUES(`price`),
 `includes`         = VALUES(`includes`),
 `warranty`         = VALUES(`warranty`),
 `image_alt`        = VALUES(`image_alt`),
 `tags`             = VALUES(`tags`),
 `meta_title`       = VALUES(`meta_title`),
 `meta_description` = VALUES(`meta_description`),
 `meta_keywords`    = VALUES(`meta_keywords`),
 `updated_at`       = VALUES(`updated_at`);


-- ---------------------------------------------------------
-- 2) Modernization
-- ---------------------------------------------------------

SET @SRV_MOD_ID := (
  SELECT s.id
  FROM services s
  JOIN services_i18n i ON i.service_id = s.id AND i.locale = 'tr'
  WHERE i.slug = 'modernizasyon'
  LIMIT 1
);

INSERT INTO `services_i18n`
(`id`,`service_id`,`locale`,
 `slug`,`name`,
 `description`,`material`,`price`,
 `includes`,`warranty`,`image_alt`,
 `tags`,`meta_title`,`meta_description`,`meta_keywords`,
 `created_at`,`updated_at`)
VALUES
(
  UUID(),
  @SRV_MOD_ID,
  'en',
  'modernization',
  'Modernization',
  'We offer modernization solutions to upgrade your existing cooling towers to current efficiency and performance standards. Ensotek replaces outdated equipment with high–efficiency fans and motors, new generation PVC/PVDF fills, advanced water distribution systems and modern automation. Modernization projects allow you to increase cooling capacity or reduce energy consumption without investing in completely new towers. All design and implementation steps are based on performance calculations, site conditions and process requirements.',
  'High–efficiency FRP body, energy–saving fan and motor assemblies, new generation PVC/PVDF fills',
  'Priced after on-site assessment and performance analysis',
  'Performance assessment, modernization design, supply of new equipment, installation and commissioning, performance verification tests',
  '12–24 months equipment and workmanship warranty depending on the selected configuration',
  'Main image of modernized industrial cooling towers',
  'modernization, retrofit, energy efficiency, tower upgrade, performance improvement',
  'Modernization | Ensotek',
  'Ensotek provides modernization solutions for existing cooling towers with a strong focus on energy efficiency. By upgrading fans, fills, water distribution systems and automation, you can achieve higher performance with lower energy consumption.',
  'cooling tower modernization, retrofit solutions, energy saving, performance upgrade',
  '2024-01-01 00:00:00.000',
  '2024-01-01 00:00:00.000'
)
ON DUPLICATE KEY UPDATE
 `slug`             = VALUES(`slug`),
 `name`             = VALUES(`name`),
 `description`      = VALUES(`description`),
 `material`         = VALUES(`material`),
 `price`            = VALUES(`price`),
 `includes`         = VALUES(`includes`),
 `warranty`         = VALUES(`warranty`),
 `image_alt`        = VALUES(`image_alt`),
 `tags`             = VALUES(`tags`),
 `meta_title`       = VALUES(`meta_title`),
 `meta_description` = VALUES(`meta_description`),
 `meta_keywords`    = VALUES(`meta_keywords`),
 `updated_at`       = VALUES(`updated_at`);


-- ---------------------------------------------------------
-- 3) Spare Parts & Components
-- ---------------------------------------------------------

SET @SRV_SPARE_ID := (
  SELECT s.id
  FROM services s
  JOIN services_i18n i ON i.service_id = s.id AND i.locale = 'tr'
  WHERE i.slug = 'yedek-parcalar-ve-bilesenler'
  LIMIT 1
);

INSERT INTO `services_i18n`
(`id`,`service_id`,`locale`,
 `slug`,`name`,
 `description`,`material`,`price`,
 `includes`,`warranty`,`image_alt`,
 `tags`,`meta_title`,`meta_description`,`meta_keywords`,
 `created_at`,`updated_at`)
VALUES
(
  UUID(),
  @SRV_SPARE_ID,
  'en',
  'spare-parts-and-components',
  'Spare Parts & Components',
  'We supply a wide range of high–quality spare parts and components to keep your cooling towers operating with minimum downtime. Ensotek provides fans, gearboxes, motors, fill packs, drift eliminators, nozzles, structural FRP and steel parts, as well as many other accessories. Our technical team supports you in selecting the right part based on tower type, operating conditions and process requirements, helping you avoid mismatches and unplanned failures.',
  'FRP and galvanized structural components, PVC/PVDF fills, drift eliminators, nozzles, fan–motor–gearbox assemblies',
  'Quoted based on part type, quantity and delivery conditions',
  'Technical selection support, equivalent product alternatives, fast delivery and, upon request, on-site replacement',
  'Manufacturer warranty applies for all supplied parts; optional installation warranty on request',
  'Cooling tower spare parts and components',
  'spare parts, tower components, fan, fill, drift eliminator, nozzles',
  'Spare Parts & Components | Ensotek',
  'Ensotek supplies a comprehensive portfolio of cooling tower spare parts such as fans, motors, gearboxes, fill packs, drift eliminators and nozzles. Proper part selection and fast delivery help reduce downtime and operating risks.',
  'cooling tower spare parts, tower components, industrial spare part supply',
  '2024-01-01 00:00:00.000',
  '2024-01-01 00:00:00.000'
)
ON DUPLICATE KEY UPDATE
 `slug`             = VALUES(`slug`),
 `name`             = VALUES(`name`),
 `description`      = VALUES(`description`),
 `material`         = VALUES(`material`),
 `price`            = VALUES(`price`),
 `includes`         = VALUES(`includes`),
 `warranty`         = VALUES(`warranty`),
 `image_alt`        = VALUES(`image_alt`),
 `tags`             = VALUES(`tags`),
 `meta_title`       = VALUES(`meta_title`),
 `meta_description` = VALUES(`meta_description`),
 `meta_keywords`    = VALUES(`meta_keywords`),
 `updated_at`       = VALUES(`updated_at`);


-- ---------------------------------------------------------
-- 4) Applications & References
-- ---------------------------------------------------------

SET @SRV_APPREF_ID := (
  SELECT s.id
  FROM services s
  JOIN services_i18n i ON i.service_id = s.id AND i.locale = 'tr'
  WHERE i.slug = 'uygulamalar-ve-referanslar'
  LIMIT 1
);

INSERT INTO `services_i18n`
(`id`,`service_id`,`locale`,
 `slug`,`name`,
 `description`,`material`,`price`,
 `includes`,`warranty`,`image_alt`,
 `tags`,`meta_title`,`meta_description`,`meta_keywords`,
 `created_at`,`updated_at`)
VALUES
(
  UUID(),
  @SRV_APPREF_ID,
  'en',
  'applications-and-references',
  'Applications & References',
  'Ensotek has extensive reference projects and real–world applications in many industries including energy, chemicals, food & beverage, pharmaceuticals, automotive, steel and general process industries. We design and supply open– and closed–circuit FRP cooling towers for different capacities, environments with high corrosion risk and projects with limited installation space. Our reference plants demonstrate long–term stable operation, low operating costs and proven field performance. Upon request, we can share sector–specific reference lists and sample project summaries.',
  NULL,
  'Depends on project scope and application',
  'Sector–specific reference lists, sample project documentation, technical solution proposals, on–site assessment and consulting',
  NULL,
  'Applications and reference projects of Ensotek',
  'references, applications, projects, energy sector, process water, industrial cooling',
  'Applications & References | Ensotek',
  'Ensotek has a broad portfolio of reference projects with FRP cooling towers in many industries such as energy, chemicals, food, pharmaceuticals and automotive. We deliver sector–specific cooling solutions with proven performance and long service life.',
  'cooling tower references, industrial applications, sector specific projects',
  '2024-01-01 00:00:00.000',
  '2024-01-01 00:00:00.000'
)
ON DUPLICATE KEY UPDATE
 `slug`             = VALUES(`slug`),
 `name`             = VALUES(`name`),
 `description`      = VALUES(`description`),
 `material`         = VALUES(`material`),
 `price`            = VALUES(`price`),
 `includes`         = VALUES(`includes`),
 `warranty`         = VALUES(`warranty`),
 `image_alt`        = VALUES(`image_alt`),
 `tags`             = VALUES(`tags`),
 `meta_title`       = VALUES(`meta_title`),
 `meta_description` = VALUES(`meta_description`),
 `meta_keywords`    = VALUES(`meta_keywords`),
 `updated_at`       = VALUES(`updated_at`);


-- ---------------------------------------------------------
-- 5) Engineering Support
-- ---------------------------------------------------------

SET @SRV_ENGSUP_ID := (
  SELECT s.id
  FROM services s
  JOIN services_i18n i ON i.service_id = s.id AND i.locale = 'tr'
  WHERE i.slug = 'muhendislik-destegi'
  LIMIT 1
);

INSERT INTO `services_i18n`
(`id`,`service_id`,`locale`,
 `slug`,`name`,
 `description`,`material`,`price`,
 `includes`,`warranty`,`image_alt`,
 `tags`,`meta_title`,`meta_description`,`meta_keywords`,
 `created_at`,`updated_at`)
VALUES
(
  UUID(),
  @SRV_ENGSUP_ID,
  'en',
  'engineering-support',
  'Engineering Support',
  'Ensotek provides comprehensive engineering support for cooling tower projects from pre–study to commissioning and beyond. Our engineering services include thermal and hydraulic calculations, tower sizing, material and configuration selection, layout and installation planning. We also perform on–site performance measurements, troubleshoot existing installations, propose optimization measures and deliver technical training to your operation team so that they can run the system more safely and efficiently.',
  NULL,
  'Priced based on scope of engineering work',
  'Pre–study and feasibility, hydraulic/thermal calculations, on–site surveys, reporting, project meetings and technical trainings',
  NULL,
  'Engineering support service image description',
  'engineering support, project consulting, tower selection, performance analysis',
  'Engineering Support | Ensotek',
  'Ensotek delivers comprehensive engineering support for cooling towers, including hydraulic and thermal calculations, tower selection, project consulting, performance analysis and technical trainings.',
  'cooling tower engineering support, project consulting, performance analysis',
  '2024-01-01 00:00:00.000',
  '2024-01-01 00:00:00.000'
)
ON DUPLICATE KEY UPDATE
 `slug`             = VALUES(`slug`),
 `name`             = VALUES(`name`),
 `description`      = VALUES(`description`),
 `material`         = VALUES(`material`),
 `price`            = VALUES(`price`),
 `includes`         = VALUES(`includes`),
 `warranty`         = VALUES(`warranty`),
 `image_alt`        = VALUES(`image_alt`),
 `tags`             = VALUES(`tags`),
 `meta_title`       = VALUES(`meta_title`),
 `meta_description` = VALUES(`meta_description`),
 `meta_keywords`    = VALUES(`meta_keywords`),
 `updated_at`       = VALUES(`updated_at`);


-- ---------------------------------------------------------
-- 6) Production
-- ---------------------------------------------------------

SET @SRV_PROD_ID := (
  SELECT s.id
  FROM services s
  JOIN services_i18n i ON i.service_id = s.id AND i.locale = 'tr'
  WHERE i.slug = 'uretim'
  LIMIT 1
);

INSERT INTO `services_i18n`
(`id`,`service_id`,`locale`,
 `slug`,`name`,
 `description`,`material`,`price`,
 `includes`,`warranty`,`image_alt`,
 `tags`,`meta_title`,`meta_description`,`meta_keywords`,
 `created_at`,`updated_at`)
VALUES
(
  UUID(),
  @SRV_PROD_ID,
  'en',
  'production',
  'Production',
  'Ensotek is specialized in the design and manufacturing of open– and closed–circuit FRP cooling towers. We use corrosion–resistant materials, high–quality resins and durable metal components to ensure long service life and reliable operation. In addition to standard tower types, we design tailor–made solutions according to process requirements and site constraints such as limited footprint, special water quality or extreme ambient conditions. All manufacturing stages from design and mould production to mechanical assembly and quality control are documented and carried out in accordance with international standards.',
  'FRP panels, galvanized steel structures, stainless fasteners, PVC/PVDF fills and drift eliminators',
  'Project–based pricing depending on tower type, capacity and options',
  'Standard or custom tower design, factory assembly, pre–shipment tests, on–site erection and commissioning',
  'Extended material warranty for tower body and manufacturer warranty for all supplied equipment',
  'Industrial FRP cooling tower production',
  'production, FRP cooling tower, industrial tower manufacturing, open circuit, closed circuit',
  'Production | Ensotek',
  'Ensotek specializes in the design and manufacturing of industrial FRP cooling towers for open and closed circuit systems, offering corrosion–resistant structures, high quality components and long–term reliable operation.',
  'FRP cooling tower production, industrial manufacturing, custom cooling tower design',
  '2024-01-01 00:00:00.000',
  '2024-01-01 00:00:00.000'
)
ON DUPLICATE KEY UPDATE
 `slug`             = VALUES(`slug`),
 `name`             = VALUES(`name`),
 `description`      = VALUES(`description`),
 `material`         = VALUES(`material`),
 `price`            = VALUES(`price`),
 `includes`         = VALUES(`includes`),
 `warranty`         = VALUES(`warranty`),
 `image_alt`        = VALUES(`image_alt`),
 `tags`             = VALUES(`tags`),
 `meta_title`       = VALUES(`meta_title`),
 `meta_description` = VALUES(`meta_description`),
 `meta_keywords`    = VALUES(`meta_keywords`),
 `updated_at`       = VALUES(`updated_at`);

COMMIT;
