// src/seo/jsonld.client.ts
"use client";

import type { Thing } from "./jsonld";

/**
 * Aynı JSON-LD’yi tekrar tekrar basmamak için id ile dedupe.
 */
export function injectJsonLd(obj: Thing, id?: string): void {
    const head = document.head;
    const key = id ? `jsonld:${id}` : null;

    let script: HTMLScriptElement | null = null;

    if (key) {
        script = head.querySelector<HTMLScriptElement>(`script[data-jsonld-id="${key}"]`);
    }

    if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        if (key) script.setAttribute("data-jsonld-id", key);
        head.appendChild(script);
    }

    script.text = JSON.stringify(obj);
}
