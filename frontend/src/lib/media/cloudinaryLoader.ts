export default function cloudinaryLoader({ src, width, quality }:{ src:string; width:number; quality?:number }){
  // src: full secure_url veya public_id. public_id verildiyse mapleyin.
  const base = 'https://res.cloudinary.com/' + (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD || 'demo') + '/image/upload/';
  const q = quality || 75;
  const tr = `f_auto,q_${q},c_limit,w_${width}`; // otomatik format, kalite, genişlik
  if (/^https?:\/\//i.test(src)) return `${src.replace('/image/upload/', '/image/upload/'+tr+'/')}`;
  return `${base}${tr}/${src}`;
}


/***Kullanım**
```tsx
import Image from 'next/image';
import cloudinaryLoader from '@/lib/media/cloudinaryLoader';

<Image loader={cloudinaryLoader} src={coverPublicIdOrUrl} alt={title} width={1200} height={800} sizes="(max-width: 768px) 100vw, 50vw" />
```

*/