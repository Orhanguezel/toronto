// src/app/analytics/sentry.client.ts
"use client";
import * as Sentry from "@sentry/browser";

if (process.env.NEXT_PUBLIC_DISABLE_SENTRY !== "1") {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
  });
}
