// =============================================================
// FILE: src/shared/scroll/scroll.ts
// =============================================================
export type Locale = "tr" | "en" | "de";

/**
 * Navbar yüksekliğini ölçüp --navbar-h değişkenine yazar.
 * Section bileşenlerinde `scroll-margin-top: calc(var(--navbar-h, 96px) + 24px);`
 * olduğunda, manuel offset'e gerek kalmaz.
 */
export function installNavbarHeightObserver() {
  if (typeof document === "undefined") return () => {};

  const root = document.documentElement;
  const write = (h: number) => root.style.setProperty("--navbar-h", `${Math.round(h)}px`);

  // Varsayılan
  write(96);

  const el = document.querySelector<HTMLElement>("[data-navbar]");
  if (!el) return () => {};

  // İlk frame'de ölç
  const rafId = requestAnimationFrame(() => {
    const h = el.getBoundingClientRect().height || el.offsetHeight || 96;
    write(h);
  });

  // Dinamik değişimler için gözlemle
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
 * ID'li bir bölüme kaydır.
 * Offset hesabını CSS'teki `scroll-margin-top` yapar.
 */
export function scrollToSection(id: string, opts?: { instant?: boolean; block?: ScrollLogicalPosition }) {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (!el) return;

  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  el.scrollIntoView({
    behavior: opts?.instant || prefersReduced ? "auto" : "smooth",
    block: opts?.block ?? "start",
  });
}

/**
 * /tr/services/web  → "web"
 * /tr/services      → "services"
 * /tr/projects      → "projects"
 * /tr               → null  (hero varsayımı üst tarafta yapılabilir)
 */
export function deriveSectionFromPath(pathname: string, locale: Locale): string | null {
  // Hash'i at
  const pathOnly = pathname.split("#")[0] || "/";

  // Locale'i düşür (örn. /tr/....)
  const withoutLocale = pathOnly.replace(new RegExp(`^/${locale}(?=/|$)`), "") || "/";

  // Kök: scroll yapma (hero'ya bırak)
  if (withoutLocale === "/" || withoutLocale === "") return null;

  // Çoklu slash temizliği
  const segs = withoutLocale.split("/").filter(Boolean);
  const top = segs[0];

  // Bilinen top-level bölümler
  if (top === "projects") return "projects";
  if (top === "ad-solutions") return "ad-solutions";
  if (top === "references") return "references";
  if (top === "contact") return "contact";

  if (top === "services") {
    const child = (segs[1] || "").toLowerCase();
    // Yalnızca tanımlı alt başlıklar geçerli olsun; değilse "services"e indir
    const allowed = child === "web" || child === "design" || child === "seo";
    return allowed ? child : "services";
  }

  // Tanınmayan rota → hero
  return null;
}
