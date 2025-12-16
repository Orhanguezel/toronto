"use client";

import * as React from "react";

import Container from "@/shared/ui/common/Container";
import SectionHead from "@/shared/ui/sections/SectionHead";
import { Section } from "@/shared/ui/sections/Section";

import { useResolvedLocale } from "@/i18n/locale";
import { useUiSection } from "@/i18n/uiDb";

import { useListServicesPublicQuery } from "@/integrations/rtk/endpoints/services.public.endpoints";
import type { SupportedLocale } from "@/types/common";

import ServicesCarousel from "../features/services/ServicesCarousel";

export default function ServicesSection({
  locale: localeProp,
  initialHash,
}: {
  locale?: string;
  initialHash?: string;
}) {
  const locale = useResolvedLocale(localeProp as any) as SupportedLocale;
  const { ui } = useUiSection("ui_services", locale);

  const { data, isLoading } = useListServicesPublicQuery({ locale });
  const items = data?.items ?? [];

  const lockedItemsRef = React.useRef<typeof items | null>(null);
  if (!lockedItemsRef.current && items.length) lockedItemsRef.current = items;
  const lockedItems = lockedItemsRef.current ?? [];

  if (isLoading || !lockedItems.length) return null;

  return (
    <Section density="spacious" id="services">
      <Container>
        <SectionHead
          title={ui("ui_services_title", "Services")}
          lead={ui("ui_services_lead", "")}
          center
        />

        <ServicesCarousel items={lockedItems} locale={locale} initialHash={initialHash} />
      </Container>
    </Section>
  );
}
