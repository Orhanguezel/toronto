"use client";

import * as React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export const Button = React.forwardRef<HTMLButtonElement, Props>(
  ({ variant = "primary", style, className, disabled, ...rest }, ref) => {
    // CSS var'lar yoksa güvenli fallback'ler
    const cfg = {
      primary: {
        bg: "var(--btn-primary-bg, var(--color-primary))",
        hoverBg: "var(--btn-primary-bg-hover, var(--color-primary-hover))",
        text: "var(--btn-primary-text, #fff)",
        border: "transparent",
      },
      secondary: {
        bg: "var(--btn-secondary-bg, var(--btn-ghost-bg, transparent))",
        hoverBg:
          "var(--btn-secondary-bg-hover, var(--btn-ghost-bg-hover, rgba(255,255,255,.06)))",
        text: "var(--btn-secondary-text, var(--btn-ghost-text, currentColor))",
        border: "var(--btn-secondary-border, var(--btn-ghost-border, rgba(255,255,255,.16)))",
      },
      ghost: {
        bg: "transparent",
        hoverBg: "var(--btn-ghost-bg-hover, rgba(255,255,255,.06))",
        text: "var(--btn-ghost-text, currentColor)",
        border: "var(--btn-ghost-border, rgba(255,255,255,.16))",
      },
      danger: {
        bg: "var(--btn-danger-bg, #dc3545)",
        hoverBg: "var(--btn-danger-bg-hover, #c82333)",
        text: "var(--btn-danger-text, #fff)",
        border: "transparent",
      },
    } as const;

    const c = cfg[variant];

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
          border: `1px solid ${c.border}`,
          fontWeight: 600,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
          transition:
            "transform .12s ease, opacity .12s ease, background var(--transition-normal, .3s ease), border-color var(--transition-normal, .3s ease), color var(--transition-normal, .3s ease)",
          background: c.bg,
          color: c.text,
          outline: "none",
          ...style,
        }}
        onMouseEnter={(e) => {
          if (disabled) return;
          const el = e.currentTarget;
          const v = (el.getAttribute("data-variant") || "") as Variant;
          if (v === "primary") el.style.background = cfg.primary.hoverBg;
          if (v === "danger") el.style.background = cfg.danger.hoverBg;
          if (v === "ghost") {
            el.style.background = cfg.ghost.hoverBg;
            el.style.borderColor = cfg.ghost.border;
          }
          if (v === "secondary") {
            el.style.background = cfg.secondary.hoverBg;
            el.style.borderColor = cfg.secondary.border;
          }
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          const v = (el.getAttribute("data-variant") || "") as Variant;
          if (v === "primary") el.style.background = cfg.primary.bg;
          if (v === "danger") el.style.background = cfg.danger.bg;
          if (v === "ghost") {
            el.style.background = cfg.ghost.bg;
            el.style.borderColor = cfg.ghost.border;
          }
          if (v === "secondary") {
            el.style.background = cfg.secondary.bg;
            el.style.borderColor = cfg.secondary.border;
          }
        }}
        {...rest}
      />
    );
  }
);
Button.displayName = "Button";
