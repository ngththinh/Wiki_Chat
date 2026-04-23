import { redirect } from "next/navigation";
import { ROUTES } from "@/constants";

export default function AdminDocumentsRedirectPage() {
  redirect(ROUTES.ADMIN_CATEGORIES);
}
