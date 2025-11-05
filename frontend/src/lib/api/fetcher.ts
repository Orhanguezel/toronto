// src/lib/api/fetcher.ts
export type FetcherOpts = {
  revalidate?: number;
  tags?: string[];
  locale?: string;
  cache?: RequestCache;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_BASE_URL ??
  "";

const resolveUrl = (pathOrUrl: string): string | null => {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  if (!API_BASE) return null;
  const base = API_BASE.replace(/\/+$/, "");
  const p = pathOrUrl.replace(/^\/+/, "");
  return `${base}/${p}`;
};

export async function fetchJSON<T>(pathOrUrl: string, opts: FetcherOpts = {}): Promise<T> {
  const { revalidate = 300, tags = [], locale, cache = "force-cache" } = opts;
  const url = resolveUrl(pathOrUrl) ?? pathOrUrl;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(locale ? { "Accept-Language": locale } : {}),
    },
    next: { revalidate, tags },
    cache,
  });
  if (!res.ok) throw new Error(`fetchJSON failed: ${res.status} ${res.statusText} for ${url}`);
  return (await res.json()) as T;
}
