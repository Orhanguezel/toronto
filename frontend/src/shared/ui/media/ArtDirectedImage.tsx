import { clUrl } from "@/lib/media/cloudinaryArt";

type Source = { media: string; variant: { w: number; h: number; crop?: any; g?: any } };

export default function ArtDirectedImage({
  publicId,
  alt,
  sources,
  fallback
}: { publicId: string; alt: string; sources: Source[]; fallback: { w: number; h: number } }) {
  return (
    <picture>
      {sources.map((s, i) => (
        <source key={i} media={s.media} srcSet={clUrl(publicId, s.variant)} />
      ))}
      <img
        src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD}/image/upload/c_fill,g_custom,w_${fallback.w},h_${fallback.h}/${publicId}`}
        alt={alt}
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          borderRadius: "var(--radius-md)",
          border: "var(--border-thin)"
        }}
      />
    </picture>
  );
}
