// src/i18n/activeLocales.ts

"use client";

import { useMemo } from "react";
import { useGetSiteSettingByKeyQuery } from "@/integrations/rtk/endpoints/site_settings.endpoints";
import { DEFAULT_LOCALE, isSupportedLocale } from "@/i18n/config";
import type { SupportedLocale } from "@/types/common";

type AppLocalesValue =
    | SupportedLocale[]
    | string[]
    | { locales?: string[] | SupportedLocale[] }
    | null;

function normalizeLocaleArray(raw: AppLocalesValue): SupportedLocale[] {
    const arr: unknown[] =
        Array.isArray(raw)
            ? raw
            : raw && typeof raw === "object" && Array.isArray((raw as any).locales)
                ? (raw as any).locales
                : [];

    const cleaned = arr
        .map((x) => String(x).toLowerCase().trim().split("-")[0])
        .filter(Boolean)
        .filter((x) => isSupportedLocale(x)) as SupportedLocale[];

    // dedupe
    const uniq = Array.from(new Set(cleaned));

    return uniq.length ? uniq : [DEFAULT_LOCALE];
}

export function useActiveLocales() {
    const { data, isLoading } = useGetSiteSettingByKeyQuery({ key: "app_locales" });

    const locales = useMemo<SupportedLocale[]>(() => {
        const raw = (data?.value ?? null) as AppLocalesValue;
        return normalizeLocaleArray(raw);
    }, [data]);

    return { locales, isLoading };
}
