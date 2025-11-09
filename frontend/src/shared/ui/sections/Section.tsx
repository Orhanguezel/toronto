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
  compact:  "clamp(32px, 6vw, 72px)",      // küçük alanlar
  normal:   "clamp(56px, 9vw, 112px)",     // genel kullanım
  spacious: "clamp(84px, 12vw, 180px)",    // 🔼 daha yüksek (default)
  hero:     "clamp(120px, 18vw, 280px)",   // manşet / kahraman alan
};

/** Section */
function SectionInner<T extends keyof JSX.IntrinsicElements = "section">(
  {
    as,
    style,
    density = "spacious",
    minHeight,          // "720px" | "80vh" gibi
    fullViewport,       // true ise en az 100vh - navbar kadar yap
    ...rest
  }: PolyProps<T> & {
    density?: Density;
    minHeight?: string | number;
    fullViewport?: boolean;
  }
) {
  const Tag = (as ?? "section") as any;

  // CSS var ile override imkanı: --section-py
  const pady = `var(--section-py, ${PADY[density]})`;

  // 100vh - navbar (var(--navbar-h)) - güvenlik payı
  const fvMinH = `max(0px, calc(100vh - var(--navbar-h, 96px) - 16px))`;

  return (
    <Tag
      style={{
        padding: `${pady} 0`,
        minHeight: fullViewport ? fvMinH : minHeight,
        ["--section-gap" as any]: "var(--section-gap, 16px)",
        ...style,
      }}
      {...(rest as any)}
    />
  );
}

/** Section Head (başlık + lead gridi) */
function SectionHeadInner<T extends keyof JSX.IntrinsicElements = "div">(
  { as, style, ...rest }: PolyProps<T>
) {
  const Tag = (as ?? "div") as any;

  // CSS var override: --section-head-gap, --section-head-mb, --section-head-max
  const gap = "var(--section-head-gap, clamp(8px, 1.8vw, 18px))";
  const mb  = "var(--section-head-mb, clamp(18px, 3.2vw, 28px))";
  const max = "var(--section-head-max, 68ch)";

  return (
    <Tag
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
