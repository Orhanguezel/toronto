"use client";

import React from "react";
import styled from "styled-components";
import WhatsAppButton from "@/shared/ui/actions/WhatsAppButton";

type HeroProps = { locale: "tr" | "en" | "de"; whatsapp?: string };

const COPY: Record<string, { title: string; sub: string; cta: string }> = {
  tr: { title: "Toronto ile markanızı", sub: "Satılık projeler, yaratıcı hizmetler ve yüksek etkili reklam çözümleri.", cta: "Bilgi Alın" },
  en: { title: "Grow your brand", sub: "Projects for sale, creative services, and high-impact ad solutions.", cta: "Learn More" },
  de: { title: "Wachsen Sie mit Toronto", sub: "Verkaufsprojekte, kreative Services und wirkungsvolle Werbelösungen.", cta: "Mehr erfahren" },
};

/* ========== OUTER (tam tavanda, yatay taşma yok) ========== */
const Wrap = styled.section`
  position: relative;
  width: 100%;
  margin: 0;
  isolation: isolate;
  overflow-x: clip;
  background: ${({ theme }) => theme.colors.background};
`;

/* ========== STAGE (1280×1401 oran) ========== */
const Stage = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1280 / 1401;
  overflow: hidden;
  contain: layout paint;

  background:
    radial-gradient(75% 60% at 50% 30%, rgba(40,101,224,.45) 0%, rgba(40,101,224,.22) 35%, rgba(40,101,224,.10) 55%, rgba(40,101,224,0) 72%),
    radial-gradient(45% 40% at 50% 62%, rgba(33,143,255,.55) 0%, rgba(33,143,255,.22) 45%, rgba(33,143,255,.06) 70%, rgba(33,143,255,0) 86%),
    linear-gradient(180deg, #0E1830 0%, #0A1020 100%);

  &::after {
    content: "";
    position: absolute; inset: 0; pointer-events: none;
    background:
      radial-gradient(120% 120% at 50% 35%, rgba(255,255,255,.06) 0%, rgba(255,255,255,0) 50%),
      linear-gradient(90deg, rgba(0,0,0,.28) 0%, rgba(0,0,0,0) 14%, rgba(0,0,0,0) 86%, rgba(0,0,0,.28) 100%);
  }
`;

/* ========== BLURS ========== */
const BlurBlue = styled.div`
  position: absolute; left: 15.75%; top: 19.061%;
  width: 68.75%; height: 56.163%;
  border-radius: 50%; background: #218fff;
  filter: blur(clamp(60px, 17vw, 240px)); opacity: .65;
`;
const BlurRoyal = styled.div`
  position: absolute; left: 26.416%; top: 27.775%;
  width: 47.416%; height: 38.735%;
  border-radius: 50%; background: #2865e0;
  filter: blur(clamp(30px, 8vw, 120px)); opacity: .75;
`;

/* ========== CONTENT ========== */
const TextBlock = styled.div`
  position: absolute;
  left: 50%; transform: translateX(-50%);
  top: clamp(56px, 22.5%, 320px);
  width: min(90vw, 680px);
  padding-inline: 16px;
  text-align: center; z-index: 2;
`;

const Title = styled.h1`
  margin: 0 0 clamp(10px, 2.2vw, 16px);
  font-family: 'Montserrat', ui-sans-serif, system-ui;
  font-weight: 600;
  font-size: clamp(28px, 6.4vw, 82px);
  line-height: clamp(34px, 6.6vw, 84px);
  letter-spacing: -0.0506em;
  background: linear-gradient(180deg, #fff 54.17%, #218FFF 100%);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
`;

const Sub = styled.p`
  margin: 0 auto clamp(14px, 2.6vw, 24px);
  max-width: 70ch;
  font-family: 'Inter', ui-sans-serif, system-ui;
  font-size: clamp(14px, 1.56vw, 20px);
  line-height: clamp(22px, 2.4vw, 31px);
  color: #fff; opacity: .95;
`;

const CtaShell = styled.a`
  position: relative; display: inline-block;
  width: clamp(120px, 10.7vw, 137px);
  height: clamp(44px, 4.5vw, 57px);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: clamp(8px, 1vw, 12px);
  text-decoration: none;
  transition: transform .15s ease, box-shadow .15s ease;
  &:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(0,0,0,.22); }
`;

const CtaFill = styled.span`
  position: absolute; left: 50%; transform: translateX(-50%);
  top: clamp(6px, .6vw, 8px);
  width: clamp(104px, 9.7vw, 124px);
  height: clamp(34px, 3.3vw, 41px);
  border-radius: clamp(6px, .8vw, 8px);
  background: #fff; color: #000;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Inter', ui-sans-serif, system-ui;
  font-weight: 500; font-size: clamp(12px, 1.2vw, 15px);
`;

const WhatsAppFab = styled.div`
  position: absolute;
  left: 87.03125%; top: 47.1806%;
  transform: translate(-50%, -50%);
  width: clamp(44px, 6.2vw, 79px);
  height: clamp(44px, 6.2vw, 79px);
  z-index: 3;
`;

export default function Hero({ locale, whatsapp }: HeroProps) {
  const t = COPY[locale] ?? COPY.tr;

  return (
    <Wrap>
      <Stage>
        <BlurBlue />
        <BlurRoyal />
        <TextBlock>
          <Title>{t.title}</Title>
          <Sub>{t.sub}</Sub>
          <CtaShell href="#projects" aria-label={t.cta}>
            <CtaFill>{t.cta}</CtaFill>
          </CtaShell>
        </TextBlock>
        <WhatsAppFab>
          <WhatsAppButton number={whatsapp} />
        </WhatsAppFab>
      </Stage>
    </Wrap>
  );
}
