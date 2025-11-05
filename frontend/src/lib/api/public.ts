// src/lib/api/public.ts

// Ortak, güvenli fetch helpers
type FetchOpts = {
  revalidate?: number;
  tags?: string[];
  locale?: string;
  cache?: RequestCache;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_BASE_URL ??
  ""; // boş ise backend yok demektir

const buildUrl = (path: string): string | null => {
  if (!API_BASE) return null;
  const base = API_BASE.replace(/\/+$/, "");
  const p = path.replace(/^\/+/, "");
  return `${base}/${p}`;
};


async function safeFetchJSON<T>(
  path: string,
  { revalidate = 300, tags = [], locale, cache = "force-cache" }: FetchOpts = {},
  fallback: T
): Promise<T> {
  const url = buildUrl(path);
  if (!url) return fallback;

  try {
    const nextOpts: Record<string, any> = {};
    if (tags.length) nextOpts.tags = tags;
    // no-store ise revalidate gönderme
    if (cache !== "no-store") nextOpts.revalidate = revalidate;

    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        ...(locale ? { "Accept-Language": locale } : {}),
      },
      ...(Object.keys(nextOpts).length ? { next: nextOpts } : {}),
      cache,
    });

    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

// ---------- Public API’ler (tamamı fallback’lı) ----------

// Ayarlar
export type SiteSettings = {
  contact_info?: { phones?: string[]; email?: string; address?: string; whatsappNumber?: string };
  socials?: Record<string, string>;
};
const DEFAULT_SETTINGS: SiteSettings = { contact_info: {}, socials: {} };

export async function getSiteSettings(locale: string) {
  return safeFetchJSON<SiteSettings>(
    "/site-settings",
    { revalidate: 600, tags: ["site_settings"], locale },
    DEFAULT_SETTINGS
  );
}

// Feature flag
export async function getFlag(key: string, { locale }: { locale: string }) {
  const data = await safeFetchJSON<{ value?: boolean }>(
    `/admin/flags/eval?key=${encodeURIComponent(key)}&locale=${encodeURIComponent(locale)}`,
    { revalidate: 60, tags: ["flags"], locale },
    { value: false }
  );
  return Boolean(data?.value);
}

// Projeler
export type ProjectCard = { slug: string; title: string; cover_url?: string | null; price_from?: number | null };
export async function getProjects(locale: string) {
  return safeFetchJSON<ProjectCard[]>(
    "/projects?select=slug,title,cover_url,price_from",
    { revalidate: 300, tags: ["projects"], locale },
    []
  );
}

export type ProjectDetail = ProjectCard & {
  summary?: string | null;
  body?: string | null;
  gallery?: string[];
  video_url?: string | null;
};
export async function getProjectBySlug(locale: string, slug: string) {
  return safeFetchJSON<ProjectDetail | null>(
    `/projects/${slug}`,
    { revalidate: 300, tags: ["projects"], locale },
    null
  );
}

// Referans logoları
export type Reference = { name: string; logo_url: string; url?: string | null; order: number };
export async function getReferences(locale: string) {
  return safeFetchJSON<Reference[]>(
    "/references",
    { revalidate: 600, tags: ["references"], locale },
    []
  );
}

// Servisler
export type ServiceCard = { slug: string; icon?: string | null; title: string; summary?: string | null };
export async function getServices(locale: string) {
  return safeFetchJSON<ServiceCard[]>(
    "/services",
    { revalidate: 600, tags: ["services"], locale },
    []
  );
}

// Reklam çözümleri
export type AdSolution = { slug: string; icon?: string | null; title: string; body?: string | null };
export async function getAdSolutions(locale: string) {
  return safeFetchJSON<AdSolution[]>(
    "/ad-solutions",
    { revalidate: 600, tags: ["ad_solutions"], locale },
    []
  );
}

export type ProjectsPaged = { items: ProjectCard[]; total: number; page: number; pageSize: number };
export async function getProjectsPaged(
  locale: string,
  params: { q?: string; page?: number; pageSize?: number; priceMin?: number; priceMax?: number }
) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.page) qs.set("page", String(params.page));
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));
  if (params.priceMin != null) qs.set("priceMin", String(params.priceMin));
  if (params.priceMax != null) qs.set("priceMax", String(params.priceMax));

  return safeFetchJSON<ProjectsPaged>(
    `/projects?${qs.toString()}`,
    { cache: "no-store", locale },
    { items: [], total: 0, page: params.page ?? 1, pageSize: params.pageSize ?? 12 }
  );
}

export async function getProjectSlugs(locale: string) {
  return safeFetchJSON<{ slug: string }[]>(
    "/projects?select=slug",
    { revalidate: 600, tags: ["projects"], locale },
    []
  );
}

export type Category = { slug: string; title: string };
export type Tag = { slug: string; title: string };
export async function getProjectFilters(locale: string) {
  const [cats, tags] = await Promise.all([
    safeFetchJSON<Category[]>("/projects/categories", { revalidate: 1200, tags: ["projects_filters"], locale }, []),
    safeFetchJSON<Tag[]>("/projects/tags", { revalidate: 1200, tags: ["projects_filters"], locale }, []),
  ]);
  return { cats, tags };
}

export async function getServiceBySlug(locale: string, slug: string) {
  return safeFetchJSON<{ title: string; body?: string; faq_json?: { q: string; a: string }[] } | null>(
    `/services/${slug}`,
    { revalidate: 600, tags: ["services"], locale },
    null
  );
}
export async function getAdSolutionBySlug(locale: string, slug: string) {
  return safeFetchJSON<{ title: string; body?: string } | null>(
    `/ad-solutions/${slug}`,
    { revalidate: 600, tags: ["ad_solutions"], locale },
    null
  );
}

export async function searchAll(locale: string, q: string) {
  return safeFetchJSON<{ projects: any[]; posts: any[] }>(
    `/search?q=${encodeURIComponent(q)}`,
    { revalidate: 60, tags: ["search"], locale },
    { projects: [], posts: [] }
  );
}

// --- BLOG ---

export type BlogCard = {
  slug: string;
  title: string;
  cover_url?: string | null;
  summary?: string | null;
  published_at?: string | null;
  author?: { name?: string; slug?: string; avatar_url?: string | null } | null;
};

export type BlogPaged = {
  items: BlogCard[];
  total: number;
  page: number;
  pageSize: number;
  tag?: string;
  category?: string;
  q?: string;
};

export async function getBlogPaged(
  locale: string,
  params: { q?: string; page?: number; pageSize?: number; tag?: string; category?: string }
) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.page) qs.set("page", String(params.page));
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));
  if (params.tag) qs.set("tag", params.tag);
  if (params.category) qs.set("category", params.category);

  // Backend endpoint örnek: /blog
  return safeFetchJSON<BlogPaged>(
    `/blog?${qs.toString()}`,
    { revalidate: 300, tags: ["blog"], locale },
    { items: [], total: 0, page: params.page ?? 1, pageSize: params.pageSize ?? 12 }
  );
}

