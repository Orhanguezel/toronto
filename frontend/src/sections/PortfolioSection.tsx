"use client";

import * as React from "react";
import styled from "styled-components";

import Container from "@/shared/ui/common/Container";
import SectionHead from "@/shared/ui/sections/SectionHead";
import { Section } from "@/shared/ui/sections/Section";
import CardGrid from "@/shared/ui/sections/CardGrid";
import { Card, CardTitle, CardBody, CardLink } from "@/shared/ui/cards/SiteCard";

import { useResolvedLocale } from "@/i18n/locale";
import { useUiSection } from "@/i18n/uiDb";
import type { SupportedLocale } from "@/types/common";

import { useListCustomPagesPublicQuery } from "@/integrations/rtk/endpoints/custom_pages.endpoints";
import type { CustomPageDto } from "@/integrations/types/custom_pages.types";

type Props = {
  locale?: SupportedLocale | string;
  limit?: number;
};

function pickTitle(p: CustomPageDto) {
  return (p.title || p.slug || "Portfolio").toString();
}

function pickSummary(p: CustomPageDto) {
  return (p.summary || "").toString();
}

function pickImage(p: CustomPageDto) {
  return (p.featured_image || "").toString() || null;
}

function pickAlt(p: CustomPageDto) {
  return (p.featured_image_alt || pickTitle(p)).toString();
}

function pickHref(locale: string, p: CustomPageDto) {
  // Senin routing’in farklıysa burayı değiştir:
  // Örn: `/${locale}/portfolio/${p.slug}` veya `/${locale}/p/${p.slug}`
  const slug = (p.slug || "").toString();
  return slug ? `/${locale}/portfolio/${slug}` : `/${locale}/portfolio`;
}

export default function PortfolioSection({ locale: localeProp, limit = 24 }: Props) {
  const locale = useResolvedLocale(localeProp as any) as SupportedLocale;
  const { ui } = useUiSection("ui_portfolio", locale);

  const title = ui("ui_portfolio_title", "Portfolio");
  const lead = ui("ui_portfolio_lead", "Selected work and case studies.");
  const aria = ui("ui_portfolio_aria", "Portfolio");

  const { data, isLoading, isError } = useListCustomPagesPublicQuery({
    locale,
    module_key: "portfolio",
    is_published: 1,
    limit,
    offset: 0,
    order: "updated_at.desc",
  } as any);

  const items = data?.items ?? [];

  return (
    <Section density="spacious" id="portfolio" aria-label={aria}>
      <Container>
        <SectionHead title={title} lead={lead} center />

        <CardGrid>
          {isLoading ? (
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </>
          ) : isError ? (
            <StateCard>{ui("ui_portfolio_error", "Failed to load portfolio.")}</StateCard>
          ) : items.length ? (
            items.map((p) => {
              const img = pickImage(p);
              const href = pickHref(String(locale), p);
              const summary = pickSummary(p);

              return (
                <PortfolioCard key={p.id}>
                  <Media>
                    {img ? (
                      <Thumb src={img} alt={pickAlt(p)} loading="lazy" decoding="async" />
                    ) : (
                      <ThumbFallback aria-hidden />
                    )}
                    <MediaOverlay aria-hidden />
                  </Media>

                  <Inner>
                    <Top>
                      <CardTitle>{pickTitle(p)}</CardTitle>
                      {summary ? (
                        <CardBody>{summary}</CardBody>
                      ) : (
                        <CardBody>{ui("ui_portfolio_item_fallback", "View details")}</CardBody>
                      )}
                    </Top>

                    <Bottom>
                      <CardLink href={href as any} aria-label={pickTitle(p)}>
                        {ui("ui_portfolio_item_cta", locale === "tr" ? "İncele" : locale === "de" ? "Ansehen" : "View")}
                        <span aria-hidden>→</span>
                      </CardLink>
                    </Bottom>
                  </Inner>
                </PortfolioCard>
              );
            })
          ) : (
            <StateCard>{ui("ui_portfolio_empty", "No portfolio items found.")}</StateCard>
          )}
        </CardGrid>
      </Container>
    </Section>
  );
}

/* ---------------- styles ---------------- */

const StateCard = styled(Card)`
  padding: 24px;
`;

const PortfolioCard = styled(Card)`
  padding: 0;
  overflow: hidden;

  display: grid;
  grid-template-rows: auto 1fr;

  /* daha “modern” hissiyat için hafif parıltı */
  &:hover ${"" /* Card hover'ı bozmadan ek his */} {
    transform: translateY(-1px);
  }
`;

const Media = styled.div`
  position: relative;
  width: 100%;
  height: 190px;
  overflow: hidden;
`;

const Thumb = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;

  transform: scale(1.01);
  transition: transform ${({ theme }) => theme.transition.fast},
    filter ${({ theme }) => theme.transition.fast};
  ${PortfolioCard}:hover & {
    transform: scale(1.05);
    filter: saturate(1.05);
  }
`;

const ThumbFallback = styled.div`
  width: 100%;
  height: 100%;
  background:
    radial-gradient(80% 90% at 50% 40%, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 55%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%);
`;

const MediaOverlay = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.0) 0%,
    rgba(0, 0, 0, 0.22) 90%,
    rgba(0, 0, 0, 0.28) 100%
  );
`;

const Inner = styled.div`
  padding: clamp(14px, 2vw, 20px);
  display: grid;
  gap: 14px;
  height: 100%;
`;

const Top = styled.div`
  display: grid;
  gap: 10px;
`;

const Bottom = styled.div`
  margin-top: auto;
`;

const SkeletonCard = styled(Card)`
  padding: 0;
  overflow: hidden;
  min-height: 290px;

  background:
    linear-gradient(180deg, rgba(255,255,255,.04) 0%, rgba(255,255,255,.02) 100%),
    ${({ theme }) => theme.cards.background};

  &::before {
    content: "";
    display: block;
    height: 190px;
    background: rgba(255,255,255,.06);
  }
`;
