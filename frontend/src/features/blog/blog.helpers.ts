import type { CustomPageDto } from "@/integrations/types/custom_pages.types";

export function blogHash(p: CustomPageDto) {
    return (p.slug || p.id || "").toString();
}

export function normalizeHash(raw?: string) {
    const h = (raw || "").trim();
    if (!h) return "";
    return h.startsWith("#") ? h.slice(1) : h;
}

export function indexFromHash(items: CustomPageDto[], hash?: string) {
    const h = normalizeHash(hash);
    if (!h) return -1;
    const idx = items.findIndex((p) => blogHash(p) === h || p.id === h);
    return idx;
}
