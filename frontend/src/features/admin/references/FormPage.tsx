'use client';
import * as React from 'react';
import styled from 'styled-components';
import { Button } from '@/shared/ui/buttons/Button';
import { toast } from 'sonner';
import { skipToken } from '@reduxjs/toolkit/query'; // ✅ skip için
import {
  useGetReferenceAdminByIdQuery,
  useCreateReferenceAdminMutation,
  useUpdateReferenceAdminMutation,
} from '@/integrations/endpoints/admin/references_admin.endpoints';
import type { UpsertReferenceBody, PatchReferenceBody } from '@/integrations/endpoints/types/references';

const Grid = styled.div`display:grid;grid-template-columns:1fr;gap:12px;max-width:880px;`;
const Row = styled.div`display:grid;grid-template-columns:repeat(3,1fr);gap:12px;`;
const Input = styled.input`
  padding:10px 12px;border-radius:${({theme})=>theme.radii.lg};
  border:1px solid ${({theme})=>theme.inputs.border};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  &::placeholder{color:${({theme})=>theme.inputs.placeholder||theme.colors.placeholder}};
  &:focus{outline:none;border-color:${({theme})=>theme.inputs.borderFocus}};
`;
const Textarea = styled.textarea`
  padding:10px 12px;min-height:140px;border-radius:${({theme})=>theme.radii.lg};
  border:1px solid ${({theme})=>theme.inputs.border};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
  resize:vertical; &:focus{outline:none;border-color:${({theme})=>theme.inputs.borderFocus}};
`;
const Check = styled.input.attrs({ type: 'checkbox' })`width:18px;height:18px;`;

type Props = { id?: string; onSaved?: (id: string) => void };

const b01 = (b: boolean) => (b ? 1 : 0) as 0 | 1;

function slugify(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
    .replace(/Ğ/g,'g').replace(/Ü/g,'u').replace(/Ş/g,'s').replace(/İ/g,'i').replace(/Ö/g,'o').replace(/Ç/g,'c')
    .toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}
function packContent(val: string) {
  try {
    const obj = JSON.parse(val);
    if (obj && typeof obj === 'object' && typeof (obj as any).html === 'string') return val;
  } catch {}
  return JSON.stringify({ html: val || '' });
}

export default function ReferenceFormPage({ id, onSaved }: Props) {
  const isEdit = !!id;

  // ✅ skipToken ile hiçbir render’da hook sırası değişmez
  const { data } = useGetReferenceAdminByIdQuery(id ? { id } : (skipToken as any));

  const [createRef, { isLoading: creating }] = useCreateReferenceAdminMutation();
  const [updateRef, { isLoading: updating }] = useUpdateReferenceAdminMutation();

  const [title, setTitle] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [websiteUrl, setWebsiteUrl] = React.useState('');
  const [featuredImage, setFeaturedImage] = React.useState('');
  const [displayOrder, setDisplayOrder] = React.useState('0');
  const [isPublished, setIsPublished] = React.useState(true);
  const [isFeatured, setIsFeatured] = React.useState(false);
  const [content, setContent] = React.useState('<p></p>');
  const [metaTitle, setMetaTitle] = React.useState('');
  const [metaDesc, setMetaDesc] = React.useState('');

  React.useEffect(() => {
    if (!data) return;
    setTitle(data.title || '');
    setSlug(data.slug || '');
    setWebsiteUrl(data.website_url || '');
    setFeaturedImage(data.featured_image || '');
    setDisplayOrder(String(data.display_order ?? 0));
    setIsPublished(!!data.is_published);
    setIsFeatured(!!data.is_featured);
    setContent(() => {
      try {
        const j = JSON.parse(data.content || '""');
        return j && typeof j === 'object' && typeof (j as any).html === 'string' ? (j as any).html : (data.content || '<p></p>');
      } catch { return data.content || '<p></p>'; }
    });
    setMetaTitle(data.meta_title || '');
    setMetaDesc(data.meta_description || '');
  }, [data]);

  React.useEffect(() => {
    if (!isEdit && !slug.trim()) setSlug(slugify(title));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  const onSubmit = async () => {
    try {
      const orderNum = displayOrder === '' ? 0 : Number(displayOrder);
      const common: Partial<UpsertReferenceBody> = {
        website_url: websiteUrl.trim() || null,
        featured_image: featuredImage.trim() || null,
        display_order: Number.isFinite(orderNum) ? orderNum : 0,
        is_published: b01(isPublished),
        is_featured: b01(isFeatured),
        meta_title: metaTitle.trim() || null,
        meta_description: metaDesc.trim() || null,
      };

      if (!isEdit) {
        const body: UpsertReferenceBody = {
          title: title.trim(),
          slug: slug.trim() || slugify(title),
          content: packContent(content),
          ...common,
        };
        const res = await createRef({ body }).unwrap();
        toast.success('Oluşturuldu');
        onSaved?.(res.id);
      } else {
        const patch: PatchReferenceBody = {
          title: title.trim(),
          slug: slug.trim() || slugify(title),
          content: packContent(content),
          ...common,
        };
        await updateRef({ id: id!, body: patch }).unwrap();
        toast.success('Güncellendi');
        onSaved?.(id!);
      }
    } catch (e: any) {
      toast.error(e?.data?.error?.message === 'slug_already_exists' ? 'Slug zaten var' : 'Kaydedilemedi');
    }
  };

  return (
    <div>
      <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:8 }}>
        <h2 style={{ marginRight:'auto' }}>{isEdit ? 'Referans Düzenle' : 'Yeni Referans'}</h2>
      </div>

      <Grid>
        <Input placeholder="Title *" value={title} onChange={e=>setTitle(e.target.value)} />
        <Input placeholder="slug *" value={slug} onChange={e=>setSlug(e.target.value)} />
        <Row>
          <Input placeholder="Website URL" value={websiteUrl} onChange={e=>setWebsiteUrl(e.target.value)} />
          <Input placeholder="Featured Image URL" value={featuredImage} onChange={e=>setFeaturedImage(e.target.value)} />
          <Input placeholder="Display Order" inputMode="numeric" value={displayOrder} onChange={e=>setDisplayOrder(e.target.value)} />
        </Row>

        <label style={{ display:'flex', gap:8, alignItems:'center' }}>
          <Check checked={isPublished} onChange={e=>setIsPublished(e.target.checked)} />
          <span>Published</span>
        </label>
        <label style={{ display:'flex', gap:8, alignItems:'center' }}>
          <Check checked={isFeatured} onChange={e=>setIsFeatured(e.target.checked)} />
          <span>Featured</span>
        </label>

        <Textarea
          placeholder='Content (HTML). Düz html yaz; backend {"html": "..."} formatına paketler.'
          value={content}
          onChange={e=>setContent(e.target.value)}
        />

        <Input placeholder="Meta Title" value={metaTitle} onChange={e=>setMetaTitle(e.target.value)} />
        <Input placeholder="Meta Description" value={metaDesc} onChange={e=>setMetaDesc(e.target.value)} />

        <div style={{ display:'flex', gap:12 }}>
          <Button onClick={onSubmit} disabled={creating || updating}>{isEdit ? 'Kaydet' : 'Oluştur'}</Button>
        </div>
      </Grid>
    </div>
  );
}
