// src/lib/cms.ts

// CMS tarafı henüz hazır değilse bile bu modül null döndürerek güvenli çalışır.
// .env.local içine örnek:
// NEXT_PUBLIC_CMS_URL=http://localhost:8082

export type CMSProject = {
  slug: string;
  title: string;
  cover_url?: string | null;
  summary?: string | null;
  body?: string | null;
  gallery?: string[];       // opsiyonel görsel galerisi
  video_url?: string | null;
};

const CMS_BASE =
  process.env.NEXT_PUBLIC_CMS_URL ??
  process.env.CMS_URL ??
  "";

// Basit URL birleştirici
function buildUrl(type: string, slug: string, locale: string) {
  if (!CMS_BASE) return null;
  const base = CMS_BASE.replace(/\/+$/, "");
  return `${base}/cms/${encodeURIComponent(type)}/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`;
}

/**
 * CMS veri çekici
 * - CMS BASE yoksa: null döner
 * - Ağ / 4xx / 5xx hatalarında: null döner
 * - Başarılıysa JSON'u döner
 */
export async function fetchCMS<T = CMSProject>(
  type: string,
  slug: string,
  locale: string,
  init?: RequestInit & { next?: any }
): Promise<T | null> {
  const url = buildUrl(type, slug, locale);
  if (!url) return null;

  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(locale ? { "Accept-Language": locale } : {}),
        ...(init?.headers as Record<string, string> | undefined),
      },
      next: init?.next, // ISR/Tag vs. forward edilir
    });

    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
