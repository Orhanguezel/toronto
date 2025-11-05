// src/app/[locale]/services/page.tsx
import Container from '@/shared/ui/common/Container';
import { H1, Lead } from '@/shared/ui/typography';
import { Section } from '@/shared/ui/sections/Section';
import { Grid } from '@/shared/ui/grid/Grid';
import { getServices } from '@/lib/api/public';

export const revalidate = 600;

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Next 16: params Promise → unwrap
  const { locale } = await params;

  // Backend düşerse patlamasın
  const items =
    (await getServices(locale).catch(() => [])) ?? [];

  return (
    <main>
      <Section>
        <Container>
          <H1>Hizmetlerimiz</H1>
          <Lead>İhtiyacınıza en uygun çözümü birlikte seçelim.</Lead>

          {/* Grid: transient prop */}
          <Grid $min={280}>
            {items.map((s) => (
              <article key={s.slug}>
                <h3>{s.title}</h3>
                {s.summary ? <p>{s.summary}</p> : null}
              </article>
            ))}
          </Grid>
        </Container>
      </Section>
    </main>
  );
}
