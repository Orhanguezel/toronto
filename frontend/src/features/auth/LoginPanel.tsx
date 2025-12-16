// src/features/auth/LoginPanel.tsx

"use client";

import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { toRoute } from "@/shared/routing/toRoute";


import { Button } from "@/shared/ui/buttons/Button";

import {
  useLoginMutation,          // alias: token
  useSignUpMutation,         // signup endpoint'in gerçek export'u
  useGoogleStartMutation,
  useStatusQuery,
} from "@/integrations/rtk/endpoints/auth.endpoints";

import { useResolvedLocale } from "@/i18n/locale";
import { useUiSection } from "@/i18n/uiDb";
import type { SupportedLocale } from "@/types/common";

export default function LoginPanel({
  locale: localeProp,
  nextDest, // /admin, /tr/admin, vb.
}: {
  locale: string;
  nextDest?: string;
}) {
  const router = useRouter();

  // Locale'i normalize et (route paramından veya prop'tan)
  const locale = useResolvedLocale(localeProp) as SupportedLocale;

  // UI strings (DB → i18n fallback → hard fallback)
  const { ui } = useUiSection("ui_auth", locale);

  const title = ui(
    "ui_auth_title",
    locale === "tr" ? "Giriş Yap" : locale === "de" ? "Anmelden" : "Sign In"
  );

  const lead = ui(
    "ui_auth_lead",
    locale === "tr"
      ? "E-posta/şifre ile giriş yapın veya Google ile devam edin."
      : locale === "de"
        ? "Melden Sie sich mit E-Mail/Passwort an oder fahren Sie mit Google fort."
        : "Sign in with email/password or continue with Google."
  );

  // Tab butonları / label’lar için anahtarlar yoksa hard fallback ile bırakıyorum.
  // İstersen bunları da UI_FALLBACK_EN + UI_KEYS.auth içine ekleyip DB’den yönetiriz.
  const tabLogin = ui("ui_auth_tab_login", locale === "tr" ? "Giriş Yap" : locale === "de" ? "Anmelden" : "Sign In");
  const tabRegister = ui("ui_auth_tab_register", locale === "tr" ? "Kayıt Ol" : locale === "de" ? "Registrieren" : "Register");

  const labelEmail = ui("ui_auth_email_label", locale === "tr" ? "E-posta" : locale === "de" ? "E-Mail" : "Email");
  const labelPassword = ui("ui_auth_password_label", locale === "tr" ? "Şifre" : locale === "de" ? "Passwort" : "Password");

  const btnLogin = ui("ui_auth_submit", locale === "tr" ? "Giriş" : locale === "de" ? "Anmelden" : "Sign In");
  const btnGoogle = ui("ui_auth_google_button", locale === "tr" ? "Google ile devam et" : locale === "de" ? "Mit Google fortfahren" : "Continue with Google");

  const errLogin = ui(
    "ui_auth_error_login",
    locale === "tr"
      ? "Giriş başarısız. E-posta/şifreyi kontrol edin."
      : locale === "de"
        ? "Anmeldung fehlgeschlagen. Bitte E-Mail/Passwort prüfen."
        : "Login failed. Please check email/password."
  );

  const errRegister = ui(
    "ui_auth_error_register",
    locale === "tr"
      ? "Kayıt başarısız. E-posta kullanımda olabilir."
      : locale === "de"
        ? "Registrierung fehlgeschlagen. E-Mail wird möglicherweise bereits verwendet."
        : "Registration failed. Email may already be in use."
  );

  // /tr | /en | /de
  const fallbackHome = (`/${locale}`) as Route;

  // nextDest varsa onu, yoksa /admin
  const targetAfterAuth = useMemo<Route>(
    () => toRoute(nextDest?.trim() || "/admin", fallbackHome),
    [nextDest, fallbackHome]
  );

  const { data: status } = useStatusQuery();

  // RTK endpoints uyumlu mutasyonlar
  const [login, { isLoading: loginBusy, error: loginErr }] = useLoginMutation();
  const [signup, { isLoading: regBusy, error: regErr }] = useSignUpMutation();
  const [googleStart, { isLoading: googleBusy }] = useGoogleStartMutation();

  const busy = loginBusy || regBusy || googleBusy;

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

  const safeReplace = (href?: string) =>
    router.replace(toRoute(href, targetAfterAuth));

  const onSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // RTK token mutation: { email, password }
      await login({ email, password }).unwrap();
      safeReplace(); // targetAfterAuth
    } catch {
      /* handled by loginErr */
    }
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
    } catch {
      /* handled by regErr */
    }
  };

  const onGoogleClick = async () => {
    try {
      // Backend string bekliyor: redirectTo
      const res = await googleStart({ redirectTo: targetAfterAuth }).unwrap();
      if (res?.url) window.location.href = res.url; // absolute url
      else safeReplace();
    } catch {
      /* ignore */
    }
  };

  return (
    <Card>
      <Title>{title}</Title>
      <Lead>{lead}</Lead>

      <Tabs>
        <button
          type="button"
          className={mode === "login" ? "active" : ""}
          onClick={() => setMode("login")}
          disabled={busy}
        >
          {tabLogin}
        </button>
        <button
          type="button"
          className={mode === "register" ? "active" : ""}
          onClick={() => setMode("register")}
          disabled={busy}
        >
          {tabRegister}
        </button>
      </Tabs>

      {mode === "login" ? (
        <form onSubmit={onSubmitLogin}>
          <Field>
            <span>{labelEmail}</span>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
              disabled={busy}
              placeholder={locale === "tr" ? "ornek@site.com" : "example@site.com"}
              required
            />
          </Field>

          <Field>
            <span>{labelPassword}</span>
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

          {!!loginErr && <SmallError>{errLogin}</SmallError>}

          <div style={{ height: 12 }} />

          <Row>
            <Button type="submit" disabled={busy}>
              {btnLogin}
            </Button>
            <SecondaryBtn type="button" onClick={onGoogleClick} disabled={busy}>
              {btnGoogle}
            </SecondaryBtn>
          </Row>
        </form>
      ) : (
        <form onSubmit={onSubmitRegister}>
          <Field>
            <span>{locale === "tr" ? "Ad Soyad (ops.)" : locale === "de" ? "Name (optional)" : "Full name (optional)"}</span>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={busy}
              placeholder={locale === "tr" ? "Ad Soyad" : "Full name"}
            />
          </Field>

          <Field>
            <span>{locale === "tr" ? "Telefon (ops.)" : locale === "de" ? "Telefon (optional)" : "Phone (optional)"}</span>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={busy}
              placeholder="+49 ..."
            />
          </Field>

          <Field>
            <span>{labelEmail}</span>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
              disabled={busy}
              placeholder={locale === "tr" ? "ornek@site.com" : "example@site.com"}
              required
            />
          </Field>

          <Field>
            <span>{labelPassword}</span>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              disabled={busy}
              placeholder={locale === "tr" ? "en az 6 karakter" : locale === "de" ? "mindestens 6 Zeichen" : "at least 6 characters"}
              required
            />
          </Field>

          {!!regErr && <SmallError>{errRegister}</SmallError>}

          <div style={{ height: 12 }} />

          <Row>
            <Button type="submit" disabled={busy}>
              {tabRegister}
            </Button>
            <SecondaryBtn type="button" onClick={onGoogleClick} disabled={busy}>
              {locale === "tr" ? "Google ile giriş" : locale === "de" ? "Mit Google anmelden" : "Sign in with Google"}
            </SecondaryBtn>
          </Row>
        </form>
      )}
    </Card>
  );
}

/* ===== Themed UI ===== */
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
  margin: 0 0 ${({ theme }) => theme.spacings.xs};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes.h4};
  color: ${({ theme }) => theme.colors.title};
`;

const Lead = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacings.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: 1.5;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
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
