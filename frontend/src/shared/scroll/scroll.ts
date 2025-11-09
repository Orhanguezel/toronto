type Locale = "tr" | "en" | "de";

/** Navbar yüksekliğini ölçüp --navbar-h değişkenine yazar. */
export function installNavbarHeightObserver() {
  const root = document.documentElement;
  const write = (h: number) => root.style.setProperty("--navbar-h", `${Math.round(h)}px`);
  write(96);

  const el = document.querySelector<HTMLElement>("[data-navbar]");
  if (!el) return () => {};

  const ro = new ResizeObserver((entries) => {
    const box = entries[0]?.contentRect;
    const h = box?.height ?? el.offsetHeight ?? 96;
    write(h);
  });
  ro.observe(el);
  const r = requestAnimationFrame(() => write(el.getBoundingClientRect().height));

  return () => {
    cancelAnimationFrame(r);
    ro.disconnect();
  };
}

/** Artık manuel y hesaplamıyoruz; scroll-margin-top sayesinde bu yeterli. */
export function scrollToSection(id: string, opts?: { instant?: boolean }) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: opts?.instant ? "auto" : "smooth", block: "start" });
}

/** /tr/services/web → "web", /tr/projects → "projects", /tr → null */
export function deriveSectionFromPath(pathname: string, locale: Locale): string | null {
  const withoutLocale = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), "") || "/";
  if (withoutLocale === "/" || withoutLocale === "") return null;
  const segs = withoutLocale.split("/").filter(Boolean);
  const top = segs[0];

  if (top === "projects") return "projects";
  if (top === "services") return (segs[1] as "web"|"design"|"seo") ?? "services";
  if (top === "ad-solutions") return "ad-solutions";
  if (top === "references") return "references";
  if (top === "contact") return "contact";
  return null;
}
