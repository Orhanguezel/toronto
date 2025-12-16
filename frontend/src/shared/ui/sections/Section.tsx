// src/shared/ui/sections/Section.tsx

import * as React from "react";

/** Polymorphic prop tipi */
type PolyProps<T extends keyof JSX.IntrinsicElements> =
  Omit<React.ComponentPropsWithoutRef<T>, "as" | "style"> & {
    as?: T;
    style?: React.CSSProperties;
  };

/** Dikey iç boşluk yoğunluğu */
type Density = "compact" | "normal" | "spacious" | "hero";

/** Her yoğunluk için varsayılan padding-block */
const PADY: Record<Density, string> = {
  compact: "clamp(24px, 5vw, 56px)",
  normal: "clamp(40px, 7vw, 92px)",
  spacious: "clamp(64px, 10vw, 140px)",
  hero: "clamp(96px, 14vw, 220px)",
};

/**
 * ✅ Section:
 * - padding: içerik nefes alsın
 * - & + &: ardışık section’lar arasında otomatik mesafe
 */
function SectionInner<T extends keyof JSX.IntrinsicElements = "section">(
  {
    as,
    style,
    density = "spacious",
    minHeight,
    fullViewport,
    ...rest
  }: PolyProps<T> & {
    density?: Density;
    minHeight?: string | number;
    fullViewport?: boolean;
  }
) {
  const Tag = (as ?? "section") as any;

  const pady = `var(--section-py, ${PADY[density]})`;
  const fvMinH = `max(0px, calc(100vh - var(--navbar-h, 96px) - 16px))`;

  return (
    <Tag
      className="ui-section"
      style={{
        padding: `${pady} 0`,
        minHeight: fullViewport ? fvMinH : minHeight,
        // ✅ section’lar arası “stack gap” için var
        ["--section-stack-gap" as any]: "var(--section-stack-gap, clamp(22px, 3.5vw, 54px))",
        ...style,
      }}
      {...(rest as any)}
    />
  );
}

/**
 * ✅ SectionHead (grid)
 */
function SectionHeadInner<T extends keyof JSX.IntrinsicElements = "div">(
  { as, style, ...rest }: PolyProps<T>
) {
  const Tag = (as ?? "div") as any;

  const gap = "var(--section-head-gap, clamp(10px, 2vw, 20px))";
  const mb = "var(--section-head-mb, clamp(18px, 3vw, 30px))";
  const max = "var(--section-head-max, 68ch)";

  return (
    <Tag
      className="ui-section-head"
      style={{
        display: "grid",
        gap,
        marginBottom: mb,
        justifyItems: "center",
        textAlign: "center",
        maxWidth: max,
        marginInline: "auto",
        ...style,
      }}
      {...(rest as any)}
    />
  );
}

export const Section = SectionInner as <
  T extends keyof JSX.IntrinsicElements = "section"
>(props: PolyProps<T> & {
  density?: Density;
  minHeight?: string | number;
  fullViewport?: boolean;
}) => JSX.Element;

export const SectionHead = SectionHeadInner as <
  T extends keyof JSX.IntrinsicElements = "div"
>(props: PolyProps<T>) => JSX.Element;

/**
 * ✅ Global style etkisi olmadan, sadece ui-section class’ı için:
 * Ardışık Section’lar arası boşluğu otomatik uygular.
 *
 * Not: Bunu global CSS’e koymak istemiyorsan,
 * styled-components GlobalStyle içinde de ekleyebilirsin.
 */
export const sectionAdjacentCss = `
  .ui-section + .ui-section {
    margin-top: var(--section-stack-gap, clamp(22px, 3.5vw, 54px));
  }
`;
