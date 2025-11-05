// src/app/[locale]/ad-solutions/page.tsx
import Container from '@/shared/ui/common/Container';
import { H1, Lead, Prose } from '@/shared/ui/typography';
import { Section } from '@/shared/ui/sections/Section';
import { getAdSolutions } from '@/lib/api/public';

export const revalidate = 600;

export default async function AdSolutionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Next 16: params Promise → unwrap
  const { locale } = await params;

  // API çökse bile sayfa render etmeye devam etsin
  const items = (await getAdSolutions(locale).catch(() => [])) ?? [];

  return (
    <main>
      <Section>
        <Container>
          <H1>Reklam Çözümleri</H1>
          <Lead>Ölçülebilir kampanyalar, görünür sonuçlar.</Lead>

          {items.map((a) => (
            <Prose key={a.slug}>
              <h3>{a.title}</h3>
              {a.body ? <div dangerouslySetInnerHTML={{ __html: a.body }} /> : null}
            </Prose>
          ))}
        </Container>
      </Section>
    </main>
  );
}
