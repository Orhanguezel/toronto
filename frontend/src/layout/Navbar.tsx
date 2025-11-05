// src/layout/Navbar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import type { UrlObject } from 'url';
import styled from 'styled-components';
import { usePathname } from 'next/navigation';
import LocaleSwitcher from '@/shared/ui/navigation/LocaleSwitcher';

const BP = 887; // hamburger breakpoint
const glassOverlay =
  `radial-gradient(90.16% 143.01% at 15.32% 21.04%, rgba(165,239,255,.20) 0%, rgba(110,191,244,.045) 77.08%, rgba(70,144,213,0) 100%)`;

/* ================= BAR ================= */
const Bar = styled.header`
  position: fixed; inset: 0 0 auto 0; z-index: 4000;
  background: transparent;
  padding-block: clamp(10px, 2vh, 20px);
`;

const Row = styled.div`
  width: 100%; max-width: 1280px; margin: 0 auto;
  padding-inline: clamp(14px, 4vw, 56px);
  display: flex; align-items: center; justify-content: space-between;
  gap: clamp(10px, 3vw, 48px); min-width: 0;
`;

const Left  = styled.div`display:flex; align-items:center; gap:12px; flex:0 0 auto; min-width:0;`;
const Right = styled.div`display:flex; align-items:center; gap:10px; flex:0 0 auto; min-width:0;`;

/* ================= LOGO ================= */
const Brand = styled(Link)`
  display:inline-flex; align-items:center; text-decoration:none; user-select:none;
`;
const LogoImg = styled.img`
  width: clamp(72px, 8vw, 200px); height:auto; display:block;
  @media (max-width:520px){ width: clamp(60px, 17vw, 140px); }
`;

/* ========== DESKTOP NAV (sadece desktop) ========== */
const DesktopNav = styled.nav`
  flex:1 1 auto; min-width:0; display:flex; justify-content:center;
  margin-inline: clamp(24px, 6vw, 160px);
  @media (max-width:${BP}px){ display:none; }
`;

const Glass = styled.div`
  position:relative; display:inline-flex; align-items:center; justify-content:center;
  gap: clamp(10px, 2.4vw, 56px);
  min-height: clamp(44px, 5.2vw, 82px);
  padding: clamp(8px, 1.1vw, 18px) clamp(14px, 3vw, 32px);
  border-radius:999px;

  background:
    linear-gradient(180deg, rgba(7,12,24,.62), rgba(7,12,24,.46)),
    ${glassOverlay};
  backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
  border:1px solid rgba(255,255,255,.10);
  box-shadow:0 1px 0 rgba(255,255,255,.06) inset, 0 6px 24px rgba(0,0,0,.25);
`;

const NavLink = styled(Link)`
  white-space:nowrap;
  font-family:'Montserrat', ui-sans-serif, system-ui;
  font-size:clamp(13px, 1.1vw, 19px);
  line-height:1; font-weight:500;
  color:#EDEFF6; text-decoration:none;
  padding:clamp(5px,.5vw,9px) clamp(8px,1vw,14px);
  border-radius:12px; transition: color .15s, background .15s;
  &:hover{ color:#fff; background:rgba(255,255,255,.08); }
  &[aria-current='page']{ color:#265DFF; font-weight:600; background:rgba(38,93,255,.12); }
`;

/* ===== Dropdown (desktop) ===== */
const Dropdown = styled.div`
  position:relative; z-index:1;
  &::after{ content:''; position:absolute; left:0; right:0; top:100%; height:12px; }
`;

const DropBtn = styled.button`
  appearance:none; border:0; background:transparent; cursor:pointer;
  white-space:nowrap; font-family:'Montserrat', ui-sans-serif, system-ui;
  font-size:clamp(13px,1.1vw,19px); line-height:1; font-weight:500; color:#EDEFF6;
  padding:clamp(5px,.5vw,9px) clamp(8px,1vw,14px); border-radius:12px;
  display:inline-flex; align-items:center; gap:6px;
  transition: color .15s, background .15s;
  ${Dropdown}:hover &{ color:#fff; background:rgba(255,255,255,.08); }
`;

const Panel = styled.div`
  position:absolute; left:50%; top:calc(100% + 12px); transform:translateX(-50%);
  z-index:4500; min-width:240px; padding:10px; border-radius:14px;
  background: linear-gradient(180deg, rgba(7,12,24,.78), rgba(7,12,24,.66)), ${glassOverlay};
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  border:1px solid rgba(255,255,255,.10);
  box-shadow:0 8px 32px rgba(0,0,0,.35);
  opacity:0; pointer-events:none; translate:0 -6px; transition:opacity .15s, translate .15s;
  ${Dropdown}:hover &{ opacity:1; pointer-events:auto; translate:0 0; }
`;

const PanelLink = styled(Link)`
  display:block; padding:10px 12px; border-radius:10px; color:#EDEFF6; text-decoration:none; font-size:14px;
  &:hover{ background:rgba(255,255,255,.08); color:#fff; }
`;

/* ========== Burger (sadece mobile) ========== */
const BurgerBtn = styled.button`
  display:none;
  @media (max-width:${BP}px){ display:inline-flex; }
  width:44px; height:40px; align-items:center; justify-content:center;
  border:1px solid rgba(255,255,255,.12); border-radius:10px; background:rgba(255,255,255,.06);
  cursor:pointer; outline:none; touch-action:manipulation;
  span, span::before, span::after{
    content:''; display:block; width:20px; height:2px; background:#EDEFF6; border-radius:2px;
    transition:transform .2s, opacity .2s;
  }
  span{ position:relative; }
  span::before{ position:absolute; top:-6px; }
  span::after{ position:absolute; top:6px; }
  &.open span{ transform:rotate(45deg); }
  &.open span::before{ transform:rotate(90deg); top:0; }
  &.open span::after{ opacity:0; }
`;

const DesktopLocale = styled.div`
  @media (max-width:${BP}px){ display:none; }
`;

/* ========== Mobile Drawer ========== */
const MobileSheet = styled.div<{ $open:boolean }>`
  position:fixed; inset:0; z-index:10000;
  display:${({$open})=>($open?'block':'none')};
  background:rgba(5,7,14,.55);
  backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
`;
const MobilePanel = styled.nav`
  position:absolute; top:0; right:0; width:min(86vw, 360px); height:100%;
  background: linear-gradient(180deg, rgba(7,12,24,.92), rgba(7,12,24,.88)), ${glassOverlay};
  backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px);
  border-left:1px solid rgba(255,255,255,.08); box-shadow:-12px 0 32px rgba(0,0,0,.35);
  padding:18px 16px 24px; display:flex; flex-direction:column; gap:6px; overflow-y:auto;
  z-index:10010;
`;
const MobileHeader = styled.div`display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:6px;`;
const CloseBtn = styled.button`
  width:40px; height:36px; border-radius:10px; border:1px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.06); color:#EDEFF6; cursor:pointer;
`;
const MobileLink = styled(Link)`
  padding:12px 10px; border-radius:12px; color:#EDEFF6; text-decoration:none; font-size:16px; line-height:22px;
  &:hover{ background:rgba(255,255,255,.08); }
  &[aria-current='page']{ color:#265DFF; font-weight:600; background:rgba(38,93,255,.12); }
`;

/* ========== TYPES ========== */
type Path = '' | '/projects' | '/services' | '/ad-solutions' | '/references' | '/contact';

/* ========== COMPONENT ========== */
export default function Navbar(
  props: { locale: string; contact?: { phones?: string[]; email?: string } }
) {
  // props.contact opsiyonel; şu an UI’da kullanılmıyor.
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
