'use client';
/* eslint-disable @next/next/no-img-element */
import styled from 'styled-components';
import { useState } from 'react';

const Row = styled.div`
  display: grid;
  gap: 8px;
`;

const Input = styled.input`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  transition: ${({ theme }) => theme.transition.fast};

  &::placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.inputBorderFocus};
    outline: none;
    /* hafif vurgulu odak halkası */
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }

  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
  }
`;

const FileInput = styled.input`
  &[type="file"] {
    display: block;
  }
`;

const Preview = styled.img`
  max-height: 64px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

export default function MediaInput({
  value,
  onChange,
  label = 'Görsel URL',
}: {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const sig = await fetch('/api/upload/cloudinary/sign', { method: 'POST' }).then((r) => r.json());
      const fd = new FormData();
      fd.append('file', file);
      fd.append('api_key', sig.apiKey);
      fd.append('timestamp', String(sig.timestamp));
      fd.append('folder', sig.folder);
      fd.append('signature', sig.signature);

      const url = `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`;
      const up = await fetch(url, { method: 'POST', body: fd }).then((r) => r.json());
      if (!up.secure_url) throw new Error('upload failed');
      onChange(up.secure_url);
    } finally {
      setBusy(false);
    }
  };

  const id = 'media-input-' + label.replace(/\s+/g, '-').toLowerCase();

  return (
    <Row>
      <label htmlFor={id}>{label}</label>
      <Input
        id={id}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://…"
        disabled={busy}
        inputMode="url"
      />
      <FileInput
        type="file"
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
        }}
        disabled={busy}
      />
      {busy ? <small>Yükleniyor…</small> : null}
      {value ? <Preview src={value} alt="preview" /> : null}
    </Row>
  );
}
