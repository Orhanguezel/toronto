// =============================================================
// FILE: src/features/portfolio/portfolio.server.ts
// Portfolio – server-side fetch helpers (Next Server Components)
// =============================================================

import type { ApiCustomPage, CustomPageDto, CustomPageListPublicQueryParams } from "@/integrations/types/custom_pages.types";
import { mapApiCustomPageToDto } from "@/integrations/types/custom_pages.types";

function apiBase(): string {
    // Tercih sırası: public base url -> server base url -> same-origin fallback
    return (
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        process.env.API_BASE_URL ||
        ""
    );
}

function buildQuery(params: Record<string, any>) {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;
        sp.set(k, String(v));
    });
    return sp.toString();
}

export async function getPortfolioCustomPagesSSR(args: {
    locale: string;
    limit?: number;
    offset?: number;
    order?: string;
    revalidate?: number;
}): Promise<{ items: CustomPageDto[]; total: number }> {
    const {
        locale,
        limit = 12,
        offset = 0,
        order = "updated_at.desc",
        revalidate = 900,
    } = args;

    const params: CustomPageListPublicQueryParams = {
        locale,
        module_key: "portfolio",
        is_published: 1,
        limit,
        offset,
        order,
    };

    const qs = buildQuery(params as any);
    const base = apiBase();

    // base boşsa relative çalışır: "/custom_pages?..."; proxy varsa root'ta /custom_pages olabilir.
    // Eğer backend prefix "/api" ise burada uyarlayabilirsin.
    const url = `${base}/custom_pages?${qs}`;

    const res = await fetch(url, {
        // Next cache
        next: { revalidate },
        headers: { Accept: "application/json" },
    });

    if (!res.ok) {
        return { items: [], total: 0 };
    }

    const raw = (await res.json()) as ApiCustomPage[];

    const totalHeader =
        res.headers.get("x-total-count") ?? res.headers.get("X-Total-Count");
    const total = totalHeader ? Number(totalHeader) : raw.length;

    return {
        items: raw.map(mapApiCustomPageToDto),
        total: Number.isFinite(total) ? total : raw.length,
    };
}
