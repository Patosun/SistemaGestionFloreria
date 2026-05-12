import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, notFound, parseBody } from "@/lib/api"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { adjustLot } from "@/lib/inventory"

const adjustSchema = z.object({
  newQuantity: z.number().min(0),
  reason: z.string().min(1),
})

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lot = await db.lot.findUnique({
    where: { id },
    include: {
      variant: { include: { product: { select: { id: true, sku: true, name: true } } } },
      supplier: true,
      location: true,
      movements: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  })
  if (!lot) return notFound("Lote")
  return ok(lot)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const { id } = await params
  const parsed = await parseBody(req, adjustSchema)
  if ("validationError" in parsed) return parsed.validationError

  const { newQuantity, reason } = parsed.data
  const updated = await adjustLot(id, newQuantity, reason, session.user.id)
  return ok(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return err("No autorizado", 401)

  const { id } = await params
  const lot = await db.lot.findUnique({ where: { id } })
  if (!lot) return notFound("Lote")
  if (lot.status === "ACTIVE" && Number(lot.quantityCurrent) > 0)
    return err("No se puede eliminar un lote activo con stock. Ajusta la cantidad a 0 primero.", 409)

  await db.lot.delete({ where: { id } })
  return ok({ deleted: true })
}
