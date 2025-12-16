"use client";

import * as React from "react";
import styled from "styled-components";

import Container from "@/shared/ui/common/Container";
import SectionHead from "@/shared/ui/sections/SectionHead";
import { Section } from "@/shared/ui/sections/Section";
import { Card, CardHeader, CardTitle, CardBody } from "@/shared/ui/cards/SiteCard";

import { useResolvedLocale } from "@/i18n/locale";
import { useUiSection } from "@/i18n/uiDb";
import type { SupportedLocale } from "@/types/common";

import { useListCustomPagesPublicQuery } from "@/integrations/rtk/endpoints/custom_pages.endpoints";

export default function AboutSection(props: { locale?: string }) {
  const locale = useResolvedLocale(props.locale as any) as SupportedLocale;
  const { ui } = useUiSection("ui_about", locale);

  const title = ui("ui_about_title", "About");
  const lead = ui("ui_about_lead", "Learn more about us.");
  const loadingText = ui("ui_about_loading", "Loading...");
  const failedText = ui("ui_about_failed", "Failed to load");
  const emptyText = ui("ui_about_empty", "No content");

  const { data, isLoading, isError } = useListCustomPagesPublicQuery({
    module_key: "about",
    locale,
    limit: 1,
    offset: 0,
    order: "updated_at.desc",
  });

  const page = data?.items?.[0];

  return (
    <Section density="spacious" id="about">
      <Container>
        <SectionHead title={title} lead={lead} center />

        {isLoading ? (
          <Card>
            <CardHeader>
              <CardTitle>{loadingText}</CardTitle>
            </CardHeader>
            <CardBody />
          </Card>
        ) : isError ? (
          <Card>
            <CardHeader>
              <CardTitle>{failedText}</CardTitle>
            </CardHeader>
            <CardBody />
          </Card>
        ) : !page ? (
          <Card>
            <CardHeader>
              <CardTitle>{emptyText}</CardTitle>
            </CardHeader>
            <CardBody />
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{page.title || title}</CardTitle>
            </CardHeader>
            <CardBody>
              <Rich dangerouslySetInnerHTML={{ __html: page.content_html || page.content || "" }} />
            </CardBody>
          </Card>
        )}
      </Container>
    </Section>
  );
}

const Rich = styled.div`
  line-height: 1.7;

  p { margin: 0 0 12px 0; }
  ul, ol { margin: 0 0 12px 18px; }
  a { text-decoration: underline; }
`;
