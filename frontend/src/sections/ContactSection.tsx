// src/sections/ContactSection.tsx
"use client";

import * as React from "react";
import styled from "styled-components";

import Container from "@/shared/ui/common/Container";
import SectionHead from "@/shared/ui/sections/SectionHead";
import { Section } from "@/shared/ui/sections/Section";
import { Card } from "@/shared/ui/cards/SiteCard";

import ContactForm from "@/features/contact/ContactForm";

import { useResolvedLocale } from "@/i18n/locale";
import { useUiSection } from "@/i18n/uiDb";
import type { SupportedLocale } from "@/types/common";

const FormWrap = styled.div`
  display: grid;
  justify-items: center;
`;

const FormCard = styled(Card)`
  width: min(720px, 96%);
  padding: clamp(16px, 2.2vw, 24px);
  box-shadow: ${({ theme }) => theme.shadows.form};
`;

type Props = {
  locale?: string;
};

export default function ContactSection({ locale: localeProp }: Props) {
  const locale = useResolvedLocale(localeProp as any) as SupportedLocale;
  const { ui } = useUiSection("ui_contact", locale);

  const title = ui("ui_contact_title", "Contact");
  const lead = ui("ui_contact_lead", "Fill the form and we’ll get back to you.");
  const aria = ui("ui_contact_aria", title);

  return (
    <Section density="spacious" id="contact" aria-label={aria}>
      <Container>
        <SectionHead title={title} lead={lead} center />

        <FormWrap>
          <FormCard aria-label={aria}>
            <ContactForm locale={locale as any} />
          </FormCard>
        </FormWrap>
      </Container>
    </Section>
  );
}
