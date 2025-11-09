// src/shared/ui/layout/Footer.tsx
"use client";

import styled from "styled-components";
import Container from "@/shared/ui/common/Container";

const Wrap = styled.footer`
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
  padding: ${({ theme }) => theme.spacings.xl} 0;
  background: ${({ theme }) => theme.colors.footerBackground};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Grid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.md};
`;

const InfoRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.md};
  align-items: center;
  flex-wrap: wrap;

  a {
    color: ${({ theme }) => theme.colors.link};
    text-decoration: none;
    &:hover {
      color: ${({ theme }) => theme.colors.linkHover};
    }
  }
`;

const Socials = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.sm};
  a { opacity: 0.9; }
`;

const Hours = styled.div`
  display: grid;
  gap: 4px;
  opacity: 0.9;
`;

const Copy = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.small};
`;

type Props = {
  contact?: { phones?: string[]; email?: string; address?: string };
  socials?: Partial<Record<"instagram"|"facebook"|"youtube"|"linkedin"|"x", string>>;
  hours?: { days: string; open: string; close: string }[];
};

export default function Footer({ contact, socials, hours }: Props) {
  return (
    <Wrap>
      <Container>
        <Grid>
          {contact?.address && <div>{contact.address}</div>}
          <InfoRow>
            {contact?.phones?.[0] && <>Tel: <a href={`tel:${contact.phones[0]}`}>{contact.phones[0]}</a></>}
            {contact?.email && <>E-posta: <a href={`mailto:${contact.email}`}>{contact.email}</a></>}
          </InfoRow>
          {hours?.length ? (
            <Hours>{hours.map((h,i)=> <div key={i}>{h.days}: {h.open} – {h.close}</div>)}</Hours>
          ) : null}
          <Socials>
            {socials?.instagram && <a href={socials.instagram} aria-label="Instagram">📸</a>}
            {socials?.facebook && <a href={socials.facebook} aria-label="Facebook">📘</a>}
            {socials?.youtube && <a href={socials.youtube} aria-label="YouTube">▶️</a>}
            {socials?.linkedin && <a href={socials.linkedin} aria-label="LinkedIn">💼</a>}
            {socials?.x && <a href={socials.x} aria-label="X">𝕏</a>}
          </Socials>
          <Copy>© {new Date().getFullYear()} Toronto. All rights reserved.</Copy>
        </Grid>
      </Container>
    </Wrap>
  );
}
