"use client";

import * as React from "react";

type Variant = "primary" | "ghost" | "danger";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export const Button = React.forwardRef<HTMLButtonElement, Props>(
  ({ variant = "primary", style, className, disabled, ...rest }, ref) => {
    const bg =
      variant === "primary"
        ? "var(--btn-primary-bg)"
        : variant === "danger"
        ? "var(--btn-danger-bg)"
        : "transparent";

    const color =
      variant === "primary"
        ? "var(--btn-primary-text)"
        : variant === "danger"
        ? "var(--btn-danger-text)"
        : "var(--btn-ghost-text)";

    const borderColor =
      variant === "ghost" ? "var(--btn-ghost-border)" : "transparent";

    return (
      <button
        ref={ref}
        className={`ui-btn${className ? ` ${className}` : ""}`}
        data-variant={variant}
        disabled={disabled}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "10px 16px",
          borderRadius: 999,
          border: `1px solid ${borderColor}`,
          fontWeight: 600,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
          transition: "transform .12s ease, opacity .12s ease, background var(--transition-normal), border-color var(--transition-normal), color var(--transition-normal)",
          background: bg,
          color,
          outline: "none",
          ...style,
        }}
        onMouseEnter={(e) => {
          if (disabled) return;
          const el = e.currentTarget;
          const v = el.getAttribute("data-variant");
          if (v === "primary") el.style.background = "var(--btn-primary-bg-hover)";
          if (v === "danger")  el.style.background = "var(--btn-danger-bg-hover)";
          if (v === "ghost") {
            el.style.background = "var(--btn-ghost-bg-hover)";
            el.style.borderColor = "var(--btn-ghost-border)";
          }
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          const v = el.getAttribute("data-variant");
          if (v === "primary") el.style.background = "var(--btn-primary-bg)";
          if (v === "danger")  el.style.background = "var(--btn-danger-bg)";
          if (v === "ghost") {
            el.style.background = "transparent";
            el.style.borderColor = "var(--btn-ghost-border)";
          }
        }}
        {...rest}
      />
    );
  }
);
Button.displayName = "Button";
