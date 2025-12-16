// src/modules/library/schema.ts
// =============================================================

import {
  mysqlTable,
  char,
  varchar,
  tinyint,
  datetime,
  int,
  index,
  uniqueIndex,
  customType,
  foreignKey,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { categories } from "@/modules/categories/schema";
import { subCategories } from "@/modules/subcategories/schema";

/** LONGTEXT helper */
const longtext = customType<{ data: string; driverData: string }>({
  dataType() {
    return "longtext";
  },
});

/* ============== LIBRARY PARENT ============== */

export const library = mysqlTable(
  "library",
  {
    id: char("id", { length: 36 }).primaryKey().notNull(),

    is_published: tinyint("is_published").notNull().default(0),
    is_active: tinyint("is_active").notNull().default(1),
    display_order: int("display_order").notNull().default(0),

    // Tag listesi JSON-string (["tag1","tag2"])
    tags_json: longtext("tags_json"),

    // 🔗 Kategori bağları (opsiyonel)
    category_id: char("category_id", { length: 36 }),
    sub_category_id: char("sub_category_id", { length: 36 }),

    author: varchar("author", { length: 255 }),

    views: int("views").notNull().default(0),
    download_count: int("download_count").notNull().default(0),

    published_at: datetime("published_at", { fsp: 3 }),

    created_at: datetime("created_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    index("library_created_idx").on(t.created_at),
    index("library_updated_idx").on(t.updated_at),
    index("library_published_idx").on(t.is_published),
    index("library_active_idx").on(t.is_active),
    index("library_display_order_idx").on(t.display_order),
    index("library_published_at_idx").on(t.published_at),
    index("library_views_idx").on(t.views),
    index("library_download_idx").on(t.download_count),

    index("library_category_id_idx").on(t.category_id),
    index("library_sub_category_id_idx").on(t.sub_category_id),

    foreignKey({
      columns: [t.category_id],
      foreignColumns: [categories.id],
      name: "fk_library_category",
    })
      .onDelete("set null")
      .onUpdate("cascade"),

    foreignKey({
      columns: [t.sub_category_id],
      foreignColumns: [subCategories.id],
      name: "fk_library_sub_category",
    })
      .onDelete("set null")
      .onUpdate("cascade"),
  ],
);

/* ============== LIBRARY I18N ============== */

export const libraryI18n = mysqlTable(
  "library_i18n",
  {
    id: char("id", { length: 36 }).primaryKey().notNull(),
    library_id: char("library_id", { length: 36 })
      .notNull()
      .references(() => library.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    locale: varchar("locale", { length: 10 }).notNull(),

    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),

    summary: longtext("summary"),
    content: longtext("content").notNull(),

    meta_title: varchar("meta_title", { length: 255 }),
    meta_description: varchar("meta_description", { length: 500 }),

    created_at: datetime("created_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("ux_library_i18n_parent_locale").on(
      t.library_id,
      t.locale,
    ),
    uniqueIndex("ux_library_i18n_locale_slug").on(t.locale, t.slug),
    index("library_i18n_locale_idx").on(t.locale),
    index("library_i18n_slug_idx").on(t.slug),
  ],
);

/* ============== IMAGES ============== */

export const libraryImages = mysqlTable(
  "library_images",
  {
    id: char("id", { length: 36 }).primaryKey().notNull(),
    library_id: char("library_id", { length: 36 })
      .notNull()
      .references(() => library.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    asset_id: char("asset_id", { length: 36 }).notNull(),

    // direkt URL (legacy/back-compat)
    image_url: varchar("image_url", { length: 500 }),

    // opsiyonel thumb / webp varyantları (istersen kullanırsın)
    thumb_url: varchar("thumb_url", { length: 500 }),
    webp_url: varchar("webp_url", { length: 500 }),

    display_order: int("display_order").notNull().default(0),
    is_active: tinyint("is_active").notNull().default(1),

    created_at: datetime("created_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    index("library_images_library_idx").on(t.library_id),
    index("library_images_asset_idx").on(t.asset_id),
    index("library_images_active_idx").on(t.is_active),
    index("library_images_order_idx").on(t.display_order),
  ],
);

export const libraryImagesI18n = mysqlTable(
  "library_images_i18n",
  {
    id: char("id", { length: 36 }).primaryKey().notNull(),
    image_id: char("image_id", { length: 36 })
      .notNull()
      .references(() => libraryImages.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    locale: varchar("locale", { length: 10 }).notNull(),
    alt: varchar("alt", { length: 255 }),
    caption: varchar("caption", { length: 1000 }),

    created_at: datetime("created_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("ux_library_images_i18n_parent_locale").on(
      t.image_id,
      t.locale,
    ),
    index("library_images_i18n_locale_idx").on(t.locale),
  ],
);

/* ============== FILES ============== */

export const libraryFiles = mysqlTable(
  "library_files",
  {
    id: char("id", { length: 36 }).primaryKey().notNull(),
    library_id: char("library_id", { length: 36 })
      .notNull()
      .references(() => library.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    asset_id: char("asset_id", { length: 36 }).notNull(),

    file_url: varchar("file_url", { length: 500 }),
    name: varchar("name", { length: 255 }).notNull(),

    size_bytes: int("size_bytes"),
    mime_type: varchar("mime_type", { length: 255 }),

    // tags_json → DTO'da tags: string[] | null
    tags_json: longtext("tags_json"),

    display_order: int("display_order").notNull().default(0),
    is_active: tinyint("is_active").notNull().default(1),

    created_at: datetime("created_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    index("library_files_library_idx").on(t.library_id),
    index("library_files_asset_idx").on(t.asset_id),
    index("library_files_active_idx").on(t.is_active),
    index("library_files_order_idx").on(t.display_order),
  ],
);

/* ============== TYPES ============== */

export type LibraryRow = typeof library.$inferSelect;
export type NewLibraryRow = typeof library.$inferInsert;

export type LibraryI18nRow = typeof libraryI18n.$inferSelect;
export type NewLibraryI18nRow = typeof libraryI18n.$inferInsert;

export type LibraryImageRow = typeof libraryImages.$inferSelect;
export type NewLibraryImageRow = typeof libraryImages.$inferInsert;

export type LibraryImageI18nRow = typeof libraryImagesI18n.$inferSelect;
export type NewLibraryImageI18nRow = typeof libraryImagesI18n.$inferInsert;

export type LibraryFileRow = typeof libraryFiles.$inferSelect;
export type NewLibraryFileRow = typeof libraryFiles.$inferInsert;
