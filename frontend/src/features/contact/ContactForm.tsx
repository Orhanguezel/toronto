// src/features/contact/ContactForm.tsx
"use client";

import * as React from "react";
import styled from "styled-components";
import { toast } from "sonner";

import { Button } from "@/shared/ui/buttons/Button";
import { useResolvedLocale } from "@/i18n/locale";
import { useUiSection } from "@/i18n/uiDb";
import type { SupportedLocale } from "@/types/common";

import { useCreateContactPublicMutation } from "@/integrations/rtk/endpoints/contacts.endpoints";

const Form = styled.form`
  display: grid;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacings.xs};
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

export default function ContactForm({ locale: localeProp }: { locale: string }) {
  const locale = useResolvedLocale(localeProp) as SupportedLocale;

  // ✅ 30 dil: DB ui_contact + fallback chain
  const { ui } = useUiSection("ui_contact", locale);

  // ✅ Hard-coded dil dalları YOK.
  const tName = ui("ui_contact_first_name", "Full Name*");
  const tEmail = ui("ui_contact_email", "Email*");
  const tPhone = ui("ui_contact_phone", "Phone (optional)");
  const tMsg = ui("ui_contact_msg_label", "Your message*"); // bu key yoksa DB’ye ekle
  const tSend = ui("ui_contact_submit", "Send");
  const tSending = ui("ui_contact_sending", "Sending...");
  const tOk = ui("ui_contact_success", "Thanks! Your message has been sent.");
  const tFail = ui("ui_contact_error_generic", "Failed to send. Please try again.");

  const [createContact, { isLoading: busy }] = useCreateContactPublicMutation();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [message, setMessage] = React.useState("");

  const onSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    try {
      await createContact({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() ? phone.trim() : undefined,
        message: message.trim(),
        locale, // backend kabul ediyorsa
      }).unwrap();

      toast.success(tOk);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch {
      toast.error(tFail);
    }
  };

  return (
    <Form onSubmit={onSubmit} noValidate>
      <Row>
        <Label htmlFor="cf-name">{tName}</Label>
        <Input
          id="cf-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={busy}
        />
      </Row>

      <Row>
        <Label htmlFor="cf-email">{tEmail}</Label>
        <Input
          id="cf-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={busy}
        />
      </Row>

      <Row>
        <Label htmlFor="cf-phone">{tPhone}</Label>
        <Input
          id="cf-phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={busy}
        />
      </Row>

      <Row>
        <Label htmlFor="cf-msg">{tMsg}</Label>
        <Area
          id="cf-msg"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          disabled={busy}
        />
      </Row>

      <div style={{ display: "grid", justifyContent: "end" }}>
        <Button type="submit" disabled={busy}>
          {busy ? tSending : tSend}
        </Button>
      </div>
    </Form>
  );
}
