import "@/styles/theme-ssr.css";
import type { Metadata, Viewport } from "next";

import WebVitalsListener from "@/app/analytics/WebVitalsListener";
import StyledComponentsRegistry from "@/styles/StyledComponentsRegistry";
import Providers from "@/app/providers";
import ThemeRoot from "@/styles/ThemeRoot";

import { getServerI18nContext } from "@/i18n/server";
import { buildMetadataFromSeo, fetchSeoObject } from "@/seo/serverMetadata";

import SentryBootstrap from "@/app/SentryBootstrap";

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const { detectedLocale } = await getServerI18nContext();
  const seo = await fetchSeoObject(detectedLocale);
  return buildMetadataFromSeo(seo, { locale: detectedLocale });
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { detectedLocale } = await getServerI18nContext();

  return (
    <html lang={detectedLocale} suppressHydrationWarning>
      <head>
        <link
          rel="preconnect"
          href="https://res.cloudinary.com"
          crossOrigin="anonymous"
        />
      </head>

      {/* 🔑 Extension’ların body’ye eklediği attribute mismatch’lerini susturur */}
      <body suppressHydrationWarning>
        <StyledComponentsRegistry>
          <ThemeRoot>
            <Providers>
              <WebVitalsListener />
              {process.env.NEXT_PUBLIC_DISABLE_SENTRY !== "1" ? (
                <SentryBootstrap />
              ) : null}
              {children}
            </Providers>
          </ThemeRoot>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
