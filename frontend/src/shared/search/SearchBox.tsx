// src/shared/search/SearchBox.tsx
'use client';

import styled from 'styled-components';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';

type SearchResults = {
  projects?: Array<{ slug: string; title: string }>;
  posts?: Array<{ slug: string; title: string }>;
};

const Box = styled.div`
  position: relative;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.inputs.border};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  transition: ${({ theme }) => theme.transition.fast};

  &::placeholder {
    color: ${({ theme }) => theme.inputs.placeholder};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.inputBorderFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

const List = styled.div`
  position: absolute;
  inset-inline: 0;
  top: calc(100% + 6px);
  background: ${({ theme }) => theme.cards.background};
  border: 1px solid ${({ theme }) => theme.cards.border};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: 8px;
  display: grid;
  gap: 6px;
  z-index: ${({ theme }) => theme.zIndex.overlay};
`;

const Section = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 4px 2px 2px;
`;

const Item = styled(Link)`
  display: block;
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  border: 1px solid transparent;
  transition: ${({ theme }) => theme.transition.fast};

  &:hover,
  &:focus-visible {
    background: ${({ theme }) => theme.colors.hoverBackground};
    border-color: ${({ theme }) => theme.colors.borderLight};
    outline: none;
  }
`;

const NoRes = styled.div`
  padding: 10px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
`;

export default function SearchBox({ locale }: { locale: string }) {
  const [v, setV] = useState('');
  const [items, setItems] = useState<SearchResults | null>(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abort = useRef<AbortController | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Dışarı tıklayınca kapat
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // Esc ile kapat
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Arama (debounce + abort)
  useEffect(() => {
    if (t.current) clearTimeout(t.current);
    if (abort.current) {
      abort.current.abort();
      abort.current = null;
    }
    if (!v || v.trim().length < 2) {
      setItems(null);
      setBusy(false);
      return;
    }

    setBusy(true);
    setOpen(true);
    t.current = setTimeout(async () => {
      const ctrl = new AbortController();
      abort.current = ctrl;
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(v.trim())}&locale=${encodeURIComponent(locale)}`,
          { cache: 'no-store', signal: ctrl.signal }
        );
        const json = (await res.json()) as SearchResults;
        setItems(json);
      } catch {
        // yut – istek iptal olmuş olabilir
      } finally {
        setBusy(false);
        abort.current = null;
      }
    }, 200);

    return () => {
      if (t.current) clearTimeout(t.current);
    };
  }, [v, locale]);

  const hasProjects = !!items?.projects?.length;
  const hasPosts = !!items?.posts?.length;
  const hasAny = hasProjects || hasPosts;

  return (
    <Box ref={rootRef}>
      <Input
        value={v}
        onChange={(e) => setV(e.target.value)}
        onFocus={() => v.trim().length >= 2 && setOpen(true)}
        placeholder="Arayın…"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-haspopup="listbox"
      />

      {open && (
        <List role="listbox">
          {busy && <NoRes>Aranıyor…</NoRes>}

          {!busy && !hasAny && <NoRes>Sonuç bulunamadı</NoRes>}

          {hasProjects && (
            <>
              <Section>Projeler</Section>
              {items!.projects!.map((p) => (
                <Item
                  key={p.slug}
                  href={`/${locale}/projects/${p.slug}` as Route}
                >
                  {p.title}
                </Item>
              ))}
            </>
          )}

          {hasPosts && (
            <>
              <Section>Blog</Section>
              {items!.posts!.map((p) => (
                <Item
                  key={p.slug}
                  href={`/${locale}/blog/${p.slug}` as Route}
                >
                  {p.title}
                </Item>
              ))}
            </>
          )}
        </List>
      )}
    </Box>
  );
}
