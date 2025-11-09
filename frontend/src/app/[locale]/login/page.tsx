import type { Metadata } from "next";
import LoginPanel from "@/features/auth/LoginPanel";

type Locale = "tr" | "en" | "de";

/** Build sırasında render etme; runtime'da SSR */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title =
    locale === "tr" ? "Giriş Yap" :
    locale === "de" ? "Anmelden" : "Sign In";
  const desc =
    locale === "tr"
      ? "E-posta/şifre ile giriş yapın veya Google ile devam edin."
      : locale === "de"
      ? "Melden Sie sich mit E-Mail/Passwort an oder fahren Sie mit Google fort."
      : "Sign in with email/password or continue with Google.";
  return { title, description: desc };
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams?: Promise<{ next?: string }> | { next?: string };
}) {
  const { locale } = await params;

  const sp =
    searchParams && typeof (searchParams as any)?.then === "function"
      ? await (searchParams as Promise<{ next?: string }>)
      : ((searchParams as { next?: string } | undefined) ?? {});

  // next varsa onu kullan; yoksa /admin
  const nextDest = (sp.next?.trim()) || "/admin";

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
