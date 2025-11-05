import { headers } from 'next/headers';
// RSC – yalnız markup üretir; stil temadan
export default async function ProgImage({ src, alt, w, h, blurhash }:{ src:string; alt:string; w:number; h:number; blurhash?:string }){
  const isAvif =(headers().get('accept')||'').includes('image/avif');
  const base = `${src}?w=${Math.round(w)}&h=${Math.round(h)}&fit=crop`;
  const low = `${base}&q=20&fmt=${isAvif?'avif':'webp'}&dpr=1`;
  const mid = `${base}&w=${Math.round(w/1.5)}&q=40&fmt=${isAvif?'avif':'webp'}`;
  const hi  = `${base}&q=80&fmt=${isAvif?'avif':'webp'}&dpr=2`;
  return (
    <figure className="imageCard">
      {/* blurhash → canvas arka plan (temaya uygun) */}
      <img src={low} alt={alt} width={w} height={h} loading="lazy" decoding="async" style={{ backgroundImage: blurhash?`url('data:image/svg+xml;...')`:undefined }} />
      <link rel="preload" as="image" href={mid} imagesrcset={`${mid} 1x, ${hi} 2x`} />
      {/* client helper progressive swap */}
      {/* @ts-expect-error */}
      <ProgressiveSwap low={low} mid={mid} hi={hi} alt={alt} w={w} h={h} />
    </figure>
  );
}