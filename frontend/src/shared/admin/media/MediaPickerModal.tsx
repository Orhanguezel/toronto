'use client';

import * as React from 'react';
import styled from 'styled-components';
import { Button } from '@/shared/ui/buttons/Button';

type Asset = {
  id?: string;
  url: string;
  name?: string;
  width?: number;
  height?: number;
  created_at?: string;
};

type Props = {
  /** Modal görünürlük kontrolü (zorunlu) */
  open: boolean;
  onClose: () => void;
  onPick: (url: string) => void;

  /** Varsayılan: "image/*" */
  accept?: string;

  /** Başlık (varsayılan: "Medya Seç") */
  title?: string;

  /**
   * Dosya yüklemek için opsiyonel uploader.
   * Yüklenen dosyanın KALICI URL'sini döndürmelidir.
   */
  uploader?: (file: File) => Promise<string>;

  /**
   * Kütüphane listeleyici (opsiyonel).
   * Döndürülen öğeler grid'de gösterilir, tıklanarak seçilir.
   */
  libraryLoader?: (page: number, q?: string) => Promise<{ items: Asset[]; total: number }>;
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.overlayBackground};
  display: grid;
  place-items: center;
  z-index: 5000;
`;

const Modal = styled.div`
  width: min(96vw, 980px);
  max-height: 86vh;
  background: ${({ theme }) => theme.cards.background};
  border: 1px solid ${({ theme }) => theme.cards.border};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  border-radius: ${({ theme }) => theme.radii.xl};
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  overflow: hidden;
`;

const Head = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

const Title = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.title};
  letter-spacing: -0.01em;
`;

const Tabs = styled.div`
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

const TabButton = styled.button<{ active?: boolean }>`
  appearance: none;
  border: 1px solid
    ${({ theme, active }) => (active ? theme.colors.borderBrighter : theme.colors.borderLight)};
  background: ${({ theme, active }) =>
    active ? theme.colors.hoverBackground : theme.cards.background};
  color: ${({ theme }) => theme.colors.text};
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
`;

const Body = styled.div`
  padding: 16px;
  overflow: auto;
  display: grid;
  gap: 16px;
`;

const Footer = styled.footer`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

const Field = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.inputs.border};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  ::placeholder { color: ${({ theme }) => theme.inputs.placeholder || theme.colors.placeholder}; }
`;

const DropZone = styled.label<{ dragging?: boolean }>`
  display: grid;
  place-items: center;
  padding: 28px;
  border: 1px dashed
    ${({ theme, dragging }) => (dragging ? theme.colors.borderBrighter : theme.colors.borderLight)};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.hoverBackground};
  cursor: pointer;
  text-align: center;
`;

const TileGrid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
`;

const Tile = styled.button<{ selected?: boolean }>`
  position: relative;
  border: 1px solid
    ${({ theme, selected }) => (selected ? theme.colors.borderBrighter : theme.colors.borderLight)};
  background: ${({ theme }) => theme.colors.inputBackgroundSofter};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  cursor: pointer;
  padding: 0;

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderBright};
  }

  img {
    display: block;
    width: 100%;
    height: 120px;
    object-fit: cover;
  }

  figcaption {
    padding: 6px 8px;
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const Row = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
`;

export default function MediaPickerModal({
  open,
  onClose,
  onPick,
  accept = 'image/*',
  title = 'Medya Seç',
  uploader,
  libraryLoader,
}: Props) {
  if (!open) return null;

  const hasUpload = typeof uploader === 'function';
  const hasLibrary = typeof libraryLoader === 'function';

  const [tab, setTab] = React.useState<'url' | 'upload' | 'library'>('url');

  React.useEffect(() => {
    if (hasLibrary) setTab('library');
    else if (hasUpload) setTab('upload');
  }, [hasLibrary, hasUpload]);

  // ESC ile kapat (sadece açıkken)
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // URL TAB
  const [url, setUrl] = React.useState('');

  // UPLOAD TAB
  const [dragging, setDragging] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  const onDrop = async (files: FileList | null) => {
    if (!files || !files.length || !uploader) return;
    setUploading(true);
    try {
      const file = files[0];
      const uploadedUrl = await uploader(file);
      onPick(uploadedUrl);
      onClose();
    } finally {
      setUploading(false);
    }
  };

  // LIBRARY TAB
  const [items, setItems] = React.useState<Asset[]>([]);
  const [total, setTotal] = React.useState<number>(0);
  const [page, setPage] = React.useState(1);
  const [q, setQ] = React.useState('');
  const [selectedUrl, setSelectedUrl] = React.useState<string>('');

  const loadLibrary = React.useCallback(async () => {
    if (!libraryLoader) return;
    const res = await libraryLoader(page, q);
    setItems(res.items || []);
    setTotal(res.total || 0);
  }, [libraryLoader, page, q]);

  React.useEffect(() => {
    if (hasLibrary) loadLibrary();
  }, [hasLibrary, loadLibrary]);

  const canPrev = page > 1;
  const canNext = items.length > 0 && page * items.length < total;

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Head>
          <Title>{title}</Title>
          <Button variant="ghost" onClick={onClose}>Kapat</Button>
        </Head>

        <Tabs>
          {hasLibrary && (
            <TabButton active={tab === 'library'} onClick={() => setTab('library')}>
              Kütüphane
            </TabButton>
          )}
          {hasUpload && (
            <TabButton active={tab === 'upload'} onClick={() => setTab('upload')}>
              Yükle
            </TabButton>
          )}
          <TabButton active={tab === 'url'} onClick={() => setTab('url')}>
            URL
          </TabButton>
        </Tabs>

        <Body>
          {tab === 'url' && (
            <>
              <Field
                placeholder="https://... (görsel URL'si)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                inputMode="url"
              />
              <Row>
                {!!url && (
                  <img
                    src={url}
                    alt="preview"
                    style={{ maxWidth: 260, maxHeight: 180, borderRadius: 12, border: '1px solid rgba(255,255,255,.12)' }}
                  />
                )}
              </Row>
            </>
          )}

          {tab === 'upload' && (
            <>
              <DropZone
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); onDrop(e.dataTransfer?.files || null); }}
                dragging={dragging}
              >
                <div>
                  <strong>Dosyayı bırak</strong>
                  <div style={{ opacity: 0.75, marginTop: 4 }}>veya tıkla, dosya seç</div>
                </div>
                <input
                  type="file"
                  accept={accept}
                  style={{ display: 'none' }}
                  onChange={(e) => onDrop(e.currentTarget.files)}
                />
              </DropZone>
              {uploading && <div>Yükleniyor…</div>}
            </>
          )}

          {tab === 'library' && (
            <>
              <Row>
                <Field
                  placeholder="Ara…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); loadLibrary(); } }}
                />
                <Button variant="ghost" onClick={() => { setPage(1); loadLibrary(); }}>Ara</Button>
              </Row>

              <TileGrid>
                {items.map((it) => (
                  <Tile
                    key={it.id || it.url}
                    onClick={() => setSelectedUrl(it.url)}
                    selected={selectedUrl === it.url}
                    title={it.name || it.url}
                  >
                    <img src={it.url} alt={it.name || ''} />
                    <figcaption>{it.name || ''}</figcaption>
                  </Tile>
                ))}
              </TileGrid>

              <Row style={{ justifyContent: 'space-between' }}>
                <div style={{ opacity: 0.75, fontSize: '0.9rem' }}>Toplam: {total}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button variant="ghost" disabled={!canPrev} onClick={() => canPrev && setPage((p) => p - 1)}>←</Button>
                  <Button variant="ghost" disabled={!canNext} onClick={() => canNext && setPage((p) => p + 1)}>→</Button>
                  <Button onClick={loadLibrary}>Yenile</Button>
                </div>
              </Row>
            </>
          )}
        </Body>

        <Footer>
          <div />
          <Row>
            {tab === 'url' && (
              <Button onClick={() => { if (!url) return; onPick(url); onClose(); }} disabled={!url}>
                Seç
              </Button>
            )}
            {tab === 'library' && (
              <Button onClick={() => { if (!selectedUrl) return; onPick(selectedUrl); onClose(); }} disabled={!selectedUrl}>
                Seç
              </Button>
            )}
          </Row>
        </Footer>
      </Modal>
    </Overlay>
  );
}
