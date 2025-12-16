"use client";

import React from "react";
import styled from "styled-components";

import WhatsAppButton from "@/shared/ui/actions/WhatsAppButton";
import OfferRequestModal from "@/features/offers/OfferRequestModal";

import { useResolvedLocale } from "@/i18n/locale";
import { useUiSection } from "@/i18n/uiDb";
import type { SupportedLocale } from "@/types/common";

type HeroProps = {
  locale: SupportedLocale | string;
  whatsapp?: string;
  id?: string;
};

export default function Hero({ locale: localeProp, whatsapp, id = "hero" }: HeroProps) {
  const locale = useResolvedLocale(localeProp);
  const { ui } = useUiSection("ui_hero", locale);

  const [offerOpen, setOfferOpen] = React.useState(false);

  const title = ui(
    "ui_hero_title_fallback",
    locale === "tr"
      ? "Toronto ile markanızı"
      : locale === "de"
        ? "Wachsen Sie mit Toronto"
        : "Grow your brand"
  );

  const sub = ui(
    "ui_hero_desc_fallback",
    locale === "tr"
      ? "Satılık projeler, yaratıcı hizmetler ve yüksek etkili reklam çözümleri."
      : locale === "de"
        ? "Verkaufsprojekte, kreative Services und wirkungsvolle Werbelösungen."
        : "Projects for sale, creative services, and high-impact ad solutions."
  );

  const ctaLabel = ui(
    "ui_hero_cta",
    locale === "tr"
      ? "Teklif Al"
      : locale === "de"
        ? "Angebot anfordern"
        : "Request an Offer"
  );

  const waLabel = ui(
    "ui_hero_whatsapp_label",
    locale === "tr"
      ? "WhatsApp ile sohbet et"
      : locale === "de"
        ? "Per WhatsApp chatten"
        : "Chat on WhatsApp"
  );

  return (
    <>
      <Wrap id={id} data-section={id} aria-label="Hero" role="region">
        <Stage>
          <Content>
            <Title id="hero-title">{title}</Title>
            <Sub aria-describedby="hero-title">{sub}</Sub>

            <CtaStyles>
              <button
                type="button"
                className="cta"
                aria-label={ctaLabel}
                onClick={() => setOfferOpen(true)}
              >
                <span className="cta-fill">{ctaLabel}</span>
              </button>
            </CtaStyles>
          </Content>

          <WhatsAppFab aria-label={waLabel}>
            <WhatsAppMotion>
              <WhatsAppButton
                number={whatsapp}
                label={waLabel}
                style={{ width: "var(--wa-size)", height: "var(--wa-size)" }}
              />
            </WhatsAppMotion>
          </WhatsAppFab>
        </Stage>
      </Wrap>

      <OfferRequestModal
        open={offerOpen}
        locale={String(locale)}
        onClose={() => setOfferOpen(false)}
        defaultSubject={ctaLabel}
      />
    </>
  );
}

/* ================= styles ================= */

const Wrap = styled.section`
  position: relative;
  width: 100%;
  background: transparent; /* ✅ background artık page-level */
`;

const Stage = styled.div`
  position: relative;
  width: 100%;

  /* 🔑 TAM EKRAN HERO */
  min-height: 100dvh;

  /* 🔑 Navbar boşluğu */
  padding-top: var(--navbar-h, 96px);

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;
  isolation: isolate;

  background: transparent; /* ✅ background artık page-level */
`;

const Content = styled.div`
  position: relative;
  z-index: 2;
  width: min(90vw, 680px);
  padding-inline: 16px;
  text-align: center;
`;

const Title = styled.h1`
  margin: 0 0 clamp(10px, 2.2vw, 16px);
  font-weight: 600;
  font-size: clamp(28px, 6.4vw, 82px);
  line-height: clamp(34px, 6.6vw, 84px);
  letter-spacing: -0.05em;
  background: linear-gradient(180deg, #fff 54%, #218FFF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Sub = styled.p`
  margin: 0 auto clamp(16px, 3vw, 28px);
  max-width: 70ch;
  font-size: clamp(14px, 1.56vw, 20px);
  line-height: 1.55;
  color: #fff;
  opacity: 0.95;
`;

const CtaStyles = styled.div`
  .cta {
    position: relative;
    width: clamp(140px, 14vw, 180px);
    height: clamp(46px, 5vw, 60px);
    border: 1px solid rgba(255,255,255,.15);
    border-radius: 12px;
    background: transparent;
    cursor: pointer;
    transition: transform .15s ease, box-shadow .15s ease;
  }

  .cta:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 28px rgba(0,0,0,.22);
  }

  .cta-fill {
    position: absolute;
    inset: 6px;
    border-radius: 8px;
    background: #fff;
    color: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
  }
`;

/* WhatsApp – Hero sağ alt */
const WhatsAppFab = styled.div`
  position: absolute;
  --wa-size: clamp(44px, 6vw, 84px);

  right: clamp(12px, 4vw, 32px);
  bottom: clamp(16px, 6vh, calc(var(--navbar-h, 96px) + 24px));

  z-index: 3;
`;

const WhatsAppMotion = styled.div`
  display: inline-grid;
  place-items: center;
  transition: transform 220ms ease, filter 220ms ease;

  &:hover {
    transform: translateY(-6px) scale(1.05);
    filter: drop-shadow(0 18px 34px rgba(0,0,0,.28));
  }
`;
