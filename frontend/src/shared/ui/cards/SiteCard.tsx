"use client";

import styled from "styled-components";
import Link from "next/link";

export const Card = styled.article`
  position: relative;
  background: ${({ theme }) => theme.cards.background};
  border: 1px solid ${({ theme }) => theme.cards.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  padding: clamp(14px, 2vw, 20px);
  transition:
    transform ${({ theme }) => theme.transition.fast},
    box-shadow ${({ theme }) => theme.transition.fast},
    background ${({ theme }) => theme.transition.fast};
  will-change: transform, box-shadow;

  &:hover {
    transform: translateY(-2px);
    background: ${({ theme }) => theme.cards.hoverBackground};
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

export const CardHeader = styled.header`
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

export const CardIcon = styled.div`
  width: 40px; height: 40px;
  display: grid; place-items: center;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.secondaryTransparent};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

export const CardTitle = styled.h3`
  margin: 0;
  font-size: clamp(16px, 1.6vw, 20px);
  line-height: 1.25;
  color: ${({ theme }) => theme.colors.title};
  letter-spacing: -0.01em;
`;

export const CardBody = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: clamp(14px, 1.3vw, 16px);
  line-height: 1.6;
`;

export const CardActions = styled.div`
  margin-top: 12px;
  display: flex; gap: 10px; flex-wrap: wrap;
`;

export const CardLink = styled(Link)`
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  text-decoration: none;
  color: ${({ theme }) => theme.colors.link};
  transition:
    background ${({ theme }) => theme.transition.fast},
    border ${({ theme }) => theme.transition.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.hoverBackground};
    border-color: ${({ theme }) => theme.colors.borderBrighter};
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;
