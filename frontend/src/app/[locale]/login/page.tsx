// src/app/[locale]/login/page.tsx

import type { Metadata } from "next";
import LoginPanel from "@/features/auth/LoginPanel";

import { normalizeLocale } from "@/i18n/config";
import type { SupportedLocale } from "@/types/common";

// Build sırasında render etme; runtime'da SSR
export const dynamic = "force-dynamic";
export const revalidate = 0;

const AUTH_KEYS = ["ui_auth_title", "ui_auth_lead"] as const;

function isPromise<T = unknown>(v: any): v is Promise<T> {
  return !!v && typeof v?.then === "function";
}

function hardTitle(locale: SupportedLocale) {
  return locale === "tr" ? "Giriş Yap" : locale === "de" ? "Anmelden" : "Sign In";
}

function hardDesc(locale: SupportedLocale) {
  return locale === "tr"
    ? "E-posta/şifre ile giriş yapın veya Google ile devam edin."
    : locale === "de"
      ? "Melden Sie sich mit E-Mail/Passwort an oder fahren Sie mit Google fort."
      : "Sign in with email/password or continue with Google.";
}

/**
 * Server-side settings fetch:
 * RTK ile uyumlu olacak şekilde:
 *   GET /site_settings?key_in=ui_auth_title,ui_auth_lead&locale=tr
 *
 * baseApi baseUrl'ün hangi env’den geldiğini bilmiyorum; bu yüzden iki opsiyon koydum.
 * - NEXT_PUBLIC_API_BASE_URL ör: "https://domain.com/api"
 * - yoksa relative "/api" (reverse proxy varsa çalışır)
 */
async function fetchUiStrings(locale: SupportedLocale) {
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") || "";

  // base boşsa relative istek atar: "/site_settings"
  const url =
    `${base}/site_settings` +
    `?key_in=${encodeURIComponent(AUTH_KEYS.join(","))}` +
    `&locale=${encodeURIComponent(locale)}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return {};

    const rows = (await res.json()) as Array<{
      key: string;
      value: any;
      locale?: string;
    }>;

    const out: Record<string, string> = {};

    for (const r of rows || []) {
      const k = r?.key;
      const v = r?.value;

      // site_settings.endpoints.ts'deki tryParse mantığına benzer tolerant okuma:
      // value:
      //  - string olabilir
      //  - { label: { tr/en/de } } olabilir
      //  - { tr/en/de } olabilir
      let s = "";

      if (typeof v === "string") {
        s = v;
      } else if (v && typeof v === "object") {
        const label =
          v.label && typeof v.label === "object" ? v.label : v;

        s =
          (label?.[locale] as string) ||
          (label?.en as string) ||
          (label?.tr as string) ||
          (Object.values(label || {})[0] as string) ||
          "";
      }

      if (k && typeof s === "string" && s.trim()) {
        out[k] = s.trim();
      }
    }

    return out;
  } catch {
    return {};
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const p = await params;
  const locale = normalizeLocale(p?.locale || null);

  const ui = await fetchUiStrings(locale);

  const title = ui.ui_auth_title || hardTitle(locale);
  const desc = ui.ui_auth_lead || hardDesc(locale);

  return { title, description: desc };
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale?: string }>;
  searchParams?: Promise<{ next?: string }> | { next?: string };
}) {
  const p = await params;
  const locale = normalizeLocale(p?.locale || null);

  const sp = isPromise(searchParams) ? await searchParams : (searchParams ?? {});
  const nextDest = sp.next?.trim() || "/admin";

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: "calc(var(--navbar-h, 96px) + 24px) 0 64px",
      }}
    >
      <LoginPanel locale={locale} nextDest={nextDest} />
    </main>
  );
}
