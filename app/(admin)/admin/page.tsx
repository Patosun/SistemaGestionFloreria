import { redirect } from "next/navigation"

// /admin redirige al dashboard
export default function AdminIndexPage() {
  redirect("/admin/dashboard")
}
