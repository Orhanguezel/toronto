import Image from 'next/image';
import Container from '@/shared/ui/common/Container';
import { getProjects, getProjectBySlug, type ProjectCard } from '@/lib/api/public';
import type { Metadata } from 'next';
import JsonLd from '@/shared/seo/JsonLd';

export const revalidate = 300;

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const items = await getProjects(params.locale);
  return items.slice(0, 100).map((p: ProjectCard) => ({ slug: p.slug })); // ilk 100 SSG
}

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }): Promise<Metadata> {
  const p = await getProjectBySlug(params.locale, params.slug);
  return {
    title: p.title,
    description: p.summary || undefined,
    alternates: { canonical: `/${params.locale}/projects/${params.slug}` },
    openGraph: { images: p.cover_url ? [{ url: p.cover_url }] : undefined },
  };
}

export default async function ProjectDetailPage({ params }: { params: { locale: string; slug: string } }) {
  const p = await getProjectBySlug(params.locale, params.slug);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.title,
    image: p.cover_url ? [p.cover_url] : undefined,
    description: p.summary || undefined,
    offers: p.price_from ? {
      '@type': 'Offer',
      priceCurrency: 'TRY',
      price: String(p.price_from),
      availability: 'https://schema.org/InStock',
    } : undefined,
  };
  return (
    <Container>
      <h1>{p.title}</h1>
      {p.cover_url && (
        <Image src={p.cover_url} alt={p.title} width={960} height={540} priority style={{ width: '100%', height: 'auto' }} />
      )}
      <JsonLd data={jsonLd} />
      {p.video_url ? (
        <video controls preload="metadata" style={{ width: '100%', marginTop: 16 }} poster={p.cover_url || undefined}>
          <source src={p.video_url} />
        </video>
      ) : null}
      {p.body ? <article dangerouslySetInnerHTML={{ __html: p.body }} /> : null}
    </Container>
  );
}