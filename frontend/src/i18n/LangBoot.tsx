"use client";

import { useParams } from "next/navigation";
import { KNOWN_RTL, normalizeLocale } from "./config";
import HtmlLangSync from "./HtmlLangSync";

export default function LangBoot() {
  const params = useParams() as { locale?: string } | null;
  const l = normalizeLocale(params?.locale);
  const dir = KNOWN_RTL.has(l) ? "rtl" : "ltr";
  return <HtmlLangSync lang={l} dir={dir as "ltr" | "rtl"} />;
}
