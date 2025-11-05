export default function VideoJsonLd({ name, description, thumbnailUrl, uploadDate, duration, contentUrl, embedUrl }:{ name:string; description:string; thumbnailUrl:string; uploadDate:string; duration:string; contentUrl:string; embedUrl:string }){
  const json = { '@context':'https://schema.org', '@type':'VideoObject', name, description, thumbnailUrl, uploadDate, duration, contentUrl, embedUrl };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}