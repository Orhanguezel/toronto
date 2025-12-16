// src/modules/customPages/schema.ts
import {
  mysqlTable,
  char,
  varchar,
  tinyint,
  datetime,
  uniqueIndex,
  index,
  customType,
  foreignKey,
  int,       
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { categories } from "@/modules/categories/schema";
import { subCategories } from "@/modules/subcategories/schema";

/** LONGTEXT JSON-string: {"html":"..."} */
const longtext = customType<{ data: string; driverData: string }>({
  dataType() {
    return "longtext";
  },
});

export const customPages = mysqlTable(
  "custom_pages",
  {
    id: char("id", { length: 36 }).primaryKey().notNull(),

    // dil-bağımsız alanlar
    is_published: tinyint("is_published").notNull().default(0),

    /** Sıralama */
    display_order: int("display_order").notNull().default(0),  // 👈 YENİ

    /** Eski/serbest URL (opsiyonel) */
    featured_image: varchar("featured_image", { length: 500 }),
    /** Storage bağı: asset id (opsiyonel) */
    featured_image_asset_id: char("featured_image_asset_id", {
      length: 36,
    }),

    // 🔗 Kategori bağları (news/blog/articles için)
    category_id: char("category_id", { length: 36 }),
    sub_category_id: char("sub_category_id", { length: 36 }),

    created_at: datetime("created_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    index("custom_pages_created_idx").on(t.created_at),
    index("custom_pages_updated_idx").on(t.updated_at),
    index("custom_pages_is_published_idx").on(t.is_published),
    index("custom_pages_featured_asset_idx").on(t.featured_image_asset_id),

    index("custom_pages_category_id_idx").on(t.category_id),
    index("custom_pages_sub_category_id_idx").on(t.sub_category_id),

    index("custom_pages_display_order_idx").on(t.display_order), // 👈 opsiyonel ama güzel

    foreignKey({
      columns: [t.category_id],
      foreignColumns: [categories.id],
      name: "fk_custom_pages_category",
    })
      .onDelete("set null")
      .onUpdate("cascade"),

    foreignKey({
      columns: [t.sub_category_id],
      foreignColumns: [subCategories.id],
      name: "fk_custom_pages_sub_category",
    })
      .onDelete("set null")
      .onUpdate("cascade"),
  ],
);

export const customPagesI18n = mysqlTable(
  "custom_pages_i18n",
  {
    id: char("id", { length: 36 }).primaryKey().notNull(),
    page_id: char("page_id", { length: 36 })
      .notNull()
      .references(() => customPages.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    locale: varchar("locale", { length: 10 }).notNull(),

    // çeviri alanları
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    content: longtext("content").notNull(),

    /** Kısa özet (body’den ayrı, liste ve SEO için) */
    summary: varchar("summary", { length: 1000 }),

    /** Görsel alt metni (çeviri) */
    featured_image_alt: varchar("featured_image_alt", { length: 255 }),

    meta_title: varchar("meta_title", { length: 255 }),
    meta_description: varchar("meta_description", { length: 500 }),

    /** Virgülle ayrılmış tag listesi */
    tags: varchar("tags", { length: 1000 }),

    created_at: datetime("created_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("ux_custom_pages_i18n_parent_locale").on(
      t.page_id,
      t.locale,
    ),
    uniqueIndex("ux_custom_pages_i18n_locale_slug").on(
      t.locale,
      t.slug,
    ),
    index("custom_pages_i18n_locale_idx").on(t.locale),
    index("custom_pages_i18n_slug_idx").on(t.slug),
  ],
);

export type CustomPageRow = typeof customPages.$inferSelect;
export type NewCustomPageRow = typeof customPages.$inferInsert;

export type CustomPageI18nRow = typeof customPagesI18n.$inferSelect;
export type NewCustomPageI18nRow = typeof customPagesI18n.$inferInsert;
