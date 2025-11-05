import * as React from "react";

type GridProps = React.HTMLAttributes<HTMLDivElement> & {
  $min?: number;
  $gap?: number | string;
  $align?: "start" | "center" | "end" | "stretch";
};

export function Grid({
  $min = 260,
  $gap,
  $align = "stretch",
  style,
  className,
  ...rest
}: GridProps) {
  return (
    <div
      className={`ui-grid${className ? ` ${className}` : ""}`}
      style={{
        display: "grid",
        alignItems: $align,
        gap: typeof $gap === "number" ? `${$gap}px` : $gap ?? "var(--spacing-md)",
        gridTemplateColumns: `repeat(auto-fill, minmax(${$min}px, 1fr))`,
        ...style,
      }}
      {...rest}
    />
  );
}
