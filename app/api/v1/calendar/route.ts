import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const { searchParams } = new URL(req.url)
  // from / to are ISO date strings (YYYY-MM-DD or full ISO)
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  // Default: current month
  const now = new Date()
  const fromDate = from ? new Date(from) : new Date(now.getFullYear(), now.getMonth(), 1)
  const toDate = to ? new Date(to) : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  const [orders, deliveries] = await Promise.all([
    // Orders with a scheduledDate in the range
    db.order.findMany({
      where: {
        scheduledDate: { gte: fromDate, lte: toDate },
        status: { notIn: ["CANCELED", "REFUNDED"] },
      },
      select: {
        id: true,
        orderNumber: true,
        scheduledDate: true,
        deliverySlot: true,
        status: true,
        total: true,
        customer: { select: { name: true, phone: true } },
        delivery: { select: { id: true, status: true, address: true, assignedTo: { select: { name: true } } } },
      },
      orderBy: { scheduledDate: "asc" },
    }),
    // Deliveries with a scheduledDate in the range (may not overlap with orders above)
    db.delivery.findMany({
      where: {
        scheduledDate: { gte: fromDate, lte: toDate },
        order: { status: { notIn: ["CANCELED", "REFUNDED"] } },
      },
      select: {
        id: true,
        orderId: true,
        scheduledDate: true,
        slot: true,
        status: true,
        address: true,
        zone: true,
        assignedTo: { select: { id: true, name: true } },
        order: {
          select: {
            orderNumber: true,
            total: true,
            customer: { select: { name: true, phone: true } },
          },
        },
      },
      orderBy: { scheduledDate: "asc" },
    }),
  ])

  return ok({ orders, deliveries })
}
