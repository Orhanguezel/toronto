'use client';
import styled from 'styled-components';
import { useState } from 'react';
import { Button } from '@/shared/ui/buttons/Button';

const Row = styled.div` display:grid; gap:8px; `;
const Input = styled.input` padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,.12); background:${({theme})=>theme.colors.surface}; color:inherit;`;

export default function MediaInput({ value, onChange, label = 'Görsel URL' }: { value?: string; onChange: (url: string) => void; label?: string }) {
  const [busy, setBusy] = useState(false);

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const sig = await fetch('/api/upload/cloudinary/sign', { method:'POST' }).then(r=>r.json());
      const fd = new FormData();
      fd.append('file', file);
      fd.append('api_key', sig.apiKey);
      fd.append('timestamp', String(sig.timestamp));
      fd.append('folder', sig.folder);
      fd.append('signature', sig.signature);
      const url = `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`;
      const up = await fetch(url, { method:'POST', body: fd }).then(r=>r.json());
      if (!up.secure_url) throw new Error('upload failed');
      onChange(up.secure_url);
    } finally { setBusy(false); }
  };

  return (
    <Row>
      <label>{label}</label>
      <Input value={value || ''} onChange={(e)=>onChange(e.target.value)} placeholder="https://…" />
      <input type="file" accept="image/*" onChange={e=>{ const f=e.target.files?.[0]; if (f) upload(f); }} />
      {busy ? <small>Yükleniyor…</small> : null}
      {value ? <img src={value} alt="preview" style={{ maxHeight: 64, borderRadius: 8 }} /> : null}
    </Row>
  );
}