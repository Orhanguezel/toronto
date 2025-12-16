import type { CustomPageDto } from "@/integrations/types/custom_pages.types";

export type BlogCarouselProps = {
    items: CustomPageDto[];
    locale: string;
    initialHash?: string;
    ctaLabel: string;
};
