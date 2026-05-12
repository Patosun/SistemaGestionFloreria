import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, parseBody } from "@/lib/api"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

const patchSchema = z.object({
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "IN_PRODUCTION",
      "READY",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELED",
      "REFUNDED",
    ])
    .optional(),
  notes: z.string().optional().nullable(),
  cancelReason: z.string().optional().nullable(),
  scheduledDate: z.string().datetime().optional().nullable(),
  deliverySlot: z
    .enum(["SLOT_09_12", "SLOT_12_15", "SLOT_15_18", "SLOT_18_21"])
    .optional()
    .nullable(),
  shippingAddress: z.string().optional().nullable(),
  shippingCity: z.string().optional().nullable(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const { id } = await params
  const order = await db.order.findUnique({
    where: { id },
    include: {
      customer: true,
      createdBy: { select: { id: true, name: true } },
      items: {
        include: { variant: { include: { product: { select: { id: true, name: true, images: true } } } } },
      },
      payments: { orderBy: { createdAt: "asc" } },
      delivery: { include: { assignedTo: { select: { id: true, name: true } } } },
      productionOrders: { include: { assignedTo: { select: { id: true, name: true } } } },
    },
  })

  if (!order) return err("Pedido no encontrado", 404)
  return ok(order)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const { id } = await params
  const body = await parseBody(req, patchSchema)
  if ("validationError" in body) return body.validationError

  const v = body.data

  const existing = await db.order.findUnique({ where: { id } })
  if (!existing) return err("Pedido no encontrado", 404)

  const order = await db.order.update({
    where: { id },
    data: {
      ...(v.status && { status: v.status }),
      ...(v.notes !== undefined && { notes: v.notes ?? undefined }),
      ...(v.cancelReason !== undefined && { cancelReason: v.cancelReason ?? undefined }),
      ...(v.scheduledDate !== undefined && {
        scheduledDate: v.scheduledDate ? new Date(v.scheduledDate) : null,
      }),
      ...(v.deliverySlot !== undefined && { deliverySlot: v.deliverySlot ?? undefined }),
      ...(v.shippingAddress !== undefined && { shippingAddress: v.shippingAddress ?? undefined }),
      ...(v.shippingCity !== undefined && { shippingCity: v.shippingCity ?? undefined }),
      ...(v.status === "CANCELED" && { canceledAt: new Date() }),
    },
  })

  return ok(order)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const { id } = await params
  const order = await db.order.findUnique({ where: { id } })
  if (!order) return err("Pedido no encontrado", 404)

  if (!["PENDING", "CANCELED"].includes(order.status)) {
    return err("Solo se pueden eliminar pedidos pendientes o cancelados", 409)
  }

  await db.order.delete({ where: { id } })
  return ok({ deleted: true })
}
