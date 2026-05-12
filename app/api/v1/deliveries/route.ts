import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") ?? ""
  const status = searchParams.get("status")
  const date = searchParams.get("date") // YYYY-MM-DD
  const assignedToId = searchParams.get("assignedToId")
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"))
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")))
  const skip = (page - 1) * limit
  const sort = searchParams.get("sort") ?? "scheduledDate"
  const dir = (searchParams.get("dir") ?? "asc") as "asc" | "desc"
  const allowedSorts = ["scheduledDate", "status", "createdAt"]
  const safeSort = allowedSorts.includes(sort) ? sort : "scheduledDate"

  const dateFilter = date
    ? {
        gte: new Date(`${date}T00:00:00`),
        lt: new Date(`${date}T23:59:59`),
      }
    : undefined

  const where = {
    ...(status && { status: status as never }),
    ...(assignedToId && { assignedToId }),
    ...(dateFilter && { scheduledDate: dateFilter }),
    ...(q && {
      OR: [
        { address: { contains: q, mode: "insensitive" as const } },
        { zone: { contains: q, mode: "insensitive" as const } },
        { order: { orderNumber: { contains: q, mode: "insensitive" as const } } },
        { order: { customer: { name: { contains: q, mode: "insensitive" as const } } } },
      ],
    }),
  }

  const [deliveries, total] = await Promise.all([
    db.delivery.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [safeSort]: dir },
      include: {
        order: {
          select: {
            orderNumber: true,
            total: true,
            status: true,
            customer: { select: { id: true, name: true, phone: true } },
          },
        },
        assignedTo: { select: { id: true, name: true } },
      },
    }),
    db.delivery.count({ where }),
  ])

  return ok(deliveries, { page, limit, total })
}
