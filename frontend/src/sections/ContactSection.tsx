// src/sections/ContactSection.tsx
"use client";

import Container from "@/shared/ui/common/Container";
import SectionHead from "@/shared/ui/sections/SectionHead";
import { Card } from "@/shared/ui/cards/SiteCard";
import styled from "styled-components";
import ContactForm from "@/features/contact/ContactForm"; // ← DÜZELTİLDİ

type Locale = "tr" | "en" | "de" | string;

const COPY: Record<string, { title: string; lead: string }> = {
  tr: { title: "İletişim", lead: "Formu doldurun, en kısa sürede dönüş yapalım." },
  en: { title: "Contact", lead: "Fill the form and we’ll get back to you." },
  de: { title: "Kontakt", lead: "Formular ausfüllen, wir melden uns schnell." },
};

const FormWrap = styled.div`
  display: grid;
  justify-items: center;
`;

const FormCard = styled(Card)`
  width: min(720px, 96%);
  padding: clamp(16px, 2.2vw, 24px);
  box-shadow: ${({ theme }) => theme.shadows.form};
`;

export default function ContactSection({ locale }: { locale: Locale }) {
  const t = COPY[locale] ?? COPY.tr;

  return (
    <Container>
      <SectionHead title={t.title} lead={t.lead} center />
      <FormWrap>
        <FormCard aria-label="İletişim Formu">
          <ContactForm locale={(locale as "tr"|"en"|"de") ?? "tr"} />
        </FormCard>
      </FormWrap>
    </Container>
  );
}
