// src/app/(admin)/admin/layout.tsx
import { getAdminToken } from "@/lib/auth/cookies";
import { redirect } from "next/navigation";
import AdminLayout from "@/shared/admin/AdminLayout";

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  const token = getAdminToken();
  if (!token) redirect("/admin/login"); // rotan burada, /login değil

  return <AdminLayout>{children}</AdminLayout>;
}
