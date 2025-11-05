import { db } from "@/db/client";
import { and, asc, desc, eq, like, or, sql, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";
import {
  services,
  servicesI18n,
  serviceImages,
  serviceImagesI18n,
  type NewServiceRow,
  type NewServiceI18nRow,
  type NewServiceImageRow,
  type NewServiceImageI18nRow,
} from "./schema";

/* ----------------------- types ----------------------- */

type Sortable = "created_at" | "updated_at" | "display_order";

export type ServiceMerged = {
  id: string;
  type: string;
  category: string;
  featured: 0 | 1;
  is_active: 0 | 1;
  display_order: number;

  featured_image: string | null;
  image_url: string | null;
  image_asset_id: string | null;

  // special
  area: string | null;
  duration: string | null;
  maintenance: string | null;
  season: string | null;
  soil_type: string | null;
  thickness: string | null;
  equipment: string | null;

  created_at: string | Date;
  updated_at: string | Date;

  // i18n coalesced
  slug: string | null;
  name: string | null;
  description: string | null;
  material: string | null;
  price: string | null;
  includes: string | null;
  warranty: string | null;
  image_alt: string | null;
  locale_resolved: string | null;
};

export type ServiceImageMerged = {
  id: string;
  service_id: string;
  image_asset_id: string | null;
  image_url: string | null;
  is_active: 0 | 1;
  display_order: number;
  created_at: string | Date;
  updated_at: string | Date;

  // i18n
  title: string | null;
  alt: string | null;
  caption: string | null;
  locale_resolved: string | null;
};

/* ----------------------- helpers ----------------------- */

const to01 = (v: unknown): 0 | 1 | undefined => {
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

function baseSelect(iReq: any, iDef: any) {
  return {
    id: services.id,
    type: services.type,
    category: services.category,
    featured: services.featured,
    is_active: services.is_active,
    display_order: services.display_order,
    featured_image: services.featured_image,
    image_url: services.image_url,
    image_asset_id: services.image_asset_id,

    area: services.area,
    duration: services.duration,
    maintenance: services.maintenance,
    season: services.season,
    soil_type: services.soil_type,
    thickness: services.thickness,
    equipment: services.equipment,

    created_at: services.created_at,
    updated_at: services.updated_at,

    slug: sql<string>`COALESCE(${iReq.slug}, ${iDef.slug})`.as("slug"),
    name: sql<string>`COALESCE(${iReq.name}, ${iDef.name})`.as("name"),
    description: sql<string>`COALESCE(${iReq.description}, ${iDef.description})`.as("description"),
    material: sql<string>`COALESCE(${iReq.material}, ${iDef.material})`.as("material"),
    price: sql<string>`COALESCE(${iReq.price}, ${iDef.price})`.as("price"),
    includes: sql<string>`COALESCE(${iReq.includes}, ${iDef.includes})`.as("includes"),
    warranty: sql<string>`COALESCE(${iReq.warranty}, ${iDef.warranty})`.as("warranty"),
    image_alt: sql<string>`COALESCE(${iReq.image_alt}, ${iDef.image_alt})`.as("image_alt"),
    locale_resolved: sql<string>`
      CASE WHEN ${iReq.id} IS NOT NULL THEN ${iReq.locale} ELSE ${iDef.locale} END
    `.as("locale_resolved"),
  };
}

function imgSelect(iReq: any, iDef: any) {
  return {
    id: serviceImages.id,
    service_id: serviceImages.service_id,
    image_asset_id: serviceImages.image_asset_id,
    image_url: serviceImages.image_url,
    is_active: serviceImages.is_active,
    display_order: serviceImages.display_order,
    created_at: serviceImages.created_at,
    updated_at: serviceImages.updated_at,

    title: sql<string>`COALESCE(${iReq.title}, ${iDef.title})`.as("title"),
    alt: sql<string>`COALESCE(${iReq.alt}, ${iDef.alt})`.as("alt"),
    caption: sql<string>`COALESCE(${iReq.caption}, ${iDef.caption})`.as("caption"),
    locale_resolved: sql<string>`
      CASE WHEN ${iReq.id} IS NOT NULL THEN ${iReq.locale} ELSE ${iDef.locale} END
    `.as("locale_resolved"),
  };
}

/* ----------------------- list / get ----------------------- */

export async function listServices(params: {
  locale: string; defaultLocale: string;
  orderParam?: string; sort?: Sortable; order?: "asc" | "desc";
  limit?: number; offset?: number;
  q?: string; type?: string; category?: string;
  featured?: boolean | 0 | 1 | "0" | "1" | "true" | "false";
  is_active?: boolean | 0 | 1 | "0" | "1" | "true" | "false";
}) {
  const iReq = alias(servicesI18n, "si_req");
  const iDef = alias(servicesI18n, "si_def");

  const filters: SQL[] = [];
  const featured = to01(params.featured);
  const active = to01(params.is_active);
  if (featured !== undefined) filters.push(eq(services.featured, featured));
  if (active !== undefined) filters.push(eq(services.is_active, active));
  if (params.type) filters.push(eq(services.type, params.type));
  if (params.category) filters.push(eq(services.category, params.category));
  if (params.q && params.q.trim()) {
    const s = `%${params.q.trim()}%`;
    filters.push(sql`
      (
        COALESCE(${iReq.name}, ${iDef.name}) LIKE ${s}
        OR COALESCE(${iReq.slug}, ${iDef.slug}) LIKE ${s}
        OR COALESCE(${iReq.material}, ${iDef.material}) LIKE ${s}
        OR COALESCE(${iReq.description}, ${iDef.description}) LIKE ${s}
      )
    `);
  }
  const whereExpr: SQL | undefined = filters.length ? (and(...filters) as SQL) : undefined;

  const ord = parseOrder(params.orderParam, params.sort, params.order);
  const orderBy = ord
    ? (ord.dir === "asc" ? asc(services[ord.col]) : desc(services[ord.col]))
    : asc(services.display_order);

  const take = params.limit && params.limit > 0 ? params.limit : 50;
  const skip = params.offset && params.offset >= 0 ? params.offset : 0;

  const rows = await db
    .select(baseSelect(iReq, iDef))
    .from(services)
    .leftJoin(iReq, and(eq(iReq.service_id, services.id), eq(iReq.locale, params.locale)))
    .leftJoin(iDef, and(eq(iDef.service_id, services.id), eq(iDef.locale, params.defaultLocale)))
    .where(whereExpr!)
    .orderBy(orderBy)
    .limit(take)
    .offset(skip);

  const cnt = await db
    .select({ c: sql<number>`COUNT(1)` })
    .from(services)
    .leftJoin(iReq, and(eq(iReq.service_id, services.id), eq(iReq.locale, params.locale)))
    .leftJoin(iDef, and(eq(iDef.service_id, services.id), eq(iDef.locale, params.defaultLocale)))
    .where(whereExpr!);

  const total = cnt[0]?.c ?? 0;
  return { items: rows as unknown as ServiceMerged[], total };
}

export async function getServiceMergedById(locale: string, defaultLocale: string, id: string) {
  const iReq = alias(servicesI18n, "si_req");
  const iDef = alias(servicesI18n, "si_def");
  const rows = await db
    .select(baseSelect(iReq, iDef))
    .from(services)
    .leftJoin(iReq, and(eq(iReq.service_id, services.id), eq(iReq.locale, locale)))
    .leftJoin(iDef, and(eq(iDef.service_id, services.id), eq(iDef.locale, defaultLocale)))
    .where(eq(services.id, id))
    .limit(1);
  return (rows[0] ?? null) as unknown as ServiceMerged | null;
}

export async function getServiceMergedBySlug(locale: string, defaultLocale: string, slug: string) {
  const iReq = alias(servicesI18n, "si_req");
  const iDef = alias(servicesI18n, "si_def");
  const rows = await db
    .select(baseSelect(iReq, iDef))
    .from(services)
    .leftJoin(iReq, and(eq(iReq.service_id, services.id), eq(iReq.locale, locale)))
    .leftJoin(iDef, and(eq(iDef.service_id, services.id), eq(iDef.locale, defaultLocale)))
    .where(
      sql`( ${iReq.id} IS NOT NULL AND ${iReq.slug} = ${slug} )
           OR ( ${iReq.id} IS NULL AND ${iDef.slug} = ${slug} )`
    )
    .limit(1);
  return (rows[0] ?? null) as unknown as ServiceMerged | null;
}

/* ----------------------- create/update/delete ----------------------- */

export async function createServiceParent(values: NewServiceRow) {
  await db.insert(services).values(values);
  return values.id;
}

export async function upsertServiceI18n(
  serviceId: string,
  locale: string,
  data: Partial<Omit<NewServiceI18nRow, "id" | "service_id" | "locale" | "created_at" | "updated_at">> & { id?: string }
) {
  const insertVals: NewServiceI18nRow = {
    id: data.id ?? crypto.randomUUID(),
    service_id: serviceId,
    locale,
    slug: typeof data.slug === "string" ? data.slug : "",  // boş bırakma
    name: typeof data.name === "string" ? data.name : "",
    description: typeof data.description === "string" ? data.description : null,
    material: typeof data.material === "string" ? data.material : null,
    price: typeof data.price === "string" ? data.price : null,
    includes: typeof data.includes === "string" ? data.includes : null,
    warranty: typeof data.warranty === "string" ? data.warranty : null,
    image_alt: typeof data.image_alt === "string" ? data.image_alt : null,
    created_at: new Date() as any,
    updated_at: new Date() as any,
  };

  const setObj: Record<string, any> = {};
  for (const k of ["slug","name","description","material","price","includes","warranty","image_alt"] as const) {
    if (typeof (data as any)[k] !== "undefined") (setObj as any)[k] = (data as any)[k];
  }
  setObj.updated_at = new Date();

  if (Object.keys(setObj).length === 1) return;
  await db.insert(servicesI18n).values(insertVals).onDuplicateKeyUpdate({ set: setObj });
}

export async function updateServiceParent(id: string, patch: Partial<NewServiceRow>) {
  await db.update(services).set({ ...patch, updated_at: new Date() as any }).where(eq(services.id, id));
}

export async function deleteServiceParent(id: string) {
  // çocukları sil (galeri + i18n)
  await db.delete(serviceImagesI18n).where(eq(serviceImagesI18n.image_id, id as any)); // güvenli değil; aşağıda image’lar için ayrı silinecek
  const imgs = await db.select({ id: serviceImages.id }).from(serviceImages).where(eq(serviceImages.service_id, id));
  if (imgs.length) {
    const ids = imgs.map(x => x.id);
    await db.delete(serviceImagesI18n).where(sql`image_id IN ${ids}`);
    await db.delete(serviceImages).where(sql`id IN ${ids}`);
  }
  await db.delete(servicesI18n).where(eq(servicesI18n.service_id, id));
  const res = await db.delete(services).where(eq(services.id, id)).execute();
  const affected =
    typeof (res as unknown as { affectedRows?: number }).affectedRows === "number"
      ? (res as unknown as { affectedRows: number }).affectedRows
      : 0;
  return affected;
}

/* ----------------------- images ----------------------- */

export async function listServiceImages(params: {
  serviceId: string; locale: string; defaultLocale: string; onlyActive?: boolean;
}) {
  const iReq = alias(serviceImagesI18n, "simg_req");
  const iDef = alias(serviceImagesI18n, "simg_def");

  const where = and(
    eq(serviceImages.service_id, params.serviceId),
    params.onlyActive ? eq(serviceImages.is_active, 1) : (sql`1=1` as any),
  );

  const rows = await db
    .select(imgSelect(iReq, iDef))
    .from(serviceImages)
    .leftJoin(iReq, and(eq(iReq.image_id, serviceImages.id), eq(iReq.locale, params.locale)))
    .leftJoin(iDef, and(eq(iDef.image_id, serviceImages.id), eq(iDef.locale, params.defaultLocale)))
    .where(where)
    .orderBy(asc(serviceImages.display_order), asc(serviceImages.created_at));

  return rows as unknown as ServiceImageMerged[];
}

export async function createServiceImage(values: NewServiceImageRow) {
  await db.insert(serviceImages).values(values);
  return values.id;
}

export async function upsertServiceImageI18n(
  imageId: string,
  locale: string,
  data: Partial<Omit<NewServiceImageI18nRow, "id" | "image_id" | "locale" | "created_at" | "updated_at">> & { id?: string }
) {
  const insertVals: NewServiceImageI18nRow = {
    id: data.id ?? crypto.randomUUID(),
    image_id: imageId,
    locale,
    title: typeof data.title === "string" ? data.title : null,
    alt: typeof data.alt === "string" ? data.alt : null,
    caption: typeof data.caption === "string" ? data.caption : null,
    created_at: new Date() as any,
    updated_at: new Date() as any,
  };

  const setObj: Record<string, any> = {};
  for (const k of ["title","alt","caption"] as const) {
    if (typeof (data as any)[k] !== "undefined") (setObj as any)[k] = (data as any)[k];
  }
  setObj.updated_at = new Date();

  if (Object.keys(setObj).length === 1) return;
  await db.insert(serviceImagesI18n).values(insertVals).onDuplicateKeyUpdate({ set: setObj });
}

export async function updateServiceImage(id: string, patch: Partial<NewServiceImageRow>) {
  await db.update(serviceImages).set({ ...patch, updated_at: new Date() as any }).where(eq(serviceImages.id, id));
}

export async function deleteServiceImage(id: string) {
  await db.delete(serviceImagesI18n).where(eq(serviceImagesI18n.image_id, id));
  const res = await db.delete(serviceImages).where(eq(serviceImages.id, id)).execute();
  const affected =
    typeof (res as unknown as { affectedRows?: number }).affectedRows === "number"
      ? (res as unknown as { affectedRows: number }).affectedRows
      : 0;
  return affected;
}
