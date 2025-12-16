// src/modules/services/schema.ts
// =============================================================

import {
  mysqlTable,
  char,
  varchar,
  tinyint,
  int,
  datetime,
  text,
  index,
  uniqueIndex,
  foreignKey,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { categories } from "@/modules/categories/schema";
import { subCategories } from "@/modules/subcategories/schema";
import { storageAssets } from "@/modules/storage/schema";

export const services = mysqlTable(
  "services",
  {
    id: char("id", { length: 36 }).notNull().primaryKey(),

    // non-i18n
    type: varchar("type", { length: 32 }).notNull().default("other"),

    // category relations
    category_id: char("category_id", { length: 36 }),
    sub_category_id: char("sub_category_id", { length: 36 }),

    featured: tinyint("featured").notNull().default(0),
    is_active: tinyint("is_active").notNull().default(1),
    display_order: int("display_order").notNull().default(0),

    // ana görsel alanları (legacy + storage)
    featured_image: varchar("featured_image", { length: 500 }), // legacy
    image_url: varchar("image_url", { length: 500 }), // legacy
    image_asset_id: char("image_asset_id", { length: 36 }), // storage_assets.id

    created_at: datetime("created_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    index("services_active_idx").on(t.is_active),
    index("services_order_idx").on(t.display_order),
    index("services_type_idx").on(t.type),
    index("services_category_id_idx").on(t.category_id),
    index("services_sub_category_id_idx").on(t.sub_category_id),
    index("services_asset_idx").on(t.image_asset_id),
    index("services_created_idx").on(t.created_at),
    index("services_updated_idx").on(t.updated_at),

    foreignKey({
      columns: [t.category_id],
      foreignColumns: [categories.id],
      name: "fk_services_category",
    })
      .onDelete("set null")
      .onUpdate("cascade"),

    foreignKey({
      columns: [t.sub_category_id],
      foreignColumns: [subCategories.id],
      name: "fk_services_sub_category",
    })
      .onDelete("set null")
      .onUpdate("cascade"),

    foreignKey({
      columns: [t.image_asset_id],
      foreignColumns: [storageAssets.id],
      name: "fk_services_featured_asset",
    })
      .onDelete("set null")
      .onUpdate("cascade"),
  ],
);

export type ServiceRow = typeof services.$inferSelect;
export type NewServiceRow = typeof services.$inferInsert;

/** i18n: slug, name, description, material, price, includes, warranty, image_alt, tags, meta_* */
export const servicesI18n = mysqlTable(
  "services_i18n",
  {
    id: char("id", { length: 36 }).notNull().primaryKey(),
    service_id: char("service_id", { length: 36 })
      .notNull()
      .references(() => services.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    locale: varchar("locale", { length: 10 }).notNull(),

    slug: varchar("slug", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    material: varchar("material", { length: 255 }),
    price: varchar("price", { length: 128 }),
    includes: varchar("includes", { length: 255 }),
    warranty: varchar("warranty", { length: 128 }),
    image_alt: varchar("image_alt", { length: 255 }),

    tags: varchar("tags", { length: 255 }),
    meta_title: varchar("meta_title", { length: 255 }),
    meta_description: varchar("meta_description", { length: 500 }),
    meta_keywords: varchar("meta_keywords", { length: 255 }),

    created_at: datetime("created_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
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
    service_id: char("service_id", { length: 36 })
      .notNull()
      .references(() => services.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    image_asset_id: char("image_asset_id", { length: 36 }).references(
      () => storageAssets.id,
      {
        onDelete: "set null",
        onUpdate: "cascade",
      },
    ),
    image_url: varchar("image_url", { length: 500 }),

    is_active: tinyint("is_active").notNull().default(1),
    display_order: int("display_order").notNull().default(0),

    created_at: datetime("created_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
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
    image_id: char("image_id", { length: 36 })
      .notNull()
      .references(() => serviceImages.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    locale: varchar("locale", { length: 10 }).notNull(),

    title: varchar("title", { length: 255 }),
    alt: varchar("alt", { length: 255 }),
    caption: varchar("caption", { length: 500 }),

    created_at: datetime("created_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("ux_service_images_i18n_unique").on(
      t.image_id,
      t.locale,
    ),
    index("service_images_i18n_locale_idx").on(t.locale),
  ],
);

export type ServiceImageI18nRow = typeof serviceImagesI18n.$inferSelect;
export type NewServiceImageI18nRow = typeof serviceImagesI18n.$inferInsert;
