// src/shared/lib/api.ts
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "";

const buildUrl = (path: string) => {
  if (!API_BASE_URL) return null;                // backend yoksa null dön
  const base = API_BASE_URL.replace(/\/+$/, "");
  const p = path.replace(/^\/+/, "");
  return `${base}/${p}`;
};

export async function safeGetJson<T>(
  path: string,
  init?: RequestInit
): Promise<T | null> {
  const url = buildUrl(path);
  if (!url) return null;                         // base yok → null
  try {
    const res = await fetch(url, {
      ...init,
      // revalidate ayarını ihtiyacına göre değiştir
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;                                 // network hatasında da null
  }
}
