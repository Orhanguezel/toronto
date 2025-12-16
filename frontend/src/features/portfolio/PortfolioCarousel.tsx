"use client";

import * as React from "react";
import styled from "styled-components";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

import { useResolvedLocale } from "@/i18n/locale";
import type { SupportedLocale } from "@/types/common";

import { useListCustomPagesPublicQuery } from "@/integrations/rtk/endpoints/custom_pages.endpoints";
import { mapCustomPageToPortfolioItem, type PortfolioItem } from "./portfolio.helpers";

export default function PortfolioCarousel({
  locale: localeProp,
  ariaLabel,
  limit = 24,
  initial,
}: {
  locale?: SupportedLocale | string;
  ariaLabel?: string;
  limit?: number;
  initial?: PortfolioItem[];
}) {
  const locale = useResolvedLocale(localeProp as any) as SupportedLocale;

  const shouldFetch = !initial?.length;

  const { data } = useListCustomPagesPublicQuery(
    shouldFetch
      ? ({
        locale,
        module_key: "portfolio",
        is_published: 1,
        limit,
        offset: 0,
        order: "updated_at.desc",
      } as any)
      : (undefined as any)
  );

  const items: PortfolioItem[] = React.useMemo(() => {
    if (initial?.length) return initial;
    const raw = data?.items ?? [];
    return raw.map((p) => mapCustomPageToPortfolioItem(locale, p));
  }, [data, initial, locale]);

  const plugins = React.useMemo(
    () => [Autoplay({ delay: 2600, stopOnInteraction: false, stopOnMouseEnter: true })],
    []
  );

  const [viewportRef] = useEmblaCarousel({ loop: true, align: "start", dragFree: true }, plugins);

  if (!items.length) return null;
  const doubled = React.useMemo(() => items.concat(items), [items]);

  return (
    <Wrap aria-label={ariaLabel || "Portfolio carousel"}>
      <Viewport ref={viewportRef}>
        <Track>
          {doubled.map((x, i) => (
            <Slide key={`${x.key}-${i}`}>
              <SlideLink href={x.href || "#"} aria-label={x.title}>
                {x.image_url ? (
                  <SlideImg src={x.image_url} alt={x.image_alt || x.title} loading="lazy" decoding="async" />
                ) : (
                  <SlideFallback aria-hidden />
                )}
                <SlideCap>{x.title}</SlideCap>
              </SlideLink>
            </Slide>
          ))}
        </Track>
      </Viewport>
    </Wrap>
  );
}

/* styles */

const Wrap = styled.div`
  position: relative;
`;

const Viewport = styled.div`
  overflow: hidden;
`;

const Track = styled.div`
  display: flex;
  gap: clamp(14px, 3vw, 28px);
  align-items: stretch;
  will-change: transform;
  padding-block: 10px;
`;

const Slide = styled.div`
  flex: 0 0 auto;
  width: clamp(180px, 22vw, 280px);
`;

const SlideLink = styled.a`
  display: grid;
  text-decoration: none;

  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(0, 0, 0, 0.18);

  transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 34px rgba(0, 0, 0, 0.28);
    border-color: rgba(255, 255, 255, 0.18);
  }
`;

const SlideImg = styled.img`
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
`;

const SlideFallback = styled.div`
  width: 100%;
  height: 160px;
  background:
    radial-gradient(80% 90% at 50% 40%, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 55%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%);
`;

const SlideCap = styled.div`
  padding: 10px 12px 12px;
  color: rgba(255, 255, 255, 0.92);
  font-size: 14px;
  line-height: 1.3;
`;
