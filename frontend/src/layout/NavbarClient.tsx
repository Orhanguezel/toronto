"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";

import Navbar from "@/layout/Navbar";
import { scrollToSection as scrollToSectionCore } from "@/shared/scroll/scroll";

type SectionId = "hero" | "about" | "services" | "blog" | "portfolio" | "contact";

type Props = {
    locale: string;
    contact?: { phones?: string[]; email?: string };
};

function normalizePath(p: string) {
    if (!p) return "/";
    const x = p.startsWith("/") ? p : `/${p}`;
    return x.length > 1 && x.endsWith("/") ? x.slice(0, -1) : x;
}

function asRoute(path: string): Route {
    return normalizePath(path) as Route;
}

function sectionToPath(locale: string, section: SectionId): string {
    const base = `/${locale}`;
    switch (section) {
        case "hero":
            return base;
        case "about":
            return `${base}/about`;
        case "services":
            return `${base}/services`;
        case "blog":
            return `${base}/blog`;
        case "portfolio":
            return `${base}/portfolio`;
        case "contact":
            return `${base}/contact`;
        default:
            return base;
    }
}

export default function NavbarClient({ locale, contact }: Props) {
    const pathname = usePathname() || "/";
    const router = useRouter();

    const goToSection = React.useCallback(
        (id: SectionId) => {
            // 1) URL'yi güncelle (SEO/route)
            const targetPath = normalizePath(sectionToPath(locale, id));
            const current = normalizePath(pathname);

            // aynı path değilse önce replace (scroll yok)
            if (current !== targetPath) {
                router.replace(asRoute(targetPath), { scroll: false });
            }

            // 2) ardından smooth scroll (offset core fonksiyonda)
            requestAnimationFrame(() => {
                scrollToSectionCore(id);
            });
        },
        [locale, pathname, router]
    );

    return <Navbar locale={locale as any} contact={contact} goToSection={goToSection} />;
}
