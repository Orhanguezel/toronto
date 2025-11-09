import type { Metadata } from "next";
import Container from "@/shared/ui/common/Container";
import { H1, Lead } from "@/shared/ui/typography";
import LoginForm from "@/features/login/LoginForm";

type Locale = "tr" | "en" | "de";

// Build'da üretme → runtime SSR
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Giriş Yap",
  description: "Hesabınıza giriş yapın",
};

export default function LoginPage({
  params,
  searchParams,
}: {
  params: { locale: Locale };
  searchParams?: { next?: string };
}) {
  const { locale } = params;
  const next = (searchParams?.next as string | undefined) ?? `/${locale}`;

  return (
    <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center",
                   padding: "calc(var(--navbar-h, 96px) + 24px) 0 64px" }}>
      <Container style={{ width: "100%" }}>
        <header style={{ textAlign: "center", marginBottom: 16 }}>
          <H1>{locale === "tr" ? "Giriş Yap" : locale === "de" ? "Anmelden" : "Sign In"}</H1>
          <Lead>
            {locale === "tr"
              ? "E-posta ve şifrenizle giriş yapın veya Google ile devam edin."
              : locale === "de"
              ? "Melden Sie sich mit E-Mail/Passwort an oder fahren Sie mit Google fort."
              : "Sign in with email/password or continue with Google."}
          </Lead>
        </header>
        <div style={{ display: "grid", justifyItems: "center" }}>
          <LoginForm locale={locale} next={next} />
        </div>
      </Container>
    </main>
  );
}
