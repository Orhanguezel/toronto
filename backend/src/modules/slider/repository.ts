// =============================================================
// FILE: src/modules/slider/repository.ts
// Slider – parent + i18n repository
// =============================================================
import { db } from "@/db/client";
import { and, asc, desc, eq, like, sql } from "drizzle-orm";
import {
  slider,
  sliderI18n,
  type SliderRow,
  type SliderI18nRow,
} from "./schema";
import { storageAssets } from "@/modules/storage/schema";
import type {
  AdminListQuery,
  CreateBody,
  PublicListQuery,
  UpdateBody,
  SetImageBody,
} from "./validation";
import { randomUUID } from "crypto";
import { getStorageSettings } from "@/modules/siteSettings/service";

export type RowWithAsset = {
  sl: SliderRow;
  i18n: SliderI18nRow;
  asset_url: string | null;
};

function toBoolNum(v: boolean) {
  return v ? 1 : 0;
}

const ORDER = {
  display_order: slider.display_order,
  name: sliderI18n.name,
  created_at: slider.created_at,
  updated_at: slider.updated_at,
} as const;

function orderExpr(
  sort: keyof typeof ORDER,
  dir: "asc" | "desc",
) {
  const col = ORDER[sort] ?? ORDER.display_order;
  return dir === "asc" ? asc(col) : desc(col);
}

type StorageBases = {
  cdnPublicBase?: string | null;
  publicApiBase?: string | null;
};

/** Provider URL varsa onu, yoksa site_settings + env'e göre /storage/:bucket/:path */
function publicUrlOf(
  bucket?: string | null,
  path?: string | null,
  providerUrl?: string | null,
  bases?: StorageBases,
) {
  if (providerUrl) return providerUrl;
  if (!bucket || !path) return null;

  const encSeg = (s: string) => encodeURIComponent(s);
  const encPath = path
    .split("/")
    .map((segment) => encSeg(segment))
    .join("/");

  const cdnBase = (bases?.cdnPublicBase || "").replace(/\/+$/, "");
  const apiBase = (bases?.publicApiBase || "").replace(/\/+$/, "");

  if (cdnBase) return `${cdnBase}/${encSeg(bucket)}/${encPath}`;
  if (apiBase) return `${apiBase}/storage/${encSeg(bucket)}/${encPath}`;

  // ultimate fallback – backend üzerinden
  return `/storage/${encSeg(bucket)}/${encPath}`;
}

/* ===================== PUBLIC ===================== */

export async function repoListPublic(
  q: PublicListQuery,
): Promise<RowWithAsset[]> {
  const storage = await getStorageSettings();
  const bases: StorageBases = {
    cdnPublicBase: storage.cdnPublicBase,
    publicApiBase: storage.publicApiBase,
  };

  const conds = [eq(slider.is_active, 1 as const)];

  // locale zorunlu (schema default "tr")
  conds.push(eq(sliderI18n.locale, q.locale));

  if (q.q) {
    const s = `%${q.q.trim()}%`;
    conds.push(like(sliderI18n.name, s));
  }

  const rows = await db
    .select({
      sl: slider,
      i18n: sliderI18n,
      asset_bucket: storageAssets.bucket,
      asset_path: storageAssets.path,
      asset_url0: storageAssets.url,
    })
    .from(slider)
    .innerJoin(
      sliderI18n,
      and(eq(sliderI18n.sliderId, slider.id)),
    )
    .leftJoin(
      storageAssets,
      eq(slider.image_asset_id, storageAssets.id),
    )
    .where(and(...conds))
    .orderBy(
      orderExpr(q.sort, q.order),
      asc(slider.display_order),
      asc(slider.id),
    )
    .limit(q.limit)
    .offset(q.offset);

  return rows.map((r) => ({
    sl: r.sl,
    i18n: r.i18n,
    asset_url:
      publicUrlOf(
        r.asset_bucket,
        r.asset_path,
        r.asset_url0,
        bases,
      ) ?? r.sl.image_url ?? null,
  }));
}

export async function repoGetBySlug(
  slugStr: string,
  locale: string,
): Promise<RowWithAsset | null> {
  const storage = await getStorageSettings();
  const bases: StorageBases = {
    cdnPublicBase: storage.cdnPublicBase,
    publicApiBase: storage.publicApiBase,
  };

  const rows = await db
    .select({
      sl: slider,
      i18n: sliderI18n,
      asset_bucket: storageAssets.bucket,
      asset_path: storageAssets.path,
      asset_url0: storageAssets.url,
    })
    .from(sliderI18n)
    .innerJoin(
      slider,
      eq(sliderI18n.sliderId, slider.id),
    )
    .leftJoin(
      storageAssets,
      eq(slider.image_asset_id, storageAssets.id),
    )
    .where(
      and(
        eq(sliderI18n.slug, slugStr),
        eq(sliderI18n.locale, locale),
        eq(slider.is_active, 1 as const),
      ),
    )
    .limit(1);

  if (!rows.length) return null;
  const r = rows[0];
  return {
    sl: r.sl,
    i18n: r.i18n,
    asset_url:
      publicUrlOf(
        r.asset_bucket,
        r.asset_path,
        r.asset_url0,
        bases,
      ) ?? r.sl.image_url ?? null,
  };
}

/* ===================== ADMIN ===================== */

export async function repoListAdmin(
  q: AdminListQuery,
): Promise<RowWithAsset[]> {
  const storage = await getStorageSettings();
  const bases: StorageBases = {
    cdnPublicBase: storage.cdnPublicBase,
    publicApiBase: storage.publicApiBase,
  };

  const conds: any[] = [];

  if (typeof q.is_active === "boolean") {
    conds.push(eq(slider.is_active, toBoolNum(q.is_active)));
  }
  if (q.locale) {
    conds.push(eq(sliderI18n.locale, q.locale));
  }
  if (q.q) {
    const s = `%${q.q.trim()}%`;
    conds.push(like(sliderI18n.name, s));
  }

  const baseQuery = db
    .select({
      sl: slider,
      i18n: sliderI18n,
      asset_bucket: storageAssets.bucket,
      asset_path: storageAssets.path,
      asset_url0: storageAssets.url,
    })
    .from(slider)
    .innerJoin(
      sliderI18n,
      eq(sliderI18n.sliderId, slider.id),
    )
    .leftJoin(
      storageAssets,
      eq(slider.image_asset_id, storageAssets.id),
    );

  const rowsQuery = conds.length
    ? baseQuery.where(and(...conds))
    : baseQuery;

  const rows = await rowsQuery
    .orderBy(
      orderExpr(q.sort, q.order),
      asc(slider.display_order),
      asc(slider.id),
      asc(sliderI18n.locale),
    )
    .limit(q.limit)
    .offset(q.offset);

  return rows.map((r) => ({
    sl: r.sl,
    i18n: r.i18n,
    asset_url:
      publicUrlOf(
        r.asset_bucket,
        r.asset_path,
        r.asset_url0,
        bases,
      ) ?? r.sl.image_url ?? null,
  }));
}

/**
 * Admin detail: id + optional locale
 *  - locale verilirse o dildeki i18n satırı
 *  - yoksa herhangi bir locale (örn. tr) fallback
 */
export async function repoGetById(
  id: number,
  locale?: string,
): Promise<RowWithAsset | null> {
  const storage = await getStorageSettings();
  const bases: StorageBases = {
    cdnPublicBase: storage.cdnPublicBase,
    publicApiBase: storage.publicApiBase,
  };

  const requestedLocale = locale?.trim() || undefined;

  // 1) Önce istenen locale'i dene
  if (requestedLocale) {
    const rows = await db
      .select({
        sl: slider,
        i18n: sliderI18n,
        asset_bucket: storageAssets.bucket,
        asset_path: storageAssets.path,
        asset_url0: storageAssets.url,
      })
      .from(slider)
      .innerJoin(
        sliderI18n,
        and(
          eq(sliderI18n.sliderId, slider.id),
          eq(sliderI18n.locale, requestedLocale),
        ),
      )
      .leftJoin(
        storageAssets,
        eq(slider.image_asset_id, storageAssets.id),
      )
      .where(eq(slider.id, id))
      .limit(1);

    if (rows.length) {
      const r = rows[0];
      return {
        sl: r.sl,
        i18n: r.i18n,
        asset_url:
          publicUrlOf(
            r.asset_bucket,
            r.asset_path,
            r.asset_url0,
            bases,
          ) ?? r.sl.image_url ?? null,
      };
    }
  }

  // 2) Fallback: herhangi bir locale (örn. ilk kayıt)
  const rows = await db
    .select({
      sl: slider,
      i18n: sliderI18n,
      asset_bucket: storageAssets.bucket,
      asset_path: storageAssets.path,
      asset_url0: storageAssets.url,
    })
    .from(slider)
    .innerJoin(
      sliderI18n,
      eq(sliderI18n.sliderId, slider.id),
    )
    .leftJoin(
      storageAssets,
      eq(slider.image_asset_id, storageAssets.id),
    )
    .where(eq(slider.id, id))
    .orderBy(asc(sliderI18n.locale))
    .limit(1);

  if (!rows.length) return null;
  const r = rows[0];
  return {
    sl: r.sl,
    i18n: r.i18n,
    asset_url:
      publicUrlOf(
        r.asset_bucket,
        r.asset_path,
        r.asset_url0,
        bases,
      ) ?? r.sl.image_url ?? null,
  };
}

/** Create: parent + ilk locale i18n */
export async function repoCreate(
  b: CreateBody,
): Promise<RowWithAsset> {
  const storage = await getStorageSettings();
  const bases: StorageBases = {
    cdnPublicBase: storage.cdnPublicBase,
    publicApiBase: storage.publicApiBase,
  };

  const nowMaxOrder = await db
    .select({
      maxOrder: sql<number>`COALESCE(MAX(${slider.display_order}), 0)`,
    })
    .from(slider);

  const locale = b.locale ?? "tr";

  const baseSlug = (
    b.slug ||
    b.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  ).slice(0, 255);

  const uuidVal = randomUUID();

  // 1) Parent insert
  await db.insert(slider).values({
    uuid: uuidVal,
    image_url: b.image_url ?? null,
    image_asset_id: b.image_asset_id ?? null,
    featured: b.featured ? 1 : 0,
    is_active: b.is_active ? 1 : 0,
    display_order:
      b.display_order ?? (nowMaxOrder[0]?.maxOrder ?? 0) + 1,
  } as any);

  const [baseRow] = await db
    .select()
    .from(slider)
    .where(eq(slider.uuid, uuidVal))
    .limit(1);

  if (!baseRow) {
    throw new Error("slider_create_parent_failed");
  }

  // 2) i18n insert
  await db.insert(sliderI18n).values({
    sliderId: baseRow.id,
    locale,
    name: b.name,
    slug: baseSlug,
    description: b.description ?? null,
    alt: b.alt ?? null,
    buttonText: b.buttonText ?? null,
    buttonLink: b.buttonLink ?? null,
  } as any);

  // 3) Tekrar oku
  const rows = await db
    .select({
      sl: slider,
      i18n: sliderI18n,
      asset_bucket: storageAssets.bucket,
      asset_path: storageAssets.path,
      asset_url0: storageAssets.url,
    })
    .from(slider)
    .innerJoin(
      sliderI18n,
      and(
        eq(sliderI18n.sliderId, slider.id),
        eq(sliderI18n.locale, locale),
      ),
    )
    .leftJoin(
      storageAssets,
      eq(slider.image_asset_id, storageAssets.id),
    )
    .where(eq(slider.id, baseRow.id))
    .limit(1);

  if (!rows.length) throw new Error("create_failed");
  const r = rows[0];
  return {
    sl: r.sl,
    i18n: r.i18n,
    asset_url:
      publicUrlOf(
        r.asset_bucket,
        r.asset_path,
        r.asset_url0,
        bases,
      ) ?? r.sl.image_url ?? null,
  };
}

/**
 * Update:
 *  - Parent alanları: image_url, image_asset_id, featured, is_active, display_order
 *  - i18n alanları: locale + name, slug, description, alt, buttonText, buttonLink
 *  - locale için kategori pattern: varsa update, yoksa (name geliyorsa) yeni satır insert
 */
export async function repoUpdate(
  id: number,
  b: UpdateBody,
): Promise<RowWithAsset | null> {
  const storage = await getStorageSettings();
  const bases: StorageBases = {
    cdnPublicBase: storage.cdnPublicBase,
    publicApiBase: storage.publicApiBase,
  };

  const locale = b.locale ?? "tr";

  // 1) Parent set
  const parentSet: Record<string, unknown> = {
    updated_at: sql`CURRENT_TIMESTAMP(3)`,
  };

  if (b.image_url !== undefined) {
    parentSet.image_url = b.image_url ?? null;
  }
  if (b.image_asset_id !== undefined) {
    parentSet.image_asset_id = b.image_asset_id ?? null;
  }
  if (b.featured !== undefined) {
    parentSet.featured = b.featured ? 1 : 0;
  }
  if (b.is_active !== undefined) {
    parentSet.is_active = b.is_active ? 1 : 0;
  }
  if (b.display_order !== undefined) {
    parentSet.display_order = b.display_order;
  }

  const parentKeys = Object.keys(parentSet);
  if (parentKeys.length > 1) {
    await db
      .update(slider)
      .set(parentSet as any)
      .where(eq(slider.id, id));
  }

  // 2) i18n set
  const i18nSet: Record<string, unknown> = {};

  if (b.name !== undefined) i18nSet.name = b.name;
  if (b.slug !== undefined) i18nSet.slug = b.slug;
  if (b.description !== undefined) {
    i18nSet.description = b.description ?? null;
  }
  if (b.alt !== undefined) i18nSet.alt = b.alt ?? null;
  if (b.buttonText !== undefined) {
    i18nSet.buttonText = b.buttonText ?? null;
  }
  if (b.buttonLink !== undefined) {
    i18nSet.buttonLink = b.buttonLink ?? null;
  }

  const i18nKeys = Object.keys(i18nSet);
  if (i18nKeys.length) {
    const [existing] = await db
      .select({
        id: sliderI18n.id,
        hasName: sliderI18n.name,
      })
      .from(sliderI18n)
      .where(
        and(
          eq(sliderI18n.sliderId, id),
          eq(sliderI18n.locale, locale),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .update(sliderI18n)
        .set(i18nSet as any)
        .where(eq(sliderI18n.id, existing.id));
    } else {
      // Yeni locale oluşturuluyor; name zorunlu
      const name =
        b.name ??
        ""; // boş da olsa DB kabul eder ama pratikte FE full form gönderiyor

      const baseSlug = (
        b.slug ||
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      ).slice(0, 255);

      await db.insert(sliderI18n).values({
        sliderId: id,
        locale,
        name,
        slug: baseSlug || `slider-${id}-${locale}`,
        description: b.description ?? null,
        alt: b.alt ?? null,
        buttonText: b.buttonText ?? null,
        buttonLink: b.buttonLink ?? null,
      } as any);
    }
  }

  // 3) Güncel satırı oku
  const rows = await db
    .select({
      sl: slider,
      i18n: sliderI18n,
      asset_bucket: storageAssets.bucket,
      asset_path: storageAssets.path,
      asset_url0: storageAssets.url,
    })
    .from(slider)
    .innerJoin(
      sliderI18n,
      and(
        eq(sliderI18n.sliderId, slider.id),
        eq(sliderI18n.locale, locale),
      ),
    )
    .leftJoin(
      storageAssets,
      eq(slider.image_asset_id, storageAssets.id),
    )
    .where(eq(slider.id, id))
    .limit(1);

  if (!rows.length) {
    // locale bulunamadıysa fallback
    return repoGetById(id, undefined);
  }

  const r = rows[0];
  return {
    sl: r.sl,
    i18n: r.i18n,
    asset_url:
      publicUrlOf(
        r.asset_bucket,
        r.asset_path,
        r.asset_url0,
        bases,
      ) ?? r.sl.image_url ?? null,
  };
}

export async function repoDelete(id: number): Promise<void> {
  // Önce i18n'i silmek mantıklı, ama FK yoksa sırası önemli değil
  await db
    .delete(sliderI18n)
    .where(eq(sliderI18n.sliderId, id));
  await db.delete(slider).where(eq(slider.id, id));
}

export async function repoReorder(ids: number[]): Promise<void> {
  for (let i = 0; i < ids.length; i++) {
    await db
      .update(slider)
      .set({
        display_order: i + 1,
        updated_at: sql`CURRENT_TIMESTAMP(3)`,
      } as any)
      .where(eq(slider.id, ids[i]));
  }
}

export async function repoSetStatus(
  id: number,
  isActive: boolean,
): Promise<RowWithAsset | null> {
  await db
    .update(slider)
    .set({
      is_active: isActive ? 1 : 0,
      updated_at: sql`CURRENT_TIMESTAMP(3)`,
    } as any)
    .where(eq(slider.id, id));
  return repoGetById(id, undefined);
}

/** ✅ asset_id verilirse URL/asset_id set; null/undefined ⇒ temizle (parent) */
export async function repoSetImage(
  id: number,
  body: SetImageBody,
): Promise<RowWithAsset | null> {
  const storage = await getStorageSettings();
  const bases: StorageBases = {
    cdnPublicBase: storage.cdnPublicBase,
    publicApiBase: storage.publicApiBase,
  };

  const assetId = body.asset_id ?? null;

  if (!assetId) {
    await db
      .update(slider)
      .set({
        image_url: null,
        image_asset_id: null,
        updated_at: sql`CURRENT_TIMESTAMP(3)`,
      } as any)
      .where(eq(slider.id, id));
    return repoGetById(id, undefined);
  }

  const [asset] = await db
    .select({
      bucket: storageAssets.bucket,
      path: storageAssets.path,
      url: storageAssets.url,
    })
    .from(storageAssets)
    .where(eq(storageAssets.id, assetId))
    .limit(1);

  if (!asset) return null;

  const url = publicUrlOf(
    asset.bucket,
    asset.path,
    asset.url ?? null,
    bases,
  );

  await db
    .update(slider)
    .set({
      image_url: url,
      image_asset_id: assetId,
      updated_at: sql`CURRENT_TIMESTAMP(3)`,
    } as any)
    .where(eq(slider.id, id));

  return repoGetById(id, undefined);
}
