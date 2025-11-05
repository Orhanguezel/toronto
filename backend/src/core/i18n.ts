// src/core/i18n.ts
export const LOCALES = ["tr", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "tr";

export function normalizeLocale(input?: string | null): string | undefined {
  if (!input) return undefined;
  const s = String(input).trim().toLowerCase().replace("_", "-");
  if (!s) return undefined;
  const base = s.split("-")[0];
  return base;
}

export function isSupported(l?: string): l is Locale {
  if (!l) return false;
  return (LOCALES as readonly string[]).includes(l);
}

function parseAcceptLanguage(header?: string | null): string[] {
  if (!header) return [];
  const items = String(header)
    .split(",")
    .map((part) => {
      const [tag, ...rest] = part.trim().split(";");
      const qMatch = rest.find((p) => p.trim().startsWith("q="));
      const q = qMatch ? Number(qMatch.split("=")[1]) : 1;
      return { tag: tag.toLowerCase(), q: Number.isFinite(q) ? q : 1 };
    })
    .filter((x) => x.tag)
    .sort((a, b) => b.q - a.q)
    .map((x) => x.tag);
  return items;
}

export function bestFromAcceptLanguage(header?: string | null): Locale | undefined {
  const candidates = parseAcceptLanguage(header);
  for (const cand of candidates) {
    const base = normalizeLocale(cand);
    if (base && isSupported(base)) return base as Locale;
  }
  return undefined;
}

export function resolveLocaleFromHeaders(
  headers: Record<string, unknown>
): { locale: Locale; selectedBy: "x-locale" | "accept-language" | "default" } {
  const rawXL = (headers["x-locale"] ??
    (headers as any)["X-Locale"] ??
    (headers as any)["x_locale"]) as string | undefined;

  const xl = normalizeLocale(rawXL);
  if (xl && isSupported(xl)) {
    return { locale: xl as Locale, selectedBy: "x-locale" };
  }

  const al = bestFromAcceptLanguage((headers["accept-language"] ?? (headers as any)["Accept-Language"]) as string | undefined);
  if (al && isSupported(al)) {
    return { locale: al as Locale, selectedBy: "accept-language" };
  }

  return { locale: DEFAULT_LOCALE, selectedBy: "default" };
}

// 👇 Tip güvenli ve sade fallback zinciri
export function fallbackChain(primary: Locale): Locale[] {
  const seen = new Set<Locale>();
  const order: Locale[] = [primary, DEFAULT_LOCALE, ...LOCALES];
  const uniq: Locale[] = [];
  for (const l of order) {
    if (!seen.has(l)) {
      seen.add(l);
      uniq.push(l);
    }
  }
  return uniq;
}

declare module "fastify" {
  interface FastifyRequest {
    locale: Locale;
    localeFallbacks: Locale[];
  }
}
