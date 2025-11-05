"use client";

import { useEffect, useState } from "react";

export function useHlsFallback(srcs: string[]) {
  const [url, setUrl] = useState(srcs[0]);
  useEffect(() => {
    let i = 0;
    let cancelled = false;
    const tryLoad = async () => {
      while (i < srcs.length && !cancelled) {
        try {
          const r = await fetch(srcs[i], { method: "HEAD", cache: "no-store" });
          if (r.ok) { setUrl(srcs[i]); return; }
        } catch {}
        i++;
      }
    };
    tryLoad();
    return () => { cancelled = true; };
  }, [srcs.join("|")]);
  return url;
}
