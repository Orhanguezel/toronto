'use client';

import * as React from 'react';
import styled from 'styled-components';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/buttons/Button';
import {
  useListReferencesAdminQuery,
  useUpdateReferenceAdminMutation,
  useRemoveReferenceAdminMutation,
} from '@/integrations/endpoints/admin/references_admin.endpoints';
import ReferenceFormPage from '@/features/admin/references/FormPage';
import ReferenceDetailPage from '@/features/admin/references/DetailPage';

type View = 'list' | 'create' | 'edit' | 'detail';

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

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

export default function ReferencesAdminPage() {
  const [view, setView] = React.useState<View>('list');
  const [currentId, setCurrentId] = React.useState<string | null>(null);

  const { data, refetch, isLoading } = useListReferencesAdminQuery({});
  const [updateRef, { isLoading: updating }] = useUpdateReferenceAdminMutation();
  const [removeRef, { isLoading: removing }] = useRemoveReferenceAdminMutation();

  const backToList = async () => {
    setView('list');
    setCurrentId(null);
    await refetch();
  };

  const bumpOrder = async (id: string, current?: number) => {
    try {
      await updateRef({ id, body: { display_order: (current || 0) + 1 } }).unwrap();
      toast.success('Sıra +1');
      await refetch();
    } catch {
      toast.error('Güncellenemedi');
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Silinsin mi?')) return;
    try {
      await removeRef({ id }).unwrap();
      toast.success('Silindi');
      await refetch();
    } catch {
      toast.error('Silinemedi');
    }
  };

  if (view === 'create') {
    return (
      <ReferenceFormPage
        onSaved={(id) => {
          setCurrentId(id);
          setView('detail');
        }}
      />
    );
  }

  if (view === 'edit' && currentId) {
    return <ReferenceFormPage id={currentId} onSaved={backToList} />;
  }

  if (view === 'detail' && currentId) {
    return (
      <div>
        <TopBar>
          <Button variant="ghost" onClick={backToList}>← Listeye dön</Button>
          <Button onClick={() => setView('edit')}>Düzenle</Button>
        </TopBar>
        <ReferenceDetailPage id={currentId} />
      </div>
    );
  }

  // ---- LIST VIEW ----
  // data -> { items, total } ya da direkt dizi olabilir; ikisine de güvenli davran.
  const list = React.useMemo(() => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray((data as any).items)) return (data as any).items as any[];
    return [] as any[];
  }, [data]);

  const items = React.useMemo(
    () =>
      list.slice().sort(
        (a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0)
      ),
    [list]
  );

  return (
    <div>
      <TopBar>
        <h1 style={{ marginRight: 'auto' }}>References</h1>
        <Button onClick={() => setView('create')}>Yeni Referans</Button>
      </TopBar>

      {isLoading ? (
        <div>Yükleniyor…</div>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Kapak</th>
              <th>Başlık</th>
              <th>Slug</th>
              <th>URL</th>
              <th>Published</th>
              <th>Sıra</th>
              <th style={{ width: 280 }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((x: any) => (
              <tr key={x.id}>
                <td style={{ width: 120 }}>
                  {x.featured_image_url_resolved ? (
                    <img
                      src={x.featured_image_url_resolved}
                      alt={x.title || ''}
                      height={28}
                    />
                  ) : (
                    <span style={{ opacity: 0.6 }}>—</span>
                  )}
                </td>
                <td>{x.title || '—'}</td>
                <td>{x.slug || '—'}</td>
                <td style={{ maxWidth: 360, overflowWrap: 'anywhere' }}>
                  {x.website_url || <span style={{ opacity: 0.6 }}>—</span>}
                </td>
                <td>{x.is_published ? 'Yes' : 'No'}</td>
                <td style={{ width: 70 }}>{x.display_order ?? 0}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <Button
                    variant="ghost"
                    onClick={() => bumpOrder(x.id, x.display_order)}
                    disabled={updating}
                  >
                    +order
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setCurrentId(x.id);
                      setView('edit');
                    }}
                  >
                    Düzenle
                  </Button>
                  <Button
                    onClick={() => {
                      setCurrentId(x.id);
                      setView('detail');
                    }}
                  >
                    Galeri
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => onDelete(x.id)}
                    disabled={removing}
                  >
                    Sil
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
