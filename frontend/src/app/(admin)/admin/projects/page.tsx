'use client';

import {
  useListProjectsAdminQuery,
  useCreateProjectAdminMutation,
  useRemoveProjectAdminMutation,
} from '@/integrations/endpoints/admin/projects.admin.endpoints';
import styled from 'styled-components';
import { useState } from 'react';
import { Button } from '@/shared/ui/buttons/Button';
import { toast } from 'sonner';
import { revalidateTags } from '@/lib/revalidate';

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  th, td { padding: 10px; border-bottom: 1px solid rgba(255,255,255,.08); }
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
  transition: border ${({ theme }) => theme.transition.fast}, background ${({ theme }) => theme.transition.fast};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.inputs.borderFocus};
    background: ${({ theme }) => theme.colors.inputBackgroundFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

type FormState = {
  slug: string;
  title: string;
  price_from: string;   // input için string, gönderirken number'a çevireceğiz
  cover_url: string;
};

export default function ProjectsAdminPage() {
  const { data } = useListProjectsAdminQuery({ page: 1, pageSize: 50 });
  const [createProject, { isLoading: creating }] = useCreateProjectAdminMutation();
  const [removeProject, { isLoading: removing }] = useRemoveProjectAdminMutation();

  const [form, setForm] = useState<FormState>({
    slug: '',
    title: '',
    price_from: '',
    cover_url: '',
  });

  const submit = async () => {
    try {
      const price = form.price_from.trim() === '' ? undefined : Number(form.price_from);
      await createProject({
        slug: form.slug || undefined,
        title: form.title || undefined,
        cover_url: form.cover_url || undefined,
        price_from: Number.isFinite(price!) ? price : undefined,
      }).unwrap();

      toast.success('Eklendi');
      setForm({ slug: '', title: '', price_from: '', cover_url: '' });
      await revalidateTags(['Projects', 'projects']); // hem RTK tag hem cache etiketi varsa
    } catch (e) {
      toast.error('Kaydedilemedi');
    }
  };

  const onRemove = async (id: string) => {
    try {
      await removeProject({ id }).unwrap();
      toast.success('Silindi');
      await revalidateTags(['Projects', 'projects']);
    } catch {
      toast.error('Silinemedi');
    }
  };

  return (
    <div>
      <h1>Projects</h1>

      <Row>
        <Input
          placeholder="slug"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
        />
        <Input
          placeholder="title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <Input
          placeholder="price_from"
          inputMode="numeric"
          value={form.price_from}
          onChange={(e) => setForm({ ...form, price_from: e.target.value })}
        />
        <Input
          placeholder="cover_url"
          value={form.cover_url}
          onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
        />
        <Button onClick={submit} disabled={creating}>Ekle</Button>
      </Row>

      <div style={{ height: 16 }} />

      <Table>
        <thead>
          <tr>
            <th>Kapak</th>
            <th>Başlık</th>
            <th>Slug</th>
            <th>Fiyat</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {(data?.items ?? []).map((p) => (
            <tr key={p.id}>
              <td>{p.cover_url ? <img src={p.cover_url} alt="" height={28} /> : null}</td>
              <td>{p.title}</td>
              <td>{p.slug}</td>
              <td>{typeof p.price_from === 'number' ? p.price_from.toLocaleString() : ''}</td>
              <td>
                <Button
                  variant="danger"
                  onClick={() => onRemove(p.id)}
                  disabled={removing}
                >
                  Sil
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
