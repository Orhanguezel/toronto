'use client';

import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Button } from '@/shared/ui/buttons/Button';
import { toast } from 'sonner';
import {
  useListAdminSiteSettingsQuery,
  useUpdateAdminSiteSettingByKeyMutation,
  useDeleteAdminSiteSettingByKeyMutation,
} from '@/integrations/endpoints/admin/siteSettings.endpoints';
import type { SiteSettingRow } from '@/integrations/endpoints/types/siteSettings';
import NewSettingForm from './FormPage';

type Locale = 'tr' | 'en' | 'de';
const LOCALES: Locale[] = ['tr','en','de'];
const LBL: Record<Locale,string> = { tr:'Türkçe', en:'English', de:'Deutsch' };

const Toolbar = styled.div`
  display:flex; gap:8px; align-items:center; margin:12px 0;
  input,select{ padding:8px 10px; border-radius:10px; border:1px solid ${({theme})=>theme.inputs.border};
    background:${({theme})=>theme.inputs.background}; color:${({theme})=>theme.inputs.text};}
  input{ width:280px; }
`;
const Table = styled.table`
  width:100%; border-collapse:separate; border-spacing:0 8px;
  th,td{ text-align:left; padding:10px 12px; background:${({theme})=>theme.cards.background};
         border:1px solid ${({theme})=>theme.cards.border}; }
  th:first-child,td:first-child{ border-top-left-radius:12px; border-bottom-left-radius:12px; }
  th:last-child,td:last-child{ border-top-right-radius:12px; border-bottom-right-radius:12px; }
`;
const JsonArea = styled.textarea`
  width:100%; min-height:120px; resize:vertical; padding:10px 12px; border-radius:10px;
  border:1px solid ${({theme})=>theme.inputs.border}; background:${({theme})=>theme.inputs.background};
  color:${({theme})=>theme.inputs.text};
`;

function pretty(v:unknown){ try{ return JSON.stringify(v ?? null, null, 2) } catch { return String(v ?? '') } }
function tryParseJson(s:string){ try{ return {ok:true as const, val:JSON.parse(s)} } catch(e:any){ return {ok:false as const, err:e?.message||'JSON parse hatası'} } }
const rowKey = (r:Pick<SiteSettingRow,'key'|'locale'>)=>`${r.key}::${r.locale||''}`;

// RTK hata yazısını kullanıcıya düzgün göstermek için
function readRtqError(err: any): string {
  if (err?.data?.message) return String(err.data.message);
  if (typeof err?.data === 'string') return err.data;
  if (typeof err?.error === 'string') return err.error;
  if (typeof err?.message === 'string') return err.message;
  return 'İşlem başarısız';
}

export default function DetailPage() {
  // filtreler
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof document !== 'undefined') {
      const m = document.cookie?.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
      if (m?.[1]) return (decodeURIComponent(m[1]).split('-')[0] as Locale) || 'tr';
    }
    if (typeof navigator !== 'undefined') return (navigator.language.split('-')[0] as Locale) || 'tr';
    return 'tr';
  });
  const [prefix, setPrefix] = useState('');
  const [query, setQuery]   = useState('');
  const [order, setOrder]   = useState<'updated_at.desc'|'updated_at.asc'|'key.asc'|'key.desc'>('updated_at.desc');

  const params = useMemo(() => {
    const p: Record<string, any> = { order, locale };
    if (prefix.trim()) p.prefix = prefix.trim();
    if (query.trim())  p.q = query.trim();
    return p;
  }, [order, locale, prefix, query]);

  const { data, isFetching, refetch } = useListAdminSiteSettingsQuery(params, { refetchOnMountOrArgChange: true });
  const rows = data || [];

  // yeni form
  const [showCreate, setShowCreate] = useState(false);

  // inline edit
  const [editing, setEditing] = useState<Record<string,string>>({});
  const [updateRow,  { isLoading: updating }] = useUpdateAdminSiteSettingByKeyMutation();
  const [deleteRow,  { isLoading: deleting }] = useDeleteAdminSiteSettingByKeyMutation();

  const startEdit  = (r:SiteSettingRow)=> setEditing(s=>({ ...s, [rowKey(r)]: pretty(r.value) }));
  const cancelEdit = (r:SiteSettingRow)=> setEditing(s=>{ const k=rowKey(r); const n={...s}; delete n[k]; return n; });

  const saveEdit   = async (r:SiteSettingRow)=>{
    const k = rowKey(r);
    const parsed = tryParseJson(editing[k] ?? '');
    if (!parsed.ok) { toast.error(parsed.err); return; }

    await toast.promise(
      updateRow({ key: r.key, value: parsed.val, locale: r.locale || undefined }).unwrap(),
      {
        loading: 'Kaydediliyor…',
        success: 'Güncellendi',
        error: (e) => readRtqError(e),
      }
    );

    cancelEdit(r);
    await refetch();
  };

  const onDelete = async (r:SiteSettingRow)=>{
    if (!confirm(`Silinsin mi?\n${r.key} (${r.locale || '-'})`)) return;

    await toast.promise(
      deleteRow({ key: r.key, locale: r.locale || undefined }).unwrap(),
      {
        loading: 'Siliniyor…',
        success: 'Silindi',
        error: (e) => readRtqError(e),
      }
    );

    await refetch();
  };

  // ilk açılışta hiç kayıt yoksa yeni formu göster
  useEffect(()=>{ if (!isFetching && rows.length === 0) setShowCreate(true); }, [isFetching, rows.length]);

  return (
    <section>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h1 style={{ marginBottom: 8 }}>Site Settings</h1>
        <Button onClick={()=>setShowCreate(s=>!s)}>{showCreate ? 'Kapat' : 'Yeni'}</Button>
      </div>

      {showCreate && (
        <NewSettingForm
          initialLocale={locale}
          onCreated={async ()=>{ setShowCreate(false); await refetch(); }}
          onCancel={()=>setShowCreate(false)}
        />
      )}

      <Toolbar>
        <select value={locale} onChange={e=>setLocale(e.target.value as Locale)} disabled={isFetching || updating || deleting}>
          {LOCALES.map(l => <option key={l} value={l}>{LBL[l]}</option>)}
        </select>
        <select value={order} onChange={e=>setOrder(e.target.value as any)} disabled={isFetching}>
          <option value="updated_at.desc">Güncellenme ↓</option>
          <option value="updated_at.asc">Güncellenme ↑</option>
          <option value="key.asc">Key A→Z</option>
          <option value="key.desc">Key Z→A</option>
        </select>
        <input placeholder="prefix (ör. contact_, socials)" value={prefix} onChange={e=>setPrefix(e.target.value)} />
        <input placeholder="ara (key LIKE %q%)" value={query} onChange={e=>setQuery(e.target.value)} />
        <Button variant="ghost" onClick={()=>refetch()} disabled={isFetching}>Yenile</Button>
      </Toolbar>

      <Table aria-busy={isFetching}>
        <thead>
          <tr>
            <th style={{width:260}}>Key</th>
            <th style={{width:80}}>Dil</th>
            <th>Değer (JSON)</th>
            <th style={{width:200}}>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r: SiteSettingRow)=>{
            const k = rowKey(r);
            const isEdit = editing[k] != null;
            return (
              <tr key={k}>
                <td>{r.key}</td>
                <td>{r.locale || '-'}</td>
                <td>
                  {isEdit ? (
                    <JsonArea value={editing[k] ?? ''} onChange={e=>setEditing(s=>({ ...s, [k]: e.target.value }))}/>
                  ) : (
                    <pre style={{ margin:0, whiteSpace:'pre-wrap' }}>{pretty(r.value)}</pre>
                  )}
                </td>
                <td style={{ display:'flex', gap:8 }}>
                  {isEdit ? (
                    <>
                      <Button onClick={()=>saveEdit(r)} disabled={updating}>Kaydet</Button>
                      <Button variant="ghost" onClick={()=>cancelEdit(r)}>İptal</Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" onClick={()=>startEdit(r)}>Düzenle</Button>
                      <Button variant="danger" onClick={()=>onDelete(r)} disabled={deleting}>Sil</Button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
          {!rows.length && !isFetching && !showCreate && (
            <tr>
              <td colSpan={4} style={{ textAlign:'center', opacity:.7, padding:16 }}>
                Kayıt yok. <Button variant="ghost" onClick={()=>setShowCreate(true)} style={{ marginLeft:8 }}>Yeni oluştur</Button>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </section>
  );
}
