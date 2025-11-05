import * as React from "react";

type ElemProps<T extends keyof JSX.IntrinsicElements> =
  React.ComponentPropsWithoutRef<T> & { as?: T };

export function H1<T extends keyof JSX.IntrinsicElements = "h1">({
  as, style, ...rest
}: ElemProps<T>) {
  const Tag = (as ?? "h1") as any;
  return (
    <Tag
      style={{
        fontSize: "clamp(32px, 6vw, 56px)",
        lineHeight: 1.06,
        letterSpacing: "-0.01em",
        margin: "12px 0 var(--spacing-md)",
        color: "var(--color-title)",
        ...style,
      }}
      {...rest}
    />
  );
}

export function H2<T extends keyof JSX.IntrinsicElements = "h2">({
  as, style, ...rest
}: ElemProps<T>) {
  const Tag = (as ?? "h2") as any;
  return (
    <Tag
      style={{
        fontSize: "clamp(24px, 4vw, 36px)",
        lineHeight: 1.12,
        margin: "0 0 var(--spacing-sm)",
        color: "var(--color-title)",
        ...style,
      }}
      {...rest}
    />
  );
}

export function Lead<T extends keyof JSX.IntrinsicElements = "p">({
  as, style, ...rest
}: ElemProps<T>) {
  const Tag = (as ?? "p") as any;
  return (
    <Tag
      style={{
        fontSize: "1.125rem",
        color: "var(--color-textSecondary)",
        maxWidth: "70ch",
        margin: 0,
        ...style,
      }}
      {...rest}
    />
  );
}

export function Prose<T extends keyof JSX.IntrinsicElements = "div">({
  as, className, style, ...rest
}: ElemProps<T>) {
  const Tag = (as ?? "div") as any;
  const cls = className ? `ui-prose ${className}` : "ui-prose";
  return <Tag className={cls} style={{ ...style }} {...rest} />;
}
