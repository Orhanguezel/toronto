import "@/styles/theme-ssr.css";
import WebVitalsListener from "@/app/analytics/WebVitalsListener";
import { headers, cookies } from "next/headers";
import StyledComponentsRegistry from "@/styles/StyledComponentsRegistry";
import Providers from "@/app/providers";
import ThemeRoot from "@/styles/ThemeRoot";
import type { Metadata, Viewport } from "next";

const SUPPORTED = ["tr", "en", "de"] as const;
type Locale = (typeof SUPPORTED)[number];
const isSupported = (v: unknown): v is Locale =>
  typeof v === "string" && (SUPPORTED as readonly string[]).includes(v as string);

function detectFromAcceptLanguage(h: string | null): Locale {
  const accept = (h || "").toLowerCase();
  if (accept.includes("tr")) return "tr";
  if (accept.includes("de")) return "de";
  return "en";
}

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Toronto", template: "%s | Toronto" },
  description: "Toronto portfolio site",
  openGraph: { type: "website", siteName: "Toronto" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Ortamında headers()/cookies() Promise => await kullanımı doğru.
  const h = await headers();
  const c = await cookies();
  const cookieLocale = c.get("NEXT_LOCALE")?.value as string | undefined;

  const detected: Locale = isSupported(cookieLocale)
    ? (cookieLocale as Locale)
    : detectFromAcceptLanguage(h.get("accept-language"));

  return (
    // ✅ Olası server/client lang farkı uyarısını bastır (özellik kaybı yok)
    <html lang={detected} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
      </head>
      <body>
        <StyledComponentsRegistry>
          <ThemeRoot>
            <Providers>
              <WebVitalsListener />
              {process.env.NEXT_PUBLIC_DISABLE_SENTRY !== "1" ? <SentryBootstrap /> : null}
              {children}
            </Providers>
          </ThemeRoot>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}

function SentryBootstrap() {
  "use client";
  import("@/app/analytics/sentry.client").catch(() => {});
  return null;
}
