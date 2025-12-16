"use client";

import * as React from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";

import type { BlogCarouselProps } from "./blog.types";
import { blogHash, indexFromHash } from "./blog.helpers";

import BlogFeaturedCard from "./BlogFeaturedCard";
import BlogRail from "./BlogRail";

import { useLazyGetCustomPagePublicQuery } from "@/integrations/rtk/endpoints/custom_pages.endpoints";
import type { CustomPageDto } from "@/integrations/types/custom_pages.types";

function hasDetailContent(p: CustomPageDto | null | undefined): boolean {
    if (!p) return false;
    if (typeof p.content === "string" && p.content.trim()) return true;
    if (typeof p.content_html === "string" && p.content_html.trim()) return true;
    if (typeof p.content_raw === "string" && p.content_raw.includes('"html"'))
        return true;
    return false;
}

export default function BlogCarousel({
    items,
    locale,
    initialHash,
    ctaLabel,
}: BlogCarouselProps) {
    const itemsRef = React.useRef(items);
    React.useEffect(() => {
        itemsRef.current = items;
    }, [items]);

    const [activeIndex, setActiveIndex] = React.useState(() => {
        const idx = indexFromHash(items, initialHash);
        return idx >= 0 ? idx : 0;
    });

    const [expanded, setExpanded] = React.useState(false);

    const [detailById, setDetailById] = React.useState<
        Record<string, CustomPageDto>
    >({});

    const [triggerGet] = useLazyGetCustomPagePublicQuery();

    React.useEffect(() => {
        const applyHash = (hash: string) => {
            const idx = indexFromHash(itemsRef.current, hash);
            if (idx >= 0) {
                setActiveIndex((p) => (p === idx ? p : idx));
            }
        };

        const onHashChange = () => applyHash(window.location.hash);

        if (window.location.hash) applyHash(window.location.hash);
        window.addEventListener("hashchange", onHashChange);
        return () => window.removeEventListener("hashchange", onHashChange);
    }, []);

    const activeBase = items[activeIndex] ?? items[0];
    const active =
        activeBase?.id && detailById[activeBase.id]
            ? detailById[activeBase.id]
            : activeBase;

    function setHashSilently(hash: string) {
        const base = window.location.pathname + window.location.search;
        window.history.replaceState(null, "", `${base}#${hash}`);
    }

    function selectIndex(next: number) {
        const p = items[next];
        if (!p) return;

        setActiveIndex(next);
        setExpanded(false);
        setHashSilently(blogHash(p));
    }

    async function toggleReadAsync() {
        const next = !expanded;

        if (next) {
            const id = activeBase?.id;
            if (id) {
                const baseHas = hasDetailContent(activeBase);
                const cacheHas = hasDetailContent(detailById[id]);

                if (!baseHas && !cacheHas) {
                    try {
                        const res = await triggerGet({ id, locale }).unwrap();
                        setDetailById((prev) => ({ ...prev, [id]: res }));
                    } catch {
                        /* noop */
                    }
                }
            }
        }

        setExpanded(next);
    }

    const onToggleRead = React.useCallback(() => {
        void toggleReadAsync();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expanded, activeBase?.id, locale]);

    return (
        <Shell>
            <FeaturedArea>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={active?.id}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -14 }}
                        transition={{ duration: 0.22 }}
                    >
                        <BlogFeaturedCard
                            post={active}
                            ctaLabel={ctaLabel} // "Read"
                            height={0}
                            expanded={expanded}
                            onToggle={onToggleRead}
                        />
                    </motion.div>
                </AnimatePresence>
            </FeaturedArea>

            <RailArea>
                <StickyRail>
                    <BlogRail items={items} activeIndex={activeIndex} onSelect={selectIndex} />
                </StickyRail>
            </RailArea>
        </Shell>
    );
}

const Shell = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 18px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const FeaturedArea = styled.div`
  min-width: 0;
`;

const RailArea = styled.div`
  min-width: 0;

  @media (max-width: 980px) {
    margin-top: 12px;
  }
`;

const StickyRail = styled.div`
  position: sticky;
  top: calc(var(--navbar-h, 96px) + 18px);
  max-height: calc(100vh - (var(--navbar-h, 96px) + 36px));
  overflow: auto;
  border-radius: 14px;
`;
