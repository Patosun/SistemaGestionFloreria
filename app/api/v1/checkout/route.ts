import { NextRequest } from "next/server"
import { headers } from "next/headers"
import { z } from "zod"
import { db } from "@/lib/db"
import { ok, err, parseBody } from "@/lib/api"
import { auth } from "@/lib/auth"
import { sendOrderConfirmation } from "@/lib/email"

const checkoutItemSchema = z.object({
  variantId: z.string(),
  productId: z.string(),
  name: z.string(),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
})

const checkoutSchema = z.object({
  scheduledDate: z.string().min(1, "Fecha de entrega requerida"),
  deliverySlot: z.enum(["SLOT_09_12", "SLOT_12_15", "SLOT_15_18", "SLOT_18_21"]),
  shippingAddress: z.string().min(5, "Dirección requerida"),
  shippingCity: z.string().default("La Paz"),
  phone: z.string().min(7, "Teléfono requerido"),
  notes: z.string().optional(),
  items: z.array(checkoutItemSchema).min(1, "El carrito está vacío"),
})

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("Debes iniciar sesión para realizar un pedido", 401)

  const parsed = await parseBody(req, checkoutSchema)
  if ("validationError" in parsed) return parsed.validationError
  const v = parsed.data

  // Verify all variants exist and are active (server-side price authority)
  const variantIds = v.items.map((i) => i.variantId)
  const variants = await db.productVariant.findMany({
    where: { id: { in: variantIds }, isActive: true },
    select: { id: true, costPrice: true, product: { select: { id: true } } },
  })
  if (variants.length !== variantIds.length) {
    return err("Uno o más productos no están disponibles", 400)
  }
  const costMap = new Map(variants.map((v) => [v.id, Number(v.costPrice)]))

  // Upsert customer record linked to the authenticated user's email
  const customer = await db.customer.upsert({
    where: { email: session.user.email },
    update: { phone: v.phone },
    create: {
      name: session.user.name,
      email: session.user.email,
      phone: v.phone,
    },
  })

  const subtotal = v.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)

  const order = await db.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        channel: "ECOMMERCE",
        customerId: customer.id,
        createdById: session.user.id,
        shippingAddress: v.shippingAddress,
        shippingCity: v.shippingCity,
        scheduledDate: new Date(v.scheduledDate),
        deliverySlot: v.deliverySlot,
        notes: v.notes ?? null,
        subtotal,
        discountAmount: 0,
        taxAmount: 0,
        total: subtotal,
        items: {
          create: v.items.map((item) => ({
            variantId: item.variantId,
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            costPrice: costMap.get(item.variantId) ?? 0,
            discount: 0,
            total: item.unitPrice * item.quantity,
          })),
        },
      },
      include: {
        items: { select: { name: true, quantity: true, unitPrice: true } },
      },
    })

    await tx.customer.update({
      where: { id: customer.id },
      data: {
        totalSpent: { increment: subtotal },
        orderCount: { increment: 1 },
      },
    })

    return newOrder
  })

  // Send confirmation email (best-effort, don't fail the request on email error)
  try {
    const dateLabel = new Date(v.scheduledDate).toLocaleDateString("es-BO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    await sendOrderConfirmation({
      to: session.user.email,
      name: session.user.name,
      orderNumber: order.orderNumber,
      items: order.items.map((i) => ({
        name: i.name,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
      })),
      total: subtotal,
      scheduledDate: dateLabel,
      deliverySlot: v.deliverySlot,
      shippingAddress: v.shippingAddress,
    })
  } catch (e) {
    console.error("[checkout] Error al enviar email de confirmación:", e)
  }

  return ok({ orderNumber: order.orderNumber, orderId: order.id })
}
