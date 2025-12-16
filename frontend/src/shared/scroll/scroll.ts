// =============================================================
// FILE: src/shared/scroll/scroll.ts
// =============================================================

import { LOCALE_SET } from "@/i18n/config";
import type { SupportedLocale } from "@/types/common";

/**
 * Navbar yüksekliğini ölçüp --navbar-h CSS değişkenine yazar.
 * Scroll hesaplarında tek referans burasıdır.
 */
export function installNavbarHeightObserver() {
  if (typeof document === "undefined") return () => { };

  const root = document.documentElement;

  const write = (h: number) => {
    root.style.setProperty("--navbar-h", `${Math.round(h)}px`);
  };

  // Fallback
  write(96);

  const el = document.querySelector<HTMLElement>("[data-navbar]");
  if (!el) return () => { };

  // İlk ölçüm
  const rafId = requestAnimationFrame(() => {
    const h = el.getBoundingClientRect().height || el.offsetHeight || 96;
    write(h);
  });

  // Dinamik resize
  const ro = new ResizeObserver((entries) => {
    const box = entries[0]?.contentRect;
    const h = box?.height ?? el.offsetHeight ?? 96;
    write(h);
  });

  ro.observe(el);

  return () => {
    cancelAnimationFrame(rafId);
    ro.disconnect();
  };
}

/**
 * 🔑 TEK VE DOĞRU SCROLL IMPLEMENTASYONU
 *
 * - scrollIntoView YOK
 * - Navbar offset manuel
 * - Smooth + reduce-motion uyumlu
 * - Zıplama yapmaz
 */
export function scrollToSection(
  id: string,
  opts?: { instant?: boolean }
) {
  if (typeof document === "undefined") return;

  const el = document.getElementById(id);
  if (!el) return;

  const prefersReduced =
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const navbarH =
    parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue("--navbar-h")
        .replace("px", "")
    ) || 96;

  const top =
    el.getBoundingClientRect().top +
    window.pageYOffset -
    navbarH -
    12; // küçük nefes payı

  window.scrollTo({
    top,
    behavior: opts?.instant || prefersReduced ? "auto" : "smooth",
  });
}

/* ------------------------------------------------------------------ */
/* ------------------------ PATH / SECTION --------------------------- */
/* ------------------------------------------------------------------ */

/** "/tr/..." gibi path’lerden locale’i güvenli biçimde düşürür. */
function stripLeadingLocale(pathname: string): string {
  const pathOnly = pathname.split("#")[0] || "/";
  const parts = pathOnly.replace(/^\/+/, "").split("/"); // ["tr","services","web"]
  const first = (parts[0] || "").toLowerCase();

  if (first && LOCALE_SET.has(first)) {
    parts.shift();
    const out = "/" + parts.join("/");
    return out === "/" ? "/" : out.replace(/\/+$/, "");
  }

  return pathOnly || "/";
}

/**
 * URL → section id türetir
 * Scroll kararı LandingClient’te verilir
 */
export function deriveSectionFromPath(
  pathname: string,
  _locale?: SupportedLocale | string
): string | null {
  const withoutLocale = stripLeadingLocale(pathname);

  if (withoutLocale === "/" || withoutLocale === "") return null;

  const segs = withoutLocale.split("/").filter(Boolean);
  const top = (segs[0] || "").toLowerCase();

  // Top-level sections
  if (top === "about") return "about";
  if (top === "services") return "services";
  if (top === "blog") return "blog";
  if (top === "portfolio") return "portfolio";
  if (top === "contact") return "contact";

  // Bilinmeyen rota → hero
  return null;
}
