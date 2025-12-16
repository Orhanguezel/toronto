// src/features/services/ServiceCard.tsx

"use client";

import styled from "styled-components";
import { Card, CardHeader, CardTitle, CardBody } from "@/shared/ui/cards/SiteCard";
import type { ServiceDto } from "@/integrations/types/services.types";

export default function ServiceCard({
    service,
    railHeight,
}: {
    service: ServiceDto;
    locale: string;
    railHeight?: number;
}) {
    return (
        <CardShell $h={railHeight ?? 260}>
            <Card style={{ height: "100%" as any }}>
                <CardHeader>
                    <CardTitle>{service.name}</CardTitle>
                </CardHeader>

                <BodyScroll>
                    <CardBody>{service.description}</CardBody>
                </BodyScroll>
            </Card>
        </CardShell>
    );
}

const CardShell = styled.div<{ $h: number }>`
  height: ${({ $h }) => $h}px;   /* ✅ spine ile aynı */
`;

const BodyScroll = styled.div`
  overflow: auto;               /* ✅ içerik uzunsa rail bozulmaz */
  height: calc(100% - 72px);    /* header yüksekliğine göre gerekirse ayarla */
`;
