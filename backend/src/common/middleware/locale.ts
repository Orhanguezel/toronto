// src/common/middleware/locale.ts
import type { FastifyReply, FastifyRequest } from "fastify";
import { resolveLocaleFromHeaders, fallbackChain, type Locale } from "@/core/i18n";

export async function localeMiddleware(req: FastifyRequest, _reply: FastifyReply) {
  const { locale } = resolveLocaleFromHeaders(req.headers as Record<string, unknown>);
  (req as any).locale = locale as Locale;
  (req as any).localeFallbacks = fallbackChain(locale as Locale);

  // İsteğe bağlı: loglarda görmek istersen
  // req.log?.debug?.({ locale, fallbacks: (req as any).localeFallbacks }, "locale_resolved");
}
