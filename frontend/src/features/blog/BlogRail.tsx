"use client";

import styled from "styled-components";
import type { CustomPageDto } from "@/integrations/types/custom_pages.types";

export default function BlogRail({
  items,
  activeIndex,
  onSelect,
}: {
  items: CustomPageDto[];
  activeIndex: number;
  onSelect: (idx: number) => void;
}) {
  return (
    <List>
      {items.map((p, idx) => {
        const isActive = idx === activeIndex;

        return (
          <Row
            key={p.id}
            type="button"
            onClick={() => onSelect(idx)}
            $active={isActive}
          >
            <Badge aria-hidden>{idx + 1}</Badge>
            <RowBody>
              <RowTitle>{p.title || "Untitled"}</RowTitle>
              <RowMeta>
                {(p.created_at || p.updated_at || "").toString().slice(0, 10)}
              </RowMeta>
            </RowBody>
          </Row>
        );
      })}
    </List>
  );
}

const List = styled.div`
  /* ✅ height sabitleme yok → StickyRail max-height + overflow ile scroll olur */
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 2px;
`;

const Row = styled.button<{ $active: boolean }>`
  border: none;
  cursor: pointer;
  border-radius: 14px;
  padding: 12px;

  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 10px;
  align-items: center;

  background: ${({ $active }) =>
    $active ? "rgba(37,99,235,0.18)" : "rgba(255,255,255,0.06)"};
  color: #fff;

  &:hover {
    background: ${({ $active }) =>
    $active ? "rgba(37,99,235,0.24)" : "rgba(255,255,255,0.10)"};
  }
`;

const Badge = styled.span`
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: #0b0f1a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 14px;
`;

const RowBody = styled.div`
  min-width: 0;
`;

const RowTitle = styled.div`
  font-weight: 900;
  font-size: 14px;
  line-height: 1.15;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RowMeta = styled.div`
  margin-top: 4px;
  font-size: 12px;
  opacity: 0.8;
`;
