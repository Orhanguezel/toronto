// =============================================================
// FILE: src/sections/portfolio/PortfolioStrip.tsx
// Portfolio – SSR grid + CSR carousel
// =============================================================

import Image from "next/image";

import Container from "@/shared/ui/common/Container";
import SectionHead from "@/shared/ui/sections/SectionHead";

import { fetchSetting } from "@/i18n/server";
import PortfolioCarousel from "@/features/portfolio/PortfolioCarousel";

import { getPortfolioCustomPagesSSR } from "@/features/portfolio/portfolio.server";
import { mapCustomPageToPortfolioItem, type PortfolioItem } from "@/features/portfolio/portfolio.helpers";

export const revalidate = 900;

function asObj(x: any): Record<string, any> | null {
  return x && typeof x === "object" && !Array.isArray(x) ? x : null;
}
function asStr(x: any): string | null {
  return typeof x === "string" && x.trim() ? x.trim() : null;
}

async function getPortfolioUi(locale: string) {
  const row = await fetchSetting("ui_portfolio", locale, { revalidate: 600 });
  const json = asObj(row?.value) || {};

  return {
    title: asStr(json.ui_portfolio_title) || "Portfolio",
    lead: asStr(json.ui_portfolio_lead) || "Selected work and case studies.",
    aria: asStr(json.ui_portfolio_aria) || "Portfolio",
  };
}

export default async function PortfolioStrip({ locale }: { locale: string }) {
  const ui = await getPortfolioUi(locale);

  const { items } = await getPortfolioCustomPagesSSR({
    locale,
    limit: 12,
    offset: 0,
    order: "updated_at.desc",
    revalidate: 900,
  });

  const mapped: PortfolioItem[] = items.map((p) => mapCustomPageToPortfolioItem(locale, p));
  if (!mapped.length) return null;

  return (
    <section id="portfolio-strip" aria-label={ui.aria} style={{ paddingBlock: 24 }}>
      <Container>
        <SectionHead title={ui.title} lead={ui.lead} center />

        {/* SSR grid: hızlı first paint */}
        <ul
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 18,
            alignItems: "stretch",
            margin: 0,
            padding: 0,
            listStyle: "none",
          }}
        >
          {mapped.slice(0, 6).map((x) => (
            <li key={x.key} style={{ display: "grid" }}>
              <a
                href={x.href || "#"}
                aria-label={x.title}
                style={{
                  display: "grid",
                  textDecoration: "none",
                  borderRadius: 16,
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,.10)",
                  background: "rgba(0,0,0,.18)",
                }}
              >
                {x.image_url ? (
                  <Image
                    src={x.image_url}
                    alt={x.image_alt || x.title}
                    width={520}
                    height={320}
                    style={{ width: "100%", height: 160, objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ height: 160, background: "rgba(255,255,255,.06)" }} />
                )}
                <div style={{ padding: "10px 12px 12px", color: "rgba(255,255,255,.92)", fontSize: 14 }}>
                  {x.title}
                </div>
              </a>
            </li>
          ))}
        </ul>
      </Container>

      {/* CSR: akıcı carousel (aynı veri) */}
      <div style={{ marginTop: 16 }}>
        <Container>
          <PortfolioCarousel initial={mapped} ariaLabel={ui.aria} />
        </Container>
      </div>
    </section>
  );
}
