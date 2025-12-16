// src/shared/ui/sections/SectionHead.tsx

"use client";

import styled from "styled-components";
import React, { useId } from "react";

const HeadWrap = styled.header<{ $center?: boolean }>`
  margin-bottom: clamp(24px, 4vw, 48px); /* 🔼 artırıldı */
  text-align: ${({ $center }) => ($center ? "center" : "left")};
`;

const Title = styled.h2`
  margin: 0 0 8px 0;
  font-size: ${({ theme }) => theme.fontSizes.h2};
  line-height: 1.2;
  color: ${({ theme }) => theme.colors.title};
  letter-spacing: -0.015em;
`;

const Lead = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.md};
  line-height: 1.7;
`;

type Props = {
  title: string;
  lead?: string;
  center?: boolean;
  children?: React.ReactNode;
  id?: string;
};

export default function SectionHead({
  title,
  lead,
  center = true,
  children,
  id,
}: Props) {
  const autoId = useId();
  const headingId = id ?? `section-head-${autoId}`;

  return (
    <HeadWrap $center={center} aria-labelledby={headingId}>
      <Title id={headingId}>{title}</Title>
      {lead ? <Lead>{lead}</Lead> : null}
      {children}
    </HeadWrap>
  );
}
