"use client";

import * as React from "react";
import styled from "styled-components";

import Container from "@/shared/ui/common/Container";
import SectionHead from "@/shared/ui/sections/SectionHead";
import { Section } from "@/shared/ui/sections/Section";
import {
  Card,
  CardHeader,
  CardIcon,
  CardTitle,
  CardBody,
} from "@/shared/ui/cards/SiteCard";

import { useResolvedLocale } from "@/i18n/locale";
import { useUiSection } from "@/i18n/uiDb";
import type { SupportedLocale } from "@/types/common";

import { useListCustomPagesPublicQuery } from "@/integrations/rtk/endpoints/custom_pages.endpoints";
import { FileText, Loader2, AlertTriangle } from "lucide-react";

import BlogCarousel from "@/features/blog/BlogCarousel";

export default function BlogSection(props: { locale?: string; initialHash?: string }) {
  const locale = useResolvedLocale(props.locale as any) as SupportedLocale;
  const { ui } = useUiSection("ui_blog", locale);

  const title = ui("ui_blog_title", "Blog");
  const lead = ui("ui_blog_lead", "Updates, insights, and articles.");
  const cta = ui("ui_blog_cta", "Read");

  const tLoading = ui("ui_blog_loading", "Loading...");
  const tFailed = ui("ui_blog_failed", "Failed to load posts");
  const tEmpty = ui("ui_blog_empty", "No posts found");

  const { data, isLoading, isError } = useListCustomPagesPublicQuery({
    module_key: "blog",
    locale,
    order: "created_at.desc",
    limit: 12,
    offset: 0,
  });

  const items = data?.items ?? [];

  // ✅ İlk dolu listeyi kilitle (reset olmasın)
  const lockedRef = React.useRef<typeof items | null>(null);
  if (!lockedRef.current && items.length) lockedRef.current = items;
  const lockedItems = lockedRef.current ?? [];

  return (
    <Section density="spacious">
      <Container>
        <Stack>
          <SectionHead title={title} lead={lead} center />

          {isLoading ? (
            <Card>
              <CardHeader>
                <CardIcon>
                  <Loader2 size={20} />
                </CardIcon>
                <CardTitle>{tLoading}</CardTitle>
              </CardHeader>
              <CardBody />
            </Card>
          ) : isError ? (
            <Card>
              <CardHeader>
                <CardIcon>
                  <AlertTriangle size={20} />
                </CardIcon>
                <CardTitle>{tFailed}</CardTitle>
              </CardHeader>
              <CardBody />
            </Card>
          ) : lockedItems.length ? (
            <BlogCarousel
              items={lockedItems}
              locale={locale}
              initialHash={props.initialHash}
              ctaLabel={cta}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardIcon>
                  <FileText size={20} />
                </CardIcon>
                <CardTitle>{tEmpty}</CardTitle>
              </CardHeader>
              <CardBody />
            </Card>
          )}
        </Stack>
      </Container>
    </Section>
  );
}

const Stack = styled.div`
  display: grid;
  gap: 16px;
`;
