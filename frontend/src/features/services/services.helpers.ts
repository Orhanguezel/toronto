// src/features/services/services.helpers.ts
import type { ServiceDto } from "@/integrations/types/services.types";

export function serviceHash(svc: ServiceDto) {
    return (svc.slug || svc.id).toString();
}

export function findInitialService(
    items: ServiceDto[],
    initialHash?: string,
) {
    if (!items.length) return null;
    if (!initialHash) return items[0];

    return (
        items.find(
            (i) =>
                serviceHash(i) === initialHash ||
                serviceHash(i) === initialHash.replace("#", ""),
        ) || items[0]
    );
}
