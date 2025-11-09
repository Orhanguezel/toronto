// src/shared/rich/RichEditor.tsx
'use client';

import { useEffect } from 'react';
import styled from 'styled-components';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapLink from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Heading from '@tiptap/extension-heading';

const Wrap = styled.div`
  border: 1px solid ${({ theme }) => theme.cards.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.cards.background};
  box-shadow: ${({ theme }) => theme.cards.shadow};
`;

const Bar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

const Btn = styled.button<{ $active?: boolean }>`
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.primaryTransparent : 'transparent'};
  color: ${({ theme }) => theme.colors.text};
  transition: ${({ theme }) => theme.transition.fast};
  cursor: pointer;

  &:hover,
  &:focus-visible {
    background: ${({ theme }) => theme.colors.hoverBackground};
    border-color: ${({ theme }) => theme.colors.borderBrighter};
    outline: none;
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

const Body = styled.div`
  padding: 12px;
  background: ${({ theme }) => theme.inputs.background};
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

const Content = styled(EditorContent)`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.small};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};

  .tiptap p { margin: 0 0 0.75em 0; }
  .tiptap ul, .tiptap ol { margin: 0.75em 0 0.75em 1.25em; }
  .tiptap h2, .tiptap h3, .tiptap h4 {
    margin: 0.8em 0 0.4em 0;
    color: ${({ theme }) => theme.colors.title};
  }
  .tiptap h2 { font-size: ${({ theme }) => theme.fontSizes.h4}; }
  .tiptap h3 { font-size: ${({ theme }) => theme.fontSizes.medium}; }
  .tiptap h4 { font-size: ${({ theme }) => theme.fontSizes.small}; }
  .tiptap a {
    color: ${({ theme }) => theme.colors.link};
    text-decoration: underline;
  }
  .tiptap blockquote {
    border-inline-start: 3px solid ${({ theme }) => theme.colors.borderLight};
    margin: 0.8em 0;
    padding: 0.2em 0 0.2em 0.8em;
    color: ${({ theme }) => theme.colors.textMuted};
  }
  .tiptap code {
    background: ${({ theme }) => theme.colors.inputBackgroundLight};
    border: 1px solid ${({ theme }) => theme.colors.borderLight};
    border-radius: ${({ theme }) => theme.radii.sm};
    padding: 0.1em 0.35em;
    font-family: ${({ theme }) => theme.fonts.mono};
    font-size: 0.9em;
  }
  .tiptap img {
    max-width: 100%;
    height: auto;
    border-radius: ${({ theme }) => theme.radii.md};
    border: 1px solid ${({ theme }) => theme.colors.borderLight};
  }
`;

export default function RichEditor({
  html,
  onChange,
}: {
  html?: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      TiptapLink.configure({ openOnClick: true, autolink: true }),
      Heading.configure({ levels: [2, 3, 4] }),
    ],
    content: html || '<p></p>',
    editorProps: { attributes: { class: 'tiptap' } },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // Dışarıdan html değişirse editor içeriğini güncelle
  useEffect(() => {
    if (editor && html != null && html !== editor.getHTML()) {
      editor.commands.setContent(html); // false: history'e ekleme
    }
  }, [editor, html]);

  if (!editor) return null;

  const mkBtn = (
    label: string,
    isActive: boolean,
    onClick: () => void,
    title?: string
  ) => (
    <Btn
      type="button"
      $active={isActive}
      aria-pressed={isActive}
      onClick={() => {
        editor.chain().focus();
        onClick();
      }}
      title={title ?? label}
    >
      {label}
    </Btn>
  );

  return (
    <Wrap>
      <Bar>
        {mkBtn('B', editor.isActive('bold'), () => editor.chain().toggleBold().run(), 'Bold')}
        {mkBtn('I', editor.isActive('italic'), () => editor.chain().toggleItalic().run(), 'Italic')}
        {mkBtn(
          '• List',
          editor.isActive('bulletList'),
          () => editor.chain().toggleBulletList().run(),
          'Bullet List'
        )}
        {mkBtn(
          '1. List',
          editor.isActive('orderedList'),
          () => editor.chain().toggleOrderedList().run(),
          'Ordered List'
        )}
        {mkBtn('H2', editor.isActive('heading', { level: 2 }), () =>
          editor.chain().setHeading({ level: 2 }).run()
        )}
        {mkBtn('H3', editor.isActive('heading', { level: 3 }), () =>
          editor.chain().setHeading({ level: 3 }).run()
        )}
        {mkBtn('H4', editor.isActive('heading', { level: 4 }), () =>
          editor.chain().setHeading({ level: 4 }).run()
        )}
        {mkBtn('Link', editor.isActive('link'), async () => {
          const url = window.prompt('URL girin');
          if (url) editor.chain().extendMarkRange('link').setLink({ href: url }).run();
        })}
        {mkBtn('Img', false, () => {
          const url = window.prompt('Görsel URL');
          if (url) editor.chain().setImage({ src: url }).run();
        })}
        {mkBtn('Clear', false, () =>
          editor.chain().unsetAllMarks().clearNodes().run()
        )}
      </Bar>
      <Body>
        <Content editor={editor} />
      </Body>
    </Wrap>
  );
}
