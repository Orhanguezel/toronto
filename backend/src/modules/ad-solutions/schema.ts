import {
  mysqlTable,
  char,
  varchar,
  tinyint,
  int,
  datetime,
  customType,
  index,
  uniqueIndex,
  text,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

/** LONGTEXT */
const longtext = customType<{ data: string; driverData: string }>({
  dataType() {
    return "longtext";
  },
});

/* --------- parent --------- */
export const adSolutions = mysqlTable(
  "ad_solutions",
  {
    id: char("id", { length: 36 }).primaryKey().notNull(),

    category: varchar("category", { length: 64 }).notNull().default("general"),
    featured: tinyint("featured").notNull().default(0),
    is_active: tinyint("is_active").notNull().default(1),
    display_order: int("display_order").notNull().default(0),

    // Ana görsel (legacy + storage)
    featured_image: varchar("featured_image", { length: 500 }),
    image_url: varchar("image_url", { length: 500 }),
    image_asset_id: char("image_asset_id", { length: 36 }),

    created_at: datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    index("adsol_active_idx").on(t.is_active),
    index("adsol_featured_idx").on(t.featured),
    index("adsol_order_idx").on(t.display_order),
    index("adsol_category_idx").on(t.category),
    index("adsol_asset_idx").on(t.image_asset_id),
    index("adsol_created_idx").on(t.created_at),
    index("adsol_updated_idx").on(t.updated_at),
  ],
);

export type AdSolutionRow = typeof adSolutions.$inferSelect;
export type NewAdSolutionRow = typeof adSolutions.$inferInsert;

/* --------- i18n (name/slug/content/meta) --------- */
export const adSolutionsI18n = mysqlTable(
  "ad_solutions_i18n",
  {
    id: char("id", { length: 36 }).primaryKey().notNull(),
    ad_id: char("ad_id", { length: 36 }).notNull(),
    locale: varchar("locale", { length: 10 }).notNull(),

    name: varchar("name", { length: 255 }),
    slug: varchar("slug", { length: 255 }),
    summary: text("summary"),
    content: longtext("content"),

    image_alt: varchar("image_alt", { length: 255 }),
    meta_title: varchar("meta_title", { length: 255 }),
    meta_description: varchar("meta_description", { length: 500 }),

    created_at: datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("ux_adsol_i18n_pair").on(t.ad_id, t.locale),
    uniqueIndex("ux_adsol_slug_loc").on(t.locale, t.slug),
    index("adsol_i18n_name_idx").on(t.name),
    index("adsol_i18n_created_idx").on(t.created_at),
    index("adsol_i18n_updated_idx").on(t.updated_at),
  ],
);

export type AdSolutionI18nRow = typeof adSolutionsI18n.$inferSelect;
export type NewAdSolutionI18nRow = typeof adSolutionsI18n.$inferInsert;

/* --------- gallery --------- */
export const adSolutionImages = mysqlTable(
  "ad_solution_images",
  {
    id: char("id", { length: 36 }).primaryKey().notNull(),
    ad_id: char("ad_id", { length: 36 }).notNull(),

    image_asset_id: char("image_asset_id", { length: 36 }),
    image_url: varchar("image_url", { length: 500 }),

    is_active: tinyint("is_active").notNull().default(1),
    display_order: int("display_order").notNull().default(0),

    created_at: datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    index("adsol_img_ad_idx").on(t.ad_id),
    index("adsol_img_active_idx").on(t.is_active),
    index("adsol_img_order_idx").on(t.display_order),
    index("adsol_img_asset_idx").on(t.image_asset_id),
  ],
);

export type AdSolutionImageRow = typeof adSolutionImages.$inferSelect;
export type NewAdSolutionImageRow = typeof adSolutionImages.$inferInsert;

/* --------- gallery i18n --------- */
export const adSolutionImagesI18n = mysqlTable(
  "ad_solution_images_i18n",
  {
    id: char("id", { length: 36 }).primaryKey().notNull(),
    image_id: char("image_id", { length: 36 }).notNull(),
    locale: varchar("locale", { length: 10 }).notNull(),
    title: varchar("title", { length: 255 }),
    alt: varchar("alt", { length: 255 }),
    caption: varchar("caption", { length: 500 }),

    created_at: datetime("created_at", { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("ux_adsol_img_i18n_pair").on(t.image_id, t.locale),
    index("adsol_img_i18n_created_idx").on(t.created_at),
    index("adsol_img_i18n_updated_idx").on(t.updated_at),
  ],
);

export type AdSolutionImageI18nRow = typeof adSolutionImagesI18n.$inferSelect;
export type NewAdSolutionImageI18nRow = typeof adSolutionImagesI18n.$inferInsert;
