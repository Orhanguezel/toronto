// =============================================================
// FILE: src/features/portfolio/portfolio.helpers.ts
// Portfolio – shared helpers (client/server ortak)
// =============================================================

import type { CustomPageDto } from "@/integrations/types/custom_pages.types";
import type { SupportedLocale } from "@/types/common";

export type PortfolioItem = {
    key: string;
    title: string;
    summary?: string | null;
    image_url?: string | null;
    image_alt?: string | null;
    href?: string | null;
};

export function pickPortfolioTitle(p: CustomPageDto): string {
    return (p.title || p.slug || "Portfolio").toString();
}

export function pickPortfolioSummary(p: CustomPageDto): string | null {
    const s = (p.summary || "").toString().trim();
    return s ? s : null;
}

export function pickPortfolioImage(p: CustomPageDto): string | null {
    const img = (p.featured_image || "").toString().trim();
    return img ? img : null;
}

export function pickPortfolioImageAlt(p: CustomPageDto): string {
    return (p.featured_image_alt || pickPortfolioTitle(p)).toString();
}

/**
 * Routing sende nasıl ise burayı tek yerden yönet.
 * Örnek: /tr/portfolio/my-case
 */
export function portfolioHref(locale: SupportedLocale | string, slug?: string | null): string {
    const s = (slug || "").toString().trim();
    return s ? `/${locale}/portfolio/${s}` : `/${locale}/portfolio`;
}

export function mapCustomPageToPortfolioItem(
    locale: SupportedLocale | string,
    p: CustomPageDto
): PortfolioItem {
    return {
        key: p.id,
        title: pickPortfolioTitle(p),
        summary: pickPortfolioSummary(p),
        image_url: pickPortfolioImage(p),
        image_alt: pickPortfolioImageAlt(p),
        href: portfolioHref(locale, p.slug),
    };
}
