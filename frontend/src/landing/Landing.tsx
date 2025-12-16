// src/landing/Landing.tsx
import LandingClient from "./LandingClient";
import { normalizeLocale } from "@/i18n/config";

export default function Landing({ locale }: { locale: string }) {
  // Runtime güvenlik: bilinmeyen locale gelirse default'a düşer
  const safeLocale = normalizeLocale(locale);

  return <LandingClient locale={safeLocale} initialSection="" />;
}
