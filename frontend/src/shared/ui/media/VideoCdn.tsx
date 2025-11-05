import * as React from "react";

export default function VideoCdn({ src, poster }: { src: string; poster?: string }) {
  return (
    <div style={{ position: "relative" }}>
      <video
        controls
        preload="metadata"
        poster={poster}
        style={{ width: "100%", borderRadius: "var(--radius-md)", border: "var(--border-thin)" }}
      >
        <source
          src={src}
          type={src.endsWith(".m3u8") ? "application/x-mpegURL" : "video/mp4"}
        />
      </video>
    </div>
  );
}
