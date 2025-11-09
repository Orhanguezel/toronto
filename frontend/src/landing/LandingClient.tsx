// src/landing/LandingClient.tsx
"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import dynamic from "next/dynamic";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import type { Route } from "next";
import {
  installNavbarHeightObserver,
  scrollToSection,
  deriveSectionFromPath,
} from "@/shared/scroll/scroll";

import Section from "@/shared/ui/layout/Section";
import Hero from "@/features/home/Hero";
import ProjectsSection from "@/sections/ProjectsSection";
import ServicesSection from "@/sections/ServicesSection";
import AdSolutionsSection from "@/sections/AdSolutionsSection";
import ReferencesSection from "@/sections/ReferencesSection";
import ContactSection from "@/sections/ContactSection";

type Locale = "tr" | "en" | "de";
type Props = { locale: Locale; initialSection?: string };

// Login paneli client-only
const LoginPanel = dynamic(() => import("@/features/auth/LoginPanel"), { ssr: false });

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.overlayBackground};
  display: grid;
  place-items: center;
  z-index: ${({ theme }) => theme.zIndex.overlay};
`;
const Sheet = styled.div`
  width: min(520px, 96vw);
  background: ${({ theme }) => theme.cards.background};
  border: 1px solid ${({ theme }) => theme.cards.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.md};
`;

/** typedRoutes için güvenli cast helper'ı */
function toRoute(href: string): Route {
  // İç link doğrulaması: "/" ile başlamalı
  if (!href.startsWith("/")) return "/" as Route;
  // Basit karakter doğrulaması (boşluk vs. olmasın)
  if (!/^\/[^\s]*$/.test(href)) return (href.replace(/\s+/g, "") || "/") as Route;
  return href as Route;
}

export default function LandingClient({ locale, initialSection }: Props) {
  const pathname = usePathname();
  const sp = useSearchParams();
  const router = useRouter();

  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => installNavbarHeightObserver(), []);

  // İlk yük: server'dan gelen section'a kaydır
  useEffect(() => {
    const id = (initialSection || "").trim();
    if (!id) return;
    let r1 = 0, r2 = 0;
    r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => scrollToSection(id));
    });
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Path değişince kaydır
  useEffect(() => {
    const id = deriveSectionFromPath(pathname, locale) || "hero";
    if (!id) return;
    let r1 = 0, r2 = 0;
    r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => scrollToSection(id));
    });
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
  }, [pathname, locale]);

  // ?login=1 geldiğinde modal aç
  useEffect(() => {
    setLoginOpen(sp?.get("login") === "1");
  }, [sp]);

  const closeLogin = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("login");
    const href = url.pathname + url.search + url.hash;
    router.replace(toRoute(href));
    setLoginOpen(false);
  };

  return (
    <main>
      <Hero locale={locale} id="hero" />

      <Section id="projects" aria-label="Satılık Projeler" container>
        <ProjectsSection />
      </Section>

      <Section id="services" aria-label="Hizmetlerimiz" container>
        <ServicesSection />
      </Section>

      <Section id="ad-solutions" aria-label="Reklam Çözümleri" container>
        <AdSolutionsSection />
      </Section>

      <Section id="references" aria-label="Referanslar" container>
        <ReferencesSection locale={locale} />
      </Section>

      <Section id="contact" aria-label="İletişim" container>
        <ContactSection locale={locale} />
      </Section>

      {loginOpen && (
        <Backdrop onClick={closeLogin} role="dialog" aria-modal="true" aria-label="Login">
          <Sheet onClick={(e) => e.stopPropagation()}>
            {/* Girişten sonra iletişime dön */}
            <LoginPanel locale={locale} nextDest={`/${locale}#contact`} />
          </Sheet>
        </Backdrop>
      )}
    </main>
  );
}
