"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import dynamic from "next/dynamic";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import type { Route } from "next";

import {
  installNavbarHeightObserver,
  scrollToSection,
  deriveSectionFromPath,
} from "@/shared/scroll/scroll";

import ScrollProgress from "@/layout/ScrollProgress";

import Section from "@/shared/ui/layout/Section";
import Hero from "@/features/home/Hero";
import AboutSection from "@/sections/AboutSection";
import ServicesSection from "@/sections/ServicesSection";
import BlogSection from "@/sections/BlogSection";
import PortfolioSection from "@/sections/PortfolioSection";
import ContactSection from "@/sections/ContactSection";

import { useResolvedLocale } from "@/i18n/locale";
import { useUiSection } from "@/i18n/uiDb";
import type { SupportedLocale } from "@/types/common";

const LoginPanel = dynamic(() => import("@/features/auth/LoginPanel"), { ssr: false });

type Props = {
  locale: SupportedLocale | string;
  initialSection?: string;
  initialHash?: string;
};

/* ✅ GLOBAL PAGE BACKGROUND (Hero’dan taşındı) */
const PageBackground = styled.main`
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  isolation: isolate;

  background:
    radial-gradient(75% 60% at 50% 30%, rgba(40,101,224,.45) 0%, rgba(40,101,224,.22) 35%, rgba(40,101,224,.10) 55%, rgba(40,101,224,0) 72%),
    radial-gradient(45% 40% at 50% 62%, rgba(33,143,255,.55) 0%, rgba(33,143,255,.22) 45%, rgba(33,143,255,.06) 70%, rgba(33,143,255,0) 86%),
    linear-gradient(180deg, #0E1830 0%, #0A1020 100%);
`;

/* global blur layers */
const BlurBlue = styled.div`
  position: fixed;
  left: 10%;
  top: 20%;
  width: 70%;
  height: 60%;
  border-radius: 50%;
  background: #218fff;
  filter: blur(220px);
  opacity: .5;
  pointer-events: none;
  z-index: 0;
`;

const BlurRoyal = styled.div`
  position: fixed;
  left: 35%;
  top: 35%;
  width: 45%;
  height: 40%;
  border-radius: 50%;
  background: #2865e0;
  filter: blur(140px);
  opacity: .55;
  pointer-events: none;
  z-index: 0;
`;

/* içerik blur’un üstünde kalsın */
const ContentLayer = styled.div`
  position: relative;
  z-index: 1;
`;

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

type SectionId = "hero" | "about" | "services" | "blog" | "portfolio" | "contact";
const SECTION_IDS: SectionId[] = ["hero", "about", "services", "blog", "portfolio", "contact"];

function normalizePath(p: string) {
  if (!p) return "/";
  const x = p.startsWith("/") ? p : `/${p}`;
  return x.length > 1 && x.endsWith("/") ? x.slice(0, -1) : x;
}

function asRoute(path: string): Route {
  return normalizePath(path) as Route;
}

function sectionToPath(locale: string, section: SectionId): string {
  const base = `/${locale}`;
  switch (section) {
    case "hero":
      return base;
    case "about":
      return `${base}/about`;
    case "services":
      return `${base}/services`;
    case "blog":
      return `${base}/blog`;
    case "portfolio":
      return `${base}/portfolio`;
    case "contact":
      return `${base}/contact`;
    default:
      return base;
  }
}

function pathToSection(pathname: string, locale: string): SectionId {
  const derived = deriveSectionFromPath(pathname, locale);
  if (derived && SECTION_IDS.includes(derived as SectionId)) return derived as SectionId;

  const p = normalizePath(pathname);
  if (p === `/${locale}`) return "hero";
  if (p.endsWith("/about")) return "about";
  if (p.endsWith("/services")) return "services";
  if (p.endsWith("/blog")) return "blog";
  if (p.endsWith("/portfolio")) return "portfolio";
  if (p.endsWith("/contact")) return "contact";
  return "hero";
}

export default function LandingClient({ locale: localeProp, initialSection, initialHash }: Props) {
  const pathname = usePathname() || "/";
  const sp = useSearchParams();
  const router = useRouter();

  const [loginOpen, setLoginOpen] = useState(false);
  const locale = useResolvedLocale(localeProp) as SupportedLocale;

  const { ui: uiHome } = useUiSection("ui_home", locale);
  const { ui: uiAbout } = useUiSection("ui_about", locale);
  const { ui: uiServices } = useUiSection("ui_services", locale);
  const { ui: uiBlog } = useUiSection("ui_blog", locale);
  const { ui: uiPortfolio } = useUiSection("ui_portfolio", locale);
  const { ui: uiContact } = useUiSection("ui_contact", locale);

  const ariaAbout = uiAbout("ui_about_title", "About");
  const ariaServices = uiServices("ui_services_title", "Services");
  const ariaBlog = uiBlog("ui_blog_title", "Blog");
  const ariaPortfolio = uiPortfolio("ui_portfolio_title", "Portfolio");
  const ariaContact = uiContact("ui_contact_title_left", "Contact");
  const ariaLoginModal = uiHome("ui_home_login_aria", "Login");

  useEffect(() => {
    const cleanup = installNavbarHeightObserver();
    return () => cleanup?.();
  }, []);

  const isProgrammaticScrollRef = useRef(false);
  const urlSyncingFromScrollRef = useRef(false);

  const navigationIntentRef = useRef<{
    allowScroll: boolean;
    reason: "goToSection" | "popstate" | "initialRoute" | "hash" | "unknown";
  }>({ allowScroll: false, reason: "unknown" });

  const didInitialRouteScrollRef = useRef(false);

  const enableScrollSyncRef = useRef(false);
  useEffect(() => {
    const t = window.setTimeout(() => {
      enableScrollSyncRef.current = true;
    }, 900);
    return () => window.clearTimeout(t);
  }, []);

  const userScrollingRef = useRef(false);
  const userScrollTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const mark = () => {
      userScrollingRef.current = true;
      if (userScrollTimerRef.current) window.clearTimeout(userScrollTimerRef.current);
      userScrollTimerRef.current = window.setTimeout(() => {
        userScrollingRef.current = false;
      }, 180);
    };

    const onWheel = () => mark();
    const onTouch = () => mark();
    const onKey = (e: KeyboardEvent) => {
      const keys = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "];
      if (keys.includes(e.key)) mark();
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("keydown", onKey);
      if (userScrollTimerRef.current) window.clearTimeout(userScrollTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const onPop = () => {
      navigationIntentRef.current = { allowScroll: true, reason: "popstate" };
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const raw = (initialHash || initialSection || "").trim();
    if (!raw) return;

    navigationIntentRef.current = { allowScroll: true, reason: "hash" };
    isProgrammaticScrollRef.current = true;

    const r = requestAnimationFrame(() => {
      scrollToSection(raw);
      window.setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 450);
    });

    return () => cancelAnimationFrame(r);
  }, [initialHash, initialSection]);

  useEffect(() => {
    if (urlSyncingFromScrollRef.current) {
      urlSyncingFromScrollRef.current = false;
      return;
    }

    const targetSection = pathToSection(pathname, locale);

    if (!didInitialRouteScrollRef.current) {
      didInitialRouteScrollRef.current = true;

      if (targetSection && targetSection !== "hero") {
        navigationIntentRef.current = { allowScroll: true, reason: "initialRoute" };
      }
    }

    if (!navigationIntentRef.current.allowScroll) return;
    navigationIntentRef.current = { allowScroll: false, reason: "unknown" };

    if (userScrollingRef.current) return;

    isProgrammaticScrollRef.current = true;

    const r = requestAnimationFrame(() => {
      scrollToSection(targetSection);
      window.setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 450);
    });

    return () => cancelAnimationFrame(r);
  }, [pathname, locale]);

  useEffect(() => {
    setLoginOpen(sp?.get("login") === "1");
  }, [sp]);

  const nextAfterLogin = useMemo(() => `/${locale}/contact`, [locale]);

  const closeLogin = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("login");
    const href = url.pathname + url.search;
    router.replace(asRoute(href), { scroll: false });
    setLoginOpen(false);
  };

  const lastSectionRef = useRef<SectionId>("hero");
  const lastPathRef = useRef<string>("");
  const replaceTimerRef = useRef<number | null>(null);
  const ratioByIdRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const els = SECTION_IDS
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (!els.length) return;

    ratioByIdRef.current = {};
    lastSectionRef.current = pathToSection(window.location.pathname, locale);

    const observer = new IntersectionObserver(
      (entries) => {
        if (!enableScrollSyncRef.current) return;
        if (isProgrammaticScrollRef.current) return;

        for (const e of entries) {
          const id = (e.target as HTMLElement).id;
          if (!id) continue;
          ratioByIdRef.current[id] = e.isIntersecting ? (e.intersectionRatio ?? 0) : 0;
        }

        let bestId: SectionId | null = null;
        let bestRatio = 0;

        for (const id of SECTION_IDS) {
          const r = ratioByIdRef.current[id] ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            bestId = id;
          }
        }

        if (!bestId || bestRatio < 0.25) return;
        if (lastSectionRef.current === bestId) return;

        lastSectionRef.current = bestId;

        if (replaceTimerRef.current) window.clearTimeout(replaceTimerRef.current);

        replaceTimerRef.current = window.setTimeout(() => {
          if (!enableScrollSyncRef.current) return;
          if (isProgrammaticScrollRef.current) return;

          const targetPath = normalizePath(sectionToPath(locale, bestId!));
          const current = normalizePath(window.location.pathname);

          if (current === targetPath) return;
          if (lastPathRef.current === targetPath) return;

          lastPathRef.current = targetPath;

          urlSyncingFromScrollRef.current = true;
          router.replace(asRoute(targetPath), { scroll: false });
        }, 160);
      },
      {
        root: null,
        rootMargin: "-30% 0px -55% 0px",
        threshold: [0.2, 0.35, 0.5, 0.75],
      }
    );

    els.forEach((el) => observer.observe(el));

    return () => {
      if (replaceTimerRef.current) window.clearTimeout(replaceTimerRef.current);
      observer.disconnect();
    };
  }, [router, locale]);

  const goToSection = useCallback(
    (id: SectionId) => {
      if (userScrollingRef.current) return;

      navigationIntentRef.current = { allowScroll: true, reason: "goToSection" };

      const targetPath = normalizePath(sectionToPath(locale, id));
      router.push(asRoute(targetPath), { scroll: false });
    },
    [locale, router]
  );

  return (
    <PageBackground>
      <BlurBlue />
      <BlurRoyal />

      <ContentLayer>
        <Hero locale={locale} id="hero" />

        <Section id="about" aria-label={ariaAbout} container>
          <AboutSection locale={locale} />
        </Section>

        <Section id="services" aria-label={ariaServices} container>
          <ServicesSection locale={locale} />
        </Section>

        <Section id="blog" aria-label={ariaBlog} container>
          <BlogSection locale={locale} />
        </Section>

        <Section id="portfolio" aria-label={ariaPortfolio} container>
          <PortfolioSection locale={locale} />
        </Section>

        <Section id="contact" aria-label={ariaContact} container>
          <ContactSection locale={locale} />
        </Section>

        <ScrollProgress />

        {loginOpen && (
          <Backdrop onClick={closeLogin} role="dialog" aria-modal="true" aria-label={ariaLoginModal}>
            <Sheet onClick={(e) => e.stopPropagation()}>
              <LoginPanel locale={locale} nextDest={nextAfterLogin} />
            </Sheet>
          </Backdrop>
        )}
      </ContentLayer>
    </PageBackground>
  );
}
