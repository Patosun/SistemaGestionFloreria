import { redirect } from "next/navigation"
import { db } from "@/lib/db"

// La raíz comprueba si el sistema necesita configuración inicial
export default async function RootPage() {
  const adminCount = await db.user.count({
    where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
  })

  if (adminCount === 0) {
    redirect("/setup")
  }

  redirect("/login")
}
