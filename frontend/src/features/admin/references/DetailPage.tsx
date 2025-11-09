'use client';
import * as React from 'react';
import styled from 'styled-components';
import { Button } from '@/shared/ui/buttons/Button';
import { toast } from 'sonner';
import {
  useGetReferenceAdminByIdQuery,
  useListReferenceImagesAdminQuery,
  useCreateReferenceImageAdminMutation,
  useUpdateReferenceImageAdminMutation,
  useRemoveReferenceImageAdminMutation,
} from '@/integrations/endpoints/admin/references_admin.endpoints';

const Grid = styled.div`display:grid;gap:16px;grid-template-columns:1.2fr 2fr;align-items:start;`;
const Card = styled.div`
  border:1px solid ${({theme})=>theme.colors.borderLight};
  border-radius:${({theme})=>theme.radii.lg};
  padding:12px;background:${({theme})=>theme.cards.background};
`;
const Input = styled.input`
  width:100%;padding:8px 10px;border-radius:${({theme})=>theme.radii.lg};
  border:1px solid ${({theme})=>theme.inputs.border};
  background:${({theme})=>theme.inputs.background};color:${({theme})=>theme.inputs.text};
`;

type Props = { id: string };

export default function ReferenceDetailPage({ id }: Props) {
  const { data } = useGetReferenceAdminByIdQuery({ id });
  const { data: images, refetch } = useListReferenceImagesAdminQuery({ referenceId: id });

  const [createImg, { isLoading: creating }] = useCreateReferenceImageAdminMutation();
  const [updateImg, { isLoading: updating }] = useUpdateReferenceImageAdminMutation();
  const [removeImg, { isLoading: removing }] = useRemoveReferenceImageAdminMutation();

  const [assetId, setAssetId] = React.useState('');
  const [alt, setAlt] = React.useState('');
  const [caption, setCaption] = React.useState('');
  const [displayOrder, setDisplayOrder] = React.useState('0');

  const addImage = async () => {
    try {
      await createImg({
        referenceId: id,
        body: {
          asset_id: assetId.trim(),
          image_url: null,
          display_order: Number(displayOrder) || 0,
          is_active: 1,
          alt: alt.trim() || null,
          caption: caption.trim() || null,
        },
      }).unwrap();
      setAssetId(''); setAlt(''); setCaption(''); setDisplayOrder('0');
      toast.success('Görsel eklendi');
      await refetch();
    } catch { toast.error('Görsel eklenemedi'); }
  };

  const saveImageInfo = async (imageId: string, patch: { alt?: string|null; caption?: string|null; display_order?: number }) => {
    try {
      await updateImg({ referenceId: id, imageId, body: patch }).unwrap();
      await refetch();
    } catch { toast.error('Görsel güncellenemedi'); }
  };

  const delImage = async (imageId: string) => {
    try {
      await removeImg({ referenceId: id, imageId }).unwrap();
      toast.success('Görsel silindi');
      await refetch();
    } catch { toast.error('Görsel silinemedi'); }
  };

  const list = Array.isArray(images) ? images : [];

  return (
    <div>
      <h2>Reference Detail</h2>
      {!data ? <div style={{ opacity:.7 }}>Yükleniyor…</div> : (
        <Grid>
          <Card>
            <h3>Özet</h3>
            <div><strong>Başlık:</strong> {data.title || '—'}</div>
            <div><strong>Slug:</strong> {data.slug || '—'}</div>
            <div><strong>URL:</strong> {data.website_url || '—'}</div>
            <div><strong>Yayın:</strong> {data.is_published ? 'Yes' : 'No'}</div>
            <div><strong>Featured:</strong> {data.is_featured ? 'Yes' : 'No'}</div>
            <div><strong>Sıra:</strong> {data.display_order ?? 0}</div>
            <div style={{ marginTop: 8 }}>
              {data.featured_image_url_resolved
                ? <img src={data.featured_image_url_resolved} alt={data.featured_image_alt || data.title || ''} height={64} />
                : <span style={{ opacity:.6 }}>Kapak görseli yok</span>}
            </div>
          </Card>

          <Card>
            <h3>Galeri</h3>

            <div style={{ display:'grid', gap:8, gridTemplateColumns:'2fr 1fr 1fr 0.6fr auto' }}>
              <Input placeholder="asset_id" value={assetId} onChange={(e)=>setAssetId(e.target.value)} />
              <Input placeholder="alt" value={alt} onChange={(e)=>setAlt(e.target.value)} />
              <Input placeholder="caption" value={caption} onChange={(e)=>setCaption(e.target.value)} />
              <Input placeholder="order" inputMode="numeric" value={displayOrder} onChange={(e)=>setDisplayOrder(e.target.value)} />
              <Button onClick={addImage} disabled={creating}>Ekle</Button>
            </div>

            <div style={{ height:10 }} />

            {list.map((im:any)=>(
              <div key={im.id} style={{ display:'grid', gridTemplateColumns:'100px 1fr 1fr 80px auto', gap:8, alignItems:'center', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,.08)' }}>
                <div>
                  {im.image_url_resolved
                    ? <img src={im.image_url_resolved} alt={im.alt || ''} height={56} />
                    : <span style={{ opacity:.6 }}>—</span>}
                </div>
                <Input defaultValue={im.alt || ''} onBlur={(e)=>saveImageInfo(im.id, { alt: e.target.value || null })} />
                <Input defaultValue={im.caption || ''} onBlur={(e)=>saveImageInfo(im.id, { caption: e.target.value || null })} />
                <Input defaultValue={String(im.display_order ?? 0)} inputMode="numeric" onBlur={(e)=>saveImageInfo(im.id, { display_order: Number(e.target.value) || 0 })} />
                <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                  <Button variant="danger" onClick={()=>delImage(im.id)} disabled={removing || updating}>Sil</Button>
                </div>
              </div>
            ))}
            {list.length === 0 && <div style={{ opacity:.7 }}>Görsel yok</div>}
          </Card>
        </Grid>
      )}
    </div>
  );
}
