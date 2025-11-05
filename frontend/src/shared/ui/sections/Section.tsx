import * as React from "react";

type PolyProps<T extends keyof JSX.IntrinsicElements> =
  Omit<React.ComponentPropsWithoutRef<T>, "as" | "style"> & {
    as?: T;
    style?: React.CSSProperties;
  };

function SectionInner<T extends keyof JSX.IntrinsicElements = "section">(
  { as, style, ...rest }: PolyProps<T>
) {
  const Tag = (as ?? "section") as any;
  return (
    <Tag
      style={{
        padding: "calc(var(--space-unit) * 10) 0",
        ...style,
      }}
      {...(rest as any)}
    />
  );
}

function SectionHeadInner<T extends keyof JSX.IntrinsicElements = "div">(
  { as, style, ...rest }: PolyProps<T>
) {
  const Tag = (as ?? "div") as any;
  return (
    <Tag
      style={{
        display: "grid",
        gap: "var(--spacing-sm)",
        marginBottom: "calc(var(--space-unit) * 6)",
        ...style,
      }}
      {...(rest as any)}
    />
  );
}

export const Section = SectionInner as <
  T extends keyof JSX.IntrinsicElements = "section"
>(props: PolyProps<T>) => JSX.Element;

export const SectionHead = SectionHeadInner as <
  T extends keyof JSX.IntrinsicElements = "div"
>(props: PolyProps<T>) => JSX.Element;
