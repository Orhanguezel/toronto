// src/shared/media/FocalEditor.tsx
'use client';

import styled from 'styled-components';
import { useEffect, useRef, useState } from 'react';

type Pt = { x: number; y: number };
type FocalResp = { focalX?: number; focalY?: number };

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.overlayBackground};
  display: grid;
  place-items: center;
  z-index: ${({ theme }) => theme.zIndex.overlay};
`;

const Sheet = styled.div`
  width: min(960px, 96vw);
  background: ${({ theme }) => theme.cards.background};
  border: 1px solid ${({ theme }) => theme.cards.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: ${({ theme }) => theme.spacings.md};
`;

const Box = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  background: ${({ theme }) => theme.colors.inputBackgroundLight};
  cursor: crosshair;
`;

const Img = styled.img<{ $x: number; $y: number }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: ${({ $x, $y }) => `${$x}% ${$y}%`};
  display: block;
`;

const Dot = styled.div<{ $x: number; $y: number }>`
  position: absolute;
  left: ${({ $x }) => `${$x}%`};
  top: ${({ $y }) => `${$y}%`};
  width: 16px;
  height: 16px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  border: 2px solid ${({ theme }) => theme.colors.white};
  box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryTransparent};
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xs};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacings.sm};
`;

const Btn = styled.button<{ $variant?: 'primary' | 'ghost' }>`
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid
    ${({ theme, $variant }) =>
      $variant === 'ghost' ? theme.colors.borderLight : theme.colors.buttonBorder};
  background: ${({ theme, $variant }) =>
    $variant === 'ghost' ? 'transparent' : theme.buttons.primary.background};
  color: ${({ theme, $variant }) =>
    $variant === 'ghost' ? theme.colors.text : theme.buttons.primary.text};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.fast};

  &:hover,
  &:focus-visible {
    outline: none;
    border-color: ${({ theme }) => theme.colors.borderBrighter};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
    background: ${({ theme, $variant }) =>
      $variant === 'ghost' ? theme.colors.hoverBackground : theme.buttons.primary.backgroundHover};
  }

  &:disabled {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
  }
`;

export default function FocalEditor({
  src,
  id,
  onClose,
}: {
  src: string;
  id: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pt, setPt] = useState<Pt>({ x: 50, y: 50 });

  // ESC ile kapat + body scroll kilidi
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  // İlk odak noktasını yükle
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/_admin/media/focal?id=${encodeURIComponent(id)}`, {
          cache: 'no-store',
        });
        if (r.ok) {
          const j = (await r.json()) as FocalResp;
          setPt({ x: j.focalX ?? 50, y: j.focalY ?? 50 });
        }
      } catch {
        // sessizce yut (network hatası)
      }
    })();
  }, [id]);

  const clamp01 = (n: number) => Math.max(0, Math.min(100, n));

  const click = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const box = ref.current.getBoundingClientRect();
    const x = ((e.clientX - box.left) / box.width) * 100;
    const y = ((e.clientY - box.top) / box.height) * 100;
    setPt({ x: clamp01(x), y: clamp01(y) });
  };

  const save = async () => {
    await fetch('/api/_admin/media/focal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, focalX: Math.round(pt.x), focalY: Math.round(pt.y) }),
    });
    onClose();
  };

  return (
    <Backdrop onClick={onClose} role="dialog" aria-modal="true" aria-label="Focal point editor">
      <Sheet onClick={(e) => e.stopPropagation()}>
        <Box ref={ref} onClick={click}>
          <Img src={src} alt="" $x={pt.x} $y={pt.y} />
          <Dot $x={pt.x} $y={pt.y} />
        </Box>
        <Actions>
          <Btn $variant="ghost" onClick={onClose}>Vazgeç</Btn>
          <Btn $variant="primary" onClick={save}>Kaydet</Btn>
        </Actions>
      </Sheet>
    </Backdrop>
  );
}
