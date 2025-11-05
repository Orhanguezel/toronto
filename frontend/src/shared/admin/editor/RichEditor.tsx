'use client';
import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Heading from '@tiptap/extension-heading';
import styled from 'styled-components';

const Wrap = styled.div` border:1px solid rgba(255,255,255,.12); border-radius:12px; background:${({theme})=>theme.colors.surface}; `;
const Bar = styled.div` display:flex; flex-wrap:wrap; gap:6px; padding:8px; border-bottom:1px solid rgba(255,255,255,.08); `;
const Btn = styled.button<{active?:boolean}>`
  padding:6px 10px; border-radius:8px; opacity:${p=>p.active?1:.8}; border:1px solid rgba(255,255,255,.12);
`;
const Body = styled.div` padding:12px; `;

export default function RichEditor({ html, onChange }:{ html?: string; onChange: (html:string)=>void }){
  const editor = useEditor({
    extensions: [StarterKit, Image, Link.configure({ openOnClick: true }), Heading.configure({ levels: [2,3,4] })],
    content: html || '<p></p>',
    editorProps: { attributes: { class: 'tiptap-content' } },
    onUpdate({ editor }) { onChange(editor.getHTML()); },
  });

  useEffect(()=>{ if (editor && html != null) editor.commands.setContent(html); },[html]);
  if (!editor) return null;

  const b = (name:string, run:()=>void) => (
    <Btn active={editor.isActive(name)} onClick={run}>{name}</Btn>
  );

  return (
    <Wrap>
      <Bar>
        {b('bold', ()=>editor.chain().focus().toggleBold().run())}
        {b('italic', ()=>editor.chain().focus().toggleItalic().run())}
        {b('bulletList', ()=>editor.chain().focus().toggleBulletList().run())}
        {b('orderedList', ()=>editor.chain().focus().toggleOrderedList().run())}
        <Btn onClick={()=>{ const url = prompt('Image URL'); if (url) editor.chain().focus().setImage({ src: url }).run(); }}>img</Btn>
        <Btn onClick={()=>editor.chain().focus().setHeading({ level:2 }).run()}>H2</Btn>
        <Btn onClick={()=>editor.chain().focus().setHeading({ level:3 }).run()}>H3</Btn>
        <Btn onClick={()=>editor.chain().focus().unsetAllMarks().clearNodes().run()}>clear</Btn>
      </Bar>
      <Body>
        <EditorContent editor={editor} />
      </Body>
    </Wrap>
  );
}