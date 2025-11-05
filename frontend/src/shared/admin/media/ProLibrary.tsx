'use client';
import styled from 'styled-components';
import { useState, useRef } from 'react';

const Drop = styled.div`
  border: 1px dashed ${({theme})=>theme.colors.border}; padding:16px; border-radius:${({theme})=>theme.radii.lg}px; text-align:center;
`;

export default function ProLibrary(){
  const [items,setItems] = useState<any[]>([]);
  const [sel,setSel] = useState<string[]>([]);
  const upRef = useRef<HTMLInputElement>(null);
  const pick = ()=> upRef.current?.click();
  const onFiles = async (files: FileList | null)=>{ if(!files) return; /* signed upload → Part 14 */ };
  return (
    <div>
      <Drop onClick={pick}>Dosyaları buraya sürükleyin veya tıklayın</Drop>
      <input ref={upRef} type="file" multiple hidden onChange={e=>onFiles(e.target.files)} />
      {/* Grid + toolbar ... */}
    </div>
  );
}