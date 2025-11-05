// src/features/projects/ProjectView.tsx
"use client";

import Image from "next/image";
import styled from "styled-components";
import type { CMSProject } from "@/lib/cms";

type Props = { item: CMSProject };

const Wrap = styled.section`
  margin: ${({ theme }) => theme.spacings.xl} 0;
`;

const Summary = styled.p`
  margin: ${({ theme }) => theme.spacings.md} 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 840px;
`;

const Gallery = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: ${({ theme }) => theme.spacings.md};
  margin: ${({ theme }) => theme.spacings.lg} 0;
`;

const Prose = styled.article`
  max-width: 840px;
  line-height: 1.7;

  h2, h3 {
    margin-top: ${({ theme }) => theme.spacings.lg};
    color: ${({ theme }) => theme.colors.title};
  }
  p {
    margin: ${({ theme }) => theme.spacings.md} 0;
    color: ${({ theme }) => theme.colors.text};
  }
  ul, ol {
    padding-left: 1.2rem;
  }
  a {
    color: ${({ theme }) => theme.colors.link};
    text-decoration: underline;
    &:hover { color: ${({ theme }) => theme.colors.linkHover}; }
  }
`;

export default function ProjectView({ item }: Props) {
  // Bu bileşen başlık render etmez; sayfadaki <h1> ile çakışmasın diye.
  return (
    <Wrap>
      {item.summary ? <Summary>{item.summary}</Summary> : null}

      {Array.isArray(item.gallery) && item.gallery.length > 0 ? (
        <Gallery>
          {item.gallery.map((src, i) => (
            <div key={i}>
              <Image
                src={src}
                alt={`Gallery ${i + 1}`}
                width={640}
                height={400}
                sizes="(max-width: 768px) 100vw, 33vw"
                style={{ width: "100%", height: "auto", borderRadius: 12 }}
              />
            </div>
          ))}
        </Gallery>
      ) : null}

      {item.body ? (
        <Prose dangerouslySetInnerHTML={{ __html: item.body }} />
      ) : null}
    </Wrap>
  );
}
