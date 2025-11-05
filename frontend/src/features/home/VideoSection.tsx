"use client";

import styled from "styled-components";
import Container from "@/shared/ui/common/Container";

const Section = styled.section`
  padding: ${({ theme }) => theme.spacings.xl} 0;
  background: transparent;
`;

const Box = styled.div`
  max-width: 960px;
  margin: 0 auto;
`;

const Player = styled.video<{ $ratio?: string }>`
  width: 100%;
  height: auto;          /* kritik: globalde yükseklik zorlanmasın */
  block-size: auto;      /* FF uyumu */
  display: block;

  border-radius: ${({ theme }) => theme.radii.lg};
  border: ${({ theme }) => theme.borders.thin};
  border-color: ${({ theme }) => theme.colors.borderLight};
  background: ${({ theme }) => theme.colors.black};
  box-shadow: ${({ theme }) => theme.shadows.md};

  aspect-ratio: ${({ $ratio }) => $ratio || "16 / 9"};
  outline: none;
  /* isterseniz: object-fit: cover;  */
`;

type Props = {
  src: string;
  poster?: string;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  ratio?: string; // "16 / 9", "4 / 3", "1 / 1" ...
};

export default function VideoSection({
  src,
  poster,
  controls = true,
  autoPlay,
  muted,
  loop,
  ratio,
}: Props) {
  return (
    <Section>
      <Container>
        <Box>
          <Player
            $ratio={ratio}
            controls={controls}
            autoPlay={autoPlay}
            muted={muted}
            loop={loop}
            preload="metadata"
            poster={poster}
            playsInline
          >
            <source src={src} type="video/mp4" />
          </Player>
        </Box>
      </Container>
    </Section>
  );
}
