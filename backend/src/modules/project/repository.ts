import { db } from "@/db/client";
import {
  projects,
  projectsI18n,
  projectImages,
  projectImagesI18n,
  type NewProjectRow,
  type NewProjectI18nRow,
  type NewProjectImageRow,
  type NewProjectImageI18nRow,
} from "./schema";
import { and, asc, desc, eq, sql, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";

/* ================= helpers ================= */
type Sortable = "created_at" | "updated_at" | "display_order";

export type ProjectListParams = {
  orderParam?: string;
  sort?: Sortable;
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;

  is_published?: boolean | 0 | 1 | "0" | "1" | "true" | "false";
  is_featured?: boolean | 0 | 1 | "0" | "1" | "true" | "false";

  q?: string;
  slug?: string;

  locale: string;
  defaultLocale: string;
};

const to01 = (v: any): 0 | 1 | undefined => {
  if (v === true || v === 1 || v === "1" || v === "true") return 1;
  if (v === false || v === 0 || v === "0" || v === "false") return 0;
  return undefined;
};

const parseOrder = (
  orderParam?: string,
  sort?: Sortable,
  ord?: "asc" | "desc",
): { col: Sortable; dir: "asc" | "desc" } | null => {
  if (orderParam) {
    const m = orderParam.match(/^([a-zA-Z0-9_]+)\.(asc|desc)$/);
    const col = m?.[1] as Sortable | undefined;
    const dir = m?.[2] as "asc" | "desc" | undefined;
    if (col && dir && (col === "created_at" || col === "updated_at" || col === "display_order")) {
      return { col, dir };
    }
  }
  if (sort && ord) return { col: sort, dir: ord };
  return null;
};

const isRec = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

export const packContent = (htmlOrJson: string): string => {
  try {
    const parsed = JSON.parse(htmlOrJson) as unknown;
    if (isRec(parsed) && typeof (parsed as any).html === "string") {
      return JSON.stringify({ html: (parsed as any).html });
    }
  } catch {}
  return JSON.stringify({ html: htmlOrJson });
};

export const packStringArray = (arr?: string[]): string | null | undefined => {
  if (typeof arr === "undefined") return undefined;
  const clean = Array.from(new Set((arr || []).map(s => s.trim()).filter(Boolean)));
  return JSON.stringify(clean);
};

/* ================= merged selects ================= */
export type ProjectMerged = {
  id: string;
  is_published: 0 | 1;
  is_featured: 0 | 1;
  display_order: number;

  featured_image: string | null;
  featured_image_asset_id: string | null;

  demo_url: string | null;
  repo_url: string | null;
  techs: string | null; // JSON-string

  created_at: string | Date;
  updated_at: string | Date;

  title: string | null;
  slug: string | null;
  summary: string | null;
  content: string | null;
  featured_image_alt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  locale_resolved: string | null;
};

function baseProjectSelect(reqI18n: any, defI18n: any) {
  return {
    id: projects.id,
    is_published: projects.is_published,
    is_featured: projects.is_featured,
    display_order: projects.display_order,
    featured_image: projects.featured_image,
    featured_image_asset_id: projects.featured_image_asset_id,
    demo_url: projects.demo_url,
    repo_url: projects.repo_url,
    techs: projects.techs,
    created_at: projects.created_at,
    updated_at: projects.updated_at,

    title: sql<string>`COALESCE(${reqI18n.title}, ${defI18n.title})`.as("title"),
    slug: sql<string>`COALESCE(${reqI18n.slug}, ${defI18n.slug})`.as("slug"),
    summary: sql<string>`COALESCE(${reqI18n.summary}, ${defI18n.summary})`.as("summary"),
    content: sql<string>`COALESCE(${reqI18n.content}, ${defI18n.content})`.as("content"),
    featured_image_alt: sql<string>`COALESCE(${reqI18n.featured_image_alt}, ${defI18n.featured_image_alt})`.as("featured_image_alt"),
    meta_title: sql<string>`COALESCE(${reqI18n.meta_title}, ${defI18n.meta_title})`.as("meta_title"),
    meta_description: sql<string>`COALESCE(${reqI18n.meta_description}, ${defI18n.meta_description})`.as("meta_description"),
    locale_resolved: sql<string>`
      CASE WHEN ${reqI18n.id} IS NOT NULL THEN ${reqI18n.locale} ELSE ${defI18n.locale} END
    `.as("locale_resolved"),
  };
}

/* ================= LIST / GET ================= */
export async function listProjects(params: ProjectListParams) {
  const reqI = alias(projectsI18n, "pi_req");
  const defI = alias(projectsI18n, "pi_def");

  const filters: SQL[] = [];
  const pub = to01(params.is_published);
  if (pub !== undefined) filters.push(eq(projects.is_published, pub));
  const feat = to01(params.is_featured);
  if (feat !== undefined) filters.push(eq(projects.is_featured, feat));

  if (params.slug && params.slug.trim()) {
    const v = params.slug.trim();
    filters.push(sql`COALESCE(${reqI.slug}, ${defI.slug}) = ${v}`);
  }
  if (params.q && params.q.trim()) {
    const s = `%${params.q.trim()}%`;
    filters.push(sql`(
      COALESCE(${reqI.title}, ${defI.title}) LIKE ${s}
      OR COALESCE(${reqI.slug}, ${defI.slug}) LIKE ${s}
      OR COALESCE(${reqI.summary}, ${defI.summary}) LIKE ${s}
      OR COALESCE(${reqI.meta_title}, ${defI.meta_title}) LIKE ${s}
      OR COALESCE(${reqI.meta_description}, ${defI.meta_description}) LIKE ${s}
    )`);
  }

  const whereExpr: SQL | undefined = filters.length ? (and(...filters) as SQL) : undefined;

  const ord = parseOrder(params.orderParam, params.sort, params.order);
  const orderBy = ord
    ? (ord.dir === "asc" ? asc(projects[ord.col]) : desc(projects[ord.col]))
    : desc(projects.created_at);

  const take = params.limit && params.limit > 0 ? params.limit : 50;
  const skip = params.offset && params.offset >= 0 ? params.offset : 0;

  const rows = await db
    .select(baseProjectSelect(reqI, defI))
    .from(projects)
    .leftJoin(reqI, and(eq(reqI.project_id, projects.id), eq(reqI.locale, params.locale)))
    .leftJoin(defI, and(eq(defI.project_id, projects.id), eq(defI.locale, params.defaultLocale)))
    .where(whereExpr!)
    .orderBy(orderBy)
    .limit(take)
    .offset(skip);

  const cnt = await db
    .select({ c: sql<number>`COUNT(1)` })
    .from(projects)
    .leftJoin(reqI, and(eq(reqI.project_id, projects.id), eq(reqI.locale, params.locale)))
    .leftJoin(defI, and(eq(defI.project_id, projects.id), eq(defI.locale, params.defaultLocale)))
    .where(whereExpr!);

  const total = cnt[0]?.c ?? 0;
  return { items: rows as unknown as ProjectMerged[], total };
}

export async function getProjectMergedById(locale: string, defaultLocale: string, id: string) {
  const reqI = alias(projectsI18n, "pi_req");
  const defI = alias(projectsI18n, "pi_def");
  const rows = await db
    .select(baseProjectSelect(reqI, defI))
    .from(projects)
    .leftJoin(reqI, and(eq(reqI.project_id, projects.id), eq(reqI.locale, locale)))
    .leftJoin(defI, and(eq(defI.project_id, projects.id), eq(defI.locale, defaultLocale)))
    .where(eq(projects.id, id))
    .limit(1);
  return (rows[0] ?? null) as unknown as ProjectMerged | null;
}

export async function getProjectMergedBySlug(locale: string, defaultLocale: string, slug: string) {
  const reqI = alias(projectsI18n, "pi_req");
  const defI = alias(projectsI18n, "pi_def");
  const rows = await db
    .select(baseProjectSelect(reqI, defI))
    .from(projects)
    .leftJoin(reqI, and(eq(reqI.project_id, projects.id), eq(reqI.locale, locale)))
    .leftJoin(defI, and(eq(defI.project_id, projects.id), eq(defI.locale, defaultLocale)))
    .where(
      sql`( ${reqI.id} IS NOT NULL AND ${reqI.slug} = ${slug} )
          OR ( ${reqI.id} IS NULL AND ${defI.slug} = ${slug} )`,
    )
    .limit(1);
  return (rows[0] ?? null) as unknown as ProjectMerged | null;
}

/* ================= parent write ================= */
export async function createProjectParent(values: NewProjectRow) {
  await db.insert(projects).values(values);
  return values.id;
}
export async function updateProjectParent(id: string, patch: Partial<NewProjectRow>) {
  await db.update(projects).set({ ...patch, updated_at: new Date() as any }).where(eq(projects.id, id));
}
export async function deleteProjectParent(id: string) {
  const res = await db.delete(projects).where(eq(projects.id, id)).execute();
  const affected =
    typeof (res as unknown as { affectedRows?: number }).affectedRows === "number"
      ? (res as unknown as { affectedRows: number }).affectedRows
      : 0;
  return affected;
}

/* ================= i18n write ================= */
export async function upsertProjectI18n(
  projectId: string,
  locale: string,
  data: Partial<Pick<NewProjectI18nRow,
    "title" | "slug" | "summary" | "content" | "featured_image_alt" | "meta_title" | "meta_description"
  >> & { id?: string }
) {
  const insertVals: NewProjectI18nRow = {
    id: data.id ?? randomUUID(),
    project_id: projectId,
    locale,
    title: data.title ?? "",
    slug: data.slug ?? "",
    summary: typeof data.summary === "undefined" ? (null as any) : (data.summary ?? null),
    content: data.content ?? JSON.stringify({ html: "" }),
    featured_image_alt: typeof data.featured_image_alt === "undefined" ? (null as any) : (data.featured_image_alt ?? null),
    meta_title: typeof data.meta_title === "undefined" ? (null as any) : (data.meta_title ?? null),
    meta_description: typeof data.meta_description === "undefined" ? (null as any) : (data.meta_description ?? null),
    created_at: new Date() as any,
    updated_at: new Date() as any,
  };

  const setObj: Record<string, any> = {};
  if (typeof data.title !== "undefined") setObj.title = data.title;
  if (typeof data.slug !== "undefined") setObj.slug = data.slug;
  if (typeof data.summary !== "undefined") setObj.summary = data.summary ?? null;
  if (typeof data.content !== "undefined") setObj.content = data.content;
  if (typeof data.featured_image_alt !== "undefined") setObj.featured_image_alt = data.featured_image_alt ?? null;
  if (typeof data.meta_title !== "undefined") setObj.meta_title = data.meta_title ?? null;
  if (typeof data.meta_description !== "undefined") setObj.meta_description = data.meta_description ?? null;
  setObj.updated_at = new Date();

  if (Object.keys(setObj).length === 1) return;

  await db
    .insert(projectsI18n)
    .values(insertVals)
    .onDuplicateKeyUpdate({ set: setObj });
}

export async function getProjectI18nRow(projectId: string, locale: string) {
  const rows = await db.select().from(projectsI18n)
    .where(and(eq(projectsI18n.project_id, projectId), eq(projectsI18n.locale, locale)))
    .limit(1);
  return rows[0] ?? null;
}

/* ================= GALLERY repo ================= */
export type ProjectImageMerged = {
  id: string;
  project_id: string;
  asset_id: string;
  image_url: string | null;
  display_order: number;
  is_active: 0 | 1;
  created_at: string | Date;
  updated_at: string | Date;

  alt: string | null;
  caption: string | null;
  locale_resolved: string | null;
};

function baseImageSelect(reqI: any, defI: any) {
  return {
    id: projectImages.id,
    project_id: projectImages.project_id,
    asset_id: projectImages.asset_id,
    image_url: projectImages.image_url,
    display_order: projectImages.display_order,
    is_active: projectImages.is_active,
    created_at: projectImages.created_at,
    updated_at: projectImages.updated_at,

    alt: sql<string>`COALESCE(${reqI.alt}, ${defI.alt})`.as("alt"),
    caption: sql<string>`COALESCE(${reqI.caption}, ${defI.caption})`.as("caption"),
    locale_resolved: sql<string>`
      CASE WHEN ${reqI.id} IS NOT NULL THEN ${reqI.locale} ELSE ${defI.locale} END
    `.as("locale_resolved"),
  };
}

export async function listProjectImagesMerged(projectId: string, locale: string, defaultLocale: string) {
  const reqI = alias(projectImagesI18n, "pii_req");
  const defI = alias(projectImagesI18n, "pii_def");
  const rows = await db
    .select(baseImageSelect(reqI, defI))
    .from(projectImages)
    .leftJoin(reqI, and(eq(reqI.image_id, projectImages.id), eq(reqI.locale, locale)))
    .leftJoin(defI, and(eq(defI.image_id, projectImages.id), eq(defI.locale, defaultLocale)))
    .where(eq(projectImages.project_id, projectId))
    .orderBy(asc(projectImages.display_order), asc(projectImages.created_at));
  return rows as unknown as ProjectImageMerged[];
}

export async function createProjectImageParent(values: NewProjectImageRow) {
  await db.insert(projectImages).values(values);
  return values.id;
}

export async function updateProjectImageParent(id: string, patch: Partial<NewProjectImageRow>) {
  await db.update(projectImages).set({ ...patch, updated_at: new Date() as any }).where(eq(projectImages.id, id));
}

export async function deleteProjectImageParent(id: string) {
  const res = await db.delete(projectImages).where(eq(projectImages.id, id)).execute();
  const affected =
    typeof (res as unknown as { affectedRows?: number }).affectedRows === "number"
      ? (res as unknown as { affectedRows: number }).affectedRows
      : 0;
  return affected;
}

export async function upsertProjectImageI18n(
  imageId: string,
  locale: string,
  data: Partial<Pick<NewProjectImageI18nRow, "alt" | "caption">> & { id?: string }
) {
  const insertVals: NewProjectImageI18nRow = {
    id: data.id ?? randomUUID(),
    image_id: imageId,
    locale,
    alt: typeof data.alt === "undefined" ? (null as any) : (data.alt ?? null),
    caption: typeof data.caption === "undefined" ? (null as any) : (data.caption ?? null),
    created_at: new Date() as any,
    updated_at: new Date() as any,
  };

  const setObj: Record<string, any> = {};
  if (typeof data.alt !== "undefined") setObj.alt = data.alt ?? null;
  if (typeof data.caption !== "undefined") setObj.caption = data.caption ?? null;
  setObj.updated_at = new Date();

  if (Object.keys(setObj).length === 1) return;

  await db.insert(projectImagesI18n).values(insertVals).onDuplicateKeyUpdate({ set: setObj });
}
