"use client";

import * as React from "react";
import styled, { css } from "styled-components";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { toast } from "sonner";
import {
  usePasswordLoginMutation,
  useGoogleStartMutation,
} from "@/integrations/endpoints/public/auth.entpoints";
import { Button } from "@/shared/ui/buttons/Button";
import { revalidateTags } from "@/lib/revalidate";

type Locale = "tr" | "en" | "de";
type Props = { locale: Locale; next?: string };

const COPY: Record<Locale, { email: string; password: string; or: string; google: string; submit: string }> = {
  tr: { email: "E-posta", password: "Şifre", or: "veya", google: "Google ile devam et", submit: "Giriş Yap" },
  en: { email: "Email", password: "Password", or: "or", google: "Continue with Google", submit: "Sign In" },
  de: { email: "E-Mail", password: "Passwort", or: "oder", google: "Mit Google fortfahren", submit: "Anmelden" },
};

const Card = styled.form`
  width: min(560px, 96vw);
  padding: clamp(16px, 3vw, 24px);
  background: ${({ theme }) => theme.cards.background};
  border: 1px solid ${({ theme }) => theme.cards.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  display: grid;
  gap: 12px;
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
`;

const fieldBase = css`
  width: 100%;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.inputs.border};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  ::placeholder {
    color: ${({ theme }) => theme.inputs.placeholder || theme.colors.placeholder};
  }
  transition:
    border ${({ theme }) => theme.transition.fast},
    background ${({ theme }) => theme.transition.fast},
    box-shadow ${({ theme }) => theme.transition.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.inputs.borderFocus};
    background: ${({ theme }) => theme.colors.inputBackgroundFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

const Input = styled.input`${fieldBase}`;

const Label = styled.label`
  display: grid;
  gap: 6px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};
`;

const Divider = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 1fr auto 1fr;
  gap: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  &::before,
  &::after {
    content: "";
    height: 1px;
    background: ${({ theme }) => theme.colors.borderLight};
    display: block;
  }
`;

const Row = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
`;

const PasswordWrap = styled.div`
  position: relative;
`;

const ToggleBtn = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: 0;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.8;
  cursor: pointer;
  padding: 2px 4px;

  &:hover,
  &:focus-visible {
    opacity: 1;
    outline: none;
  }
`;

const FullWidthButton = styled(Button)`
  width: 100%;
`;

export default function LoginForm({ locale, next }: Props) {
  const t = COPY[locale] ?? COPY.en; // güvenli fallback
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [show, setShow] = React.useState(false);

  const [passwordLogin, { isLoading: loggingIn }] = usePasswordLoginMutation();
  const [googleStart, { isLoading: startingGoogle }] = useGoogleStartMutation();

  const onSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    try {
      await passwordLogin({ grant_type: "password", email, password }).unwrap();
      await revalidateTags(["Auth"]);
      router.replace((next || `/${locale}`) as Route);
      router.refresh();
      toast.success(
        locale === "tr" ? "Giriş başarılı" : locale === "de" ? "Anmeldung erfolgreich" : "Signed in"
      );
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        (locale === "tr"
          ? "Giriş başarısız"
          : locale === "de"
          ? "Anmeldung fehlgeschlagen"
          : "Sign in failed");
      toast.error(msg);
    }
  };

  const onGoogle = async () => {
    try {
      const res = await googleStart(next ? { redirectTo: next } : undefined).unwrap();
      if (res?.url) window.location.href = res.url;
      else
        toast.error(
          locale === "tr"
            ? "Google yönlendirmesi alınamadı"
            : locale === "de"
            ? "Google-Weiterleitung fehlgeschlagen"
            : "Could not start Google flow"
        );
    } catch {
      toast.error(
        locale === "tr"
          ? "Google ile giriş başlatılamadı"
          : locale === "de"
          ? "Google-Anmeldung konnte nicht gestartet werden"
          : "Failed to start Google sign-in"
      );
    }
  };

  return (
    <Card onSubmit={onSubmit} noValidate>
      <TwoCol>
        <Label>
          {t.email}
          <Input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="ornek@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Label>

        <Label>
          {t.password}
          <PasswordWrap>
            <Input
              type={show ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ paddingRight: 44 }}
            />
            <ToggleBtn
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              title={show ? "Hide password" : "Show password"}
            >
              {show ? "🙈" : "👁️"}
            </ToggleBtn>
          </PasswordWrap>
        </Label>
      </TwoCol>

      <Row>
        <div />
        <Button type="submit" disabled={loggingIn}>
          {loggingIn
            ? locale === "tr"
              ? "Giriş yapılıyor…"
              : locale === "de"
              ? "Wird angemeldet…"
              : "Signing in…"
            : t.submit}
        </Button>
      </Row>

      <Divider>{t.or}</Divider>

      <FullWidthButton
        type="button"
        variant="secondary"
        onClick={onGoogle}
        disabled={startingGoogle}
      >
        {startingGoogle
          ? locale === "tr"
            ? "Yönlendiriliyor…"
            : locale === "de"
            ? "Weiterleiten…"
            : "Redirecting…"
          : t.google}
      </FullWidthButton>
    </Card>
  );
}
