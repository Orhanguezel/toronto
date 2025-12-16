// src/layout/ScrollProgress.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { FiChevronUp } from "react-icons/fi";

const CIRCUMFERENCE = 308.66; // 2πr (r≈49)

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    const calc = () => {
      const total = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );

      const p = (window.scrollY / total) * 100;
      setProgress(Math.max(0, Math.min(100, p)));

      tickingRef.current = false;
    };

    const onScroll = () => {
      if (!tickingRef.current) {
        tickingRef.current = true;
        requestAnimationFrame(calc);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    calc();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const onClick = () => {
    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReduced ? "auto" : "smooth",
    });
  };

  const dashOffset =
    CIRCUMFERENCE - (progress * CIRCUMFERENCE) / 100;

  return (
    <Wrap
      type="button"
      $active={progress > 0}
      onClick={onClick}
      aria-label="Back to top"
      title="Back to top"
    >
      <Svg viewBox="-1 -1 102 102" aria-hidden="true">
        <Path
          d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98"
          style={{
            strokeDasharray: `${CIRCUMFERENCE}px`,
            strokeDashoffset: `${dashOffset}px`,
          }}
        />
      </Svg>

      <Icon>
        <FiChevronUp size={20} />
      </Icon>
    </Wrap>
  );
}

/* ------------------------------------------------------------------ */
/* ------------------------------ STYLES ------------------------------ */
/* ------------------------------------------------------------------ */

/* ✅ ÖNCE Icon */
const Icon = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  color: ${({ theme }) => theme.colors.primary};
  transition: color ${({ theme }) => theme.transition.fast};
`;

const Wrap = styled.button<{ $active: boolean }>`
  position: fixed;
  right: ${({ theme }) => theme.spacings.lg};
  bottom: ${({ theme }) => theme.spacings.lg};

  width: 46px;
  height: 46px;
  border-radius: ${({ theme }) => theme.radii.circle};

  background: ${({ theme }) => theme.colors.cardBackground};
  box-shadow: ${({ theme }) => theme.shadows.md};

  border: 0;
  padding: 0;
  cursor: pointer;

  display: grid;
  place-items: center;

  opacity: ${({ $active }) => ($active ? 1 : 0)};
  visibility: ${({ $active }) => ($active ? "visible" : "hidden")};
  transform: ${({ $active }) =>
    $active ? "translateY(0)" : "translateY(8px)"};

  transition:
    opacity ${({ theme }) => theme.transition.fast},
    transform ${({ theme }) => theme.transition.fast},
    visibility ${({ theme }) => theme.transition.fast};

  z-index: ${({ theme }) => theme.zIndex.overlay};

  &:hover ${Icon} {
    color: ${({ theme }) => theme.colors.primaryHover};
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

const Svg = styled.svg`
  position: absolute;
  inset: 0;
`;

const Path = styled.path`
  fill: none;
  stroke: ${({ theme }) => theme.colors.primary};
  stroke-width: 4;
  transition: stroke-dashoffset ${({ theme }) => theme.durations.fast} linear;
`;
