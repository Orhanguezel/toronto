// src/shared/ui/typography.tsx

import * as React from "react";
import { useTheme } from "styled-components";

type ElemProps<T extends keyof JSX.IntrinsicElements> =
  Omit<React.ComponentPropsWithoutRef<T>, "style"> & { as?: T; style?: React.CSSProperties };

export function H1<T extends keyof JSX.IntrinsicElements = "h1">({
  as,
  style,
  ...rest
}: ElemProps<T>) {
  const theme: any = useTheme();
  const Tag = (as ?? "h1") as any;

  return (
    <Tag
      style={{
        fontSize: "clamp(32px, 6vw, 56px)",
        lineHeight: 1.06,
        letterSpacing: "-0.01em",
        margin: "12px 0 16px",
        color: theme?.colors?.title ?? "#fff",
        ...style,
      }}
      {...(rest as any)}
    />
  );
}

export function H2<T extends keyof JSX.IntrinsicElements = "h2">({
  as,
  style,
  ...rest
}: ElemProps<T>) {
  const theme: any = useTheme();
  const Tag = (as ?? "h2") as any;

  return (
    <Tag
      style={{
        fontSize: "clamp(24px, 4vw, 36px)",
        lineHeight: 1.12,
        margin: "0 0 10px",
        color: theme?.colors?.title ?? "#fff",
        ...style,
      }}
      {...(rest as any)}
    />
  );
}

export function Lead<T extends keyof JSX.IntrinsicElements = "p">({
  as,
  style,
  ...rest
}: ElemProps<T>) {
  const theme: any = useTheme();
  const Tag = (as ?? "p") as any;

  return (
    <Tag
      style={{
        fontSize: "clamp(16px, 1.6vw, 18px)",
        color: theme?.colors?.textSecondary ?? "rgba(255,255,255,0.72)",
        maxWidth: "70ch",
        margin: 0,
        lineHeight: 1.7,
        ...style,
      }}
      {...(rest as any)}
    />
  );
}

export function Prose<T extends keyof JSX.IntrinsicElements = "div">({
  as,
  className,
  style,
  ...rest
}: ElemProps<T>) {
  const Tag = (as ?? "div") as any;
  const cls = className ? `ui-prose ${className}` : "ui-prose";
  return <Tag className={cls} style={{ ...style }} {...(rest as any)} />;
}
