'use client';
import { useParams } from 'next/navigation';
import { useProjectById, useUpdateProject } from '@/integrations/endpoints/admin/projects.admin.endpoints';
import { useGetProjectTranslationsQuery, useUpsertProjectTranslationMutation } from '@/integrations/endpoints/admin/i18n.endpoints';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { Tabs } from '@/shared/admin/Tabs';
import MediaPickerModal from '@/shared/admin/media/MediaPickerModal';
import MediaInput from '@/shared/admin/MediaInput';
import { Button } from '@/shared/ui/buttons/Button';
import { toast } from 'sonner';
import { useListCategoriesAdminQuery, useListTagsAdminQuery, useGetProjectTaxonomyQuery, useSetProjectTaxonomyMutation } from '@/integrations/endpoints/admin/taxonomy.endpoints';

const Grid = styled.div` display:grid; gap:12px; grid-template-columns: 1fr 1fr; max-width: 980px; `;
const Input = styled.input` padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,.12); background:${({ theme }) => theme.colors.surface}; color:inherit;`;
const Area = styled.textarea` padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,.12); background:${({ theme }) => theme.colors.surface}; color:inherit; min-height:140px;`;

const LOCALES = ['tr', 'en', 'de'];

export default function ProjectEditPage() {
  const { id } = useParams<{ id: string }>();
  const { data: p } = useProjectById({ id });
  const { data: trs } = useGetProjectTranslationsQuery({ id });
  const [upsert] = useUpsertProjectTranslationMutation();
  const [update] = useUpdateProject();
  const { data: catList } = useListCategoriesAdminQuery();
  const { data: tagList } = useListTagsAdminQuery();
  const { data: tax } = useGetProjectTaxonomyQuery({ id });
  const [saveTax] = useSetProjectTaxonomyMutation();

  const [selCats, setSelCats] = useState<string[]>(tax?.categories || []);
  const [selTags, setSelTags] = useState<string[]>(tax?.tags || []);

  const [current, setCurrent] = useState('tr');
  const cur = (trs || []).find((t: any) => t.locale === current) || { locale: current, title: '', summary: '', body: '', metaTitle: '', metaDesc: '' };

  const [cover, setCover] = useState<string>('');
  const [mediaOpen, setMediaOpen] = useState(false);
  useEffect(() => { setCover(p?.cover_url || ''); }, [p]);

  const saveTr = async () => {
    await upsert({ id, locale: current, data: { title: cur.title!, summary: cur.summary, body: cur.body, metaTitle: cur.metaTitle, metaDesc: cur.metaDesc } }).unwrap();
    toast.success('Çeviri kaydedildi');
  };
  const saveMedia = async () => {
    await update({ id, cover_url: cover }).unwrap();
    toast.success('Kapak güncellendi');
  };

  return (
    <div>
      <h1>Project Edit: {p?.title} ({p?.slug})</h1>

      <h3>Kapak Görseli</h3>
      <Grid style={{ gridTemplateColumns: '1fr auto' }}>
        <MediaInput value={cover} onChange={setCover} label="Cover URL" />
        <Button variant="ghost" onClick={() => setMediaOpen(true)}>Media Picker</Button>
      </Grid>
      <div style={{ marginTop: 8 }}><Button onClick={saveMedia}>Kaydet</Button></div>

      <div style={{ height: 24 }} />
      <h3>Çeviriler</h3>
      <Tabs items={LOCALES} current={current} onChange={setCurrent} />
      <Grid>
        <div>
          <label>Title</label>
          <Input defaultValue={cur.title} onChange={(e) => (cur.title = e.target.value)} />
          <label>Summary</label>
          <Area defaultValue={cur.summary} onChange={(e) => (cur.summary = e.target.value)} />
        </div>
        <div>
          <label>Meta Title</label>
          <Input defaultValue={cur.metaTitle} onChange={(e) => (cur.metaTitle = e.target.value)} />
          <label>Meta Desc</label>
          <Area defaultValue={cur.metaDesc} onChange={(e) => (cur.metaDesc = e.target.value)} />
        </div>
      </Grid>
      <h3>Taxonomy</h3>
      <Grid>
        <div>
          <strong>Kategoriler</strong>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(catList || []).map((c: any) => (
              <label key={c.id} style={{ display: 'inline-flex', gap: 6 }}>
                <input type="checkbox" checked={selCats.includes(c.id)} onChange={(e) => setSelCats(v => e.target.checked ? [...v, c.id] : v.filter(x => x !== c.id))} />
                {c.title}
              </label>
            ))}
          </div>
        </div>
        <div>
          <strong>Etiketler</strong>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(tagList || []).map((t: any) => (
              <label key={t.id} style={{ display: 'inline-flex', gap: 6 }}>
                <input type="checkbox" checked={selTags.includes(t.id)} onChange={(e) => setSelTags(v => e.target.checked ? [...v, t.id] : v.filter(x => x !== t.id))} />
                {t.title}
              </label>
            ))}
          </div>
        </div>
      </Grid>
      <Button onClick={async () => { await saveTax({ id, categories: selCats, tags: selTags }).unwrap(); toast.success('Taxonomy güncellendi'); }}>Kaydet</Button>
      <div style={{ height: 12 }} />
      <label>Body (HTML)</label>
      <Area defaultValue={cur.body} onChange={(e) => (cur.body = e.target.value)} />
      <div style={{ marginTop: 8 }}><Button onClick={saveTr}>Kaydet</Button></div>

      {mediaOpen && <MediaPickerModal onClose={() => setMediaOpen(false)} onPick={(url) => { setCover(url); setMediaOpen(false); }} />}
    </div>
  );
}