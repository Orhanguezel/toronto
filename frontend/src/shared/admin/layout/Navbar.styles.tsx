// src/layout/Navbar.styles.tsx

"use client";

import styled from "styled-components";
import Link from "next/link";

export const BP = 887; // hamburger breakpoint
export const glassOverlay =
  `radial-gradient(90.16% 143.01% at 15.32% 21.04%, rgba(165,239,255,.20) 0%, rgba(110,191,244,.045) 77.08%, rgba(70,144,213,0) 100%)`;

/* ================= BAR ================= */
export const Bar = styled.header`
  position: fixed; inset: 0 0 auto 0; z-index: 4000;
  background: transparent;
  padding-block: clamp(10px, 2vh, 20px);
`;

export const Row = styled.div`
  width: 100%;
  max-width: min(var(--navbar-max, 1640px), 96vw);
  margin: 0 auto;
  padding-inline: clamp(14px, 4vw, 56px);

  /* GRID: logo | nav | locale/burger */
  display: grid; align-items: center;
  grid-template-columns: auto 1fr auto;
  grid-template-areas: "left center right";
  column-gap: clamp(12px, 4vw, 56px);

  container-type: inline-size;
`;

export const Left  = styled.div`
  grid-area: left;
  min-width: 0;
`;

export const Right = styled.div`
  grid-area: right;
  justify-self: end;
  min-width: 0;
  display:flex; align-items:center; gap:10px;
`;

/* ================= LOGO ================= */
export const Brand = styled(Link)`
  display:inline-flex; align-items:center; text-decoration:none; user-select:none;
`;

export const LogoImg = styled.img`
  width: clamp(72px, 8vw, 200px); height:auto; display:block;
  @media (max-width:520px){ width: clamp(60px, 17vw, 140px); }
`;

/* ========== DESKTOP NAV (sadece desktop) ========== */
export const DesktopNav = styled.nav`
  grid-area: center;
  min-width: 0;
  display: flex; justify-content: center;
  justify-self: center;

  @media (max-width:${BP}px){ display:none; }
`;

/* Cam tüp */
export const Glass = styled.div`
  position:relative;
  display:inline-flex; align-items:center; justify-content:center;

  gap: clamp(10px, 3.5cqw, 49px);
  min-height: clamp(44px, 6cqw, 82px);
  padding-block: clamp(8px, 2cqw, 25px);
  padding-inline: clamp(14px, 3cqw, 61px);
  border-radius: clamp(20px, 2.6cqw, 33px);

  width: clamp(max-content, 67.4cqw, 100%);
  max-width: 100%;

  overflow: visible;

  background:
    linear-gradient(180deg, rgba(7,12,24,.62), rgba(7,12,24,.46)),
    ${glassOverlay};
  backdrop-filter: blur(clamp(16px, 3.1cqw, 40px));
  -webkit-backdrop-filter: blur(clamp(16px, 3.1cqw, 40px));
  border:1px solid rgba(255,255,255,.10);
  box-shadow:0 1px 0 rgba(255,255,255,.06) inset, 0 6px 24px rgba(0,0,0,.25);

  @container (max-width: 1020px){
    gap: clamp(8px, 2.4cqw, 36px);
    padding-inline: clamp(10px, 2.4cqw, 24px);
  }
  @container (max-width: 920px){
    gap: clamp(6px, 1.8cqw, 24px);
    padding-inline: clamp(8px, 1.8cqw, 16px);
  }
`;

export const NavLink = styled(Link)`
  white-space:nowrap;
  font-family:'Montserrat', ui-sans-serif, system-ui;
  font-size:clamp(13px, 1.1vw, 19px);
  line-height:1; font-weight:500;
  color:#EDEFF6; text-decoration:none;
  padding:clamp(5px,.5vw,9px) clamp(8px,1vw,14px);
  border-radius:12px; transition: color .15s, background .15s;

  &:hover{ color:#fff; background:rgba(255,255,255,.08); }
`;

/* ===== Dropdown (desktop) ===== */
export const Dropdown = styled.div`
  position:relative; z-index: 1;
  &::after{ content:''; position:absolute; left:0; right:0; top:100%; height:12px; }
`;

export const DropBtn = styled.button`
  appearance:none; border:0; background:transparent; cursor:pointer;
  white-space:nowrap; font-family:'Montserrat', ui-sans-serif, system-ui;
  font-size:clamp(13px,1.1vw,19px); line-height:1; font-weight:500; color:#EDEFF6;
  padding:clamp(5px,.5vw,9px) clamp(8px,1vw,14px); border-radius:12px;
  display:inline-flex; align-items:center; gap:6px;
  transition: color .15s, background .15s;
  ${Dropdown}:hover &{ color:#fff; background:rgba(255,255,255,.08); }
`;

export const Panel = styled.div`
  position:absolute; left:50%; top:calc(100% + 12px); transform:translateX(-50%);
  z-index: 41000;

  min-width:240px; padding:10px; border-radius:14px;
  background: linear-gradient(180deg, rgba(7,12,24,.78), rgba(7,12,24,.66)), ${glassOverlay};
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  border:1px solid rgba(255,255,255,.10);
  box-shadow:0 8px 32px rgba(0,0,0,.35);

  opacity:0; pointer-events:none; translate:0 -6px; transition:opacity .15s, translate .15s;

  ${Dropdown}:hover &{ opacity:1; pointer-events:auto; translate:0 0; }
`;

export const PanelLink = styled(Link)`
  display:block; padding:10px 12px; border-radius:10px; color:#EDEFF6; text-decoration:none; font-size:14px;
  &:hover{ background:rgba(255,255,255,.08); color:#fff; }
`;

/* ========== Burger (sadece mobile) ========== */
export const BurgerBtn = styled.button`
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

export const DesktopLocale = styled.div`
  display:flex; align-items:center;
  @media (max-width:${BP}px){ display:none; }
`;

/* ========== Mobile Drawer ========== */
export const MobileSheet = styled.div<{ $open:boolean }>`
  position:fixed; inset:0; z-index:10000;
  display:${({$open})=>($open?'block':'none')};
  background:rgba(5,7,14,.55);
  backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
`;

export const MobilePanel = styled.nav`
  position:absolute; top:0; right:0; width:min(86vw, 360px); height:100%;
  background: linear-gradient(180deg, rgba(7,12,24,.92), rgba(7,12,24,.88)), ${glassOverlay};
  backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px);
  border-left:1px solid rgba(255,255,255,.08); box-shadow:-12px 0 32px rgba(0,0,0,.35);
  padding:18px 16px 24px; display:flex; flex-direction:column; gap:6px; overflow-y:auto;
  z-index:10080;
`;

export const MobileHeader = styled.div`
  display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:6px;
`;

export const CloseBtn = styled.button`
  width:40px; height:36px; border-radius:10px; border:1px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.06); color:#EDEFF6; cursor:pointer;
`;

export const MobileLink = styled(Link)`
  padding:12px 10px; border-radius:12px; color:#EDEFF6; text-decoration:none; font-size:16px; line-height:22px;
  &:hover{ background:rgba(255,255,255,.08); }
`;
