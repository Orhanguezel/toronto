'use client';
import styled from 'styled-components';
const List = styled.div` display:flex; gap:8px; border-bottom:1px solid rgba(255,255,255,.08); margin-bottom:12px; `;
const Btn = styled.button<{active?:boolean}>`
  padding:8px 12px; border-bottom:2px solid transparent; opacity:.9;
  ${({active,theme})=> active && `border-color:${theme.colors.primary}; opacity:1;`}
`;
export function Tabs({ items, current, onChange }:{ items:string[]; current:string; onChange:(k:string)=>void }){
  return (<List>{items.map(k=>(<Btn key={k} onClick={()=>onChange(k)} active={current===k}>{k.toUpperCase()}</Btn>))}</List>);
}