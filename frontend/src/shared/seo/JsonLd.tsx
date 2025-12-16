// src/shared/seo/JsonLd.tsx

type Props = {
  data: Record<string, any>;
  id?: string; // aynı layout/page içinde tekrar basmayı önlemek için
};

export default function JsonLd({ data, id }: Props) {
  return (
    <script
      type="application/ld+json"
      {...(id ? { id: `jsonld:${id}` } : {})}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
