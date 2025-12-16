// src/frontend/src/features/services/ServicesCarousel.tsx

"use client";

import * as React from "react";
import styled from "styled-components";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import type { ServiceDto } from "@/integrations/types/services.types";
import type { ServicesCarouselProps } from "./services.types";
import { serviceHash } from "./services.helpers";
import ServiceCard from "./ServiceCard";

const RAIL_HEIGHT = 360;
const SPINE_WIDTH = 68;
const GAP = 12;

function normalizeHash(raw?: string) {
    const h = (raw || "").trim();
    if (!h) return "";
    return h.startsWith("#") ? h.slice(1) : h;
}

function indexFromHash(items: ServiceDto[], hash?: string) {
    const h = normalizeHash(hash);
    if (!h) return -1;
    const idx = items.findIndex((i) => serviceHash(i) === h || i.id === h);
    return idx;
}

export default function ServicesCarousel({
    items,
    locale,
    initialHash,
}: ServicesCarouselProps) {
    const router = useRouter();

    // ✅ items ref: hash listener içinde güncel items
    const itemsRef = React.useRef(items);
    React.useEffect(() => {
        itemsRef.current = items;
    }, [items]);

    // ✅ active index: yalnızca ilk mount’ta initialHash’e göre belirle
    const [activeIndex, setActiveIndex] = React.useState<number>(() => {
        const idx = indexFromHash(items, initialHash);
        return idx >= 0 ? idx : 0;
    });

    // ✅ animasyon yönü için önceki index
    const prevActiveRef = React.useRef(activeIndex);
    React.useEffect(() => {
        prevActiveRef.current = activeIndex;
    }, [activeIndex]);

    // ✅ hashchange listener: 1 kez kurulsun, items değişince reset atmasın
    React.useEffect(() => {
        const applyHash = (hash: string) => {
            const idx = indexFromHash(itemsRef.current, hash);
            if (idx >= 0) {
                setActiveIndex((prev) => (prev === idx ? prev : idx));
            }
        };

        const onHashChange = () => {
            const h = typeof window !== "undefined" ? window.location.hash : "";
            applyHash(h);
        };

        // Sadece hash varsa uygula (yoksa 0’a çekme)
        if (typeof window !== "undefined" && window.location.hash) {
            applyHash(window.location.hash);
        }

        window.addEventListener("hashchange", onHashChange);
        return () => window.removeEventListener("hashchange", onHashChange);
    }, []);

    function selectIndex(nextIndex: number) {
        const svc = items[nextIndex];
        if (!svc) return;

        setActiveIndex(nextIndex);
        router.replace(`/${locale}/services#${serviceHash(svc)}`, { scroll: false });
    }

    return (
        <Rail>
            <Track $h={RAIL_HEIGHT}>
                {items.map((svc, idx) => {
                    const isActive = idx === activeIndex;
                    const prev = prevActiveRef.current;

                    return (
                        <Panel
                            key={svc.id}
                            layout
                            transition={{ type: "spring", stiffness: 420, damping: 38 }}
                            $active={isActive}
                            $spineW={SPINE_WIDTH}
                            $h={RAIL_HEIGHT}
                        >
                            {isActive ? (
                                <CardWrap
                                    layout
                                    initial={{ opacity: 0, x: idx > prev ? 16 : -16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.22 }}
                                    $h={RAIL_HEIGHT}
                                >
                                    <ServiceCard
                                        service={svc}
                                        locale={locale}
                                        railHeight={RAIL_HEIGHT}
                                    />
                                </CardWrap>
                            ) : (
                                <SpineButton
                                    type="button"
                                    onClick={() => selectIndex(idx)}
                                    $h={RAIL_HEIGHT}
                                    aria-label={svc.name || "Service"}
                                >
                                    <SpineTitle>{svc.name}</SpineTitle>
                                    <SpineIndex aria-hidden>{idx + 1}</SpineIndex>
                                </SpineButton>
                            )}
                        </Panel>
                    );
                })}
            </Track>
        </Rail>
    );
}

/* ---------------- styles (styled-components) ---------------- */

const Rail = styled.div`
  width: 100%;
  overflow: hidden;
`;

const Track = styled.div<{ $h: number }>`
  display: flex;
  align-items: stretch;
  gap: ${GAP}px;
  width: 100%;
  height: ${({ $h }) => $h}px;
`;

const Panel = styled(motion.div) <{
    $active: boolean;
    $spineW: number;
    $h: number;
}>`
  height: ${({ $h }) => $h}px;
  border-radius: 14px;
  overflow: hidden;

  flex: ${({ $active }) => ($active ? "1 1 auto" : "0 0 auto")};
  min-width: ${({ $active, $spineW }) => ($active ? "0" : `${$spineW}px`)};
`;

const CardWrap = styled(motion.div) <{ $h: number }>`
  height: ${({ $h }) => $h}px;
`;

const SpineButton = styled.button<{ $h: number }>`
  height: ${({ $h }) => $h}px;
  width: ${SPINE_WIDTH}px;

  border: none;
  border-radius: 14px;
  cursor: pointer;

  background: #1e40af;
  color: #fff;

  padding: 14px 10px;
  writing-mode: vertical-rl;
  transform: rotate(180deg);

  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  user-select: none;

  &:hover {
    background: #2563eb;
  }
`;

const SpineTitle = styled.span`
  font-weight: 800;
  font-size: 18px;
  letter-spacing: 0.4px;
  line-height: 1.05;
  text-align: center;
`;

const SpineIndex = styled.span`
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);

  width: 28px;
  height: 28px;
  border-radius: 999px;

  background: #0b0f1a;
  color: #fff;
  font-weight: 800;
  font-size: 14px;

  display: flex;
  align-items: center;
  justify-content: center;

  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35);
`;
