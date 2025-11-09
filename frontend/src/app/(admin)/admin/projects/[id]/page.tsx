'use client';

import { useParams } from 'next/navigation';
import {
  useGetProjectAdminQuery,
  useUpdateProjectAdminMutation,
} from '@/integrations/endpoints/admin/projects.admin.endpoints';
import {
  useGetProjectTranslationsQuery,
  useUpsertProjectTranslationMutation,
} from '@/integrations/endpoints/admin/i18n.endpoints';
import {
  useListCategoriesAdminQuery,
  useListTagsAdminQuery,
  useGetProjectTaxonomyQuery,
  useSetProjectTaxonomyMutation,
} from '@/integrations/endpoints/admin/taxonomy.endpoints';

import styled, { css } from 'styled-components';
import { useEffect, useMemo, useState } from 'react';
import { Tabs } from '@/shared/admin/Tabs';
import MediaPickerModal from '@/shared/admin/media/MediaPickerModal';
import MediaInput from '@/shared/admin/MediaInput';
import { Button } from '@/shared/ui/buttons/Button';
import { toast } from 'sonner';

const LOCALES = ['tr', 'en', 'de'] as const;
type Locale = (typeof LOCALES)[number];

const PageWrap = styled.div`
  display: grid;
  gap: 16px;
`;

const Grid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 1fr;
  max-width: 980px;
  width: 100%;

  ${({ theme }) => theme.media.small} {
    grid-template-columns: 1fr;
  }
`;

const FieldBase = css`
  width: 100%;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.inputs.border};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  ::placeholder {
    color: ${({ theme }) => theme.inputs.placeholder || theme.colors.placeholder};
  }
  transition:
    border ${({ theme }) => theme.transition.fast},
    background ${({ theme }) => theme.transition.fast},
    box-shadow ${({ theme }) => theme.transition.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.inputs.borderFocus};
    background: ${({ theme }) => theme.colors.inputBackgroundFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

const Input = styled.input`
  ${FieldBase}
`;

const Area = styled.textarea`
  ${FieldBase};
  min-height: 140px;
  resize: vertical;
`;

export default function ProjectEditPage() {
  // ---- route param ----
  const params = useParams<{ id: string }>();
  const id = useMemo(
    () => (Array.isArray(params?.id) ? params.id[0] : params?.id) as string,
    [params]
  );

  // ---- data ----
  const { data: p } = useGetProjectAdminQuery({ id }, { skip: !id });
  const { data: trs } = useGetProjectTranslationsQuery({ id }, { skip: !id });
  const [upsert, { isLoading: savingTr }] = useUpsertProjectTranslationMutation();
  const [updateProject, { isLoading: savingMedia }] = useUpdateProjectAdminMutation();

  const { data: catList } = useListCategoriesAdminQuery();
  const { data: tagList } = useListTagsAdminQuery();
  const { data: tax } = useGetProjectTaxonomyQuery({ id }, { skip: !id });
  const [saveTax, { isLoading: savingTax }] = useSetProjectTaxonomyMutation();

  // ---- local states ----
  const [cover, setCover] = useState<string>('');
  const [mediaOpen, setMediaOpen] = useState(false);

  // taxonomy local state (tax yüklenince senkron)
  const [selCats, setSelCats] = useState<string[]>([]);
  const [selTags, setSelTags] = useState<string[]>([]);
  useEffect(() => {
    if (tax) {
      setSelCats(tax.categories || []);
      setSelTags(tax.tags || []);
    }
  }, [tax]);

  // çeviri draftları – kontrollü form
  type Draft = { title: string; summary: string; body: string; metaTitle: string; metaDesc: string };
  const emptyDraft: Draft = { title: '', summary: '', body: '', metaTitle: '', metaDesc: '' };
  const [drafts, setDrafts] = useState<Record<Locale, Draft>>({
    tr: emptyDraft,
    en: emptyDraft,
    de: emptyDraft,
  });

  // trs geldiğinde draftları doldur
  useEffect(() => {
    if (!trs) return;
    const next: Record<Locale, Draft> = { tr: { ...emptyDraft }, en: { ...emptyDraft }, de: { ...emptyDraft } };
    for (const loc of LOCALES) {
      const row = (trs as any[]).find((t) => t.locale === loc) || {};
      next[loc] = {
        title: row.title || '',
        summary: row.summary || '',
        body: row.body || '',
        metaTitle: row.metaTitle || '',
        metaDesc: row.metaDesc || '',
      };
    }
    setDrafts(next);
  }, [trs]);

  // kapak url senkronu
  useEffect(() => {
    setCover(p?.cover_url || '');
  }, [p?.cover_url]);

  // aktif sekme
  const [current, setCurrent] = useState<Locale>('tr');

  const setDraft = (loc: Locale, patch: Partial<Draft>) =>
    setDrafts((d) => ({ ...d, [loc]: { ...d[loc], ...patch } }));

  const saveTr = async () => {
    const d = drafts[current];
    await upsert({
      id,
      locale: current,
      data: {
        title: d.title,
        summary: d.summary,
        body: d.body,
        metaTitle: d.metaTitle,
        metaDesc: d.metaDesc,
      },
    }).unwrap();
    toast.success('Çeviri kaydedildi');
  };

  const saveMedia = async () => {
    await updateProject({ id, cover_url: cover }).unwrap();
    toast.success('Kapak güncellendi');
  };

  const saveTaxonomy = async () => {
    await saveTax({ id, categories: selCats, tags: selTags }).unwrap();
    toast.success('Taxonomy güncellendi');
  };

  return (
    <PageWrap>
      <h1>
        Project Edit: {p?.title || '—'} ({p?.slug || id})
      </h1>

      {/* --- Kapak Görseli --- */}
      <h3>Kapak Görseli</h3>
      <Grid style={{ gridTemplateColumns: '1fr auto' }}>
        <MediaInput value={cover} onChange={setCover} label="Cover URL" />
        <Button variant="ghost" onClick={() => setMediaOpen(true)}>
          Media Picker
        </Button>
      </Grid>
      {!!cover && (
        <div style={{ marginTop: 8 }}>
          <img
            src={cover}
            alt="cover preview"
            style={{ maxWidth: 340, maxHeight: 200, borderRadius: 12, border: '1px solid rgba(255,255,255,.12)' }}
          />
        </div>
      )}
      <div style={{ marginTop: 8 }}>
        <Button onClick={saveMedia} disabled={savingMedia}>
          {savingMedia ? 'Kaydediliyor…' : 'Kaydet'}
        </Button>
      </div>

      {/* --- Çeviriler --- */}
      <div style={{ height: 24 }} />
      <h3>Çeviriler</h3>
      <Tabs items={LOCALES as unknown as string[]} current={current} onChange={(l) => setCurrent(l as Locale)} />

      <Grid>
        <div>
          <label>Title</label>
          <Input
            value={drafts[current].title}
            onChange={(e) => setDraft(current, { title: e.target.value })}
            placeholder="Başlık"
          />
          <label>Summary</label>
          <Area
            value={drafts[current].summary}
            onChange={(e) => setDraft(current, { summary: e.target.value })}
            placeholder="Özet"
          />
        </div>
        <div>
          <label>Meta Title</label>
          <Input
            value={drafts[current].metaTitle}
            onChange={(e) => setDraft(current, { metaTitle: e.target.value })}
            placeholder="Meta Title"
          />
          <label>Meta Desc</label>
          <Area
            value={drafts[current].metaDesc}
            onChange={(e) => setDraft(current, { metaDesc: e.target.value })}
            placeholder="Meta Description"
          />
        </div>
      </Grid>

      <div>
        <label>Body (HTML)</label>
        <Area
          value={drafts[current].body}
          onChange={(e) => setDraft(current, { body: e.target.value })}
          placeholder="<p>...</p>"
        />
      </div>
      <div style={{ marginTop: 8 }}>
        <Button onClick={saveTr} disabled={savingTr}>
          {savingTr ? 'Kaydediliyor…' : 'Kaydet'}
        </Button>
      </div>

      {/* --- Taxonomy --- */}
      <div style={{ height: 24 }} />
      <h3>Taxonomy</h3>
      <Grid>
        <div>
          <strong>Kategoriler</strong>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            {(catList || []).map((c: any) => (
              <label key={c.id} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={selCats.includes(c.id)}
                  onChange={(e) =>
                    setSelCats((v) => (e.target.checked ? [...v, c.id] : v.filter((x) => x !== c.id)))
                  }
                />
                {c.title}
              </label>
            ))}
          </div>
        </div>

        <div>
          <strong>Etiketler</strong>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            {(tagList || []).map((t: any) => (
              <label key={t.id} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={selTags.includes(t.id)}
                  onChange={(e) =>
                    setSelTags((v) => (e.target.checked ? [...v, t.id] : v.filter((x) => x !== t.id)))
                  }
                />
                {t.title}
              </label>
            ))}
          </div>
        </div>
      </Grid>

      <div>
        <Button onClick={saveTaxonomy} disabled={savingTax}>
          {savingTax ? 'Kaydediliyor…' : 'Kaydet'}
        </Button>
      </div>

      {/* --- Media Picker --- */}
      {mediaOpen && (
        <MediaPickerModal
  open={mediaOpen}
  onClose={() => setMediaOpen(false)}
  onPick={(url) => {
    setCover(url);
    setMediaOpen(false);
  }}
/>
      )}
    </PageWrap>
  );
}
