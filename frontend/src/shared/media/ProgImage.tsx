import { headers } from 'next/headers';

// RSC – yalnız markup üretir; stil temadan
export default async function ProgImage({
  src, alt, w, h, blurhash,
}: { src: string; alt: string; w: number; h: number; blurhash?: string }) {
  // headers() artık Promise
  const hds = await headers();
  const accept = hds.get('accept') ?? '';
  const isAvif = accept.includes('image/avif');

  const base = `${src}?w=${Math.round(w)}&h=${Math.round(h)}&fit=crop`;
  const fmt = isAvif ? 'avif' : 'webp';

  const low = `${base}&q=20&fmt=${fmt}&dpr=1`;
  const mid = `${base}&w=${Math.round(w / 1.5)}&q=40&fmt=${fmt}`;
  const hi  = `${base}&q=80&fmt=${fmt}&dpr=2`;

  return (
    <figure className="imageCard">
      {/* blurhash → canvas arka plan (temaya uygun) */}
      <img
        src={low}
        alt={alt}
        width={w}
        height={h}
        loading="lazy"
        decoding="async"
        style={{ backgroundImage: blurhash ? `url('data:image/svg+xml;...')` : undefined }}
      />

      {/* React'ta imagesrcset => imageSrcSet */}
      <link
        rel="preload"
        as="image"
        href={mid}
        imageSrcSet={`${mid} 1x, ${hi} 2x`}
      />

      {/* client helper progressive swap */}
      {/* @ts-expect-error Server bileşeninden istemci bileşeni kullanımına izin ver */}
      <ProgressiveSwap low={low} mid={mid} hi={hi} alt={alt} w={w} h={h} />
    </figure>
  );
}
