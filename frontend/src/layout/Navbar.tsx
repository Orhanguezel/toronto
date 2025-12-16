'use client';

import React from 'react';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';

import LocaleSwitcher from '@/shared/ui/navigation/LocaleSwitcher';
import { toRoute } from '@/shared/routing/toRoute';

import { useResolvedLocale } from '@/i18n/locale';
import type { SupportedLocale } from '@/types/common';

import { useListMenuItemsQuery } from '@/integrations/rtk/endpoints/menu_items.endpoints';
import type { PublicMenuItemDto } from '@/integrations/types/menu_items.types';

import {
  Bar,
  Row,
  Left,
  Right,
  Brand,
  LogoImg,
  DesktopNav,
  Glass,
  NavLink,
  Dropdown,
  DropBtn,
  Panel,
  PanelLink,
  BurgerBtn,
  DesktopLocale,
  MobileSheet,
  MobilePanel,
  MobileHeader,
  CloseBtn,
  MobileLink,
} from './Navbar.styles';

type SectionId = 'hero' | 'about' | 'services' | 'blog' | 'portfolio' | 'contact';

type NavbarProps = {
  locale: SupportedLocale | string;
  contact?: { phones?: string[]; email?: string };

  // 🔑 LandingClient’ten gelir
  goToSection?: (id: SectionId) => void;
};

function buildHref(locale: SupportedLocale, url: string) {
  const clean = (url || '').trim() || '/';
  return `/${locale}${clean === '/' ? '' : clean}`;
}

function normalizeUrl(u: string) {
  const x = (u || '').trim() || '/';
  if (x === '') return '/';
  // "/about/" gibi gelirse kırp
  return x.length > 1 && x.endsWith('/') ? x.slice(0, -1) : x;
}

// Root menü için aktif kontrol (subpath’te de aktif kalsın)
function isActive(pathname: string, href: string, isRoot: boolean) {
  if (isRoot) return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}

// URL -> section mapping (şimdilik sabit)
function urlToSectionId(url: string): SectionId | null {
  const u = normalizeUrl(url);
  if (u === '/' || u === '') return 'hero';
  if (u === '/about') return 'about';
  if (u === '/services') return 'services';
  if (u === '/blog') return 'blog';
  if (u === '/portfolio') return 'portfolio';
  if (u === '/contact') return 'contact';
  return null;
}

export default function Navbar(props: NavbarProps) {
  const pathname = usePathname() || '/';

  // ✅ 30+ dil için güvenli normalize
  const locale = useResolvedLocale(props.locale) as SupportedLocale;

  // ✅ DB’den HEADER menü ağacını çek
  const { data } = useListMenuItemsQuery(
    {
      location: 'header',
      locale,
      is_active: 1,
      nested: 1,
      order: 'order_num',
    } as any
  );

  const items = (data?.items ?? []) as PublicMenuItemDto[];

  const ariaMainMenu = 'Main menu';
  const ariaBrandHome = 'Home';
  const ariaOpenClose = 'Open Menu';
  const ariaClose = 'Close';

  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  React.useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  // Home link
  const homeHrefStr = buildHref(locale, '/');
  const homeHref = toRoute(homeHrefStr, (`/${locale}` as Route));

  // ✅ Aynı route’a basınca scroll (LandingClient dispatcher)
  const tryGoSamePath = (e: React.MouseEvent, hrefStr: string, url: string) => {
    if (pathname !== hrefStr) return;

    const sectionId = urlToSectionId(url);
    if (!sectionId) return;

    e.preventDefault();
    props.goToSection?.(sectionId);
  };

  return (
    <>
      <Bar data-navbar="">
        <Row>
          <Left>
            <Brand
              href={homeHref}
              aria-label={ariaBrandHome}
              onClick={(e) => {
                // Aynı path ise hero’ya yumuşak kay
                if (pathname === homeHrefStr) {
                  e.preventDefault();
                  props.goToSection?.('hero');
                }
              }}
              scroll={false}
            >
              <LogoImg src="/logo.svg" alt="Toronto" />
            </Brand>
          </Left>

          <DesktopNav aria-label={ariaMainMenu}>
            <Glass>
              {items.map((m) => {
                const title = (m.title || '').trim() || 'Menu';
                const url = normalizeUrl(m.url || '/');
                const hrefStr = buildHref(locale, url);
                const href = toRoute(hrefStr, (`/${locale}` as Route));

                const root = !m.parent_id;
                const activeProps = isActive(pathname, hrefStr, root)
                  ? { 'aria-current': 'page' as const }
                  : {};

                const children = Array.isArray(m.children) ? m.children : [];
                const hasChildren = children.length > 0;

                // Dropdown
                if (hasChildren) {
                  return (
                    <Dropdown key={m.id}>
                      <DropBtn type="button" aria-haspopup="menu" aria-expanded="false">
                        {title}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path
                            d="M7 10l5 5 5-5"
                            stroke="#EDEFF6"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </DropBtn>

                      <Panel role="menu" aria-label={title}>
                        {children.map((c) => {
                          const ct = (c.title || '').trim() || 'Item';
                          const cu = normalizeUrl(c.url || '/');
                          const chrefStr = buildHref(locale, cu);
                          const chref = toRoute(chrefStr, (`/${locale}` as Route));

                          return (
                            <PanelLink
                              key={c.id}
                              href={chref}
                              scroll={false}
                              onClick={(e) => {
                                // Aynı path ise ilgili section’a kay
                                tryGoSamePath(e, chrefStr, cu);
                              }}
                            >
                              {ct}
                            </PanelLink>
                          );
                        })}
                      </Panel>
                    </Dropdown>
                  );
                }

                // Normal link
                return (
                  <NavLink
                    key={m.id}
                    href={href}
                    {...activeProps}
                    scroll={false}
                    onClick={(e) => {
                      // Aynı path ise ilgili section’a kay
                      tryGoSamePath(e, hrefStr, url);
                    }}
                  >
                    {title}
                  </NavLink>
                );
              })}
            </Glass>
          </DesktopNav>

          <Right>
            <DesktopLocale>
              <LocaleSwitcher />
            </DesktopLocale>

            <BurgerBtn
              className={mobileOpen ? 'open' : ''}
              aria-label={ariaOpenClose}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((v) => !v)}
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
              href={homeHref}
              aria-label={ariaBrandHome}
              scroll={false}
              onClick={(e) => {
                if (pathname === homeHrefStr) {
                  e.preventDefault();
                  props.goToSection?.('hero');
                }
                setMobileOpen(false);
              }}
            >
              <LogoImg src="/logo.svg" alt="Toronto" />
            </Brand>

            <CloseBtn onClick={() => setMobileOpen(false)} aria-label={ariaClose}>
              ✕
            </CloseBtn>
          </MobileHeader>

          {items.map((m) => {
            const title = (m.title || '').trim() || 'Menu';
            const url = normalizeUrl(m.url || '/');
            const hrefStr = buildHref(locale, url);
            const href = toRoute(hrefStr, (`/${locale}` as Route));

            const root = !m.parent_id;
            const activeProps = isActive(pathname, hrefStr, root)
              ? { 'aria-current': 'page' as const }
              : {};

            const children = Array.isArray(m.children) ? m.children : [];
            const hasChildren = children.length > 0;

            if (!hasChildren) {
              return (
                <MobileLink
                  key={m.id}
                  href={href}
                  {...activeProps}
                  scroll={false}
                  onClick={(e) => {
                    tryGoSamePath(e, hrefStr, url);
                    setMobileOpen(false);
                  }}
                >
                  {title}
                </MobileLink>
              );
            }

            return (
              <React.Fragment key={m.id}>
                <MobileLink
                  href={href}
                  {...activeProps}
                  scroll={false}
                  onClick={(e) => {
                    tryGoSamePath(e, hrefStr, url);
                    setMobileOpen(false);
                  }}
                >
                  {title}
                </MobileLink>

                {children.map((c) => {
                  const ct = (c.title || '').trim() || 'Item';
                  const cu = normalizeUrl(c.url || '/');
                  const chrefStr = buildHref(locale, cu);
                  const chref = toRoute(chrefStr, (`/${locale}` as Route));

                  return (
                    <MobileLink
                      key={c.id}
                      href={chref}
                      scroll={false}
                      onClick={(e) => {
                        tryGoSamePath(e, chrefStr, cu);
                        setMobileOpen(false);
                      }}
                      style={{ paddingLeft: 18 }}
                    >
                      {ct}
                    </MobileLink>
                  );
                })}
              </React.Fragment>
            );
          })}

          <div style={{ marginTop: 'auto', paddingTop: 8 }}>
            <LocaleSwitcher />
          </div>
        </MobilePanel>
      </MobileSheet>
    </>
  );
}
