import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

// Returns users with roles that can do deliveries (for driver assignment dropdown)
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const staff = await db.user.findMany({
    where: {
      isActive: true,
      role: { in: ["DELIVERY", "ADMIN", "SUPER_ADMIN", "MANAGER"] },
    },
    select: { id: true, name: true, role: true },
    orderBy: { name: "asc" },
  })

  return ok(staff)
}
