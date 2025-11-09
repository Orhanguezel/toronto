"use client";

import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useRouter } from "next/navigation";
import type { Route } from "next"; // ⬅️ EKLE
import { Button } from "@/shared/ui/buttons/Button";
import {
  usePasswordLoginMutation,
  useSignupMutation,
  useGoogleStartMutation,
  useStatusQuery,
} from "@/integrations/endpoints/public/auth.entpoints";

/** İç linkleri güvenle Route'a çevirir */
function toRoute(href?: string, fallback: Route = "/" as Route): Route {
  if (!href) return fallback;
  // absolute URL (http:, https:) veya protokolleri reddet
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(href)) return fallback;
  // iç rota değilse reddet
  if (!href.startsWith("/")) return fallback;
  const cleaned = href.replace(/\s+/g, "");
  return (cleaned || fallback) as Route;
}

export default function LoginPanel({
  locale,
  nextDest, // /admin, /tr/admin, vb.
}: {
  locale: string;
  nextDest?: string;
}) {
  const router = useRouter();

  // /tr | /en | /de → runtime olduğu için cast gerekiyor
  const fallbackHome = (`/${locale}`) as Route;

  // nextDest varsa onu, yoksa /admin → her zaman Route
  const targetAfterAuth = useMemo<Route>(
    () => toRoute(nextDest?.trim() || "/admin", fallbackHome),
    [nextDest, fallbackHome]
  );

  const { data: status } = useStatusQuery();
  const [passwordLogin, { isLoading: loginBusy, error: loginErr }] = usePasswordLoginMutation();
  const [signup, { isLoading: regBusy, error: regErr }] = useSignupMutation();
  const [googleStart, { isLoading: googleBusy }] = useGoogleStartMutation();

  // Auth olduysa garanti yönlendir
  useEffect(() => {
    if (status?.authenticated) {
      queueMicrotask(() => router.replace(targetAfterAuth));
    }
  }, [status?.authenticated, router, targetAfterAuth]);

  // Forms...
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const busy = loginBusy || regBusy || googleBusy;

  // Her zaman Route döndür
  const safeReplace = (href?: string) => router.replace(toRoute(href, targetAfterAuth));

  const onSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await passwordLogin({ grant_type: "password", email, password }).unwrap();
      safeReplace(); // targetAfterAuth'a gider
    } catch {}
  };

  const onSubmitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup({
        email,
        password,
        full_name: fullName || undefined,
        phone: phone || undefined,
      }).unwrap();
      safeReplace();
    } catch {}
  };

  const onGoogleClick = async () => {
    try {
      // Backend absolute URL döndürürse window.location kullanıyoruz (typedRoutes’dan bağımsız)
      const res = await googleStart({ redirectTo: targetAfterAuth }).unwrap();
      if (res?.url) window.location.href = res.url;
      else safeReplace();
    } catch {}
  };

  return (
    <Card>
      <Title>Yönetim Girişi</Title>

      <Tabs>
        <button
          type="button"
          className={mode === "login" ? "active" : ""}
          onClick={() => setMode("login")}
          disabled={busy}
        >
          Giriş Yap
        </button>
        <button
          type="button"
          className={mode === "register" ? "active" : ""}
          onClick={() => setMode("register")}
          disabled={busy}
        >
          Kayıt Ol
        </button>
      </Tabs>

      {mode === "login" ? (
        <form onSubmit={onSubmitLogin}>
          <Field>
            <span>E-posta</span>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
              disabled={busy}
              placeholder="ornek@site.com"
              required
            />
          </Field>
          <Field>
            <span>Şifre</span>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={busy}
              placeholder="••••••••"
              required
            />
          </Field>
          {!!loginErr && (
            <SmallError>Giriş başarısız. E-posta/şifreyi kontrol edin.</SmallError>
          )}
          <div style={{ height: 12 }} />
          <Row>
            <Button type="submit" disabled={busy}>
              Giriş
            </Button>
            <SecondaryBtn type="button" onClick={onGoogleClick} disabled={busy}>
              Google ile devam et
            </SecondaryBtn>
          </Row>
        </form>
      ) : (
        <form onSubmit={onSubmitRegister}>
          <Field>
            <span>Ad Soyad (ops.)</span>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={busy}
              placeholder="Ad Soyad"
            />
          </Field>
          <Field>
            <span>Telefon (ops.)</span>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={busy}
              placeholder="+49 ..."
            />
          </Field>
          <Field>
            <span>E-posta</span>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
              disabled={busy}
              placeholder="ornek@site.com"
              required
            />
          </Field>
          <Field>
            <span>Şifre</span>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              disabled={busy}
              placeholder="en az 6 karakter"
              required
            />
          </Field>
          {!!regErr && (
            <SmallError>Kayıt başarısız. E-posta kullanımda olabilir.</SmallError>
          )}
          <div style={{ height: 12 }} />
          <Row>
            <Button type="submit" disabled={busy}>
              Kayıt Ol
            </Button>
            <SecondaryBtn type="button" onClick={onGoogleClick} disabled={busy}>
              Google ile giriş
            </SecondaryBtn>
          </Row>
        </form>
      )}
    </Card>
  );
}

/* ===== Themed UI (senin stil dosyalarınla uyumlu) ===== */
const Card = styled.div`
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.lg};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.cards.background};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.cards.border};
  box-shadow: ${({ theme }) => theme.cards.shadow};
`;

const Title = styled.h2`
  margin: 0 0 ${({ theme }) => theme.spacings.md};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.h4};
  color: ${({ theme }) => theme.colors.title};
`;

const Tabs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacings.sm};
  margin-bottom: ${({ theme }) => theme.spacings.md};

  button {
    padding: 10px 12px;
    border-radius: ${({ theme }) => theme.radii.md};
    border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderLight};
    background: ${({ theme }) => theme.colors.hoverBackground};
    color: ${({ theme }) => theme.colors.text};
    transition: ${({ theme }) => theme.transition.normal};
  }
  button:hover { background: ${({ theme }) => theme.colors.sectionBackground}; }
  .active {
    border-color: ${({ theme }) => theme.colors.borderHighlight};
    background: ${({ theme }) => theme.colors.primaryTransparent};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

const Field = styled.label`
  display: grid;
  gap: 6px;
  margin-top: ${({ theme }) => theme.spacings.sm};

  span {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const Input = styled.input`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.inputs.border};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  transition: ${({ theme }) => theme.transition.normal};

  &::placeholder { color: ${({ theme }) => theme.inputs.placeholder}; }
  &:hover { background: ${({ theme }) => theme.colors.inputBackgroundLight}; }
  &:focus {
    outline: none;
    background: ${({ theme }) => theme.colors.inputBackgroundFocus};
    border-color: ${({ theme }) => theme.inputs.borderFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
  &:disabled { opacity: ${({ theme }) => theme.opacity.disabled}; }
`;

const Row = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const SmallError = styled.div`
  margin-top: ${({ theme }) => theme.spacings.sm};
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const SecondaryBtn = styled(Button)`
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderLight};
  &:hover {
    background: ${({ theme }) => theme.buttons.secondary.backgroundHover};
    color: ${({ theme }) => theme.buttons.secondary.textHover};
  }
`;
