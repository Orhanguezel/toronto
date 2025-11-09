"use client";

import Container from "@/shared/ui/common/Container";
import SectionHead from "@/shared/ui/sections/SectionHead";
import CardGrid from "@/shared/ui/sections/CardGrid";
import { Card, CardHeader, CardIcon, CardTitle, CardBody, CardActions, CardLink } from "@/shared/ui/cards/SiteCard";
import { Code2, Palette, Gauge } from "lucide-react";

export default function ServicesSection() {
  return (
    <Container>
      <SectionHead title="Hizmetlerimiz" lead="Web, Tasarım, SEO/Performans." center />

      <CardGrid>
        <Card>
          <CardHeader>
            <CardIcon><Code2 size={20} /></CardIcon>
            <CardTitle>Web Geliştirme</CardTitle>
          </CardHeader>
          <CardBody>
            Kurumsal site, e-ticaret, CMS, entegrasyonlar ve ölçeklenebilir mimariler.
          </CardBody>
          <CardActions>
            <CardLink href={{ pathname: "/tr/services", hash: "web" }}>Detay</CardLink>
          </CardActions>
        </Card>

        <Card>
          <CardHeader>
            <CardIcon><Palette size={20} /></CardIcon>
            <CardTitle>Tasarım</CardTitle>
          </CardHeader>
          <CardBody>
            UI/UX, marka kimliği, komponent kütüphanesi ve tasarım sistemleri.
          </CardBody>
          <CardActions>
            <CardLink href={{ pathname: "/tr/services", hash: "design" }}>Detay</CardLink>
          </CardActions>
        </Card>

        <Card>
          <CardHeader>
            <CardIcon><Gauge size={20} /></CardIcon>
            <CardTitle>SEO / Performans</CardTitle>
          </CardHeader>
          <CardBody>
            Teknik SEO, Lighthouse 90+, Core Web Vitals ve izleme/raporlama.
          </CardBody>
          <CardActions>
            <CardLink href={{ pathname: "/tr/services", hash: "seo" }}>Detay</CardLink>
          </CardActions>
        </Card>
      </CardGrid>
    </Container>
  );
}
