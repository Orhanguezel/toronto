'use client';

import React from 'react';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import LocaleSwitcher from '@/shared/ui/navigation/LocaleSwitcher';

import {
  Bar, Row, Left, Right, Brand, LogoImg, DesktopNav, Glass,
  NavLink, Dropdown, DropBtn, Panel, PanelLink,
  BurgerBtn, DesktopLocale, MobileSheet, MobilePanel, MobileHeader, CloseBtn, MobileLink,
} from './Navbar.styles';

/* ========= helpers ========= */
const GAP = 24;
function scrollToSection(id?: string) {
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;
  const navH =
    parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-h')) || 96;
  const y = el.getBoundingClientRect().top + window.scrollY - (navH + GAP);
  window.scrollTo({ top: y, behavior: 'smooth' });
}

type Locale = 'tr' | 'en' | 'de';

export default function Navbar(
  props: { locale: Locale; contact?: { phones?: string[]; email?: string } }
) {
  const { locale } = props;
  const pathname = usePathname();

  // ✅ sub destekli path üret (typed-routes: Route'a cast)
  const toPath = (segment?: string, sub?: string): Route =>
    (`/${locale}${segment ? `/${segment}` : ''}${sub ? `/${sub}` : ''}`) as Route;

  // /tr/services/web → /tr/services aktif kalsın (startsWith)
  const is = (segment?: string) => {
    const target = `/${locale}${segment ? `/${segment}` : ''}`;
    if (!segment) return pathname === target ? { 'aria-current': 'page' as const } : {};
    return pathname.startsWith(target) ? { 'aria-current': 'page' as const } : {};
  };

  // Aynı path ise default'u iptal et → scroll
  const clickSamePath = (e: React.MouseEvent, targetPath: string, sectionId: string) => {
    if (pathname === targetPath) {
      e.preventDefault();
      scrollToSection(sectionId);
    }
  };

  const [mobileOpen, setMobileOpen] = React.useState(false);
  React.useEffect(() => { setMobileOpen(false); }, [pathname]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  React.useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [mobileOpen]);

  return (
    <>
      <Bar data-navbar="">
        <Row>
          <Left>
            <Brand
              href={toPath()}
              aria-label="Toronto anasayfa"
              onClick={(e) => clickSamePath(e, `/${locale}`, 'hero')}
              scroll={false}
            >
              <LogoImg src="/logo.svg" alt="Toronto" />
            </Brand>
          </Left>

          <DesktopNav aria-label="Ana menü">
            <Glass>
              <NavLink
                href={toPath()}
                {...is()}
                onClick={(e) => clickSamePath(e, `/${locale}`, 'hero')}
                scroll={false}
              >
                Ana Sayfa
              </NavLink>

              <NavLink
                href={toPath('projects')}
                {...is('projects')}
                onClick={(e) => clickSamePath(e, `/${locale}/projects`, 'projects')}
                scroll={false}
              >
                Satılık Projeler
              </NavLink>

              <Dropdown>
                <DropBtn type="button" aria-haspopup="menu" aria-expanded="false">
                  Hizmetlerimiz
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M7 10l5 5 5-5" stroke="#EDEFF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </DropBtn>
                <Panel role="menu" aria-label="Hizmetlerimiz">
                  {/* ✅ Alt başlıklar alt-segment ile */}
                  <PanelLink
                    href={toPath('services','web')}
                    onClick={(e) => clickSamePath(e, `/${locale}/services/web`, 'web')}
                    scroll={false}
                  >
                    Web Geliştirme
                  </PanelLink>
                  <PanelLink
                    href={toPath('services','design')}
                    onClick={(e) => clickSamePath(e, `/${locale}/services/design`, 'design')}
                    scroll={false}
                  >
                    Tasarım
                  </PanelLink>
                  <PanelLink
                    href={toPath('services','seo')}
                    onClick={(e) => clickSamePath(e, `/${locale}/services/seo`, 'seo')}
                    scroll={false}
                  >
                    SEO / Performans
                  </PanelLink>
                </Panel>
              </Dropdown>

              <NavLink
                href={toPath('ad-solutions')}
                {...is('ad-solutions')}
                onClick={(e) => clickSamePath(e, `/${locale}/ad-solutions`, 'ad-solutions')}
                scroll={false}
              >
                Reklam Çözümleri
              </NavLink>

              <NavLink
                href={toPath('references')}
                {...is('references')}
                onClick={(e) => clickSamePath(e, `/${locale}/references`, 'references')}
                scroll={false}
              >
                Referanslar
              </NavLink>

              <NavLink
                href={toPath('contact')}
                {...is('contact')}
                onClick={(e) => clickSamePath(e, `/${locale}/contact`, 'contact')}
                scroll={false}
              >
                İletişim
              </NavLink>
            </Glass>
          </DesktopNav>

          <Right>
            <DesktopLocale><LocaleSwitcher /></DesktopLocale>
            <BurgerBtn
              className={mobileOpen ? 'open' : ''}
              aria-label="Menüyü aç/kapat"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen(v => !v)}
            >
              <span />
            </BurgerBtn>
          </Right>
        </Row>
      </Bar>

      {/* Mobile */}
      <MobileSheet $open={mobileOpen} onClick={() => setMobileOpen(false)}>
        <MobilePanel id="mobile-menu" onClick={(e) => e.stopPropagation()}>
          <MobileHeader>
            <Brand
              href={toPath()}
              aria-label="Toronto anasayfa"
              onClick={(e) => { clickSamePath(e, `/${locale}`, 'hero'); setMobileOpen(false); }}
              scroll={false}
            >
              <LogoImg src="/logo.svg" alt="Toronto" />
            </Brand>
            <CloseBtn onClick={() => setMobileOpen(false)} aria-label="Kapat">✕</CloseBtn>
          </MobileHeader>

          <MobileLink
            href={toPath()}
            {...is()}
            onClick={(e) => { clickSamePath(e, `/${locale}`, 'hero'); setMobileOpen(false); }}
            scroll={false}
          >
            Ana Sayfa
          </MobileLink>

          <MobileLink
            href={toPath('projects')}
            {...is('projects')}
            onClick={(e) => { clickSamePath(e, `/${locale}/projects`, 'projects'); setMobileOpen(false); }}
            scroll={false}
          >
            Satılık Projeler
          </MobileLink>

          {/* ✅ Mobile alt-segmentler de düzeltildi */}
          <MobileLink
            href={toPath('services','web')}
            {...is('services')}
            onClick={(e) => { clickSamePath(e, `/${locale}/services/web`, 'web'); setMobileOpen(false); }}
            scroll={false}
          >
            Web Geliştirme
          </MobileLink>

          <MobileLink
            href={toPath('services','design')}
            {...is('services')}
            onClick={(e) => { clickSamePath(e, `/${locale}/services/design`, 'design'); setMobileOpen(false); }}
            scroll={false}
          >
            Tasarım
          </MobileLink>

          <MobileLink
            href={toPath('services','seo')}
            {...is('services')}
            onClick={(e) => { clickSamePath(e, `/${locale}/services/seo`, 'seo'); setMobileOpen(false); }}
            scroll={false}
          >
            SEO / Performans
          </MobileLink>

          <MobileLink
            href={toPath('ad-solutions')}
            {...is('ad-solutions')}
            onClick={(e) => { clickSamePath(e, `/${locale}/ad-solutions`, 'ad-solutions'); setMobileOpen(false); }}
            scroll={false}
          >
            Reklam Çözümleri
          </MobileLink>

          <MobileLink
            href={toPath('references')}
            {...is('references')}
            onClick={(e) => { clickSamePath(e, `/${locale}/references`, 'references'); setMobileOpen(false); }}
            scroll={false}
          >
            Referanslar
          </MobileLink>

          <MobileLink
            href={toPath('contact')}
            {...is('contact')}
            onClick={(e) => { clickSamePath(e, `/${locale}/contact`, 'contact'); setMobileOpen(false); }}
            scroll={false}
          >
            İletişim
          </MobileLink>

          <div style={{ marginTop: 'auto', paddingTop: 8 }}>
            <LocaleSwitcher />
          </div>
        </MobilePanel>
      </MobileSheet>
    </>
  );
}
