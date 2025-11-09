'use client';

import { useAdminSettings, useUpdateAdminSettings } from '@/integrations/endpoints/admin/siteSettings.endpoints';
import styled, { css, type DefaultTheme } from 'styled-components';
import { Button } from '@/shared/ui/buttons/Button';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { revalidateTags } from '@/lib/revalidate';

const Grid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 1fr;
  max-width: 880px;
  width: 100%;

  /* theme tipi bazı projelerde burada da 'any' uyarısı verebiliyor → anot ettik */
  ${({ theme }: { theme: DefaultTheme }) => theme.media.small} {
    grid-template-columns: 1fr;
  }
`;

/* 🔧 ÖNEMLİ: BaseField artık 'css' helper ile tipli bir fragment */
const baseField = css`
  width: 100%;
  padding: 10px 12px;
  border-radius: var(--radius-lg, 12px);
  border: 1px solid ${({ theme }) => theme.inputs.border};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};

  ::placeholder {
    color: ${({ theme }) => theme.inputs.placeholder || theme.colors.placeholder};
  }

  transition:
    border   ${({ theme }) => theme.transition.fast},
    background ${({ theme }) => theme.transition.fast},
    box-shadow ${({ theme }) => theme.transition.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.inputs.borderFocus};
    background: ${({ theme }) => theme.colors.inputBackgroundFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

const Input = styled.input`${baseField}`;
const Area  = styled.textarea`${baseField}; min-height: 120px; resize: vertical;`;

export default function SiteSettingsPage() {
  const { data } = useAdminSettings();
  const [update, { isLoading: saving }] = useUpdateAdminSettings();

  const [phones, setPhones]   = useState('');
  const [email, setEmail]     = useState('');
  const [address, setAddress] = useState('');
  const [whats, setWhats]     = useState('');
  const [socials, setSocials] = useState({ instagram: '', facebook: '', youtube: '', linkedin: '', x: '' });
  const [hours, setHours]     = useState([{ days: 'Hafta içi', open: '09:00', close: '18:00' }]);

  useEffect(() => {
    if (!data) return;
    setPhones((data.contact_info?.phones || []).join(', '));
    setEmail(data.contact_info?.email || '');
    setAddress(data.contact_info?.address || '');
    setWhats(data.contact_info?.whatsappNumber || '');
    setSocials({
      instagram: data.socials?.instagram || '',
      facebook : data.socials?.facebook  || '',
      youtube  : data.socials?.youtube   || '',
      linkedin : data.socials?.linkedin  || '',
      x        : data.socials?.x         || '',
    });
    setHours(data.businessHours?.length ? data.businessHours : [{ days: 'Hafta içi', open: '09:00', close: '18:00' }]);
  }, [data]);

  const save = async () => {
    try {
      await update({
        contact_info: {
          phones: phones.split(',').map(s => s.trim()).filter(Boolean),
          email,
          address,
          whatsappNumber: whats,
        },
        socials,
        businessHours: hours,
      }).unwrap();

      toast.success('Kaydedildi');
      await revalidateTags(['site_settings']);
    } catch {
      toast.error('Kaydedilemedi');
    }
  };

  return (
    <div>
      <h1>Site Settings</h1>

      <Grid>
        <Input placeholder="Telefonlar (virgülle)" value={phones} onChange={e => setPhones(e.target.value)} />
        <Input type="email" placeholder="E-posta" value={email} onChange={e => setEmail(e.target.value)} />
        <Area placeholder="Adres" value={address} onChange={e => setAddress(e.target.value)} />
        <Input placeholder="WhatsApp" value={whats} onChange={e => setWhats(e.target.value)} />

        <Input type="url" placeholder="Instagram" value={socials.instagram} onChange={e => setSocials({ ...socials, instagram: e.target.value })} />
        <Input type="url" placeholder="Facebook"  value={socials.facebook}  onChange={e => setSocials({ ...socials, facebook : e.target.value })} />
        <Input type="url" placeholder="YouTube"   value={socials.youtube}   onChange={e => setSocials({ ...socials, youtube  : e.target.value })} />
        <Input type="url" placeholder="LinkedIn"  value={socials.linkedin}  onChange={e => setSocials({ ...socials, linkedin : e.target.value })} />
        <Input type="url" placeholder="X (Twitter)" value={socials.x} onChange={e => setSocials({ ...socials, x: e.target.value })} />
      </Grid>

      <div style={{ height: 12 }} />

      <h3>Çalışma Saatleri</h3>
      {hours.map((h, i) => (
        <Grid key={i} style={{ gridTemplateColumns: '1fr 120px 120px' }}>
          <Input placeholder="Günler" value={h.days}
            onChange={e => { const arr = [...hours]; arr[i] = { ...h, days: e.target.value }; setHours(arr); }} />
          <Input placeholder="Açılış" value={h.open}
            onChange={e => { const arr = [...hours]; arr[i] = { ...h, open: e.target.value }; setHours(arr); }} />
          <Input placeholder="Kapanış" value={h.close}
            onChange={e => { const arr = [...hours]; arr[i] = { ...h, close: e.target.value }; setHours(arr); }} />
        </Grid>
      ))}

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <Button variant="ghost" onClick={() => setHours(h => [...h, { days: '', open: '', close: '' }])}>Satır ekle</Button>
        <Button onClick={save} disabled={saving}>{saving ? 'Kaydediliyor…' : 'Kaydet'}</Button>
      </div>
    </div>
  );
}
