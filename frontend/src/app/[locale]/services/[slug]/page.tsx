import { getServiceBySlug } from '@/lib/api/public';
import Container from '@/shared/ui/common/Container';
import { Prose, H1 } from '@/shared/ui/typography';
import JsonLd from '@/shared/seo/JsonLd';
import type { Metadata } from 'next';

export const revalidate = 600;

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }): Promise<Metadata> {
  const s = await getServiceBySlug(params.locale, params.slug);
  return { title: s.title, description: s.body?.slice(0,160) };
}

export default async function ServiceDetail({ params }: { params: { locale: string; slug: string } }){
  const s = await getServiceBySlug(params.locale, params.slug);
  const faq = Array.isArray(s.faq_json) ? s.faq_json : [];
  const jsonLd = {
    '@context':'https://schema.org', '@type':'Service', name: s.title,
    description: s.body?.slice(0,160),
  };
  const faqLd = faq.length ? {
    '@context':'https://schema.org', '@type':'FAQPage',
    mainEntity: faq.map((f:any)=>({ '@type':'Question', name:f.q, acceptedAnswer:{ '@type':'Answer', text:f.a } }))
  } : null;

  return (
    <Container>
      <H1>{s.title}</H1>
      {s.body ? <Prose dangerouslySetInnerHTML={{ __html: s.body }} /> : null}
      <JsonLd data={jsonLd} />
      {faqLd ? <JsonLd data={faqLd} /> : null}
    </Container>
  );
}