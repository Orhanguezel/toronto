// src/i18n/locale.ts
"use client";

import { useParams } from "next/navigation";
import type { SupportedLocale } from "@/types/common";
import { normalizeLocale } from "./config";

/**
 * App Router client-side locale çözümü:
 * - explicitLocale > params.locale > DEFAULT fallback
 */
export function useResolvedLocale(
  explicitLocale?: SupportedLocale | string | null
): SupportedLocale {
  const params = useParams() as { locale?: string } | null;

  const cand =
    (typeof explicitLocale === "string" && explicitLocale) ||
    (explicitLocale ? String(explicitLocale) : undefined) ||
    params?.locale ||
    undefined;

  return normalizeLocale(cand);
}
