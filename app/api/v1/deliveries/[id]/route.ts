import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, parseBody } from "@/lib/api"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { z } from "zod"

const patchSchema = z.object({
  assignedToId: z.string().cuid().optional().nullable(),
  status: z
    .enum(["PENDING", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "FAILED", "RETURNED"])
    .optional(),
  scheduledDate: z.string().datetime().optional().nullable(),
  slot: z
    .enum(["SLOT_09_12", "SLOT_12_15", "SLOT_15_18", "SLOT_18_21"])
    .optional()
    .nullable(),
  zone: z.string().optional().nullable(),
  address: z.string().optional(),
  notes: z.string().optional().nullable(),
  failureReason: z.string().optional().nullable(),
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const { id } = await params
  const delivery = await db.delivery.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          customer: { select: { id: true, name: true, phone: true, email: true } },
          items: { select: { name: true, quantity: true, total: true } },
        },
      },
      assignedTo: { select: { id: true, name: true } },
    },
  })

  if (!delivery) return err("Entrega no encontrada", 404)
  return ok(delivery)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const { id } = await params
  const body = await parseBody(req, patchSchema)
  if ("validationError" in body) return body.validationError

  const existing = await db.delivery.findUnique({ where: { id } })
  if (!existing) return err("Entrega no encontrada", 404)

  const updateData: Record<string, unknown> = { ...body.data }

  // Auto-set timestamps
  if (body.data.status === "DELIVERED") {
    updateData.deliveredAt = new Date()
  }
  if (body.data.status === "FAILED") {
    updateData.failedAt = new Date()
  }

  const delivery = await db.delivery.update({
    where: { id },
    data: updateData,
    include: {
      order: { select: { orderNumber: true, customer: { select: { name: true } } } },
      assignedTo: { select: { id: true, name: true } },
    },
  })

  return ok(delivery)
}
