// =============================================================
// FILE: src/modules/subcategories/schema.ts
// =============================================================
import {
  mysqlTable,
  char,
  varchar,
  longtext,
  text,
  int,
  tinyint,
  datetime,
  index,
  uniqueIndex,
  foreignKey,
  primaryKey,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { categories } from "../categories/schema";

export const subCategories = mysqlTable(
  "sub_categories",
  {
    id: char("id", { length: 36 }).notNull().primaryKey(),
    category_id: char("category_id", { length: 36 }).notNull(),

    // Tekil storage pattern (base tablo)
    image_url: longtext("image_url"),
    storage_asset_id: char("storage_asset_id", { length: 36 }),
    alt: varchar("alt", { length: 255 }),

    icon: varchar("icon", { length: 100 }),

    is_active: tinyint("is_active").notNull().default(1).$type<boolean>(),
    is_featured: tinyint("is_featured").notNull().default(0).$type<boolean>(),
    display_order: int("display_order").notNull().default(0),

    created_at: datetime("created_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => ({
    sub_categories_category_id_idx: index(
      "sub_categories_category_id_idx",
    ).on(t.category_id),
    sub_categories_active_idx: index("sub_categories_active_idx").on(
      t.is_active,
    ),
    sub_categories_order_idx: index("sub_categories_order_idx").on(
      t.display_order,
    ),
    sub_categories_storage_asset_idx: index(
      "sub_categories_storage_asset_idx",
    ).on(t.storage_asset_id),
    fk_sub_categories_category: foreignKey({
      columns: [t.category_id],
      foreignColumns: [categories.id],
      name: "fk_sub_categories_category",
    })
      .onDelete("restrict")
      .onUpdate("cascade"),
  }),
);

export const subCategoryI18n = mysqlTable(
  "sub_category_i18n",
  {
    sub_category_id: char("sub_category_id", { length: 36 }).notNull(),
    locale: varchar("locale", { length: 8 }).notNull().default("tr"),

    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),

    description: text("description"),
    alt: varchar("alt", { length: 255 }),

    created_at: datetime("created_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => ({
    pk: primaryKey({
      name: "sub_category_i18n_pk",
      columns: [t.sub_category_id, t.locale],
    }),
    sub_category_i18n_locale_slug_uq: uniqueIndex(
      "sub_category_i18n_locale_slug_uq",
    ).on(t.locale, t.slug),
    sub_category_i18n_locale_idx: index(
      "sub_category_i18n_locale_idx",
    ).on(t.locale),
    fk_sub_category_i18n_sub_category: foreignKey({
      columns: [t.sub_category_id],
      foreignColumns: [subCategories.id],
      name: "fk_sub_category_i18n_sub_category",
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
  }),
);

export type SubCategoryRow = typeof subCategories.$inferSelect;
export type NewSubCategoryRow = typeof subCategories.$inferInsert;

export type SubCategoryI18nRow = typeof subCategoryI18n.$inferSelect;
export type NewSubCategoryI18nRow = typeof subCategoryI18n.$inferInsert;
