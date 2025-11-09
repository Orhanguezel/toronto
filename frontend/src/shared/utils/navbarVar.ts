// src/shared/utils/navbarVar.ts
export function setNavbarHeightVar() {
  const el = document.querySelector("header[data-navbar]") as HTMLElement | null;
  if (!el) return () => {};
  const apply = () =>
    document.documentElement.style.setProperty("--navbar-h", `${el.offsetHeight}px`);
  apply();
  const ro = new ResizeObserver(apply);
  ro.observe(el);
  return () => ro.disconnect();
}
