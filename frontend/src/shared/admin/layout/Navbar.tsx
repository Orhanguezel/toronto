// src/layout/Navbar.tsx

'use client';

import React from 'react';
import type { UrlObject } from 'url';
import { usePathname } from 'next/navigation';
import LocaleSwitcher from '@/shared/ui/navigation/LocaleSwitcher';

import {
  Bar, Row, Left, Right, Brand, LogoImg, DesktopNav, Glass,
  NavLink, Dropdown, DropBtn, Panel, PanelLink,
  BurgerBtn, DesktopLocale, MobileSheet, MobilePanel, MobileHeader, CloseBtn, MobileLink,
} from './Navbar.styles';

/* ========== TYPES ========== */
type Path = '' | '/projects' | '/services' | '/ad-solutions' | '/references' | '/contact';

export default function Navbar(
  props: { locale: string; contact?: { phones?: string[]; email?: string } }
) {
  const { locale } = props;

  const pathname = usePathname();
  const mk = (p: Path): UrlObject => ({ pathname: `/${locale}${p}` });
  const is = (p: Path) => (pathname === `/${locale}${p}` ? { 'aria-current': 'page' as const } : {});

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
      <Bar>
        <Row>
          <Left>
            <Brand href={mk('')} aria-label="Toronto anasayfa">
              <LogoImg src="/logo.svg" alt="Toronto" />
            </Brand>
          </Left>

          {/* Desktop nav – sadece breakpoint üstünde */}
          <DesktopNav aria-label="Ana menü">
            <Glass>
              <NavLink href={mk('')} {...is('')}>Ana Sayfa</NavLink>
              <NavLink href={mk('/projects')} {...is('/projects')}>Satılık Projeler</NavLink>

              <Dropdown>
                <DropBtn type="button" aria-haspopup="menu" aria-expanded="false">
                  Hizmetlerimiz
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M7 10l5 5 5-5" stroke="#EDEFF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </DropBtn>
                <Panel role="menu" aria-label="Hizmetlerimiz">
                  <PanelLink href={{ ...mk('/services'), hash: 'web' }}>Web Geliştirme</PanelLink>
                  <PanelLink href={{ ...mk('/services'), hash: 'design' }}>Tasarım</PanelLink>
                  <PanelLink href={{ ...mk('/services'), hash: 'seo' }}>SEO / Performans</PanelLink>
                </Panel>
              </Dropdown>

              <NavLink href={mk('/ad-solutions')} {...is('/ad-solutions')}>Reklam Çözümleri</NavLink>
              <NavLink href={mk('/references')} {...is('/references')}>Referanslar</NavLink>
              <NavLink href={mk('/contact')} {...is('/contact')}>İletişim</NavLink>
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

      {/* Mobile drawer – sadece state’e bağlı */}
      <MobileSheet $open={mobileOpen} onClick={() => setMobileOpen(false)}>
        <MobilePanel id="mobile-menu" onClick={(e) => e.stopPropagation()}>
          <MobileHeader>
            <Brand href={mk('')} aria-label="Toronto anasayfa" onClick={() => setMobileOpen(false)}>
              <LogoImg src="/logo.svg" alt="Toronto" />
            </Brand>
            <CloseBtn onClick={() => setMobileOpen(false)} aria-label="Kapat">✕</CloseBtn>
          </MobileHeader>

          <MobileLink href={mk('')} {...is('')} onClick={() => setMobileOpen(false)}>Ana Sayfa</MobileLink>
          <MobileLink href={mk('/projects')} {...is('/projects')} onClick={() => setMobileOpen(false)}>Satılık Projeler</MobileLink>
          <MobileLink href={mk('/services')} {...is('/services')} onClick={() => setMobileOpen(false)}>Hizmetlerimiz</MobileLink>
          <MobileLink href={mk('/ad-solutions')} {...is('/ad-solutions')} onClick={() => setMobileOpen(false)}>Reklam Çözümleri</MobileLink>
          <MobileLink href={mk('/references')} {...is('/references')} onClick={() => setMobileOpen(false)}>Referanslar</MobileLink>
          <MobileLink href={mk('/contact')} {...is('/contact')} onClick={() => setMobileOpen(false)}>İletişim</MobileLink>

          <div style={{ marginTop: 'auto', paddingTop: 8 }}>
            <LocaleSwitcher />
          </div>
        </MobilePanel>
      </MobileSheet>
    </>
  );
}
