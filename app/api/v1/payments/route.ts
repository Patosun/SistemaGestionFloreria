import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, parseBody } from "@/lib/api"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

const paymentSchema = z.object({
  orderId: z.string().cuid(),
  method: z.enum(["CASH", "CARD", "QR", "TRANSFER", "INTERNAL_CREDIT"]),
  amount: z.number().positive("El monto debe ser positivo"),
  reference: z.string().max(200).optional().nullable(),
})

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const body = await parseBody(req, paymentSchema)
  if ("validationError" in body) return body.validationError

  const v = body.data

  const order = await db.order.findUnique({
    where: { id: v.orderId },
    include: { payments: { where: { status: "COMPLETED" } } },
  })
  if (!order) return err("Pedido no encontrado", 404)
  if (order.status === "CANCELED") return err("No se puede cobrar un pedido cancelado", 409)

  const alreadyPaid = order.payments.reduce((s, p) => s + Number(p.amount), 0)
  const remaining = Number(order.total) - alreadyPaid

  if (v.amount > remaining + 0.01) {
    return err(`El monto excede el saldo pendiente ($${remaining.toFixed(2)})`, 400)
  }

  const payment = await db.$transaction(async (tx) => {
    const p = await tx.payment.create({
      data: {
        orderId: v.orderId,
        method: v.method,
        amount: v.amount,
        status: "COMPLETED",
        reference: v.reference ?? undefined,
        paidAt: new Date(),
      },
    })

    // Mark order as paid if fully covered
    const newTotal = alreadyPaid + v.amount
    if (newTotal >= Number(order.total) - 0.01) {
      await tx.order.update({
        where: { id: v.orderId },
        data: {
          paidAt: new Date(),
          status: order.status === "PENDING" ? "CONFIRMED" : order.status,
        },
      })
    }

    return p
  })

  return ok(payment)
}
