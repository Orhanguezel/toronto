// src/shared/ui/layout/NavOffset.tsx

"use client";

import * as React from "react";

/**
 * Navbar (fixed header) yüksekliğini ölçer ve
 * :root --navbar-h değişkenine yazar.
 */
export default function NavOffset() {
  React.useEffect(() => {
    const root = document.documentElement;
    const header =
      (document.querySelector("header") as HTMLElement | null) ?? null;

    const write = () => {
      const h = header?.getBoundingClientRect().height ?? 96; // güvenli varsayılan
      root.style.setProperty("--navbar-h", `${Math.round(h)}px`);
    };

    write();

    const ro = header ? new ResizeObserver(write) : null;
    ro?.observe(header!);

    const onResize = () => write();
    window.addEventListener("resize", onResize);

    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return null;
}
