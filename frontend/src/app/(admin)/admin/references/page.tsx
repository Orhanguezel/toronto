'use client';
import { useReferencesList, useCreateReference, useUpdateReference, useRemoveReference } from '@/integrations/endpoints/admin/references.endpoints';
import { useState } from 'react';
import styled from 'styled-components';
import { Button } from '@/shared/ui/buttons/Button';
import { toast } from 'sonner';
import { revalidateTags } from '@/lib/revalidate';

const Table = styled.table` width:100%; border-collapse: collapse; th,td{ padding:10px; border-bottom:1px solid rgba(255,255,255,.08); }`;
const Row = styled.div` display:grid; gap:10px; max-width:560px;`;
const Input = styled.input` padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,.12); background:${({ theme }) => theme.colors.surface}; color:inherit;`;

export default function ReferencesAdminPage() {
  const { data } = useReferencesList({});
  const [createRef] = useCreateReference();
  const [updateRef] = useUpdateReference();
  const [removeRef] = useRemoveReference();
  const [form, setForm] = useState({ name: '', logo_url: '', url: '', order: 0 });

  const submit = async () => {
    try {
      await createRef({ ...form, order: Number(form.order) || 0 }).unwrap();
      toast.success('Eklendi');
      setForm({ name: '', logo_url: '', url: '', order: 0 });
      await revalidateTags(['references']);
    } catch { toast.error('Kaydedilemedi'); }
  };

  return (
    <div>
      <h1>References</h1>
      <Row>
        <Input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <Input placeholder="Logo URL" value={form.logo_url} onChange={e => setForm({ ...form, logo_url: e.target.value })} />
        <Input placeholder="Link (opsiyonel)" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
        <Input placeholder="Order" value={String(form.order)} onChange={e => setForm({ ...form, order: e.target.value as any })} />
        <Button onClick={submit}>Ekle</Button>
      </Row>

      <div style={{ height: 16 }} />
      <Table>
        <thead><tr><th>Logo</th><th>Ad</th><th>URL</th><th>Sıra</th><th></th></tr></thead>
        <tbody>
          {(data || []).map((x) => (
            <tr key={x.id}>
              <td><img src={x.logo_url} alt="" height={28} /></td>
              <td>{x.name}</td><td>{x.url}</td><td>{x.order}</td>
              <td style={{ display: 'flex', gap: 8 }}>
                <Button variant="ghost" onClick={async () => { await updateRef({ id: x.id, order: (x.order || 0) + 1 }).unwrap(); toast.success('Güncellendi'); await revalidateTags(['references']); }}>+order</Button>
                <Button variant="danger" onClick={async () => { await removeRef({ id: x.id }).unwrap(); toast.success('Silindi'); await revalidateTags(['references']); }}>Sil</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}