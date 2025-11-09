"use client";

import Container from "@/shared/ui/common/Container";
import SectionHead from "@/shared/ui/sections/SectionHead";
import CardGrid from "@/shared/ui/sections/CardGrid";
import { Card, CardHeader, CardTitle, CardBody } from "@/shared/ui/cards/SiteCard";

const PROJECTS = [
  { title: "E-Ticaret Starter", desc: "Çok tenant’lı, ödeme/kupon/stoğa hazır altyapı." },
  { title: "Portfolyo Suite", desc: "Hızlı kurulum, çok dilli, SEO-ready portfolyo." },
  { title: "Randevu Uygulaması", desc: "Kurum/staff bazlı randevu + bildirim akışları." },
];

export default function ProjectsSection() {
  return (
    <Container>
      <SectionHead title="Satılık Projeler" lead="Öne çıkan projeler yakında burada." center />
      <CardGrid>
        {PROJECTS.map((p) => (
          <Card key={p.title}>
            <CardHeader>
              <CardTitle>{p.title}</CardTitle>
            </CardHeader>
            <CardBody>{p.desc}</CardBody>
          </Card>
        ))}
      </CardGrid>
    </Container>
  );
}
