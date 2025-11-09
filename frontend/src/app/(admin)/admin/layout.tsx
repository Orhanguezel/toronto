// src/app/(admin)/admin/layout.tsx
import type { Route } from "next";
import { getAdminToken } from "@/lib/auth/cookies";
import { redirect } from "next/navigation";
import AdminLayout from "@/shared/admin/AdminLayout";

const LOGIN_ROUTE = "/login" as const;

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  const token = getAdminToken();
  if (!token) redirect(LOGIN_ROUTE as Route); // veya: redirect('/admin/login' as Route)

  return <AdminLayout>{children}</AdminLayout>;
}
