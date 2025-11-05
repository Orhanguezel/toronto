import Image from "next/image";
import Container from "@/shared/ui/common/Container";
import { getProjectBySlug, getProjectSlugs } from "@/lib/api/public";
import type { Metadata } from "next";
import JsonLd from "@/shared/seo/JsonLd";
import { fetchCMS } from "@/lib/cms";
import { notFound } from "next/navigation";
import ProjectView from "@/features/projects/ProjectView";
import { SUPPORTED_LOCALES } from "@/lib/i18n/locales";
import { canonicalFor, languagesMap } from "@/shared/seo/alternates";

type Locale = (typeof SUPPORTED_LOCALES)[number];

export const revalidate = 300;

/** Next 16: generateStaticParams argümansız olmalı */
export async function generateStaticParams(): Promise<Array<{ locale: Locale; slug: string }>> {
  const entries: Array<{ locale: Locale; slug: string }> = [];
  for (const locale of SUPPORTED_LOCALES) {
    const slugs = await getProjectSlugs(locale);
    for (const { slug } of slugs.slice(0, 100)) {
      entries.push({ locale, slug });
    }
  }
  return entries;
}

export async function generateMetadata(
  { params }: { params: Promise<{ locale: Locale; slug: string }> }
): Promise<Metadata> {
  const { locale, slug } = await params; // 👈 Next 16: params Promise
  const path = `/projects/${slug}`;
  return {
    alternates: {
      canonical: canonicalFor(locale, path),
      languages: languagesMap(path),
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;

  // CMS + API (fallback’lı)
  const item = await fetchCMS("project", slug, locale, {
    next: { revalidate: 300, tags: [`cms:project:${slug}:${locale}`] },
  }).catch(() => null);

  const p = await getProjectBySlug(locale, slug);

  if (!item && !p) return notFound();

  const title = p?.title || (item as any)?.title || "Proje";
  const cover = p?.cover_url || (item as any)?.cover_url || undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    image: cover ? [cover] : undefined,
    description: p?.summary || (item as any)?.summary || undefined,
    offers:
      p?.price_from != null
        ? {
            "@type": "Offer",
            priceCurrency: "TRY",
            price: String(p.price_from),
            availability: "https://schema.org/InStock",
          }
        : undefined,
  };

  return (
    <Container>
      {item ? <ProjectView item={item} /> : null}

      <h1>{title}</h1>

      {cover ? (
        <Image
          src={cover}
          alt={title}
          width={960}
          height={540}
          priority
          style={{ width: "100%", height: "auto" }}
        />
      ) : null}

      <JsonLd data={jsonLd} />

      {p?.video_url ? (
        <video
          controls
          preload="metadata"
          style={{ width: "100%", marginTop: 16 }}
          poster={cover}
        >
          <source src={p.video_url} />
        </video>
      ) : null}

      {p?.body ? <article dangerouslySetInnerHTML={{ __html: p.body }} /> : null}
    </Container>
  );
}
