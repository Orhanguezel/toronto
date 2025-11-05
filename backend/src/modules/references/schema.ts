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
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

/** LONGTEXT helper */
const longtext = customType<{ data: string; driverData: string }>({
  dataType() { return "longtext"; },
});

export const references = mysqlTable(
  "references",
  {
    id: char("id", { length: 36 }).primaryKey().notNull(),

    is_published: tinyint("is_published").notNull().default(0),
    is_featured: tinyint("is_featured").notNull().default(0),
    display_order: int("display_order").notNull().default(0),

    featured_image: varchar("featured_image", { length: 500 }),
    featured_image_asset_id: char("featured_image_asset_id", { length: 36 }),

    website_url: varchar("website_url", { length: 500 }),

    created_at: datetime("created_at", { fsp: 3 })
      .notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull().default(sql`CURRENT_TIMESTAMP(3)`).$onUpdateFn(() => new Date()),
  },
  (t) => [
    index("references_created_idx").on(t.created_at),
    index("references_updated_idx").on(t.updated_at),
    index("references_published_idx").on(t.is_published),
    index("references_featured_idx").on(t.is_featured),
    index("references_display_order_idx").on(t.display_order),
    index("references_featured_asset_idx").on(t.featured_image_asset_id),
  ],
);

export const referencesI18n = mysqlTable(
  "references_i18n",
  {
    id: char("id", { length: 36 }).primaryKey().notNull(),
    reference_id: char("reference_id", { length: 36 }).notNull().references(() => references.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    locale: varchar("locale", { length: 10 }).notNull(),

    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),

    summary: longtext("summary"),
    content: longtext("content").notNull(),

    featured_image_alt: varchar("featured_image_alt", { length: 255 }),

    meta_title: varchar("meta_title", { length: 255 }),
    meta_description: varchar("meta_description", { length: 500 }),

    created_at: datetime("created_at", { fsp: 3 })
      .notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull().default(sql`CURRENT_TIMESTAMP(3)`).$onUpdateFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("ux_references_i18n_parent_locale").on(t.reference_id, t.locale),
    uniqueIndex("ux_references_i18n_locale_slug").on(t.locale, t.slug),
    index("references_i18n_locale_idx").on(t.locale),
    index("references_i18n_slug_idx").on(t.slug),
  ],
);

/* ============== GALLERY ============== */
export const referenceImages = mysqlTable(
  "reference_images",
  {
    id: char("id", { length: 36 }).primaryKey().notNull(),
    reference_id: char("reference_id", { length: 36 }).notNull().references(() => references.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    asset_id: char("asset_id", { length: 36 }).notNull(),
    image_url: varchar("image_url", { length: 500 }), // legacy/back-compat

    display_order: int("display_order").notNull().default(0),
    is_active: tinyint("is_active").notNull().default(1),

    created_at: datetime("created_at", { fsp: 3 })
      .notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull().default(sql`CURRENT_TIMESTAMP(3)`).$onUpdateFn(() => new Date()),
  },
  (t) => [
    index("reference_images_reference_idx").on(t.reference_id),
    index("reference_images_asset_idx").on(t.asset_id),
    index("reference_images_active_idx").on(t.is_active),
    index("reference_images_order_idx").on(t.display_order),
  ],
);

export const referenceImagesI18n = mysqlTable(
  "reference_images_i18n",
  {
    id: char("id", { length: 36 }).primaryKey().notNull(),
    image_id: char("image_id", { length: 36 }).notNull().references(() => referenceImages.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    locale: varchar("locale", { length: 10 }).notNull(),
    alt: varchar("alt", { length: 255 }),
    caption: varchar("caption", { length: 1000 }),

    created_at: datetime("created_at", { fsp: 3 })
      .notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull().default(sql`CURRENT_TIMESTAMP(3)`).$onUpdateFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("ux_reference_images_i18n_parent_locale").on(t.image_id, t.locale),
    index("reference_images_i18n_locale_idx").on(t.locale),
  ],
);

export type ReferenceRow = typeof references.$inferSelect;
export type NewReferenceRow = typeof references.$inferInsert;

export type ReferenceI18nRow = typeof referencesI18n.$inferSelect;
export type NewReferenceI18nRow = typeof referencesI18n.$inferInsert;

export type ReferenceImageRow = typeof referenceImages.$inferSelect;
export type NewReferenceImageRow = typeof referenceImages.$inferInsert;

export type ReferenceImageI18nRow = typeof referenceImagesI18n.$inferSelect;
export type NewReferenceImageI18nRow = typeof referenceImagesI18n.$inferInsert;
