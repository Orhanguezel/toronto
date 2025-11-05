"use client";

import { useEffect, useRef } from "react";

export default function VideoPlayer({
  src,
  poster,
  captions,
}: {
  src: string;
  poster?: string;
  captions?: { src: string; lang: string; label: string }[];
}) {
  const v = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let hlsInstance: any | null = null;
    const setup = async () => {
      const vid = v.current;
      if (!vid) return;
      const canNative = !!vid.canPlayType?.("application/vnd.apple.mpegurl");
      if (canNative) return;
      try {
        const { default: Hls } = await import("hls.js");
        if (Hls?.isSupported()) {
          hlsInstance = new Hls({ lowLatencyMode: true });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(vid);
        }
      } catch {}
    };
    setup();
    return () => {
      try { hlsInstance?.destroy?.(); } catch {}
      hlsInstance = null;
    };
  }, [src]);

  return (
    <video
      ref={v}
      controls
      playsInline
      preload="metadata"
      poster={poster}
      style={{ width: "100%", borderRadius: "var(--radius-md)", border: "var(--border-thin)" }}
    >
      <source src={src} type="application/vnd.apple.mpegurl" />
      {captions?.map((c) => (
        <track
          key={c.src}
          srcLang={c.lang}
          label={c.label}
          src={c.src}
          kind="subtitles"
          default={c.lang === "en"}
        />
      ))}
    </video>
  );
}
