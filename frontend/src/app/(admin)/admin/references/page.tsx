'use client';

import {
  useReferencesList,
  useCreateReference,
  useUpdateReference,
  useRemoveReference,
} from '@/integrations/endpoints/admin/references.endpoints';
import { useState } from 'react';
import styled from 'styled-components';
import { Button } from '@/shared/ui/buttons/Button';
import { toast } from 'sonner';
import { revalidateTags } from '@/lib/revalidate';

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead th {
    text-align: left;
    padding: 10px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
    background: ${({ theme }) => theme.colors.tableHeader};
    font-weight: ${({ theme }) => theme.fontWeights.medium};
  }

  tbody td {
    padding: 10px;
    border-bottom: 1px solid rgba(255,255,255,.08);
    vertical-align: middle;
  }
`;

const Row = styled.div`
  display: grid;
  gap: 10px;
  max-width: 920px;
  grid-template-columns: repeat(5, minmax(140px, 1fr));
  align-items: center;
`;

const Input = styled.input`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.inputs.border};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  ::placeholder { color: ${({ theme }) => theme.inputs.placeholder || theme.colors.placeholder}; }
  transition: border ${({ theme }) => theme.transition.fast}, background ${({ theme }) => theme.transition.fast}, box-shadow ${({ theme }) => theme.transition.fast};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.inputs.borderFocus};
    background: ${({ theme }) => theme.colors.inputBackgroundFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

export default function ReferencesAdminPage() {
  const { data } = useReferencesList({});
  const [createRef, { isLoading: creating }] = useCreateReference();
  const [updateRef, { isLoading: updating }] = useUpdateReference();
  const [removeRef, { isLoading: removing }] = useRemoveReference();

  const [form, setForm] = useState({ name: '', logo_url: '', url: '', order: '' as any });

  const submit = async () => {
    try {
      const orderNum = form.order === '' ? 0 : Number(form.order);
      await createRef({ ...form, order: Number.isFinite(orderNum) ? orderNum : 0 }).unwrap();
      toast.success('Eklendi');
      setForm({ name: '', logo_url: '', url: '', order: '' as any });
      await revalidateTags(['References', 'references']);
    } catch {
      toast.error('Kaydedilemedi');
    }
  };

  const bumpOrder = async (id: string, current?: number) => {
    try {
      await updateRef({ id, order: (current || 0) + 1 }).unwrap();
      toast.success('Güncellendi');
      await revalidateTags(['References', 'references']);
    } catch {
      toast.error('Güncellenemedi');
    }
  };

  const remove = async (id: string) => {
    try {
      await removeRef({ id }).unwrap();
      toast.success('Silindi');
      await revalidateTags(['References', 'references']);
    } catch {
      toast.error('Silinemedi');
    }
  };

  const items = (data || []).slice().sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div>
      <h1>References</h1>

      <Row>
        <Input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          placeholder="Logo URL"
          value={form.logo_url}
          onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
        />
        <Input
          placeholder="Link (opsiyonel)"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
        />
        <Input
          placeholder="Order"
          inputMode="numeric"
          value={String(form.order)}
          onChange={(e) => setForm({ ...form, order: e.target.value as any })}
        />
        <Button onClick={submit} disabled={creating}>Ekle</Button>
      </Row>

      <div style={{ height: 16 }} />

      <Table>
        <thead>
          <tr>
            <th>Logo</th>
            <th>Ad</th>
            <th>URL</th>
            <th>Sıra</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((x: any) => (
            <tr key={x.id}>
              <td style={{ width: 120 }}>
                {x.logo_url ? <img src={x.logo_url} alt={x.name || ''} height={28} /> : <span style={{ opacity: .6 }}>—</span>}
              </td>
              <td>{x.name}</td>
              <td style={{ maxWidth: 360, overflowWrap: 'anywhere' }}>{x.url || <span style={{ opacity: .6 }}>—</span>}</td>
              <td style={{ width: 90 }}>{x.order ?? 0}</td>
              <td style={{ display: 'flex', gap: 8 }}>
                <Button variant="ghost" onClick={() => bumpOrder(x.id, x.order)} disabled={updating}>+order</Button>
                <Button variant="danger" onClick={() => remove(x.id)} disabled={removing}>Sil</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
