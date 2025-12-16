// src/shared/routing/toRoute.ts
import type { Route } from "next";

/**
 * İç linkleri güvenle Route'a çevirir.
 * - Absolute URL/protokol (http:, https:, mailto:, vb.) reddedilir.
 * - "/" ile başlamayan string reddedilir.
 * - Boşluklar temizlenir.
 */
export function toRoute(href?: string, fallback: Route = "/" as Route): Route {
    if (!href) return fallback;

    // absolute URL (http:, https:, mailto:, etc.) veya protokoller
    if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(href)) return fallback;

    // iç rota değilse reddet
    if (!href.startsWith("/")) return fallback;

    const cleaned = href.replace(/\s+/g, "");
    return (cleaned || fallback) as Route;
}
