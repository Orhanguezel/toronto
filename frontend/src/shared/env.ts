// src/shared/env.ts
const ensureOrigin = (v: string | undefined, fallback: string) =>
  v && /^https?:\/\//i.test(v) ? v : fallback;

export const SITE_URL = ensureOrigin(process.env.NEXT_PUBLIC_SITE_URL, 'http://localhost:3000');
export const API_URL  = ensureOrigin(process.env.NEXT_PUBLIC_API_URL,  'http://127.0.0.1:8088');
export const API_BASE = ensureOrigin(process.env.API_BASE_URL,         API_URL);

export const toAbsUrl = (path: string) => new URL(path, SITE_URL).toString();
