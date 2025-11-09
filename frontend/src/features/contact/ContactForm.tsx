"use client";

import * as React from "react";
import styled from "styled-components";
import { Button } from "@/shared/ui/buttons/Button";
import { toast } from "sonner";

type Locale = "tr" | "en" | "de";

const COPY: Record<Locale, {
  name: string; email: string; phone: string; msg: string; send: string; ok: string; fail: string;
}> = {
  tr: { name: "Ad Soyad", email: "E-posta", phone: "Telefon (ops.)", msg: "Mesajınız", send: "Gönder", ok: "Mesajınız alındı", fail: "Gönderilemedi" },
  en: { name: "Full Name", email: "Email", phone: "Phone (opt.)", msg: "Your message", send: "Send", ok: "Message received", fail: "Failed to send" },
  de: { name: "Vollständiger Name", email: "E-Mail", phone: "Telefon (optional)", msg: "Ihre Nachricht", send: "Senden", ok: "Nachricht empfangen", fail: "Senden fehlgeschlagen" },
};

const Form = styled.form`
  display: grid;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const Row = styled.div`
  display: grid; grid-template-columns: 1fr; gap: ${({ theme }) => theme.spacings.xs};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};
`;

const Input = styled.input`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.inputs.border};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  &::placeholder { color: ${({ theme }) => theme.inputs.placeholder}; }
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.inputs.borderFocus};
    background: ${({ theme }) => theme.colors.inputBackgroundFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

const Area = styled.textarea`
  min-height: 140px;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.inputs.border};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  resize: vertical;
  &::placeholder { color: ${({ theme }) => theme.inputs.placeholder}; }
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.inputs.borderFocus};
    background: ${({ theme }) => theme.colors.inputBackgroundFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

export default function ContactForm({ locale }: { locale: Locale }) {
  const t = COPY[locale] ?? COPY.tr;

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const onSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setBusy(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message, locale }),
      });
      if (!res.ok) throw new Error("fail");
      toast.success(t.ok);
      setName(""); setEmail(""); setPhone(""); setMessage("");
    } catch {
      toast.error(t.fail);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Form onSubmit={onSubmit} noValidate>
      <Row>
        <Label htmlFor="cf-name">{t.name}</Label>
        <Input id="cf-name" value={name} onChange={(e)=>setName(e.target.value)} required />
      </Row>
      <Row>
        <Label htmlFor="cf-email">{t.email}</Label>
        <Input id="cf-email" type="email" inputMode="email" autoComplete="email"
               value={email} onChange={(e)=>setEmail(e.target.value)} required />
      </Row>
      <Row>
        <Label htmlFor="cf-phone">{t.phone}</Label>
        <Input id="cf-phone" value={phone} onChange={(e)=>setPhone(e.target.value)} />
      </Row>
      <Row>
        <Label htmlFor="cf-msg">{t.msg}</Label>
        <Area id="cf-msg" value={message} onChange={(e)=>setMessage(e.target.value)} required />
      </Row>
      <div style={{ display: "grid", justifyContent: "end" }}>
        <Button type="submit" disabled={busy}>{t.send}</Button>
      </div>
    </Form>
  );
}
