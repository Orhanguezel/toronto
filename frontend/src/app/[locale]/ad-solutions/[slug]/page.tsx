import { getAdSolutionBySlug } from '@/lib/api/public';
import Container from '@/shared/ui/common/Container';
import { Prose, H1 } from '@/shared/ui/typography';
import JsonLd from '@/shared/seo/JsonLd';

export const revalidate = 600;

export default async function AdSolutionDetail({ params }: { params: { locale: string; slug: string } }){
  const a = await getAdSolutionBySlug(params.locale, params.slug);
  const jsonLd = { '@context':'https://schema.org', '@type':'CreativeWork', name:a.title, description: a.body?.slice(0,160) };
  return (
    <Container>
      <H1>{a.title}</H1>
      {a.body ? <Prose dangerouslySetInnerHTML={{ __html: a.body }} /> : null}
      <JsonLd data={jsonLd} />
    </Container>
  );
}