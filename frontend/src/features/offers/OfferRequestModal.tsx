"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";

import { useCreateOfferPublicMutation } from "@/integrations/rtk/endpoints/offers_public.endpoints";
import type { OfferRequestPublic, OfferRow } from "@/integrations/types/offers.types";
import { useUiSection } from "@/i18n/uiDb";

type Props = {
    open: boolean;
    locale: string;
    onClose: () => void;
    /** opsiyonel: sayfa bağlamı */
    defaultSubject?: string;
    defaultMessage?: string;
    productId?: string | null;
};

function toBoolLike(v: boolean) {
    // backend: boolean | number | string kabul ediyor
    return v ? 1 : 0;
}

export default function OfferRequestModal({
    open,
    locale,
    onClose,
    defaultSubject,
    defaultMessage,
    productId,
}: Props) {
    const { ui } = useUiSection("ui_offer", locale);

    const title = ui("ui_offer_title", locale === "tr" ? "Teklif Talep Formu" : locale === "de" ? "Angebot anfordern" : "Request an Offer");
    const subtitle = ui("ui_offer_subtitle", locale === "tr" ? "Bilgilerinizi bırakın, size en kısa sürede dönüş yapalım." : locale === "de" ? "Hinterlassen Sie Ihre Daten – wir melden uns kurzfristig." : "Leave your details and we’ll get back to you shortly.");
    const submitLabel = ui("ui_offer_submit", locale === "tr" ? "Gönder" : locale === "de" ? "Senden" : "Submit");
    const cancelLabel = ui("ui_offer_cancel", locale === "tr" ? "İptal" : locale === "de" ? "Abbrechen" : "Cancel");

    const lblName = ui("ui_offer_name", locale === "tr" ? "Ad Soyad" : locale === "de" ? "Name" : "Full name");
    const lblCompany = ui("ui_offer_company", locale === "tr" ? "Şirket" : locale === "de" ? "Firma" : "Company");
    const lblEmail = ui("ui_offer_email", locale === "tr" ? "E-posta" : locale === "de" ? "E-Mail" : "Email");
    const lblPhone = ui("ui_offer_phone", locale === "tr" ? "Telefon" : locale === "de" ? "Telefon" : "Phone");
    const lblSubject = ui("ui_offer_subject", locale === "tr" ? "Konu" : locale === "de" ? "Betreff" : "Subject");
    const lblMessage = ui("ui_offer_message", locale === "tr" ? "Mesaj" : locale === "de" ? "Nachricht" : "Message");

    const lblTerms = ui(
        "ui_offer_terms",
        locale === "tr"
            ? "Şartları ve gizlilik politikasını kabul ediyorum."
            : locale === "de"
                ? "Ich akzeptiere die Bedingungen und die Datenschutzerklärung."
                : "I accept the terms and privacy policy."
    );

    const lblMarketing = ui(
        "ui_offer_marketing",
        locale === "tr"
            ? "Kampanya ve bilgilendirme e-postaları almak istiyorum."
            : locale === "de"
                ? "Ich möchte Marketing-/Info-E-Mails erhalten."
                : "I want to receive marketing/info emails."
    );

    const successTitle = ui(
        "ui_offer_success_title",
        locale === "tr" ? "Talebiniz alındı" : locale === "de" ? "Anfrage erhalten" : "Request received"
    );
    const successDesc = ui(
        "ui_offer_success_desc",
        locale === "tr"
            ? "En kısa sürede sizinle iletişime geçeceğiz."
            : locale === "de"
                ? "Wir melden uns so schnell wie möglich."
                : "We’ll contact you as soon as possible."
    );

    const errGeneric = ui(
        "ui_offer_error_generic",
        locale === "tr" ? "Bir hata oluştu. Lütfen tekrar deneyin." : locale === "de" ? "Ein Fehler ist aufgetreten. Bitte erneut versuchen." : "Something went wrong. Please try again."
    );

    const [createOffer, { isLoading }] = useCreateOfferPublicMutation();

    const firstInputRef = useRef<HTMLInputElement | null>(null);

    const [done, setDone] = useState<OfferRow | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [form, setForm] = useState({
        customer_name: "",
        company_name: "",
        email: "",
        phone: "",
        subject: defaultSubject ?? "",
        message: defaultMessage ?? "",
        consent_terms: true,
        consent_marketing: false,
    });

    // Modal açılınca reset + focus
    useEffect(() => {
        if (!open) return;
        setErrorMsg(null);
        setDone(null);
        setForm((s) => ({
            ...s,
            subject: defaultSubject ?? s.subject,
            message: defaultMessage ?? s.message,
        }));

        const t = window.setTimeout(() => firstInputRef.current?.focus(), 50);

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);

        // body scroll lock
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            window.clearTimeout(t);
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [open, onClose, defaultSubject, defaultMessage]);

    const canSubmit = useMemo(() => {
        if (done) return false;
        if (!form.customer_name.trim()) return false;
        if (!form.email.trim()) return false;
        if (!form.consent_terms) return false;
        return true;
    }, [form, done]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setErrorMsg(null);

        const payload: OfferRequestPublic = {
            locale,
            customer_name: form.customer_name.trim(),
            company_name: form.company_name.trim() || null,
            email: form.email.trim(),
            phone: form.phone.trim() || null,
            subject: form.subject.trim() || null,
            message: form.message.trim() || null,
            product_id: productId ?? null,
            consent_terms: toBoolLike(!!form.consent_terms),
            consent_marketing: toBoolLike(!!form.consent_marketing),
            form_data: {
                source: "hero_modal",
            },
        };

        try {
            const res = await createOffer(payload).unwrap();
            setDone(res);
        } catch (err: any) {
            // RTK error shape değişebilir; generic fallback
            const msg =
                err?.data?.error?.message ||
                err?.data?.message ||
                errGeneric;
            setErrorMsg(String(msg));
        }
    };

    if (!open) return null;

    return (
        <Backdrop role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
            <Sheet onClick={(e) => e.stopPropagation()}>
                <Head>
                    <div>
                        <H>{done ? successTitle : title}</H>
                        <P>{done ? successDesc : subtitle}</P>
                    </div>
                    <Close type="button" onClick={onClose} aria-label="Close">
                        ✕
                    </Close>
                </Head>

                {done ? (
                    <SuccessBox>
                        <SuccessRow>
                            <b>ID</b>
                            <span>{done.id}</span>
                        </SuccessRow>
                        <SuccessRow>
                            <b>No</b>
                            <span>{done.offer_no ?? "-"}</span>
                        </SuccessRow>
                        <Actions>
                            <Btn type="button" onClick={onClose}>
                                OK
                            </Btn>
                        </Actions>
                    </SuccessBox>
                ) : (
                    <form onSubmit={submit}>
                        {errorMsg && <Error>{errorMsg}</Error>}

                        <Grid>
                            <Field>
                                <Label>{lblName} *</Label>
                                <Input
                                    ref={firstInputRef}
                                    value={form.customer_name}
                                    onChange={(e) => setForm((s) => ({ ...s, customer_name: e.target.value }))}
                                    autoComplete="name"
                                />
                            </Field>

                            <Field>
                                <Label>{lblCompany}</Label>
                                <Input
                                    value={form.company_name}
                                    onChange={(e) => setForm((s) => ({ ...s, company_name: e.target.value }))}
                                    autoComplete="organization"
                                />
                            </Field>

                            <Field>
                                <Label>{lblEmail} *</Label>
                                <Input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                                    autoComplete="email"
                                />
                            </Field>

                            <Field>
                                <Label>{lblPhone}</Label>
                                <Input
                                    value={form.phone}
                                    onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                                    autoComplete="tel"
                                />
                            </Field>

                            <FieldFull>
                                <Label>{lblSubject}</Label>
                                <Input
                                    value={form.subject}
                                    onChange={(e) => setForm((s) => ({ ...s, subject: e.target.value }))}
                                />
                            </FieldFull>

                            <FieldFull>
                                <Label>{lblMessage}</Label>
                                <TextArea
                                    rows={5}
                                    value={form.message}
                                    onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))}
                                />
                            </FieldFull>

                            <FieldFull>
                                <Checks>
                                    <Check>
                                        <input
                                            type="checkbox"
                                            checked={form.consent_terms}
                                            onChange={(e) => setForm((s) => ({ ...s, consent_terms: e.target.checked }))}
                                        />
                                        <span>{lblTerms}</span>
                                    </Check>

                                    <Check>
                                        <input
                                            type="checkbox"
                                            checked={form.consent_marketing}
                                            onChange={(e) => setForm((s) => ({ ...s, consent_marketing: e.target.checked }))}
                                        />
                                        <span>{lblMarketing}</span>
                                    </Check>
                                </Checks>
                            </FieldFull>
                        </Grid>

                        <Actions>
                            <BtnGhost type="button" onClick={onClose}>
                                {cancelLabel}
                            </BtnGhost>

                            <Btn type="submit" disabled={!canSubmit || isLoading}>
                                {isLoading ? "..." : submitLabel}
                            </Btn>
                        </Actions>
                    </form>
                )}
            </Sheet>
        </Backdrop>
    );
}

/* ---------------- styles (classicTheme uyumlu) ---------------- */

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.overlayBackground};
  display: grid;
  place-items: center;
  z-index: ${({ theme }) => theme.zIndex.overlay};
  padding: ${({ theme }) => theme.spacings.lg};
`;

const Sheet = styled.div`
  width: min(680px, 96vw);
  background: ${({ theme }) => theme.cards.background};
  border: 1px solid ${({ theme }) => theme.cards.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.lg};
`;

const Head = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacings.md};
  margin-bottom: ${({ theme }) => theme.spacings.md};
`;

const H = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const P = styled.p`
  margin: ${({ theme }) => theme.spacings.xs} 0 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
`;

const Close = styled.button`
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacings.xs};
  border-radius: ${({ theme }) => theme.radii.md};

  &:hover {
    background: ${({ theme }) => theme.colors.hoverBackground};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacings.md};

  ${({ theme }) => theme.media.small} {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.xs};
`;

const FieldFull = styled(Field)`
  grid-column: 1 / -1;
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Input = styled.input`
  width: 100%;
  height: 42px;
  padding: 0 ${({ theme }) => theme.spacings.md};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.textPrimary};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.inputBorderFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: ${({ theme }) => theme.spacings.md};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.textPrimary};
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.inputBorderFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

const Checks = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const Check = styled.label`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacings.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};

  input {
    margin-top: 3px;
    accent-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacings.sm};
  margin-top: ${({ theme }) => theme.spacings.lg};
`;

const Btn = styled.button`
  height: 42px;
  padding: 0 ${({ theme }) => theme.spacings.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.buttons.primary.background};
  background: ${({ theme }) => theme.buttons.primary.background};
  color: ${({ theme }) => theme.buttons.primary.text};
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};
  transition: background ${({ theme }) => theme.transition.fast}, transform ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ theme }) => theme.buttons.primary.backgroundHover};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
    transform: none;
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

const BtnGhost = styled.button`
  height: 42px;
  padding: 0 ${({ theme }) => theme.spacings.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  background: transparent;
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.hoverBackground};
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

const Error = styled.div`
  margin-bottom: ${({ theme }) => theme.spacings.md};
  padding: ${({ theme }) => theme.spacings.md};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid rgba(220, 53, 69, 0.35);
  background: ${({ theme }) => theme.colors.dangerBg};
  color: ${({ theme }) => theme.colors.textOnDanger};
`;

const SuccessBox = styled.div`
  padding: ${({ theme }) => theme.spacings.md};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  background: ${({ theme }) => theme.colors.contentBackground};
`;

const SuccessRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacings.md};
  padding: ${({ theme }) => theme.spacings.sm} 0;
  color: ${({ theme }) => theme.colors.textSecondary};

  b {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;
