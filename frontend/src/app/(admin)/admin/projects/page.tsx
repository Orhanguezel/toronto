'use client';
import { useProjectsList, useCreateProject, useRemoveProject } from '@/integrations/endpoints/admin/projects.admin.endpoints';
import styled from 'styled-components';
import { useState } from 'react';
import { Button } from '@/shared/ui/buttons/Button';
import { toast } from 'sonner';
import { revalidateTags } from '@/lib/revalidate';

const Table = styled.table` width:100%; border-collapse: collapse; th,td{ padding:10px; border-bottom:1px solid rgba(255,255,255,.08); }`;
const Row = styled.div` display:grid; gap:10px; max-width:720px; grid-template-columns: repeat(3, 1fr);`;
const Input = styled.input` padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,.12); background:${({ theme }) => theme.colors.surface}; color:inherit;`;

export default function ProjectsAdminPage() {
  const { data } = useProjectsList({ page: 1, pageSize: 50 });
  const [create] = useCreateProject();
  const [remove] = useRemoveProject();
  const [form, setForm] = useState({ slug: '', title: '', price_from: '' as any, cover_url: '' });

  const submit = async () => {
    try {
      await create({ ...form, price_from: form.price_from ? Number(form.price_from) : undefined }).unwrap();
      toast.success('Eklendi');
      setForm({ slug: '', title: '', price_from: '' as any, cover_url: '' });
      await revalidateTags(['projects']);
    } catch { toast.error('Kaydedilemedi'); }
  };

  return (
    <div>
      <h1>Projects</h1>
      <Row>
        <Input placeholder="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        <Input placeholder="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Input placeholder="price_from" value={form.price_from} onChange={(e) => setForm({ ...form, price_from: e.target.value as any })} />
        <Input placeholder="cover_url" value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} />
        <Button onClick={submit}>Ekle</Button>
      </Row>

      <div style={{ height: 16 }} />
      <Table>
        <thead><tr><th>Kapak</th><th>Başlık</th><th>Slug</th><th>Fiyat</th><th></th></tr></thead>
        <tbody>
          {(data?.items || []).map((p: any) => (
            <tr key={p.id}>
              <td>{p.cover_url ? <img src={p.cover_url} alt="" height={28} /> : null}</td>
              <td>{p.title}</td><td>{p.slug}</td><td>{p.price_from?.toLocaleString?.()}</td>
              <td><Button variant="danger" onClick={async () => { await remove({ id: p.id }).unwrap(); toast.success('Silindi'); await revalidateTags(['projects']); }}>Sil</Button></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}