'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { Button } from '@/shared/ui/buttons/Button';
import { toast } from 'sonner';
import { useCreateAdminSiteSettingMutation } from '@/integrations/endpoints/admin/siteSettings.endpoints';

type Locale = 'tr' | 'en' | 'de';
const LOCALES: Locale[] = ['tr', 'en', 'de'];
const LBL: Record<Locale, string> = { tr: 'Türkçe', en: 'English', de: 'Deutsch' };

const Field = styled.input`
  width: 100%; padding: 10px 12px; border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.inputs.border};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
`;
const JsonArea = styled.textarea`
  width: 100%; min-height: 140px; resize: vertical; padding: 10px 12px; border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.inputs.border};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
`;
const Row = styled.div`display: grid; gap: 10px; grid-template-columns: 1fr 140px; align-items: center;`;

function tryParseJson(s: string) {
  try { return { ok: true as const, val: JSON.parse(s) }; }
  catch (e: any) { return { ok: false as const, err: e?.message || 'JSON parse hatası' }; }
}

function readRtqError(err: any): string {
  if (err?.data?.message) return String(err.data.message);
  if (typeof err?.data === 'string') return err.data;
  if (typeof err?.error === 'string') return err.error;
  if (typeof err?.message === 'string') return err.message;
  return 'İşlem başarısız';
}

export default function NewSettingForm({
  initialLocale,
  onCreated,
  onCancel,
}: {
  initialLocale: Locale;
  onCreated?: () => void;
  onCancel?: () => void;
}) {
  const [createRow, { isLoading }] = useCreateAdminSiteSettingMutation();

  const [keyText, setKeyText] = useState('');
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [valueText, setValueText] = useState('{\n  \n}');

  const submit = async () => {
    if (!keyText.trim()) { toast.error('Key boş olamaz'); return; }
    const parsed = tryParseJson(valueText);
    if (!parsed.ok) { toast.error(parsed.err); return; }

    await toast.promise(
      createRow({ key: keyText.trim(), value: parsed.val, locale }).unwrap(),
      {
        loading: 'Kaydediliyor…',
        success: 'Ayar eklendi',
        error: (e) => readRtqError(e),
      }
    );

    onCreated?.();
  };

  return (
    <div style={{ border: '1px solid var(--border,#2d3543)', borderRadius: 12, padding: 12, marginBottom: 12 }}>
      <h3 style={{ margin: '0 0 8px' }}>Yeni Ayar</h3>
      <Row>
        <Field placeholder="key (örn: contact_info, socials)" value={keyText} onChange={(e)=>setKeyText(e.target.value)} />
        <select value={locale} onChange={(e)=>setLocale(e.target.value as Locale)}
          style={{ padding: 10, borderRadius: 10, border: '1px solid var(--border,#2d3543)' }}>
          {LOCALES.map(l => <option key={l} value={l}>{LBL[l]}</option>)}
        </select>
      </Row>
      <div style={{ marginTop: 8 }}>
        <JsonArea value={valueText} onChange={(e)=>setValueText(e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <Button onClick={submit} disabled={isLoading}>Kaydet</Button>
        <Button variant="ghost" onClick={onCancel} disabled={isLoading}>Kapat</Button>
      </div>
    </div>
  );
}
