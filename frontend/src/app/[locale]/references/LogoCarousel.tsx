// src/app/[locale]/references/LogoCarousel.tsx  (CLIENT)
'use client';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useRef } from 'react';

type Item = { name: string; logo_url: string; url?: string | null };

export default function LogoCarousel({ initial }: { initial: Item[] }) {
  // Autoplay instance'ı ref'te tut (tip güvenli)
  const autoplay = useRef(
    Autoplay({ delay: 2500, stopOnInteraction: false, stopOnMouseEnter: true })
  );
  const [viewportRef/*, emblaApi*/] = useEmblaCarousel(
    { loop: true, align: 'start', dragFree: true },
    [autoplay.current]
  );

  return (
    <div
      ref={viewportRef}
      style={{ overflow: 'hidden', marginTop: 8 }}
      aria-label="Referans carousel"
    >
      <div style={{ display: 'flex', gap: 48 }}>
        {initial.concat(initial).map((x, i) => (
          <a
            key={`${x.name}-${i}`}
            href={x.url || '#'}
            aria-label={x.name}
            target={x.url ? '_blank' : undefined}
            rel={x.url ? 'noopener noreferrer' : undefined}
          >
            <img src={x.logo_url} alt={x.name} height={40} style={{ opacity: 0.9 }} />
          </a>
        ))}
      </div>
    </div>
  );
}
