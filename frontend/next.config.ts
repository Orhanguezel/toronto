// next.config.ts
import type { NextConfig } from "next";
import createBundleAnalyzer from "@next/bundle-analyzer";
import mdx from "@next/mdx";

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});
const withMDX = mdx();

const nextConfig = {
  reactStrictMode: true,
  compiler: { styledComponents: true },
  // ⬇️ Artık experimental altında değil
  typedRoutes: true,
  images: {
    formats: ["image/avif", "image/webp"] as const, // tip daraltma
    remotePatterns: [
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "**.imgix.net" },
      { protocol: "https", hostname: "**.netlify.app" },
    ],
  },
} satisfies NextConfig;

export default withBundleAnalyzer(withMDX(nextConfig));
