"use client";

import styled from "styled-components";
import Container from "@/shared/ui/common/Container";
import SectionHead from "@/shared/ui/sections/SectionHead";
import CardGrid from "@/shared/ui/sections/CardGrid";
import { Card } from "@/shared/ui/cards/SiteCard";

// Basit logo kartı
const Logo = styled.img`
  max-width: 160px;
  max-height: 60px;
  width: auto;
  height: auto;
  opacity: .95;
  filter: saturate(0.9) contrast(1.02);
`;

export default function ReferencesSection({ locale }: { locale: "tr" | "en" | "de" }) {
  // TODO: SSR + client carousel ile logos çekilecek.
  const logos = [
    { name: "Acme", url: "#", logo_url: "/logos/globe.svg" },
    { name: "Globex", url: "#", logo_url: "/logos/globe.svg" },
    { name: "Initech", url: "#", logo_url: "/logos/globe.svg" },
  ];

  return (
    <Container>
      <SectionHead title="Referanslar" lead="Çalıştığımız markalardan seçkiler." center />
      <CardGrid>
        {logos.map((x) => (
          <Card key={x.name} style={{ display: "grid", placeItems: "center", padding: "24px" }}>
            <a href={x.url} aria-label={x.name} target="_blank" rel="noopener noreferrer">
              <Logo src={x.logo_url} alt={x.name} />
            </a>
          </Card>
        ))}
      </CardGrid>
    </Container>
  );
}
