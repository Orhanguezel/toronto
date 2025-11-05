import {
  mysqlTable, mysqlSchema,
  char, varchar, tinyint, int, datetime, text, index, uniqueIndex
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const services = mysqlTable(
  "services",
  {
    id: char("id", { length: 36 }).notNull().primaryKey(),

    // non-i18n
    type: varchar("type", { length: 32 }).notNull().default("other"),
    category: varchar("category", { length: 64 }).notNull().default("general"),
    featured: tinyint("featured").notNull().default(0),
    is_active: tinyint("is_active").notNull().default(1),
    display_order: int("display_order").notNull().default(1),

    // ana görsel alanları (legacy + storage)
    featured_image: varchar("featured_image", { length: 500 }), // legacy
    image_url: varchar("image_url", { length: 500 }),           // legacy
    image_asset_id: char("image_asset_id", { length: 36 }),     // storage_assets.id

    // tip-özeline özgü (non-i18n)
    area: varchar("area", { length: 64 }),
    duration: varchar("duration", { length: 64 }),
    maintenance: varchar("maintenance", { length: 64 }),
    season: varchar("season", { length: 64 }),
    soil_type: varchar("soil_type", { length: 128 }),
    thickness: varchar("thickness", { length: 64 }),
    equipment: varchar("equipment", { length: 128 }),

    created_at: datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    index("services_active_idx").on(t.is_active),
    index("services_order_idx").on(t.display_order),
    index("services_type_idx").on(t.type),
    index("services_category_idx").on(t.category),
    index("services_asset_idx").on(t.image_asset_id),
    index("services_created_idx").on(t.created_at),
    index("services_updated_idx").on(t.updated_at),
  ],
);

export type ServiceRow = typeof services.$inferSelect;
export type NewServiceRow = typeof services.$inferInsert;

/** i18n: slug, name, description, material, price, includes, warranty, image_alt */
export const servicesI18n = mysqlTable(
  "services_i18n",
  {
    id: char("id", { length: 36 }).notNull().primaryKey(),
    service_id: char("service_id", { length: 36 }).notNull(),
    locale: varchar("locale", { length: 10 }).notNull(),

    slug: varchar("slug", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    material: varchar("material", { length: 255 }),
    price: varchar("price", { length: 128 }),
    includes: varchar("includes", { length: 255 }),
    warranty: varchar("warranty", { length: 128 }),
    image_alt: varchar("image_alt", { length: 255 }),

    created_at: datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("ux_services_i18n_unique").on(t.service_id, t.locale),
    uniqueIndex("ux_services_locale_slug").on(t.locale, t.slug),
    index("services_i18n_slug_idx").on(t.slug),
    index("services_i18n_name_idx").on(t.name),
    index("services_i18n_created_idx").on(t.created_at),
    index("services_i18n_updated_idx").on(t.updated_at),
  ],
);

export type ServiceI18nRow = typeof servicesI18n.$inferSelect;
export type NewServiceI18nRow = typeof servicesI18n.$inferInsert;

/** Gallery images */
export const serviceImages = mysqlTable(
  "service_images",
  {
    id: char("id", { length: 36 }).notNull().primaryKey(),
    service_id: char("service_id", { length: 36 }).notNull(),

    image_asset_id: char("image_asset_id", { length: 36 }),
    image_url: varchar("image_url", { length: 500 }),

    is_active: tinyint("is_active").notNull().default(1),
    display_order: int("display_order").notNull().default(0),

    created_at: datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    index("service_images_service_idx").on(t.service_id),
    index("service_images_active_idx").on(t.is_active),
    index("service_images_order_idx").on(t.display_order),
    index("service_images_asset_idx").on(t.image_asset_id),
  ],
);

export type ServiceImageRow = typeof serviceImages.$inferSelect;
export type NewServiceImageRow = typeof serviceImages.$inferInsert;

export const serviceImagesI18n = mysqlTable(
  "service_images_i18n",
  {
    id: char("id", { length: 36 }).notNull().primaryKey(),
    image_id: char("image_id", { length: 36 }).notNull(),
    locale: varchar("locale", { length: 10 }).notNull(),

    title: varchar("title", { length: 255 }),
    alt: varchar("alt", { length: 255 }),
    caption: varchar("caption", { length: 500 }),

    created_at: datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("ux_service_images_i18n_unique").on(t.image_id, t.locale),
    index("service_images_i18n_locale_idx").on(t.locale),
  ],
);

export type ServiceImageI18nRow = typeof serviceImagesI18n.$inferSelect;
export type NewServiceImageI18nRow = typeof serviceImagesI18n.$inferInsert;
