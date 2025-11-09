"use client";

import { useMemo } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

type Item = { name: string; logo_url: string; url?: string | null };

export default function LogoCarousel({ initial }: { initial: Item[] }) {
  if (!initial?.length) return null;

  // Plugin instance'ını stable tut
  const plugins = useMemo(
    () => [Autoplay({ delay: 2500, stopOnInteraction: false, stopOnMouseEnter: true })],
    []
  );

  const [viewportRef /*, emblaApi */] = useEmblaCarousel(
    { loop: true, align: "start", dragFree: true },
    plugins
  );

  // Akıcı ve basit bir track
  const items = useMemo(() => initial.concat(initial), [initial]);

  return (
    <div
      ref={viewportRef}
      aria-label="Referans carousel"
      style={{ overflow: "hidden" }}
    >
      <div
        style={{
          display: "flex",
          gap: 48,
          alignItems: "center",
          willChange: "transform",
          paddingBlock: 8,
        }}
      >
        {items.map((x, i) => (
          <a
            key={`${x.name}-${i}`}
            href={x.url || "#"}
            aria-label={x.name}
            target={x.url ? "_blank" : undefined}
            rel={x.url ? "noopener noreferrer" : undefined}
            style={{ display: "inline-flex", alignItems: "center" }}
          >
            <img
              src={x.logo_url}
              alt={x.name}
              height={40}
              style={{ objectFit: "contain", opacity: 0.9 }}
              loading="lazy"
              decoding="async"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
