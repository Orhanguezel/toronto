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

/** LONGTEXT types */
const longtext = customType<{ data: string; driverData: string }>({
  dataType() { return "longtext"; },
});

export const projects = mysqlTable(
  "projects",
  {
    id: char("id", { length: 36 }).primaryKey().notNull(),

    is_published: tinyint("is_published").notNull().default(0),
    is_featured: tinyint("is_featured").notNull().default(0),
    display_order: int("display_order").notNull().default(0),

    // main visual
    featured_image: varchar("featured_image", { length: 500 }),
    featured_image_asset_id: char("featured_image_asset_id", { length: 36 }),

    // links
    demo_url: varchar("demo_url", { length: 500 }),
    repo_url: varchar("repo_url", { length: 500 }),

    // JSON-string: string[] (tech stack)
    techs: longtext("techs"),

    created_at: datetime("created_at", { fsp: 3 })
      .notNull().default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime("updated_at", { fsp: 3 })
      .notNull().default(sql`CURRENT_TIMESTAMP(3)`).$onUpdateFn(() => new Date()),
  },
  (t) => [
    index("projects_created_idx").on(t.created_at),
    index("projects_updated_idx").on(t.updated_at),
    index("projects_published_idx").on(t.is_published),
    index("projects_featured_idx").on(t.is_featured),
    index("projects_display_order_idx").on(t.display_order),
    index("projects_featured_asset_idx").on(t.featured_image_asset_id),
  ],
);

export const projectsI18n = mysqlTable(
  "projects_i18n",
  {
    id: char("id", { length: 36 }).primaryKey().notNull(),
    project_id: char("project_id", { length: 36 }).notNull().references(() => projects.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    locale: varchar("locale", { length: 10 }).notNull(),

    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),

    // düz metin (uzun), opsiyonel
    summary: longtext("summary"),

    // JSON-string {"html": "..."}
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
    uniqueIndex("ux_projects_i18n_parent_locale").on(t.project_id, t.locale),
    uniqueIndex("ux_projects_i18n_locale_slug").on(t.locale, t.slug),
    index("projects_i18n_locale_idx").on(t.locale),
    index("projects_i18n_slug_idx").on(t.slug),
  ],
);

/* ============== GALLERY ============== */
export const projectImages = mysqlTable(
  "project_images",
  {
    id: char("id", { length: 36 }).primaryKey().notNull(),
    project_id: char("project_id", { length: 36 }).notNull().references(() => projects.id, {
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
    index("project_images_project_idx").on(t.project_id),
    index("project_images_asset_idx").on(t.asset_id),
    index("project_images_active_idx").on(t.is_active),
    index("project_images_order_idx").on(t.display_order),
  ],
);

export const projectImagesI18n = mysqlTable(
  "project_images_i18n",
  {
    id: char("id", { length: 36 }).primaryKey().notNull(),
    image_id: char("image_id", { length: 36 }).notNull().references(() => projectImages.id, {
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
    uniqueIndex("ux_project_images_i18n_parent_locale").on(t.image_id, t.locale),
    index("project_images_i18n_locale_idx").on(t.locale),
  ],
);

export type ProjectRow = typeof projects.$inferSelect;
export type NewProjectRow = typeof projects.$inferInsert;

export type ProjectI18nRow = typeof projectsI18n.$inferSelect;
export type NewProjectI18nRow = typeof projectsI18n.$inferInsert;

export type ProjectImageRow = typeof projectImages.$inferSelect;
export type NewProjectImageRow = typeof projectImages.$inferInsert;

export type ProjectImageI18nRow = typeof projectImagesI18n.$inferSelect;
export type NewProjectImageI18nRow = typeof projectImagesI18n.$inferInsert;
