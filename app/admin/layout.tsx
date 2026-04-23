import { ReactNode } from "react";
import { AdminRouteShell } from "@/screens/admin_screen";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminRouteShell>{children}</AdminRouteShell>;
}
