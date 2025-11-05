'use client';
import { useState } from 'react';
export default function LocaleSwitcher({ current, options }:{ current:string; options:string[] }){
  const [open,setOpen] = useState(false);
  return (
    <div>
      <button onClick={()=>setOpen(!open)} aria-expanded={open}> {current.toUpperCase()} </button>
      {open && <ul role="listbox">{options.map(o=> <li key={o}><a href={`/${o}`}>{o.toUpperCase()}</a></li>)}</ul>}
    </div>
  );
}