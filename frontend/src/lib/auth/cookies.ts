// src/lib/auth/cookies.ts
import { cookies } from "next/headers";
export const ADMIN_TOKEN_COOKIE = "ADMIN_TOKEN";

export async function getAdminToken(): Promise<string | null> {
  const c = await cookies();
  return c.get(ADMIN_TOKEN_COOKIE)?.value ?? null;
}
