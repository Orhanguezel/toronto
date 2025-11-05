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
        maxWidth: "var(--container-max)",
        margin: "0 auto",
        paddingLeft: "var(--container-padX)",
        paddingRight: "var(--container-padX)",
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
