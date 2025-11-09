// src/shared/faq/FAQBuilder.tsx
'use client';

import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { Button } from '@/shared/ui/buttons/Button';

export type Faq = { q: string; a: string };

const Wrap = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.md};
`;

const List = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const Item = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.xs};
  padding: ${({ theme }) => theme.spacings.sm};
  background: ${({ theme }) => theme.cards.background};
  border: 1px solid ${({ theme }) => theme.cards.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
`;

const Field = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.inputs.border};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  transition: ${({ theme }) => theme.transition.fast};

  &::placeholder { color: ${({ theme }) => theme.inputs.placeholder}; }
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.inputBorderFocus};
    background: ${({ theme }) => theme.colors.inputBackgroundFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

const Area = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.inputs.border};
  background: ${({ theme }) => theme.inputs.background};
  color: ${({ theme }) => theme.inputs.text};
  transition: ${({ theme }) => theme.transition.fast};
  resize: vertical;

  &::placeholder { color: ${({ theme }) => theme.inputs.placeholder}; }
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.inputBorderFocus};
    background: ${({ theme }) => theme.colors.inputBackgroundFocus};
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xs};
`;

const AddRow = styled.div`
  margin-top: ${({ theme }) => theme.spacings.sm};
`;

export default function FAQBuilder({
  value,
  onChange,
}: {
  value?: Faq[];
  onChange: (v: Faq[]) => void;
}) {
  const [list, setList] = useState<Faq[]>(value ?? []);

  // Dışarıdan value güncellenirse senkronize et
  useEffect(() => {
    if (value) setList(value);
  }, [value]);

  const update = (next: Faq[]) => {
    setList(next);
    onChange(next);
  };

  const push = () => update([...list, { q: '', a: '' }]);
  const remove = (i: number) => update(list.filter((_, idx) => idx !== i));
  const moveUp = (i: number) => {
    if (i <= 0) return;
    const next = [...list];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    update(next);
  };
  const moveDown = (i: number) => {
    if (i >= list.length - 1) return;
    const next = [...list];
    [next[i + 1], next[i]] = [next[i], next[i + 1]];
    update(next);
  };

  const setQ = (i: number, q: string) => {
    const next = [...list];
    next[i] = { ...next[i], q };
    update(next);
  };
  const setA = (i: number, a: string) => {
    const next = [...list];
    next[i] = { ...next[i], a };
    update(next);
  };

  return (
    <Wrap>
      <List>
        {list.map((f, i) => (
          <Item key={`${i}-${f.q.slice(0, 8)}`}>
            <Field
              placeholder="Soru"
              aria-label="Soru"
              value={f.q}
              onChange={(e) => setQ(i, e.target.value)}
            />
            <Area
              placeholder="Cevap"
              aria-label="Cevap"
              value={f.a}
              onChange={(e) => setA(i, e.target.value)}
            />
            <Actions>
              <Button variant="ghost" onClick={() => remove(i)}>Sil</Button>
              <Button variant="ghost" disabled={i === 0} onClick={() => moveUp(i)}>Yukarı</Button>
              <Button variant="ghost" disabled={i === list.length - 1} onClick={() => moveDown(i)}>Aşağı</Button>
            </Actions>
          </Item>
        ))}
      </List>

      <AddRow>
        <Button onClick={push}>Soru ekle</Button>
      </AddRow>
    </Wrap>
  );
}
