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
  typedRoutes: true, // Next 16'da üst seviyede
  staticPageGenerationTimeout: 120, // build'da uzun süren sayfalara tampon

  images: {
    formats: ["image/avif", "image/webp"] as const,
    remotePatterns: [
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "**.imgix.net" },
      { protocol: "https", hostname: "**.netlify.app" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
} satisfies NextConfig;

export default withBundleAnalyzer(withMDX(nextConfig));
