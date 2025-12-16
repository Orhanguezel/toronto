// src/shared/ui/common/Container.tsx

import * as React from "react";

type PolyProps<T extends keyof JSX.IntrinsicElements> =
  Omit<React.ComponentPropsWithoutRef<T>, "as" | "style"> & {
    as?: T;
    style?: React.CSSProperties;
  };

function ContainerInner<T extends keyof JSX.IntrinsicElements = "div">(
  { as, style, ...rest }: PolyProps<T>
) {
  const Tag = (as ?? "div") as any;

  return (
    <Tag
      style={{
        // ✅ var yoksa fallback
        maxWidth: "var(--container-max, 1200px)",
        margin: "0 auto",
        paddingLeft: "var(--container-padX, clamp(16px, 4vw, 28px))",
        paddingRight: "var(--container-padX, clamp(16px, 4vw, 28px))",
        width: "100%",
        ...style,
      }}
      {...(rest as any)}
    />
  );
}

const Container = ContainerInner as <
  T extends keyof JSX.IntrinsicElements = "div"
>(props: PolyProps<T>) => JSX.Element;

export default Container;
