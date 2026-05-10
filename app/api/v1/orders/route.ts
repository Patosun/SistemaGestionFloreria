import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, parseBody } from "@/lib/api"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { consumeStockFIFO } from "@/lib/inventory"

const orderItemSchema = z.object({
  variantId: z.string().cuid(),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  costPrice: z.number().nonnegative(),
  discount: z.number().nonnegative().default(0),
  notes: z.string().optional().nullable(),
})

const orderSchema = z.object({
  channel: z.enum(["POS", "ECOMMERCE", "CHATBOT", "PHONE"]).default("POS"),
  customerId: z.string().cuid().optional().nullable(),
  shippingAddress: z.string().optional().nullable(),
  shippingCity: z.string().optional().nullable(),
  scheduledDate: z.string().datetime().optional().nullable(),
  deliverySlot: z
    .enum(["SLOT_09_12", "SLOT_12_15", "SLOT_15_18", "SLOT_18_21"])
    .optional()
    .nullable(),
  notes: z.string().optional().nullable(),
  discountAmount: z.number().nonnegative().default(0),
  taxAmount: z.number().nonnegative().default(0),
  items: z.array(orderItemSchema).min(1, "Al menos un producto"),
  consumeInventory: z.boolean().default(false),
})

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const channel = searchParams.get("channel")
  const customerId = searchParams.get("customerId")
  const q = searchParams.get("q") ?? ""
  const dateFrom = searchParams.get("dateFrom")
  const dateTo = searchParams.get("dateTo")
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"))
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")))
  const skip = (page - 1) * limit

  const where = {
    ...(status && { status: status as never }),
    ...(channel && { channel: channel as never }),
    ...(customerId && { customerId }),
    ...(q && {
      OR: [
        { orderNumber: { contains: q, mode: "insensitive" as const } },
        { customer: { name: { contains: q, mode: "insensitive" as const } } },
        { shippingAddress: { contains: q, mode: "insensitive" as const } },
      ],
    }),
    ...(dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom && { gte: new Date(dateFrom) }),
            ...(dateTo && { lte: new Date(dateTo) }),
          },
        }
      : {}),
  }

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        createdBy: { select: { id: true, name: true } },
        items: { select: { id: true, name: true, quantity: true, total: true } },
        payments: { select: { id: true, method: true, amount: true, status: true } },
      },
    }),
    db.order.count({ where }),
  ])

  return ok(orders, { page, limit, total })
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const body = await parseBody(req, orderSchema)
  if ("validationError" in body) return body.validationError

  const v = body.data

  // Validate variants exist
  const variantIds = v.items.map((i) => i.variantId)
  const variants = await db.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: { select: { id: true, name: true } } },
  })
  if (variants.length !== variantIds.length) return err("Una o más variantes no existen", 400)

  const variantMap = new Map(variants.map((v) => [v.id, v]))

  const subtotal = v.items.reduce(
    (sum, item) => sum + (item.unitPrice * item.quantity - item.discount),
    0,
  )
  const total = subtotal + v.taxAmount - v.discountAmount

  const order = await db.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        channel: v.channel,
        customerId: v.customerId ?? undefined,
        createdById: session.user.id,
        shippingAddress: v.shippingAddress ?? undefined,
        shippingCity: v.shippingCity ?? undefined,
        scheduledDate: v.scheduledDate ? new Date(v.scheduledDate) : undefined,
        deliverySlot: v.deliverySlot ?? undefined,
        notes: v.notes ?? undefined,
        subtotal,
        discountAmount: v.discountAmount,
        taxAmount: v.taxAmount,
        total,
        items: {
          create: v.items.map((item) => {
            const variant = variantMap.get(item.variantId)!
            return {
              variantId: item.variantId,
              productId: variant.product.id,
              name: `${variant.product.name} — ${variant.name}`,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              costPrice: item.costPrice,
              discount: item.discount,
              total: item.unitPrice * item.quantity - item.discount,
              notes: item.notes ?? undefined,
            }
          }),
        },
      },
      include: {
        items: true,
        customer: { select: { id: true, name: true } },
      },
    })

    // Update customer stats
    if (v.customerId) {
      await tx.customer.update({
        where: { id: v.customerId },
        data: {
          totalSpent: { increment: total },
          orderCount: { increment: 1 },
        },
      })
    }

    return newOrder
  })

  // Consume inventory outside transaction (best-effort, fire and forget errors logged)
  if (v.consumeInventory) {
    for (const item of v.items) {
      try {
        await consumeStockFIFO(item.variantId, item.quantity, order.id, "Venta POS")
      } catch (e) {
        console.error(`[inventory] FIFO consume error for variant ${item.variantId}:`, e)
      }
    }
  }

  return ok(order)
}
