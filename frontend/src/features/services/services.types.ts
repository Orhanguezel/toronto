// src/features/services/services.types.ts
import type { ServiceDto } from "@/integrations/types/services.types";

export type ActiveServiceState = {
    id: string;
    hash: string;
};

export type ServicesCarouselProps = {
    items: ServiceDto[];
    locale: string;
    initialHash?: string;
};
