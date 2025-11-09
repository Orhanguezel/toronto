"use client";

import Container from "@/shared/ui/common/Container";
import SectionHead from "@/shared/ui/sections/SectionHead";
import CardGrid from "@/shared/ui/sections/CardGrid";
import { Card, CardHeader, CardIcon, CardTitle, CardBody } from "@/shared/ui/cards/SiteCard";
import { Megaphone, LineChart, Target } from "lucide-react";

export default function AdSolutionsSection() {
  return (
    <Container>
      <SectionHead title="Reklam Çözümleri" lead="Ölçülebilir kampanyalar, görünür sonuçlar." center />

      <CardGrid>
        <Card>
          <CardHeader>
            <CardIcon><Megaphone size={20} /></CardIcon>
            <CardTitle>Sosyal & Arama</CardTitle>
          </CardHeader>
          <CardBody>
            Meta, Google, TikTok ve LinkedIn kampanya kurulumu, kreatif ve optimizasyon.
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardIcon><Target size={20} /></CardIcon>
            <CardTitle>Hedefleme & Retargeting</CardTitle>
          </CardHeader>
          <CardBody>
            Segment bazlı hedefleme, piksel/etiket yönetimi ve dönüşüm hunileri.
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardIcon><LineChart size={20} /></CardIcon>
            <CardTitle>Raporlama</CardTitle>
          </CardHeader>
          <CardBody>
            KPI’lar, ROI takibi, otomatik dashboard ve haftalık/aylık özetler.
          </CardBody>
        </Card>
      </CardGrid>
    </Container>
  );
}
